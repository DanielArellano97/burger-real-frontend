import { Component, inject, HostListener, OnDestroy, effect, Renderer2, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { Dialog } from '@angular/cdk/dialog';
import { LucideX, LucideTrash2, LucidePlus, LucideMinus, LucideShoppingCart, LucidePencil } from '@lucide/angular';
import { CartService } from '../../core/services/cart.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { CartItem } from '../../core/models/cart-item.model';
import { IngredientModalComponent, IngredientModalResult } from '../../shared/components/ingredient-modal/ingredient-modal.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [A11yModule, RouterLink, LucideX, LucideTrash2, LucidePlus, LucideMinus, LucideShoppingCart, LucidePencil],
  template: `
    @if (isVisible()) {
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-40 bg-black"
  [class.overlay-fade-in]="!isClosing()"
  [class.overlay-fade-out]="isClosing()"
        (click)="cartService.closeDrawer()"
        aria-hidden="true"
      ></div>

      <!-- Drawer panel -->
      <div
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        class="fixed top-0 right-0 bottom-0 z-50 w-[90%] max-w-sm flex flex-col"
  [class.drawer-slide-in]="!isClosing()"
  [class.drawer-slide-out]="isClosing()"
  style="background: #1A1A1A; border-left: 1px solid #2A2A2A;"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b" style="border-color: #2A2A2A;">
          <div class="flex items-center gap-2">
            <svg lucideShoppingCart class="w-5 h-5 text-brand-orange" aria-hidden="true"></svg>
            <h2 class="font-heading font-semibold text-lg text-brand-white">Tu Pedido</h2>
          </div>
          <button
            (click)="cartService.closeDrawer()"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-brand-cream hover:bg-brand-surface-2 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg lucideX class="w-5 h-5" aria-hidden="true"></svg>
          </button>
        </div>

        <!-- Items or Empty state -->
        @if (cartService.cartItems().length === 0) {
          <div class="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <svg lucideShoppingCart class="w-16 h-16" style="color: #3A3A3A;" aria-hidden="true"></svg>
            <p class="font-heading text-lg text-brand-cream">Tu carrito está vacío</p>
            <p class="font-body text-sm" style="color: #555;">Agrega tus hamburguesas favoritas</p>
            <a
              routerLink="/menu"
              (click)="cartService.closeDrawer()"
              class="mt-2 px-6 py-2.5 rounded-lg font-heading font-semibold text-brand-dark transition-all hover:opacity-90"
              style="background: #F07800;"
            >Ver Menú</a>
          </div>
        } @else {
          <!-- Cart items list -->
          <div class="flex-1 overflow-y-auto" role="list" aria-label="Productos en el carrito">
            @for (item of cartService.cartItems(); track item.cartItemId) {
              <div
                class="flex items-start gap-3 px-4 py-3 border-b"
                style="border-color: #242424;"
                role="listitem"
              >
                <!-- Left: info + controls -->
                <div class="flex-1 min-w-0">
                  <p class="font-heading font-semibold text-sm text-brand-white leading-tight">
                    @if (item.isCombo) {
                      <span style="color: #F07800;">Combo </span>
                    }{{ item.product.name }}
                  </p>

                  <!-- Customization summary -->
                  @let summary = getSummary(item);
                  @if (item.isCombo) {
                    @for (detail of summary.removed; track $index) {
                      <p class="font-body text-xs mt-0.5" style="color: #F0DCC8;">• {{ detail }}</p>
                    }
                  } @else if (item.product.customizable) {
                    @if (!summary.variant && summary.removed.length === 0 && summary.extras.length === 0) {
                      <p class="font-body text-xs mt-0.5" style="color: #666;">• Estándar</p>
                    } @else {
                      @if (summary.variant) {
                        <p class="font-body text-xs mt-0.5" style="color: #F07800;">• {{ summary.variant }}</p>
                      }
                      @if (summary.removed.length > 0) {
                        @if (summary.removed[0] === '¡Solo Pan y Carne! 🍞🥩') {
                          <p class="font-body text-xs mt-0.5 font-semibold" style="color: #F07800;">
                            • {{ summary.removed[0] }}
                          </p>
                        } @else {
                          <p class="font-body text-xs mt-0.5" style="color: #888;">
                            • Sin: {{ summary.removed.join(', ') }}
                          </p>
                        }
                      }
                      @for (extra of summary.extras; track $index) {
                        <p class="font-body text-xs mt-0.5" style="color: #F07800;">• Extra: {{ extra }}</p>
                      }
                    }
                  } @else if (item.selectedVariant) {
                    <p class="font-body text-xs mt-0.5" style="color: #F07800;">• {{ item.selectedVariant.name }}</p>
                  }

                  <!-- Quantity controls -->
                  <div class="flex items-center gap-2 mt-2" role="group" [attr.aria-label]="'Cantidad de ' + item.product.name">
                    <button
                      (click)="cartService.updateQuantity(item.cartItemId, item.quantity - 1)"
                      class="w-6 h-6 flex items-center justify-center rounded border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-dark transition-colors"
                      [attr.aria-label]="'Reducir cantidad de ' + item.product.name"
                    >
                      <svg lucideMinus class="w-3 h-3" aria-hidden="true"></svg>
                    </button>
                    <span class="w-5 text-center font-heading font-bold text-sm text-brand-white" aria-live="polite">
                      {{ item.quantity }}
                    </span>
                    <button
                      (click)="cartService.updateQuantity(item.cartItemId, item.quantity + 1)"
                      class="w-6 h-6 flex items-center justify-center rounded bg-brand-orange text-brand-dark hover:opacity-90 transition-colors"
                      [attr.aria-label]="'Aumentar cantidad de ' + item.product.name"
                    >
                      <svg lucidePlus class="w-3 h-3" aria-hidden="true"></svg>
                    </button>
                  </div>
                </div>

                <!-- Right: total + actions -->
                <div class="flex flex-col items-end gap-2 flex-shrink-0">
                  <span class="font-heading font-bold text-base text-brand-orange">
                    {{ formatPrice(item.unitPrice * item.quantity) }}
                  </span>
                  <div class="flex items-center gap-1">
                    @if (item.product.customizable) {
                      <button
                        (click)="openEditModal(item)"
                        class="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-brand-surface-2"
                        style="color: #F07800;"
                        aria-label="Editar personalización"
                      >
                        <svg lucidePencil class="w-4 h-4" aria-hidden="true"></svg>
                      </button>
                    }
                    <button
                      (click)="cartService.removeItem(item.cartItemId)"
                      class="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:bg-red-950 transition-colors"
                      [attr.aria-label]="'Eliminar ' + item.product.name + ' del carrito'"
                    >
                      <svg lucideTrash2 class="w-4 h-4" aria-hidden="true"></svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-4 pt-5 pb-4 border-t" style="border-color: #2A2A2A;">
            <div class="flex items-center justify-between mb-4">
              <span class="font-heading text-base text-brand-cream">Total</span>
              <span class="font-display text-3xl text-brand-orange">
                {{ formatPrice(cartService.totalPrice()) }}
              </span>
            </div>

            <button
              (click)="goToConfirm()"
              class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-heading font-bold text-lg transition-all hover:opacity-90 active:scale-95 mb-2"
              style="background: #F07800; color: #0F0F0F;"
              aria-label="Ir a confirmar pedido"
            >
              <svg lucideShoppingCart class="w-5 h-5" aria-hidden="true"></svg>
              Ir a confirmar
            </button>
<div class="h-14 flex items-center">
  @if (confirmingClear()) {
    <div class="flex items-center justify-between w-full gap-2">
      <span class="font-body text-sm" style="color: #888;">¿Vaciar carrito?</span>
      <div class="flex gap-2">
        <button
          (click)="confirmingClear.set(false)"
          class="px-3 py-1.5 rounded-lg font-body text-sm transition-colors border"
          style="color: #888; border-color: #2A2A2A; background: transparent;"
        >Cancelar</button>
        <button
          (click)="confirmClear()"
          class="px-3 py-1.5 rounded-lg font-body text-sm font-semibold transition-colors"
          style="background: #F07800; color: #1A1A1A;"
        >Sí, vaciar</button>
      </div>
    </div>
  } @else {
    <button
      (click)="confirmingClear.set(true)"
      class="w-full py-2 font-body text-sm transition-colors hover:text-red-400"
      style="color: #666;"
    >Vaciar carrito</button>
  }
</div>
          </div>
        }
      </div>
    }
  `,
})
export class CartDrawerComponent implements OnDestroy {
  cartService = inject(CartService);
  whatsappService = inject(WhatsappService);
  confirmingClear = signal(false);
  isVisible = signal(false);
  isClosing = signal(false);
  private dialog = inject(Dialog);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.cartService.isDrawerOpen()) {
        this.renderer.addClass(this.document.body, 'overflow-hidden');
      } else {
        this.renderer.removeClass(this.document.body, 'overflow-hidden');
        this.confirmingClear.set(false);
      }
    });

    effect(() => {
      if (this.cartService.isDrawerOpen()) {
        this.isVisible.set(true);
        this.isClosing.set(false);
      } else if (this.isVisible()) {
        this.isClosing.set(true);
        setTimeout(() => {
          this.isVisible.set(false);
          this.isClosing.set(false);
        }, 300);
      }
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'overflow-hidden');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cartService.closeDrawer();
  }

  getSummary(item: CartItem): { variant: string | null; removed: string[]; extras: string[] } {
    if (item.isCombo && item.combo) {
      const variants = item.selectedVariants ?? [];
      let variantIndex = 0;

      const detalles = item.combo.detalles.map(d => {
        let texto = d.productoNombre;

        if (d.cantidad > 1) {
          texto += ` (x${d.cantidad})`;
        }

        if (!d.requiereSeleccion && d.varianteSeleccionada) {
          texto += ` (${d.varianteSeleccionada.shortName})`;
        }

        if (d.requiereSeleccion && d.cantidad > 0) {
          const variantesDeEsteDetalle = variants.slice(variantIndex, variantIndex + d.cantidad);
          variantIndex += d.cantidad;

          if (variantesDeEsteDetalle.length > 0) {
            const conteo = new Map<number, { variant: typeof variantesDeEsteDetalle[0]; count: number }>();
            for (const v of variantesDeEsteDetalle) {
              if (conteo.has(v.id)) {
                conteo.get(v.id)!.count++;
              } else {
                conteo.set(v.id, { variant: v, count: 1 });
              }
            }
            const resumen = Array.from(conteo.values())
              .map(({ variant, count }) =>
                count > 1 && count < d.cantidad ? `${variant.shortName} (x${count})` : variant.shortName
              )
              .join(', ');
            texto += ` (${resumen})`;
          }
        }

        return texto;
      });

      return { variant: null, removed: detalles, extras: [] };
    }

    const variant = item.selectedVariant?.name ?? null;

    const removedIngredients = item.customizedIngredients.filter(
      i => i.defaultQuantity > 0 && i.currentQuantity === 0
    );

    const optionalIngredients = item.customizedIngredients.filter(
      i => i.defaultQuantity > 0 && !i.isRequired
    );

    const allOptionalsRemoved =
      item.product.category === 'hamburguesas' &&
      optionalIngredients.length > 0 &&
      optionalIngredients.every(i => i.currentQuantity === 0);

    const removed = allOptionalsRemoved
      ? ['¡Solo Pan y Carne! 🍞🥩']
      : removedIngredients.map(i => i.name);

    const extras = item.customizedIngredients
      .filter(i => i.currentQuantity > i.defaultQuantity)
      .map(i => {
        const excedente = i.currentQuantity - i.defaultQuantity;
        return `${i.name}${excedente > 1 ? ' x' + excedente : ''}`;
      });

    return { variant, removed, extras };
  }

  formatPrice(n: number): string {
    return this.whatsappService.formatPrice(n);
  }

  goToConfirm(): void {
    this.cartService.closeDrawer();
    this.router.navigate(['/confirmar-pedido']);
  }

  sendOrder(): void {
    this.whatsappService.sendOrder(this.cartService.cartItems());
    this.cartService.closeDrawer();
    this.cartService.clearCart();
  }

  openEditModal(item: CartItem): void {
    const ref = this.dialog.open<IngredientModalResult>(
      IngredientModalComponent,
      {
        data: {
          product: item.product,
          currentIngredients: item.customizedIngredients,
          selectedVariant: item.selectedVariant,
        },
        backdropClass: 'burger-dialog-backdrop',
        panelClass: 'burger-modal-pane',
        maxWidth: '95vw',
        width: '420px',
        autoFocus: 'first-tabbable',
      }
    );

    ref.closed.subscribe(result => {
      if (result) {
        this.cartService.updateItemCustomization(
          item.cartItemId,
          result.ingredients,
          result.unitPrice,
          result.selectedVariant,
        );
      }
    });
  }

  confirmClear(): void {
    this.cartService.clearCart();
    this.confirmingClear.set(false);
  }
}
