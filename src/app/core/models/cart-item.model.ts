import { Product, Ingredient, SizeVariant } from './product.model';
import { Combo } from './combo.model';

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  customizedIngredients: Ingredient[];
  unitPrice: number;
  selectedVariant?: SizeVariant;
  selectedVariants?: SizeVariant[];
  isCombo?: boolean;
  combo?: Combo;
  selectedDrink?: Product;
  /**
   * `true` = línea creada desde "Burger de la semana".
   * Se mantiene separada de la burger de carta aunque sea el mismo producto,
   * porque tiene otro precio y no admite personalización.
   */
  isPromo?: boolean;
}
