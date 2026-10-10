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
}
