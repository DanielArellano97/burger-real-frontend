import { Combo, ComboOption, Ingredient, Portion, Product } from '../catalog/catalog.models';

/* ─── Lo que se guarda (solo referencias, nunca precios) ─────────────────── */

/**
 * Personalización como `ingredienteId → cantidad`, guardando solo lo que
 * difiere de la receta. `{}` = receta original.
 */
export type IngredientQuantities = Readonly<Record<number, number>>;

export interface StoredProductLine {
  kind: 'product';
  id: string;
  productId: number;
  quantity: number;
  portionId: number | null;
  quantities: IngredientQuantities;
  /** Día (`YYYY-MM-DD`) en que se agregó como "Burger de la semana"; `null` = carta. */
  promoDate: string | null;
}

export interface StoredComboLine {
  kind: 'combo';
  id: string;
  comboId: number;
  quantity: number;
  /** Ids de las opciones elegidas, en orden (ej. bebidas). */
  selectionIds: readonly number[];
}

export type StoredCartLine = StoredProductLine | StoredComboLine;

/* ─── Lo que ve la app (reconstruido desde el catálogo vigente) ─────────── */

interface CartItemBase {
  id: string;
  name: string;
  quantity: number;
  /** Calculado desde el catálogo actual: nunca viene del almacenamiento. */
  unitPrice: number;
}

export interface ProductCartItem extends CartItemBase {
  kind: 'product';
  product: Product;
  portion: Portion | null;
  /** Receta + extras agregados, con las cantidades elegidas. */
  ingredients: readonly Ingredient[];
  isPromo: boolean;
}

export interface ComboCartItem extends CartItemBase {
  kind: 'combo';
  combo: Combo;
  selections: readonly ComboOption[];
}

export type CartItem = ProductCartItem | ComboCartItem;
