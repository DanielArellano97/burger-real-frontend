import { Component, inject, computed, input, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { LucidePlus, LucideMinus, LucideImageOff, LucideSlidersHorizontal, LucidePencil } from '@lucide/angular';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  IngredientModalComponent,
  IngredientModalData,
  IngredientModalResult,
} from '../ingredient-modal/ingredient-modal.component';
import { DrinkSelectorModalComponent, DrinkSelectorModalData, DrinkSelectorModalResult } from '../drink-selector-modal/drink-selector-modal.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [LucidePlus, LucideMinus, LucideImageOff, LucideSlidersHorizontal, LucidePencil],
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
            @if (product().image && !imgError()) {
              <img
                [src]="product().image"
                [alt]="product().name"
                class="w-full h-full object-cover"
                loading="lazy"
                (error)="imgError.set(true)"
              />
            } @else {
              <div class="w-full h-full flex items-center justify-center">
                <svg lucideImageOff class="w-8 h-8" aria-hidden="true" style="color: #3A3A3A;"></svg>
              </div>
            }
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-heading font-semibold text-sm text-brand-white leading-tight">{{ product().name }}</h3>
              <span class="font-heading font-bold text-sm text-brand-orange flex-shrink-0">{{ formatPrice(product().price) }}</span>
            </div>
            <p class="font-body text-xs mt-1 leading-relaxed" style="color: #888;">{{ product().description }}</p>
          </div>
        </div>

        <!-- Fila inferior: botones full-width -->
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
          @if (product().image && !imgError()) {
            <img
              [src]="product().image"
              [alt]="product().name"
              class="w-full h-full object-cover"
              loading="lazy"
              (error)="imgError.set(true)"
            />
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
                  <div style="color: #F07800; font-size: 13px; font-weight: 700;">{{ formatPrice(product().price) }}</div>
                </div>
              </div>
              <p class="font-body text-xs text-brand-cream mt-0.5 line-clamp-2 leading-relaxed">
                {{ product().description }}
              </p>
            </div>
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
              @if (quantity() === 0) {
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
  product = input.required<Product>();

  private cartService = inject(CartService);
  private dialog = inject(Dialog);
  private notification = inject(NotificationService);

  imgError = signal(false);

  private cartItem = computed(() =>
    this.cartService.getCartItemByProductId(this.product().id)
  );

  quantity = computed(() => this.cartItem()?.quantity ?? 0);

  originalQuantity = computed(() => {
    const original = this.cartService.cartItems().find(item =>
      item.product.id === this.product().id &&
      item.customizedIngredients.every(i => i.currentQuantity === i.defaultQuantity) &&
      !item.selectedVariant &&
      !item.isPromo
    );
    return original?.quantity ?? 0;
  });

  originalCartItemId = computed(() => {
    const original = this.cartService.cartItems().find(item =>
      item.product.id === this.product().id &&
      item.customizedIngredients.every(i => i.currentQuantity === i.defaultQuantity) &&
      !item.selectedVariant &&
      !item.isPromo
    );
    return original?.cartItemId ?? null;
  });

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-CL')}`;
  }

  openModal(): void {
    const ref = this.dialog.open<IngredientModalResult, IngredientModalData>(
      IngredientModalComponent,
      {
        data: { product: this.product() },
        backdropClass: 'burger-dialog-backdrop',
        panelClass: 'burger-modal-pane',
        width: '420px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      }
    );

    ref.closed.subscribe(result => {
      if (result) {
        this.cartService.addItem(this.product(), result.ingredients, result.unitPrice, result.selectedVariant);
        this.notification.show(this.product().name);
      }
    });
  }

  add(): void {
    const product = this.product();
    const variants = (product.variants ?? []).filter(v => !v.internal);

    if (variants.length === 0) {
      this.cartService.addItem(product, [], product.price);
      this.notification.show(product.name);
      return;
    }

    const ref = this.dialog.open<DrinkSelectorModalResult, DrinkSelectorModalData>(
      DrinkSelectorModalComponent,
      {
        data: {
          productName: product.name,
          opciones: variants,
        },
        backdropClass: 'burger-dialog-backdrop',
        panelClass: 'burger-modal-pane',
        width: '380px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      }
    );

    ref.closed.subscribe(result => {
      if (result) {
        this.cartService.addItem(product, [], product.price, result.selectedVariant);
        this.notification.show(product.name);
      }
    });
  }

  increase(): void {
    const item = this.cartItem();
    if (item) {
      this.cartService.updateQuantity(item.cartItemId, item.quantity + 1);
      this.notification.show(this.product().name);
    }
  }

  decrease(): void {
    const item = this.cartItem();
    if (item) this.cartService.updateQuantity(item.cartItemId, item.quantity - 1);
  }

  addOriginal(): void {
    this.cartService.addItem(this.product(), this.product().ingredients.map(i => ({ ...i })), this.product().price);
    this.notification.show(this.product().name);
  }

  increaseOriginal(): void {
    const id = this.originalCartItemId();
    if (id) {
      this.cartService.updateQuantity(id, this.originalQuantity() + 1);
      this.notification.show(this.product().name);
    }
  }

  decreaseOriginal(): void {
    const id = this.originalCartItemId();
    if (id) this.cartService.updateQuantity(id, this.originalQuantity() - 1);
  }
}