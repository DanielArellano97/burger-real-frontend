import { Component, inject, signal, computed } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideX, LucidePlus, LucideMinus } from '@lucide/angular';
import { Ingredient, MAX_INGREDIENT_QUANTITY, Portion, Product } from '../../../domain/catalog/catalog.models';
import { customizationCost, defaultPortion, portionPrice, productUnitPrice, sellablePortions } from '../../../domain/catalog/pricing';
import { extrasFor } from '../../../domain/cart/cart-lines';
import { formatPrice } from '../../../domain/shared/money';
import { CatalogService } from '../../../application/catalog.service';

export interface IngredientModalData {
  product: Product;
  /** Al editar desde el carrito: lo que el cliente ya había elegido. */
  currentIngredients?: readonly Ingredient[];
  currentPortion?: Portion | null;
}

export interface IngredientModalResult {
  /** Receta con cantidades elegidas + extras agregados. */
  ingredients: Ingredient[];
  portion: Portion | null;
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

        <!-- Selector de porciones -->
        @if (portions.length > 0) {
          <div class="mb-4">
            <p
              style="color: #F0DCC8; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;"
            >Elige tu tamaño</p>
            <div class="flex gap-2 flex-wrap mt-2">
              @for (portion of portions; track portion.id) {
                <button
                  (click)="selectedPortion.set(portion)"
                  class="flex flex-col items-center justify-center rounded-lg transition-colors"
                  style="padding: 8px 14px; border-radius: 8px;"
                  [style.background]="selectedPortion()?.id === portion.id ? '#F07800' : '#242424'"
                  [style.border]="selectedPortion()?.id === portion.id ? '1px solid #F07800' : '1px solid #2A2A2A'"
                  [style.color]="selectedPortion()?.id === portion.id ? '#0F0F0F' : '#F0F0F0'"
                  [style.font-weight]="selectedPortion()?.id === portion.id ? '700' : '400'"
                  [attr.aria-pressed]="selectedPortion()?.id === portion.id"
                  [attr.aria-label]="portion.name"
                >
                  <span style="font-size: 14px;">{{ portion.shortName }}</span>
                  <!-- Porciones con adicional muestran su precio final (base + adicional). -->
                  @if (portion.additionalPrice > 0) {
                    <span style="font-size: 10px; line-height: 1.2;">{{ formatPrice(priceOf(portion)) }}</span>
                  }
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
                  [disabled]="ing.currentQuantity >= maxQuantity"
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

                @if (extra.control === 'toggle') {
                  <button
                    type="button"
                    role="switch"
                    [attr.aria-checked]="extra.currentQuantity > 0"
                    (click)="toggleExtra(extra.id)"
                    class="relative flex-shrink-0 rounded-full transition-colors"
                    style="width: 44px; height: 24px;"
                    [style.background]="extra.currentQuantity > 0 ? '#F07800' : '#242424'"
                    [style.border]="extra.currentQuantity > 0 ? '1px solid #F07800' : '1px solid #3A3A3A'"
                    [attr.aria-label]="extra.name + (extra.currentQuantity > 0 ? ': agregado' : ': no agregado')"
                  >
                    <span
                      class="absolute rounded-full transition-transform"
                      style="top: 2px; left: 2px; width: 18px; height: 18px;"
                      [style.background]="extra.currentQuantity > 0 ? '#0F0F0F' : '#888'"
                      [style.transform]="extra.currentQuantity > 0 ? 'translateX(20px)' : 'translateX(0)'"
                    ></span>
                  </button>
                } @else {
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
                      [disabled]="extra.currentQuantity >= maxQuantity"
                      class="w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style="background: #242424; color: #F0F0F0;"
                      [attr.aria-label]="'Agregar más ' + extra.name"
                    >
                      <svg lucidePlus class="w-3.5 h-3.5" aria-hidden="true"></svg>
                    </button>
                  </div>
                }
              </div>
            }
          }
        }

      </div>

      <!-- FOOTER — fijo -->
      <div class="flex-shrink-0 px-5 pt-4 pb-5 border-t space-y-3" style="border-color: #2A2A2A;">
        <!-- Price preview -->
        <div class="flex items-center justify-between rounded-lg px-3 py-2.5" style="background: #111;">
          <span class="font-body text-sm" style="color: #888;">{{ priceLabel() }}</span>
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
  readonly data = inject<IngredientModalData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<IngredientModalResult>>(DialogRef);
  private readonly catalog = inject(CatalogService);

  private readonly product = this.data.product;
  private readonly isEditing = this.data.currentIngredients !== undefined;

  readonly formatPrice = formatPrice;
  readonly maxQuantity = MAX_INGREDIENT_QUANTITY;

  readonly isAccompaniment = computed(() => this.product.category === 'acompañamientos');
  readonly headerTitle = computed(() =>
    this.isAccompaniment() ? 'Personaliza tu Acompañamiento' : 'Personaliza tu Burger'
  );

  /** Porciones vendibles (excluye las internas, ej. papas 100g de las burgers). */
  readonly portions = sellablePortions(this.product);
  readonly selectedPortion = signal<Portion | null>(
    this.isEditing ? (this.data.currentPortion ?? defaultPortion(this.product)) : defaultPortion(this.product)
  );

  /** Receta con las cantidades actuales (o las guardadas al editar). */
  readonly ingredients = signal<Ingredient[]>(
    this.product.ingredients.map(i => {
      const saved = this.data.currentIngredients?.find(ci => ci.id === i.id);
      return { ...i, currentQuantity: saved?.currentQuantity ?? i.currentQuantity };
    })
  );

  private readonly extraQuantities = signal<ReadonlyMap<number, number>>(this.savedExtraQuantities());

  readonly included = computed(() =>
    this.ingredients().filter(i => i.defaultQuantity > 0 && !i.hidden)
  );

  /** Extras del catálogo maestro que aplican a este producto, con su cantidad elegida. */
  readonly dynamicExtras = computed<Ingredient[]>(() =>
    extrasFor(this.product, this.catalog.extras()).map(extra => ({
      id: extra.id,
      name: extra.name,
      extraPrice: extra.extraPrice,
      control: extra.control,
      defaultQuantity: 0,
      currentQuantity: this.extraQuantities().get(extra.id) ?? 0,
      isRequired: false,
      hidden: false,
    }))
  );

  readonly allowExtras = computed(() => this.product.allowsExtras);

  private readonly optionalIngredients = computed(() =>
    this.ingredients().filter(i => i.defaultQuantity > 0 && !i.isRequired)
  );

  /** "Hamburguesa solitaria": quedan menos de la mitad de los opcionales. */
  readonly showLonelyAlert = computed(() => {
    const optional = this.optionalIngredients();
    if (optional.length === 0) return false;
    return optional.filter(i => i.currentQuantity > 0).length < optional.length * 0.5;
  });

  private readonly extrasCost = computed(() => customizationCost(this.dynamicExtras()));

  readonly isModified = computed(() =>
    (this.selectedPortion()?.additionalPrice ?? 0) !== 0 ||
    this.ingredients().some(i => i.currentQuantity !== i.defaultQuantity) ||
    this.dynamicExtras().some(e => e.currentQuantity > 0)
  );

  readonly confirmButtonLabel = computed(() => {
    if (this.isAccompaniment()) {
      return this.dynamicExtras().some(e => e.currentQuantity > 0) ? 'Confirmar personalización' : 'Agregar';
    }
    return this.isModified() ? 'Confirmar personalización' : 'Agregar receta original';
  });

  readonly previewPrice = computed(() =>
    productUnitPrice(this.product, [...this.ingredients(), ...this.dynamicExtras()], this.selectedPortion())
  );

  /** Precio tachado: la porción elegida (acompañamientos) o el precio base (burgers). */
  readonly strikeThroughPrice = computed(() =>
    this.isAccompaniment() ? portionPrice(this.product, this.selectedPortion()) : this.product.price
  );

  readonly showStrikeThrough = computed(() =>
    this.isAccompaniment() ? this.extrasCost() > 0 : this.previewPrice() > this.product.price
  );

  readonly priceLabel = computed(() => {
    const name = this.product.name.toLowerCase();
    if (name.includes('papas') || name.includes('fritas')) return 'Precio Papitas';
    if (name.includes('aritos')) return 'Precio Aritos';
    if (name.includes('deditos') || name.includes('pollo')) return 'Precio Deditos';
    return 'Precio Burger';
  });

  priceOf(portion: Portion): number {
    return portionPrice(this.product, portion);
  }

  private savedExtraQuantities(): Map<number, number> {
    const map = new Map<number, number>();
    const inRecipe = new Set(this.product.ingredients.map(i => i.id));
    for (const ingredient of this.data.currentIngredients ?? []) {
      if (!inRecipe.has(ingredient.id) && ingredient.currentQuantity > 0) {
        map.set(ingredient.id, ingredient.currentQuantity);
      }
    }
    return map;
  }

  isDecreaseDisabled(ing: Ingredient): boolean {
    if (ing.currentQuantity === 0) return true;
    return ing.isRequired && ing.currentQuantity <= ing.defaultQuantity;
  }

  adjust(id: number, delta: number): void {
    this.ingredients.update(list =>
      list.map(i =>
        i.id === id
          ? { ...i, currentQuantity: Math.max(0, Math.min(MAX_INGREDIENT_QUANTITY, i.currentQuantity + delta)) }
          : i
      )
    );
  }

  adjustExtra(id: number, delta: number): void {
    this.extraQuantities.update(map => {
      const current = map.get(id) ?? 0;
      return new Map(map).set(id, Math.max(0, Math.min(MAX_INGREDIENT_QUANTITY, current + delta)));
    });
  }

  /** Extras sí/no (ej. Pepinillos): alternan entre 0 y 1. */
  toggleExtra(id: number): void {
    this.extraQuantities.update(map => new Map(map).set(id, (map.get(id) ?? 0) > 0 ? 0 : 1));
  }

  confirm(): void {
    this.dialogRef.close({
      ingredients: [...this.ingredients(), ...this.dynamicExtras().filter(e => e.currentQuantity > 0)],
      portion: this.selectedPortion(),
    });
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
