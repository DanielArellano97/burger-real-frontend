export interface Ingredient {
  id: number;
  name: string;
  defaultQuantity: number;
  currentQuantity: number;
  extraPrice: number;
  isRequired?: boolean;
}

export interface SizeVariant {
  id: number;
  name: string;
  shortName: string;
  extraPrice: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'hamburguesas' | 'acompañamientos' | 'bebestibles' | 'extras';
  image?: string;
  customizable: boolean;
  ingredients: Ingredient[];
  variants?: SizeVariant[];
  precioOferta?: number;
}
