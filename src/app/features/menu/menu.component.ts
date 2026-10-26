import {
  Component, inject, signal, computed, effect, DestroyRef,
  AfterViewInit, OnDestroy, OnInit, ChangeDetectionStrategy, isDevMode,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { CATEGORIES } from '../../core/data/menu.data';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartService } from '../../core/services/cart.service';
import { Combo, ComboDetalle } from '../../core/models/combo.model';
import { BurgerEnOferta, burgerDelDia, esDiaDeOferta } from '../../core/utils/burger-of-the-week';
import { Product, SizeVariant } from '../../core/models/product.model';
import { ComboModalComponent, ComboModalData, ComboModalResult } from '../../shared/components/combo-modal/combo-modal.component';
import { BurgerOfTheWeekModalComponent, BurgerOfTheWeekModalData, BurgerOfTheWeekModalResult } from '../../shared/components/burger-of-the-week-modal/burger-of-the-week-modal.component';
import { ComboDetailModalComponent, ComboDetailModalData } from '../../shared/components/combo-detail-modal/combo-detail-modal.component';
import { NotificationService } from '../../core/services/notification.service';
import { ProductoService } from '../../core/services/producto.service';
import { ComboService } from '../../core/services/combo.service';

/**
 * Fecha fija para probar la rotación en desarrollo: `?fecha=2026-10-26`.
 * En producción siempre devuelve `null`, así que se usa la fecha real.
 */
function leerFechaSimulada(): Date | null {
  if (!isDevMode()) return null;

  const valor = new URLSearchParams(location.search).get('fecha');
  if (!valor) return null;

  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

type CategoryKey = (typeof CATEGORIES)[number]['key'];

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
  private route           = inject(ActivatedRoute);
  private destroyRef      = inject(DestroyRef);
  private cartService     = inject(CartService);
  private dialog          = inject(Dialog);
  private notification    = inject(NotificationService);
  private productoService = inject(ProductoService);
  private comboService    = inject(ComboService);

  readonly categories = CATEGORIES;
  combos = this.comboService.combos;
  activeTab = signal<CategoryKey>(CATEGORIES[0].key);

  loading = this.productoService.loading;
  error   = this.productoService.error;

  /** Fecha fija para probar la rotación en desarrollo (`?fecha=2026-10-26`). */
  private readonly fechaSimulada = leerFechaSimulada();

  /** Fecha actual; se actualiza al cruzar la medianoche o al volver a la pestaña. */
  private hoy = signal(this.fechaSimulada ?? new Date());
  private midnightTimer?: ReturnType<typeof setTimeout>;

  burgerOfTheWeek = computed<BurgerEnOferta | null>(() =>
    burgerDelDia(this.productoService.hamburguesas(), this.hoy())
  );

  /** Solo lunes a jueves se muestra el precio de oferta y el botón Agregar. */
  ofertaActiva = computed(() => esDiaDeOferta(this.hoy()));

  private observers: IntersectionObserver[] = [];

  constructor() {
    effect(() => {
      if (!this.productoService.loading()) {
        setTimeout(() => this.setupSectionObservers());
      }
    });

    this.programarCambioDeDia();

    // Si la pestaña estuvo en segundo plano, el timer puede llegar tarde.
    fromEvent(document, 'visibilitychange')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!document.hidden) this.hoy.set(this.fechaSimulada ?? new Date());
      });
  }

  /** Reevalúa la fecha al cruzar la medianoche. */
  private programarCambioDeDia(): void {
    if (this.fechaSimulada) return;

    const ahora = new Date();
    const proximoDia = new Date(
      ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 1
    );

    this.midnightTimer = setTimeout(() => {
      this.hoy.set(new Date());
      this.programarCambioDeDia();
    }, proximoDia.getTime() - ahora.getTime());
  }

  /**
   * Productos de la categoría. Mientras la promo está activa, la burger de la
   * semana no se repite en la lista: ya está destacada arriba.
   */
  getProducts(category: CategoryKey): Product[] {
    const promo = this.ofertaActiva() ? this.burgerOfTheWeek() : null;

    return this.productoService
      .products()
      .filter(p => p.category === category && p.id !== promo?.id);
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-CL')}`;
  }

  calcularDescuento(precioOriginal: number, precioOferta: number): string {
    const ahorro = precioOriginal - precioOferta;
    return `$${ahorro.toLocaleString('es-CL')} OFF`;
  }

  retry(): void {
    this.productoService.loadProducts();
  }

  scrollToCategory(key: string): void {
    const validKey = this.categories.find(c => c.key === key)?.key;
    if (validKey) this.activeTab.set(validKey);
    const el = document.getElementById(`section-${key}`);
    if (el) {
      const offset = 112;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  addComboToCart(combo: Combo): void {
    const detallesConSeleccion = combo.detalles.filter(d => d.requiereSeleccion);

    if (detallesConSeleccion.length === 0) {
      this.cartService.addCombo(combo, []);
      this.notification.show(combo.name);
      return;
    }

    const seleccionesRequeridas: { detalle: ComboDetalle; turno: number; total: number }[] = [];
    for (const detalle of detallesConSeleccion) {
      for (let i = 0; i < detalle.cantidad; i++) {
        seleccionesRequeridas.push({ detalle, turno: i + 1, total: detalle.cantidad });
      }
    }

    this.abrirModalSecuencial(combo, seleccionesRequeridas, 0, []);
  }

  private abrirModalSecuencial(
    combo: Combo,
    selecciones: { detalle: ComboDetalle; turno: number; total: number }[],
    index: number,
    variantesElegidas: SizeVariant[],
    seleccionInicial?: SizeVariant
  ): void {
    if (index >= selecciones.length) {
      this.cartService.addCombo(combo, variantesElegidas);
      this.notification.show(combo.name);
      return;
    }

    const { detalle, turno, total } = selecciones[index];

    const ref = this.dialog.open<ComboModalResult, ComboModalData>(
      ComboModalComponent,
      {
        data: {
          combo,
          detalle,
          opciones: detalle.opcionesDisponibles,
          turno,
          total,
          seleccionInicial,
          seleccionesPrevias: variantesElegidas,
          puedeVolver: index > 0,
        },
        backdropClass: 'burger-dialog-backdrop',
        panelClass: 'burger-modal-pane',
        width: '380px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      }
    );

    ref.closed.subscribe(result => {
      if (!result) return;

      if ('back' in result) {
        const anterior = variantesElegidas[variantesElegidas.length - 1];
        this.abrirModalSecuencial(
          combo,
          selecciones,
          index - 1,
          variantesElegidas.slice(0, -1),
          anterior
        );
        return;
      }

      this.abrirModalSecuencial(
        combo,
        selecciones,
        index + 1,
        [...variantesElegidas, result.selectedVariant]
      );
    });
  }

  openBurgerOfTheWeekModal(): void {
    const burger = this.burgerOfTheWeek();
    if (!burger) return;

    const ref = this.dialog.open<BurgerOfTheWeekModalResult, BurgerOfTheWeekModalData>(
      BurgerOfTheWeekModalComponent,
      {
        data: { burger },
        backdropClass: 'burger-dialog-backdrop',
        panelClass: 'burger-modal-pane',
        width: '420px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      }
    );

    ref.closed.subscribe(result => {
      if (result?.confirmed) {
        const bw = this.burgerOfTheWeek();
        if (!bw) return;
        const precio = bw.precioOferta ?? bw.price;
        this.cartService.addItem(
          bw,
          bw.ingredients.map(i => ({ ...i })),
          precio,
          undefined,
          true
        );
        this.notification.show(bw.name);
      }
    });
  }

  getComboQuantity(combo: Combo): number {
    return this.cartService.cartItems()
      .filter(i => i.isCombo && i.combo?.id === combo.id)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  openComboDetail(combo: Combo): void {
    this.dialog.open(ComboDetailModalComponent, {
      data: { combo } as ComboDetailModalData,
      backdropClass: 'burger-dialog-backdrop',
      panelClass: 'burger-modal-pane',
      width: '420px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
    });
  }

  removeComboItem(combo: Combo): void {
    const items = this.cartService.cartItems()
      .filter(i => i.isCombo && i.combo?.id === combo.id);
    if (items.length === 0) return;
    const last = items[items.length - 1];
    this.cartService.updateQuantity(last.cartItemId, last.quantity - 1);
  }

  private setupSectionObservers(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
    for (const cat of this.categories) {
      const el = document.getElementById(`section-${cat.key}`);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) this.activeTab.set(cat.key);
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      this.observers.push(obs);
    }
  }

  ngOnInit(): void {
    this.productoService.loadProducts();
    this.comboService.loadCombos();
  }

  ngAfterViewInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (params['cat']) {
          setTimeout(() => this.scrollToCategory(params['cat']), 100);
        }
      });
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    if (this.midnightTimer) clearTimeout(this.midnightTimer);
  }
}
