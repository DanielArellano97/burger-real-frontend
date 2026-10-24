export type IngredientControl = 'counter' | 'toggle';

export type ProductCategory = 'hamburguesas' | 'acompañamientos' | 'bebestibles';

/**
 * Ingrediente en tiempo de ejecución (snapshot de receta + personalización).
 * Es la forma que consumen el modal, el carrito y WhatsApp.
 */
export interface Ingredient {
  id: number;
  name: string;
  defaultQuantity: number;
  currentQuantity: number;
  extraPrice: number;
  isRequired?: boolean;
  canBeExtra?: boolean;
  control?: IngredientControl;
  hidden?: boolean;
}

/**
 * Catálogo maestro de ingredientes: única fuente de verdad para recetas y extras.
 * Equivale a la tabla `ingredientes` de la futura BD.
 */
export interface IngredientMaster {
  id: number;
  name: string;
  /** Precio que se cobra al cliente por agregarlo como extra (0 = gratis). */
  extraPrice: number;
  /** Define si se ofrece en la sección "¿Deseas agregar extras?". */
  canBeExtra: boolean;
  /** `counter` = 0..5 unidades · `toggle` = sí/no. */
  control: IngredientControl;
  /** Existe en la receta pero no se muestra en el modal (ej. pan). */
  hidden?: boolean;
  /**
   * Categorías de producto donde se ofrece como extra.
   * Si se omite, se ofrece en todas. Ej. Pepinillos: solo 'hamburguesas'.
   */
  extraCategories?: ProductCategory[];
  /** Costo unitario de producción. NO es el precio de venta. */
  cost?: number;
}

/**
 * Línea de receta: referencia a un ingrediente del catálogo maestro.
 * Equivale a la tabla intermedia `producto_ingrediente`.
 */
export interface RecipeLine {
  ingredientId: number;
  quantity: number;
  /** `true` = no se puede quitar de la receta (equivale a `permiteQuitar: false`). */
  isRequired?: boolean;
}

export interface SizeVariant {
  id: number;
  name: string;
  shortName: string;
  /** Precio de venta individual de esta porción. */
  extraPrice: number;
  /**
   * Precio de esta porción cuando se incluye en un combo.
   * Si se omite, el combo usa `extraPrice` (o el precio base del producto).
   */
  comboPrice?: number;
  /**
   * `true` = porción de uso interno (recetas/costos). No se ofrece en los
   * selectores de venta ni en la personalización.
   */
  internal?: boolean;
}

/** Producto o porción que viene incluido en otro producto (ej. papas de una burger). */
export interface IncludedProduct {
  productoId: number;
  varianteId?: number;
  cantidad: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  /** Precio unitario cuando el producto se vende dentro de un combo. Si falta, se usa `price`. */
  comboPrice?: number;
  category: ProductCategory;
  image?: string;
  customizable: boolean;
  ingredients: Ingredient[];
  variants?: SizeVariant[];
  precioOferta?: number;
  allowExtras?: boolean;
  /** Componentes incluidos que no se personalizan (para costos y BD). */
  incluye?: IncludedProduct[];
}
