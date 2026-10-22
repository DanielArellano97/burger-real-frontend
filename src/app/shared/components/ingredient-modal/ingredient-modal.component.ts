import { Component, inject, signal, computed } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideX, LucidePlus, LucideMinus } from '@lucide/angular';
import { Product, Ingredient, SizeVariant } from '../../../core/models/product.model';
import { ProductoService } from '../../../core/services/producto.service';

export interface IngredientModalData {
  product: Product;
  currentIngredients?: Ingredient[];
  selectedVariant?: SizeVariant;
}

export interface IngredientModalResult {
  ingredients: Ingredient[];
  unitPrice: number;
  selectedVariant?: SizeVariant;
}

@Component({
  selector: 'app-ingredient-modal',
  standalone: true,
  imports: [LucideX, LucidePlus, LucideMinus],
  template: `
    <div
      class="flex flex-col w-full overflow-hidden"
      style="background: #1A1A1A; border-top: 3px solid #F07800; max-height: 85vh;"
    >
      <!-- HEADER — fijo -->
      <div class="flex-shrink-0 flex items-start justify-between px-5 pt-5 pb-4 border-b" style="border-color: #2A2A2A;">
        <div>
          <h2 class="font-heading font-semibold text-base text-brand-white leading-tight">
            {{ headerTitle() }}
          </h2>
          <p class="font-heading font-bold text-base text-brand-orange mt-1">{{ data.product.name }}</p>
        </div>
        <button
          (click)="cancel()"
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-brand-surface-2 mt-0.5"
          style="color: #888;"
          aria-label="Cerrar"
        >
          <svg lucideX class="w-5 h-5" aria-hidden="true"></svg>
        </button>
      </div>

      <!-- BODY — scroll independiente -->
      <div class="flex-1 overflow-y-auto px-5 py-4 modal-scroll" role="list" aria-label="Ingredientes">

        <!-- Selector de variantes -->
        @if (data.product.variants && data.product.variants.length > 0) {
          <div class="mb-4">
            <p
              style="color: #F0DCC8; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;"
            >Elige tu tamaño</p>
            <div class="flex gap-2 flex-wrap mt-2">
              @for (variant of data.product.variants; track variant.id) {
                <button
                  (click)="selectedVariant.set(variant)"
                  class="flex flex-col items-center justify-center rounded-lg transition-colors"
                  style="padding: 8px 14px; border-radius: 8px;"
                  [style.background]="selectedVariant()?.id === variant.id ? '#F07800' : '#242424'"
                  [style.border]="selectedVariant()?.id === variant.id ? '1px solid #F07800' : '1px solid #2A2A2A'"
                  [style.color]="selectedVariant()?.id === variant.id ? '#0F0F0F' : '#F0F0F0'"
                  [style.font-weight]="selectedVariant()?.id === variant.id ? '700' : '400'"
                  [attr.aria-pressed]="selectedVariant()?.id === variant.id"
                  [attr.aria-label]="variant.name"
                >
                  <span style="font-size: 14px;">{{ variant.shortName }}</span>
                  @if (variant.extraPrice > 0) {
                    <span style="font-size: 10px; line-height: 1.2;">
                      @if (isAccompaniment()) {
                        {{ formatPrice(variant.extraPrice) }}
                      } @else {
                        +{{ formatPrice(variant.extraPrice) }}
                      }
                    </span>                  }
                </button>
              }
            </div>
          </div>
        }

        @if (included().length > 0) {
          <p
            class="mb-2"
            style="color: #F0DCC8; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;"
          >Ingredientes incluidos</p>

          @for (ing of included(); track ing.id) {
            <div
              class="flex items-center justify-between gap-3 py-2"
              [class.border-b]="!$last"
              style="border-color: #242424;"
              role="listitem"
            >
              <div class="flex-1 min-w-0">
                <span
                  class="font-body text-sm leading-tight"
                  [class.line-through]="ing.currentQuantity === 0"
                  [style.color]="ing.currentQuantity === 0 ? '#555' : '#F0F0F0'"
                >{{ ing.name }}</span>
              </div>

              @if (ing.currentQuantity > ing.defaultQuantity && ing.extraPrice > 0) {
                <span
                  class="inline-flex items-center text-[11px] font-semibold rounded-full px-1.5 py-0.5 mr-1 transition-opacity duration-200"
                  style="background: #F07800; color: #0F0F0F;"
                >+{{ formatPrice((ing.currentQuantity - ing.defaultQuantity) * ing.extraPrice) }}</span>
              }

              <div class="flex items-center gap-1.5 flex-shrink-0" role="group" [attr.aria-label]="'Cantidad de ' + ing.name">
                <button
                  (click)="adjust(ing.id, -1)"
                  [disabled]="isDecreaseDisabled(ing)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style="background: #242424; color: #F0F0F0;"
                  [attr.aria-label]="'Reducir ' + ing.name"
                >
                  <svg lucideMinus class="w-3.5 h-3.5" aria-hidden="true"></svg>
                </button>
                <span
                  class="w-7 text-center font-heading font-bold text-sm"
                  [style.color]="ing.currentQuantity > 0 ? '#F07800' : '#555'"
                  aria-live="polite"
                >{{ ing.currentQuantity }}</span>
                <button
                  (click)="adjust(ing.id, 1)"
                  [disabled]="ing.currentQuantity >= 5"
                  class="w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style="background: #242424; color: #F0F0F0;"
                  [attr.aria-label]="'Agregar más ' + ing.name"
                >
                  <svg lucidePlus class="w-3.5 h-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            </div>
          }
        }

        @if (dynamicExtras().length > 0) {
          @if (allowExtras() && dynamicExtras().length > 0) {
            <div class="border-t" style="border-color: #2A2A2A; margin: 12px 0;"></div>
            <p
              class="flex items-center gap-1 mb-2"
              style="color: #F07800; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;"
            >
              <svg lucidePlus class="w-3 h-3 flex-shrink-0" aria-hidden="true"></svg>
              ¿Deseas agregar extras?
            </p>

            @for (extra of dynamicExtras(); track extra.id) {
              <div
                class="flex items-center justify-between gap-3 py-2"
                [class.border-b]="!$last"
                style="border-color: #242424;"
                role="listitem"
              >
                <div class="flex-1 min-w-0">
                  <span class="font-body text-sm leading-tight" style="color: #F0F0F0;">{{ extra.name }}</span>
                </div>

                @if (extra.currentQuantity > 0 && extra.extraPrice > 0) {
                  <span
                    class="inline-flex items-center text-[11px] font-semibold rounded-full px-1.5 py-0.5 mr-1 transition-opacity duration-200"
                    style="background: #F07800; color: #0F0F0F;"
                  >+{{ formatPrice(extra.currentQuantity * extra.extraPrice) }}</span>
                }

                <div class="flex items-center gap-1.5 flex-shrink-0" role="group" [attr.aria-label]="'Cantidad de ' + extra.name">
                  <button
                    (click)="adjustExtra(extra.id, -1)"
                    [disabled]="extra.currentQuantity === 0"
                    class="w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style="background: #242424; color: #F0F0F0;"
                    [attr.aria-label]="'Reducir ' + extra.name"
                  >
                    <svg lucideMinus class="w-3.5 h-3.5" aria-hidden="true"></svg>
                  </button>
                  <span
                    class="w-7 text-center font-heading font-bold text-sm"
                    [style.color]="extra.currentQuantity > 0 ? '#F07800' : '#555'"
                    aria-live="polite"
                  >{{ extra.currentQuantity }}</span>
                  <button
                    (click)="adjustExtra(extra.id, 1)"
                    [disabled]="extra.currentQuantity >= 5"
                    class="w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style="background: #242424; color: #F0F0F0;"
                    [attr.aria-label]="'Agregar más ' + extra.name"
                  >
                    <svg lucidePlus class="w-3.5 h-3.5" aria-hidden="true"></svg>
                  </button>
                </div>
              </div>
            }
          }
        }

      </div>

      <!-- FOOTER — fijo -->
      <div class="flex-shrink-0 px-5 pt-4 pb-5 border-t space-y-3" style="border-color: #2A2A2A;">
        <!-- Price preview -->
        <div class="flex items-center justify-between rounded-lg px-3 py-2.5" style="background: #111;">
          <span class="font-body text-sm" style="color: #888;">Precio unitario</span>
          <div class="flex items-center gap-2">
            @if (showStrikeThrough()) {
              <span class="font-body text-sm line-through" style="color: #555;">{{ formatPrice(strikeThroughPrice()) }}</span>
              <span class="font-heading font-bold text-lg text-brand-orange" aria-live="polite">{{ formatPrice(previewPrice()) }}</span>
            } @else {
              <span class="font-heading font-bold text-lg text-brand-orange">{{ formatPrice(previewPrice()) }}</span>
            }
          </div>
        </div>
        <!-- Alerta "hamburguesa solitaria" -->
        @if (showLonelyAlert() && !isAccompaniment()) {
          <div class="flex items-start gap-2 px-3 py-2 rounded-lg" style="background: rgba(240, 120, 0, 0.08); border: 1px solid rgba(240, 120, 0, 0.2);">
            <span class="text-sm flex-shrink-0">⚠️</span>
            <p class="font-body text-xs leading-relaxed" style="color: #F0DCC8;">
              Estás dejando tu hamburguesa muy solita. ¿Estas seguro Real?
            </p>
          </div>
        }
        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            (click)="cancel()"
            class="flex-1 py-3 rounded-xl font-heading font-semibold text-base transition-colors border"
            style="background: transparent; color: #888; border-color: #2A2A2A;"
          >Cancelar</button>
          <button
            (click)="confirm()"
            class="flex-[2] py-3 rounded-xl font-heading font-bold text-base transition-all hover:opacity-90 active:scale-95"
            style="background: #F07800; color: #0F0F0F;"
            aria-label="Confirmar y agregar al carrito"
          >{{ confirmButtonLabel() }}</button>
        </div>
      </div>
    </div>
  `,
})
export class IngredientModalComponent {
  data = inject<IngredientModalData>(DIALOG_DATA);
  dialogRef = inject<DialogRef<IngredientModalResult>>(DialogRef);
  private productoService = inject(ProductoService);

  isAccompaniment = computed(() => this.data.product.category === 'acompañamientos');

  headerTitle = computed(() =>
    this.isAccompaniment() ? 'Personaliza tu Acompañamiento' : 'Personaliza tu Burger'
  );

  selectedVariant = signal<SizeVariant | undefined>(
    this.data.currentIngredients
      ? (this.data.selectedVariant ?? this.getDefaultVariant())
      : this.getDefaultVariant()
  );

  private getDefaultVariant(): SizeVariant | undefined {
    const variants = this.data.product.variants;
    if (!variants || variants.length === 0) return undefined;
    if (this.isAccompaniment()) {
      return variants[0];
    }
    return variants.find(v => v.extraPrice === 0) ?? variants[0];
  }

  ingredients = signal<Ingredient[]>(
    this.data.product.ingredients.map(i => {
      const saved = this.data.currentIngredients?.find(ci => ci.id === i.id);
      return { ...i, currentQuantity: saved?.currentQuantity ?? i.currentQuantity };
    })
  );

  extraQuantities = signal<Map<number, number>>(this.buildExtraQuantities());

  private includedIds = computed(() =>
    new Set(this.ingredients().map(i => i.id))
  );

  included = computed(() => this.ingredients().filter(i => i.defaultQuantity > 0));

  dynamicExtras = computed<Ingredient[]>(() => {
    const excluded = this.includedIds();
    return this.productoService.allIngredients()
      .filter(i => !excluded.has(i.id))
      .map(i => ({
        ...i,
        defaultQuantity: 0,
        currentQuantity: this.extraQuantities().get(i.id) ?? 0,
      }));
  });

  activeOptionalCount = computed(() =>
    this.ingredients().filter(
      i => i.defaultQuantity > 0 && !i.isRequired && i.currentQuantity > 0
    ).length
  );

  totalOptionalCount = computed(() =>
    this.ingredients().filter(
      i => i.defaultQuantity > 0 && !i.isRequired
    ).length
  );

  showLonelyAlert = computed(() => {
    const total = this.totalOptionalCount();
    if (total === 0) return false;
    return this.activeOptionalCount() < total * 0.5;
  });

  isModified = computed(() => {
    const variantChanged = (this.selectedVariant()?.extraPrice ?? 0) !== 0;
    return variantChanged ||
      this.ingredients().some(i => i.currentQuantity !== i.defaultQuantity) ||
      this.dynamicExtras().some(e => e.currentQuantity > 0);
  });

  confirmButtonLabel = computed(() => {
    // Si es acompañamiento
    if (this.isAccompaniment()) {
      // Si tiene extras añadidos, pasa a ser personalización
      const hasExtrasAdded = this.dynamicExtras().some(e => e.currentQuantity > 0);
      return hasExtrasAdded ? 'Confirmar personalización' : 'Agregar';
    }

    // Si es hamburguesa (mantiene la lógica original)
    return this.isModified() ? 'Confirmar personalización' : 'Agregar receta original';
  });

  previewPrice = computed(() => {

    // SI ES ACOMPAÑAMIENTO: 
    if (this.isAccompaniment()) {
      const variant = this.selectedVariant();
      // Si la variante tiene un precio definido (>0), lo usamos; de lo contrario, usamos el precio base del producto
      const variantPrice = (variant && variant.extraPrice > 0) ? variant.extraPrice : this.data.product.price;

      const dynamicCost = this.dynamicExtras().reduce((sum, extra) => {
        return sum + extra.currentQuantity * extra.extraPrice;
      }, 0);
      return variantPrice + dynamicCost;
    }

    const variantCost = this.selectedVariant()?.extraPrice ?? 0;
    const baseExtras = this.ingredients().reduce((sum, ing) => {
      const excedente = Math.max(0, ing.currentQuantity - ing.defaultQuantity);
      return sum + excedente * ing.extraPrice;
    }, 0);
    const dynamicCost = this.dynamicExtras().reduce((sum, extra) => {
      return sum + extra.currentQuantity * extra.extraPrice;
    }, 0);
    return this.data.product.price + variantCost + baseExtras + dynamicCost;
  });

  // Determina qué precio debe ir tachado (para papas es la variante actual; para burgers es el precio base)
  strikeThroughPrice = computed(() => {
    if (this.isAccompaniment()) {
      const variant = this.selectedVariant();
      return (variant && variant.extraPrice > 0) ? variant.extraPrice : this.data.product.price;
    }
    return this.data.product.price;
  });

  // Define si debemos mostrar el precio tachado (en papas solo si hay extras añadidos)
  showStrikeThrough = computed(() => {
    if (this.isAccompaniment()) {
      const dynamicCost = this.dynamicExtras().reduce((sum, extra) => sum + extra.currentQuantity * extra.extraPrice, 0);
      return dynamicCost > 0;
    }
    return this.previewPrice() > this.data.product.price;
  });

  allowExtras = computed(() => this.data.product.allowExtras ?? true);

  private buildExtraQuantities(): Map<number, number> {
    const map = new Map<number, number>();
    if (!this.data.currentIngredients) return map;
    const productIngIds = new Set(this.data.product.ingredients.map(i => i.id));
    for (const ci of this.data.currentIngredients) {
      if (!productIngIds.has(ci.id) && ci.currentQuantity > 0) {
        map.set(ci.id, ci.currentQuantity);
      }
    }
    return map;
  }

  isDecreaseDisabled(ing: Ingredient): boolean {
    if (ing.currentQuantity === 0) return true;
    if (ing.isRequired && ing.currentQuantity <= ing.defaultQuantity) return true;
    return false;
  }

  adjust(id: number, delta: number): void {
    this.ingredients.update(list =>
      list.map(i =>
        i.id === id
          ? { ...i, currentQuantity: Math.max(0, Math.min(5, i.currentQuantity + delta)) }
          : i
      )
    );
  }

  adjustExtra(extraId: number, delta: number): void {
    this.extraQuantities.update(map => {
      const current = map.get(extraId) ?? 0;
      return new Map(map).set(extraId, Math.max(0, Math.min(5, current + delta)));
    });
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-CL')}`;
  }

  confirm(): void {
    const baseIngredients = this.ingredients().filter(
      i => i.defaultQuantity > 0 || i.currentQuantity > 0
    );
    const activeExtras = this.dynamicExtras().filter(e => e.currentQuantity > 0);
    this.dialogRef.close({
      ingredients: [...baseIngredients, ...activeExtras],
      unitPrice: this.previewPrice(),
      selectedVariant: this.selectedVariant(),
    });
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
