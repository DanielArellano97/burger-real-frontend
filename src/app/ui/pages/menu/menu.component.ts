import {
  AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, computed, effect, inject, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { LucideMaximize2 } from '@lucide/angular';
import { CartService } from '../../../application/cart.service';
import { CatalogService } from '../../../application/catalog.service';
import { ClockService } from '../../../application/clock.service';
import { NotificationService } from '../../../application/notification.service';
import { StoreStatusService } from '../../../application/store-status.service';
import { Combo, ComboLine, ComboOption, Product, ProductCategory } from '../../../domain/catalog/catalog.models';
import { OfferBurger, burgerOfTheDay, isOfferDay } from '../../../domain/promo/burger-of-the-week';
import { formatPrice } from '../../../domain/shared/money';
import { CATEGORIES } from '../../shared/categories';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { StoreClosedBannerComponent } from '../../components/store-closed-banner/store-closed-banner.component';
import { openImageLightbox } from '../../components/image-lightbox/image-lightbox.component';
import { ComboModalComponent, ComboModalData, ComboModalResult } from '../../components/combo-modal/combo-modal.component';
import {
  BurgerOfTheWeekModalComponent, BurgerOfTheWeekModalData, BurgerOfTheWeekModalResult,
} from '../../components/burger-of-the-week-modal/burger-of-the-week-modal.component';
import {
  ComboDetailModalComponent, ComboDetailModalData,
} from '../../components/combo-detail-modal/combo-detail-modal.component';

/** Un paso del flujo secuencial de elección dentro de un combo. */
interface SelectionStep {
  line: ComboLine;
  step: number;
  totalSteps: number;
}

const MODAL_OPTIONS = {
  backdropClass: 'burger-dialog-backdrop',
  panelClass: 'burger-modal-pane',
  maxWidth: '95vw',
  autoFocus: 'first-tabbable',
} as const;

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgOptimizedImage, ProductCardComponent, LucideMaximize2, StoreClosedBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.component.html',
})
export class MenuComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartService = inject(CartService);
  private readonly dialog = inject(Dialog);
  private readonly notification = inject(NotificationService);
  private readonly catalog = inject(CatalogService);
  private readonly clock = inject(ClockService);

  readonly categories = CATEGORIES;
  readonly combos = this.catalog.combos;
  readonly loading = this.catalog.loading;
  readonly error = this.catalog.error;
  readonly activeTab = signal<ProductCategory>(CATEGORIES[0].key);
  readonly formatPrice = formatPrice;
  readonly storeOpen = inject(StoreStatusService).isOpen;

  /** Imagen de respaldo (logo local) si la burger de la semana no tiene foto o falla. */
  readonly fallbackImage = 'images/logo-burger-real.webp';
  readonly heroError = signal(false);

  readonly burgerOfTheWeek = computed<OfferBurger | null>(() =>
    burgerOfTheDay(this.catalog.burgers(), this.clock.now())
  );

  /** Solo lunes a jueves se muestra el precio de oferta y el botón Agregar. */
  readonly offerActive = computed(() => isOfferDay(this.clock.now()));

  /** Foto del hero: Cloudinary la recorta a la forma de la tarjeta (ver template). */
  readonly heroImage = computed(() =>
    this.heroError() ? this.fallbackImage : (this.burgerOfTheWeek()?.image ?? this.fallbackImage)
  );
  readonly heroIsFallback = computed(() => this.heroImage() === this.fallbackImage);

  private observers: IntersectionObserver[] = [];

  constructor() {
    effect(() => {
      if (!this.catalog.loading()) setTimeout(() => this.setupSectionObservers());
    });
  }

  /** Productos de la categoría; con la promo activa la burger del día no se repite. */
  getProducts(category: ProductCategory): Product[] {
    const promo = this.offerActive() ? this.burgerOfTheWeek() : null;
    return this.catalog.byCategory(category).filter(p => p.id !== promo?.id);
  }

  discountLabel(price: number, offerPrice: number): string {
    return `${formatPrice(price - offerPrice)} OFF`;
  }

  retry(): void {
    this.catalog.load();
  }

  scrollToCategory(key: string): void {
    const category = this.categories.find(c => c.key === key);
    if (category) this.activeTab.set(category.key);

    const el = document.getElementById(`section-${key}`);
    if (el) {
      const offset = 112;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  }

  /* ─── Combos ─── */

  addComboToCart(combo: Combo): void {
    const steps: SelectionStep[] = combo.lines
      .filter(line => line.requiresSelection)
      .flatMap(line =>
        Array.from({ length: line.quantity }, (_, i) => ({ line, step: i + 1, totalSteps: line.quantity }))
      );

    if (steps.length === 0) {
      this.cartService.addCombo(combo, []);
      this.notification.show(combo.name);
      return;
    }
    this.openSelectionStep(combo, steps, 0, []);
  }

  /** Abre un modal por cada elección pendiente; permite volver al paso anterior. */
  private openSelectionStep(
    combo: Combo,
    steps: SelectionStep[],
    index: number,
    chosen: ComboOption[],
    initialSelection?: ComboOption
  ): void {
    if (index >= steps.length) {
      this.cartService.addCombo(combo, chosen);
      this.notification.show(combo.name);
      return;
    }

    const { line, step, totalSteps } = steps[index];
    const ref = this.dialog.open<ComboModalResult, ComboModalData>(ComboModalComponent, {
      ...MODAL_OPTIONS,
      width: '380px',
      data: { combo, line, step, totalSteps, initialSelection, previousSelections: chosen, canGoBack: index > 0 },
    });

    ref.closed.subscribe(result => {
      if (!result) return;
      if ('back' in result) {
        this.openSelectionStep(combo, steps, index - 1, chosen.slice(0, -1), chosen.at(-1));
        return;
      }
      this.openSelectionStep(combo, steps, index + 1, [...chosen, result.selected]);
    });
  }

  getComboQuantity(combo: Combo): number {
    return this.cartService.comboQuantity(combo.id);
  }

  removeComboItem(combo: Combo): void {
    this.cartService.removeOneCombo(combo.id);
  }

  openComboDetail(combo: Combo): void {
    this.dialog.open<void, ComboDetailModalData>(ComboDetailModalComponent, {
      ...MODAL_OPTIONS,
      width: '420px',
      data: { combo },
    });
  }

  /* ─── Burger de la semana ─── */

  openWeeklyImage(): void {
    const burger = this.burgerOfTheWeek();
    if (burger) openImageLightbox(this.dialog, { src: burger.image ?? this.fallbackImage, alt: burger.name });
  }

  openBurgerOfTheWeekModal(): void {
    const burger = this.burgerOfTheWeek();
    if (!burger) return;

    const ref = this.dialog.open<BurgerOfTheWeekModalResult, BurgerOfTheWeekModalData>(
      BurgerOfTheWeekModalComponent,
      { ...MODAL_OPTIONS, width: '420px', data: { burger } }
    );

    ref.closed.subscribe(result => {
      const current = this.burgerOfTheWeek();
      if (!result?.confirmed || !current) return;
      this.cartService.addPromo(current, this.clock.now());
      this.notification.show(current.name);
    });
  }

  /* ─── Scroll-spy de categorías ─── */

  private setupSectionObservers(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
    for (const category of this.categories) {
      const el = document.getElementById(`section-${category.key}`);
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) this.activeTab.set(category.key);
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      observer.observe(el);
      this.observers.push(observer);
    }
  }

  ngAfterViewInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['cat']) setTimeout(() => this.scrollToCategory(params['cat']), 100);
    });
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
  }
}
