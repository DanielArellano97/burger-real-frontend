import { Product, Ingredient } from '../models/product.model';

export function calculateUnitPrice(product: Product, ingredients: Ingredient[]): number {
  const extras = ingredients.reduce((sum, ing) => {
    const extraUnits = Math.max(0, ing.currentQuantity - ing.defaultQuantity);
    return sum + extraUnits * ing.extraPrice;
  }, 0);
  return product.price + extras;
}
