/**
 * Modelos de dominio del catálogo.
 *
 * Son los que consume toda la app (UI, carrito, pedido). No dependen de
 * Angular ni de cómo se guardan los datos: el adaptador de infraestructura
 * (hoy tablas locales, mañana una API) los construye con `catalog.mapper.ts`.
 */

export type ProductCategory = 'hamburguesas' | 'acompañamientos' | 'bebestibles';

/** `counter` = 0..5 unidades · `toggle` = sí/no. */
export type IngredientControl = 'counter' | 'toggle';

/** Máximo de unidades de un ingrediente o extra en la personalización. */
export const MAX_INGREDIENT_QUANTITY = 5;

/** Ingrediente del catálogo maestro que se ofrece como extra. */
export interface ExtraOption {
  id: number;
  name: string;
  /** Precio por unidad agregada (0 = gratis). */
  extraPrice: number;
  control: IngredientControl;
  /** Categorías donde se ofrece; `null` = en todas. */
  categories: readonly ProductCategory[] | null;
}

/**
 * Ingrediente dentro de un producto: receta base + lo que eligió el cliente.
 * Los extras agregados también se representan así, con `defaultQuantity: 0`.
 */
export interface Ingredient {
  id: number;
  name: string;
  defaultQuantity: number;
  currentQuantity: number;
  /** Precio por cada unidad sobre `defaultQuantity`. */
  extraPrice: number;
  /** No se puede bajar de la cantidad base (ej. medallón). */
  isRequired: boolean;
  control: IngredientControl;
  /** Está en la receta pero no se muestra al cliente (ej. pan). */
  hidden: boolean;
}

/**
 * Porción (tamaño) de un producto.
 * Precio de venta = `Product.price` (porción base) + `additionalPrice`.
 */
export interface Portion {
  id: number;
  name: string;
  shortName: string;
  additionalPrice: number;
  /** Precio absoluto de esta porción dentro de un combo; `null` = usa el de venta. */
  comboPrice: number | null;
  /** Porción de uso interno (ej. papas 100g de las burgers): nunca se ofrece. */
  internal: boolean;
}

/** Producto que viene dentro de otro (ej. papas 100g de cada burger). */
export interface IncludedItem {
  productId: number;
  portionId: number | null;
  quantity: number;
}

export interface Product {
  id: number;
  category: ProductCategory;
  name: string;
  /** Nombre corto para selectores (ej. "Coca-Cola"); `null` = usa `name`. */
  shortName: string | null;
  description: string;
  /** Precio de la porción base. */
  price: number;
  /** Precio de "Burger de la semana"; `null` = no participa de la promo. */
  offerPrice: number | null;
  /** Precio dentro de un combo; `null` = usa `price`. */
  comboPrice: number | null;
  /** Abre el modal de personalización (burgers y acompañamientos). */
  customizable: boolean;
  /** Muestra la sección "¿Deseas agregar extras?". */
  allowsExtras: boolean;
  /** `false` = agotado: se muestra pero no se puede pedir. */
  available: boolean;
  /** Id público de Cloudinary (o URL/asset local); `null` = sin foto. */
  image: string | null;
  ingredients: readonly Ingredient[];
  portions: readonly Portion[];
  includes: readonly IncludedItem[];
}

/** Opción elegible dentro de un combo (ej. una bebida). `id` = id del producto. */
export interface ComboOption {
  id: number;
  name: string;
  shortName: string;
}

export interface ComboLine {
  /** Único dentro del combo (sirve como `track` en las listas). */
  id: string;
  /** `null` cuando el cliente elige el producto (ver `options`). */
  productId: number | null;
  name: string;
  quantity: number;
  portion: Portion | null;
  /** La porción existe para costos pero no se muestra (ej. papas 100g). */
  hidePortion: boolean;
  /** Viene incluida dentro de otro producto del combo: solo visual, $0. */
  includedInProduct: boolean;
  /** Precio unitario de la línea dentro del combo. */
  unitPrice: number;
  requiresSelection: boolean;
  /** Opciones para elegir; vacío cuando `requiresSelection` es `false`. */
  options: readonly ComboOption[];
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  image: string | null;
  /** Suma de `unitPrice × quantity` de sus líneas. */
  price: number;
  available: boolean;
  lines: readonly ComboLine[];
}

export interface Catalog {
  products: readonly Product[];
  combos: readonly Combo[];
  extras: readonly ExtraOption[];
}
