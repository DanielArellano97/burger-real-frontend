import {
  IncludedProduct,
  Ingredient,
  IngredientMaster,
  Product,
  RecipeLine,
  SizeVariant,
} from '../models/product.model';
import { INGREDIENTS_DATA } from './ingredients.data';

/**
 * Producto en formato "receta": referencia ingredientes del catálogo maestro
 * en vez de duplicar nombre y precio en cada hamburguesa.
 */
interface ProductReceta {
  id: number;
  name: string;
  description: string;
  price: number;
  precioOferta?: number;
  comboPrice?: number;
  category: Product['category'];
  customizable: boolean;
  imageUrl?: string;
  allowExtras?: boolean;
  variants?: SizeVariant[];
  incluye?: IncludedProduct[];
  recipe: RecipeLine[];
}

/**
 * Porción de papas que acompaña a todas las burgers (100g).
 * Es interna: no se vende ni se muestra, solo suma para costos e inventario.
 */
const PAPAS_BURGER: IncludedProduct[] = [
  { productoId: 11, varianteId: 504, cantidad: 1 },
];

const INGREDIENT_BY_ID = new Map<number, IngredientMaster>(
  INGREDIENTS_DATA.map(i => [i.id, i])
);

/**
 * Expande una receta al snapshot que consumen el modal, el carrito y WhatsApp.
 * Si un id no existe en el catálogo maestro, falla en build/arranque en vez de
 * mostrar un ingrediente incompleto en producción.
 */
function buildIngredients(recipe: RecipeLine[]): Ingredient[] {
  return recipe.map(({ ingredientId, quantity, isRequired }) => {
    const master = INGREDIENT_BY_ID.get(ingredientId);

    if (!master) {
      throw new Error(`Ingrediente ${ingredientId} no existe en INGREDIENTS_DATA`);
    }

    return {
      id: master.id,
      name: master.name,
      defaultQuantity: quantity,
      currentQuantity: quantity,
      extraPrice: master.extraPrice,
      isRequired: isRequired ?? false,
      canBeExtra: master.canBeExtra,
      control: master.control,
      hidden: master.hidden,
    };
  });
}

const PRODUCTS_RECETA: ProductReceta[] = [
  // ─── Hamburguesas ───
  // Cada burger acepta `imageUrl` con la URL pública de Cloudinary.
  // Formato: https://res.cloudinary.com/tu-cuenta/image/upload/burger-real/<archivo>.webp
  // Para usarla, descomenta la línea de la burger y pega tu URL.
  {
    id: 1,
    // imageUrl: 'https://res.cloudinary.com/tu-cuenta/image/upload/burger-real/cheese-burger.webp',
    name: 'Cheese Burger',
    description: 'Pan brioche, medallón 100g y cheddar americano. Nuestra clásica',
    price: 4490,
    precioOferta: 3490,
    category: 'hamburguesas',
    customizable: true,
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
    ],
  },
  {
    id: 2,
    // imageUrl: 'https://res.cloudinary.com/tu-cuenta/image/upload/burger-real/cheese-bacon.webp',
    name: 'Cheese Bacon',
    description: 'Pan brioche, medallón 100g, cheddar americano y tocino ahumado.',
    price: 5190,
    category: 'hamburguesas',
    customizable: true,
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 203, quantity: 1 },
    ],
  },
  {
    id: 3,
    name: 'Onion Caramel',
    description: 'Pan brioche, medallón 100g, cheddar americano y cebolla caramelizada',
    price: 4990,
    precioOferta: 3990,
    category: 'hamburguesas',
    customizable: true,
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 204, quantity: 1 },
    ],
  },
  {
    id: 4,
    name: 'Onion Ring',
    description: 'Pan brioche, medallón 100g, cheddar americano y aritos de cebolla (x2)',
    price: 4990,
    precioOferta: 3990,
    category: 'hamburguesas',
    customizable: true,
    imageUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/v1793300205/Hamburguesa_gourmet_con_aros_de_cebolla.png',
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 205, quantity: 1 },
    ],
  },
  {
    id: 5,
    name: 'Real de la casa',
    description: 'Pan brioche, medallón de 100g, cheddar americano, cebolla caramelizada, tocino ahumado y aritos de cebolla (x2)',
    price: 6690,
    category: 'hamburguesas',
    customizable: true,
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 204, quantity: 1 },
      { ingredientId: 203, quantity: 1 },
      { ingredientId: 205, quantity: 1 },
    ],
  },
  {
    id: 6,
    name: 'Onion Caramel Bacon',
    description: 'Pan brioche, medallón de 100g, cheddar americano, cebolla caramelizada y tocino ahumado',
    price: 5690,
    category: 'hamburguesas',
    customizable: true,
    imageUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/v1793299884/Hamburguesa_doble_con_cebolla_caramelizada.png',
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 204, quantity: 1 },
      { ingredientId: 203, quantity: 1 },
    ],
  },
  {
    id: 7,
    name: 'Onion Ring Bacon',
    description: 'Pan brioche, medallón de 100g, cheddar americano, tocino ahumado y aritos de cebolla (x2)',
    price: 5690,
    category: 'hamburguesas',
    customizable: true,
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 203, quantity: 1 },
      { ingredientId: 205, quantity: 1 },
    ],
  },
  {
    id: 8,
    name: 'Avocado Bacon',
    description: 'Pan brioche, medallón de 100g, cheddar americano, tocino ahumado y palta',
    price: 6190,
    category: 'hamburguesas',
    customizable: true,
    imageUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/v1793297298/Hamburguesa_gourmet_con_guacamole_y_cheddar.png',
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 203, quantity: 1 },
      { ingredientId: 206, quantity: 1 },
    ],
  },
  {
    id: 9,
    name: 'Avocado Egg',
    description: 'Pan brioche, medallón de 100g, cheddar americano, palta y huevo frito',
    price: 6190,
    precioOferta: 5190,
    category: 'hamburguesas',
    customizable: true,
    imageUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/v1793296282/Hamburguesa_gourmet_con_huevo_y_guacamole.png',
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 206, quantity: 1 },
      { ingredientId: 207, quantity: 1 },
    ],
  },
  {
    id: 10,
    name: 'La Trilogía del Rey (by @selvaenlaluna)',
    description: 'Pan brioche, medallón de 100g, cheddar americano, cebolla caramelizada y huevo frito',
    price: 5590,
    precioOferta: 4590,
    category: 'hamburguesas',
    customizable: true,
    imageUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/v1793297458/Hamburguesa_gourmet_con_huevo_frito.png',
    incluye: PAPAS_BURGER,
    recipe: [
      { ingredientId: 200, quantity: 1, isRequired: true },
      { ingredientId: 201, quantity: 1, isRequired: true },
      { ingredientId: 202, quantity: 1 },
      { ingredientId: 204, quantity: 1 },
      { ingredientId: 207, quantity: 1 },
    ],
  },

  // ─── Acompañamientos ───
  {
    id: 11,
    name: 'Papas Fritas Reales',
    description: 'Ricas papitas caseras acompañadas con salsa de la casa',
    price: 1990,
    category: 'acompañamientos',
    customizable: true,
    imageUrl: 'assets/images/papas.webp',
    variants: [
      { id: 501, name: 'Porción Normal (150g)', shortName: '150g', extraPrice: 0 },
      { id: 502, name: 'Porción Mediana (250g)', shortName: '250g', extraPrice: 2990 },
      { id: 503, name: 'Porción Grande (300g)', shortName: '300g', extraPrice: 3990 },
      // Uso interno: porción que acompaña a las burgers. No se vende ni se muestra.
      { id: 504, name: 'Porción Burger (100g)', shortName: '100g', extraPrice: 0, comboPrice: 0, internal: true },
    ],
    recipe: [],
  },
  {
    id: 12,
    name: 'Aritos de Cebolla',
    description: 'Porción de crujientes aritos de cebolla para acompañar tu pedido',
    price: 1190,
    category: 'acompañamientos',
    customizable: true,
    allowExtras: false,
    imageUrl: 'assets/images/aritos.webp',
    variants: [
      { id: 601, name: 'Porción Normal (x5)', shortName: 'x5', extraPrice: 0, comboPrice: 1000 },
      { id: 602, name: 'Porción Mediana (x10)', shortName: 'x10', extraPrice: 2390, comboPrice: 2000 },
      { id: 603, name: 'Porción Grande (x15)', shortName: 'x15', extraPrice: 3590, comboPrice: 3000 },
    ],
    recipe: [],
  },
  {
    id: 13,
    name: 'Deditos de Pollo',
    description: 'Porción de crujientes deditos de pollo para acompañar tu pedido',
    price: 1690,
    category: 'acompañamientos',
    customizable: true,
    allowExtras: false,
    imageUrl: 'assets/images/aritos.webp',
    variants: [
      { id: 701, name: 'Porción Normal (x3)', shortName: 'x3', extraPrice: 0, comboPrice: 1500 },
      { id: 702, name: 'Porción Mediana (x6)', shortName: 'x6', extraPrice: 3390, comboPrice: 3000 },
      { id: 703, name: 'Porción Grande (x9)', shortName: 'x9', extraPrice: 5090, comboPrice: 4500 },
    ],
    recipe: [],
  },

  // ─── Bebestibles ───
  {
    id: 21,
    name: 'Coca-Cola 350ml',
    description: 'Lata fría de Coca-Cola',
    price: 1190,
    comboPrice: 1000,
    category: 'bebestibles',
    customizable: false,
    recipe: [],
  },
  {
    id: 22,
    name: 'Fanta 350ml',
    description: 'Lata fría de Fanta',
    price: 1190,
    comboPrice: 1000,
    category: 'bebestibles',
    customizable: false,
    recipe: [],
  },
  {
    id: 23,
    name: 'Sprite 350ml',
    description: 'Lata fría de Sprite',
    price: 1190,
    comboPrice: 1000,
    category: 'bebestibles',
    customizable: false,
    recipe: [],
  },
  {
    id: 24,
    name: 'Agua Gasificada 500cc',
    description: 'Agua mineral alcalina con gas',
    price: 1190,
    comboPrice: 1000,
    category: 'bebestibles',
    customizable: false,
    recipe: [],
  },
  {
    id: 25,
    name: 'Jugo Jumex Piña Coco',
    description: 'Refrescante néctar de fruta en lata.',
    price: 1190,
    comboPrice: 1000,
    category: 'bebestibles',
    customizable: false,
    recipe: [],
  },
];

export const MENU_DATA: Product[] = PRODUCTS_RECETA.map(({ recipe, ...product }) => ({
  ...product,
  ingredients: buildIngredients(recipe),
}));

export const CATEGORIES = [
  { key: 'hamburguesas',    label: 'Hamburguesas',    emoji: '🍔' },
  { key: 'acompañamientos', label: 'Acompañamientos', emoji: '🍟' },
  { key: 'bebestibles',     label: 'Bebestibles',     emoji: '🥤' },
] as const;
