import { ComboLine, Ingredient, Portion, Product } from './catalog.models';

/** Porciones que se ofrecen al cliente (excluye las internas). */
export function sellablePortions(product: Product): Portion[] {
  return product.portions.filter(p => !p.internal);
}

/** Porción preseleccionada: la primera vendible (la base). */
export function defaultPortion(product: Product): Portion | null {
  return sellablePortions(product)[0] ?? null;
}

/** Precio de venta de una porción: precio base + adicional. */
export function portionPrice(product: Product, portion: Portion | null): number {
  return product.price + (portion?.additionalPrice ?? 0);
}

/**
 * Costo de la personalización: cada unidad sobre la cantidad base suma su
 * `extraPrice`. Quitar ingredientes NO descuenta.
 */
export function customizationCost(ingredients: readonly Ingredient[]): number {
  return ingredients.reduce(
    (sum, i) => sum + Math.max(0, i.currentQuantity - i.defaultQuantity) * i.extraPrice,
    0
  );
}

/** Precio unitario de un producto con su porción y personalización. */
export function productUnitPrice(
  product: Product,
  ingredients: readonly Ingredient[],
  portion: Portion | null
): number {
  return portionPrice(product, portion) + customizationCost(ingredients);
}

/**
 * Precio unitario de un producto dentro de un combo.
 * - Porción con `comboPrice` → ese precio.
 * - Porción con adicional → su precio de venta.
 * - Si no → `comboPrice` del producto, o su precio normal (nunca `offerPrice`).
 */
export function comboUnitPrice(product: Product, portion: Portion | null): number {
  if (portion) {
    if (portion.comboPrice !== null) return portion.comboPrice;
    if (portion.additionalPrice > 0) return portionPrice(product, portion);
  }
  return product.comboPrice ?? product.price;
}

/** Precio final de un combo: suma de sus líneas. */
export function comboTotal(lines: readonly Pick<ComboLine, 'unitPrice' | 'quantity'>[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}
