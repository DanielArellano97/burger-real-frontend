import { Component, inject, computed, input, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { LucidePlus, LucideMinus, LucideImageOff, LucideSlidersHorizontal, LucidePencil, LucideMaximize2 } from '@lucide/angular';
import { Product } from '../../../domain/catalog/catalog.models';
import { formatPrice } from '../../../domain/shared/money';
import { CartService } from '../../../application/cart.service';
import { NotificationService } from '../../../application/notification.service';
import { openImageLightbox } from '../image-lightbox/image-lightbox.component';
import {
  IngredientModalComponent,
  IngredientModalData,
  IngredientModalResult,
} from '../ingredient-modal/ingredient-modal.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [LucidePlus, LucideMinus, LucideImageOff, LucideSlidersHorizontal, LucidePencil, LucideMaximize2],
  template: `
    @if (product().category === 'hamburguesas') {
      <!-- HAMBURGUESA LAYOUT: imagen+info arriba, botones full-width abajo -->
      <article
        class="rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
        style="background: #1A1A1A; border-color: #2A2A2A; box-shadow: 0 2px 12px rgba(0,0,0,0.3);"
        [attr.aria-label]="product().name"
      >
        <!-- Fila superior: imagen + info -->
        <div class="flex items-start gap-3 p-3 pb-2">
          <div class="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-brand-surface-2">
            @if (product().imageUrl && !imgError()) {
              <button
                type="button"
                (click)="openImage()"
                class="relative block w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                [attr.aria-label]="'Ampliar imagen de ' + product().name"
              >
                <img
                  [src]="product().imageUrl"
                  [alt]="product().name"
                  class="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                  (error)="imgError.set(true)"
                />
                <span
                  class="absolute flex items-center justify-center w-5 h-5 rounded-md"
                  style="right: 3px; bottom: 3px; background: rgba(0,0,0,0.55); color: #F0F0F0;"
                  aria-hidden="true"
                >
                  <svg lucideMaximize2 class="w-3 h-3"></svg>
                </span>
              </button>
            } @else {
              <div class="w-full h-full flex items-center justify-center">
                <svg lucideImageOff class="w-8 h-8" aria-hidden="true" style="color: #3A3A3A;"></svg>
              </div>
            }
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-heading font-semibold text-base text-brand-white leading-tight">{{ product().name }}</h3>
              <span class="font-heading font-bold text-lg text-brand-orange flex-shrink-0">{{ formatPrice(product().price) }}</span>
            </div>
            <p class="font-body text-xs mt-1 leading-relaxed" style="color: #888;">{{ product().description }}</p>
          </div>
        </div>

        <!-- Fila inferior: botones full-width -->
        @if (!product().available) {
          <div class="px-3 pb-3">
            <div class="flex items-center justify-center h-[44px] rounded-xl font-heading font-semibold text-sm" style="background: #242424; color: #888; border: 1px solid #2A2A2A;">
              Agotado por hoy
            </div>
          </div>
        } @else {
        <div class="flex gap-2 px-3 pb-3">
          @if (originalQuantity() > 0) {
            <div class="flex items-center justify-between w-[44%] rounded-xl px-3 h-[44px]" style="background: #242424;">
              <button
                (click)="decreaseOriginal()"
                class="text-brand-orange font-bold text-lg px-1"
                [attr.aria-label]="'Quitar un ' + product().name"
              >−</button>
              <span class="font-heading font-bold text-sm text-brand-white" aria-live="polite">{{ originalQuantity() }}</span>
              <button
                (click)="increaseOriginal()"
                class="text-brand-orange font-bold text-lg px-1"
                [attr.aria-label]="'Agregar otro ' + product().name"
              >+</button>
            </div>
          } @else {
            <button
              (click)="addOriginal()"
              class="w-[44%] flex items-center justify-center gap-2 h-[44px] rounded-xl font-heading font-semibold text-sm transition-all active:scale-95"
              style="background: #F07800; color: #0F0F0F;"
              [attr.aria-label]="'Agregar ' + product().name + ' al carrito'"
            >
              <svg lucidePlus class="w-4 h-4" aria-hidden="true"></svg>
              Agregar
            </button>
          }
          <button
            (click)="openModal()"
            class="flex-1 flex items-center justify-center gap-2 h-[44px] rounded-xl font-heading font-semibold text-sm transition-all active:scale-95 border"
            style="background: transparent; color: #F07800; border-color: #F07800;"
            [attr.aria-label]="'Personalizar ' + product().name"
          >
            <svg lucidePencil class="w-4 h-4" aria-hidden="true"></svg>
            Personalizar
          </button>
        </div>
        }
      </article>
    } @else {
      <!-- LAYOUT ORIGINAL para acompañamientos, bebestibles y extras -->
      <article
        class="flex gap-3 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
        style="background: #1A1A1A; border-color: #2A2A2A; box-shadow: 0 2px 12px rgba(0,0,0,0.3);"
        [attr.aria-label]="product().name"
      >
        <!-- Product image -->
        <div class="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-brand-surface-2">
          @if (product().imageUrl && !imgError()) {
            <button
              type="button"
              (click)="openImage()"
              class="relative block w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              [attr.aria-label]="'Ampliar imagen de ' + product().name"
            >
              <img
                [src]="product().imageUrl"
                [alt]="product().name"
                class="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                loading="lazy"
                (error)="imgError.set(true)"
              />
              <span
                class="absolute flex items-center justify-center w-5 h-5 rounded-md"
                style="right: 3px; bottom: 3px; background: rgba(0,0,0,0.55); color: #F0F0F0;"
                aria-hidden="true"
              >
                <svg lucideMaximize2 class="w-3 h-3"></svg>
              </span>
            </button>
          } @else {
            <div class="w-full h-full flex items-center justify-center">
              <svg lucideImageOff class="w-8 h-8" aria-hidden="true" style="color: #3A3A3A;"></svg>
            </div>
          }
        </div>

        <!-- Info -->
        <div class="flex flex-col flex-1 min-w-0 justify-between">
          @if (product().category === 'acompañamientos') {
            <!-- ACOMPAÑAMIENTO LAYOUT -->
            <div>
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-heading font-semibold text-base text-brand-white leading-tight flex-1 min-w-0 truncate">
                  {{ product().name }}
                </h3>
                <div style="text-align: right; flex-shrink: 0;">
                  <div style="color: #888; font-size: 10px; line-height: 1.2;">desde</div>
                  <div style="color: #F07800; font-size: 14px; font-weight: 700;">{{ formatPrice(product().price) }}</div>
                </div>
              </div>
              <p class="font-body text-xs text-brand-cream mt-0.5 line-clamp-2 leading-relaxed">
                {{ product().description }}
              </p>
            </div>
            @if (!product().available) {
              <div class="flex items-center justify-end mt-2"><span class="inline-flex items-center justify-center px-3 rounded-lg font-heading font-semibold text-sm" style="height: 36px; background: #242424; color: #888; border: 1px solid #2A2A2A;">Agotado</span></div>
            } @else {
            <div class="flex items-center justify-end mt-2">
              <button
                (click)="openModal()"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg font-heading font-semibold text-sm transition-all duration-150 border hover:opacity-90 active:scale-95"
                style="border-color: #F07800; color: #F07800; background: rgba(240,120,0,0.08);"
                [attr.aria-label]="'Elegir porción de ' + product().name"
              >
                <svg lucideSlidersHorizontal class="w-4 h-4" aria-hidden="true"></svg>
                Elegir porción
              </button>
            </div>
            }
          } @else {
            <!-- DEFAULT LAYOUT (bebestibles, extras) -->
            <div>
              <h3 class="font-heading font-semibold text-base text-brand-white leading-tight truncate">
                {{ product().name }}
              </h3>
              <p class="font-body text-xs text-brand-cream mt-0.5 line-clamp-2 leading-relaxed">
                {{ product().description }}
              </p>
            </div>
            <div class="flex items-center justify-between mt-2 min-h-[36px]">
              <span class="font-heading font-bold text-lg text-brand-orange">
                {{ formatPrice(product().price) }}
              </span>
              @if (!product().available) {
                <span class="inline-flex items-center justify-center px-3 rounded-lg font-heading font-semibold text-sm" style="height: 36px; background: #242424; color: #888; border: 1px solid #2A2A2A;">Agotado</span>
              } @else if (quantity() === 0) {
                <button
                  (click)="add()"
                  class="flex items-center gap-1 px-3 h-[36px] rounded-lg font-heading font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-95"
                  style="background: #F07800; color: #0F0F0F;"
                  [attr.aria-label]="'Agregar ' + product().name + ' al carrito'"
                >
                  <svg lucidePlus class="w-4 h-4" aria-hidden="true"></svg>
                  Agregar
                </button>
              } @else {
                <div class="flex items-center gap-1 quantity-in h-[36px]" role="group" [attr.aria-label]="'Cantidad de ' + product().name">
                  <button
                    (click)="decrease()"
                    class="w-[36px] h-[36px] flex items-center justify-center rounded-md border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-dark transition-colors duration-150"
                    [attr.aria-label]="'Quitar un ' + product().name"
                  >
                    <svg lucideMinus class="w-3.5 h-3.5" aria-hidden="true"></svg>
                  </button>
                  <span class="w-6 text-center font-heading font-bold text-base text-brand-white" aria-live="polite">
                    {{ quantity() }}
                  </span>
                  <button
                    (click)="increase()"
                    class="w-[36px] h-[36px] flex items-center justify-center rounded-md bg-brand-orange text-brand-dark hover:opacity-90 transition-colors duration-150"
                    [attr.aria-label]="'Agregar otro ' + product().name"
                  >
                    <svg lucidePlus class="w-3.5 h-3.5" aria-hidden="true"></svg>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </article>
    }
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  private readonly cartService = inject(CartService);
  private readonly dialog = inject(Dialog);
  private readonly notification = inject(NotificationService);

  readonly formatPrice = formatPrice;
  readonly imgError = signal(false);

  /** Línea de carta (bebestibles: un solo contador por producto). */
  private readonly cartItem = computed(() => this.cartService.findProductItem(this.product().id));
  readonly quantity = computed(() => this.cartItem()?.quantity ?? 0);

  /** Línea con la receta original (burgers: contador del botón "Agregar"). */
  private readonly originalItem = computed(() => this.cartService.findOriginalItem(this.product().id));
  readonly originalQuantity = computed(() => this.originalItem()?.quantity ?? 0);

  /** Abre la foto del producto en grande. */
  openImage(): void {
    const { imageUrl, name } = this.product();
    if (imageUrl) openImageLightbox(this.dialog, { src: imageUrl, alt: name });
  }

  /** Personalizar burger o elegir porción de un acompañamiento. */
  openModal(): void {
    const ref = this.dialog.open<IngredientModalResult, IngredientModalData>(IngredientModalComponent, {
      data: { product: this.product() },
      backdropClass: 'burger-dialog-backdrop',
      panelClass: 'burger-modal-pane',
      width: '420px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
    });

    ref.closed.subscribe(result => {
      if (!result) return;
      this.cartService.addProduct(this.product(), result.ingredients, result.portion);
      this.notification.show(this.product().name);
    });
  }

  /** Bebestibles: se agregan directo, no tienen porciones ni personalización. */
  add(): void {
    this.cartService.addProduct(this.product(), []);
    this.notification.show(this.product().name);
  }

  increase(): void {
    const item = this.cartItem();
    if (!item) return;
    this.cartService.updateQuantity(item.id, item.quantity + 1);
    this.notification.show(this.product().name);
  }

  decrease(): void {
    const item = this.cartItem();
    if (item) this.cartService.updateQuantity(item.id, item.quantity - 1);
  }

  addOriginal(): void {
    this.cartService.addProduct(this.product(), this.product().ingredients);
    this.notification.show(this.product().name);
  }

  increaseOriginal(): void {
    const item = this.originalItem();
    if (!item) return;
    this.cartService.updateQuantity(item.id, item.quantity + 1);
    this.notification.show(this.product().name);
  }

  decreaseOriginal(): void {
    const item = this.originalItem();
    if (item) this.cartService.updateQuantity(item.id, item.quantity - 1);
  }
}
