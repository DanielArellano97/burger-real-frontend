import { Product } from '../models/product.model';

export const MENU_DATA: Product[] = [
  // ─── Hamburguesas ───
  {
    id: 1,
    name: 'Cheese Burger',
    description: 'Medallón 100g y cheddar americano. Nuestra clásica',
    price: 4490,
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno',    defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',                 defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
    ],
  },
  {
    id: 2,
    name: 'Cheese Bacon',
    description: 'Medallón 100g, cheddar americano y tocino ahumado.',
    price: 5190,
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno',    defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',                 defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 203, name: 'Tocino Ahumado',                 defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
    ],
  },
  {
    id: 3,
    name: 'Onion Caramel',
    description: 'Medallón 100g, cheddar americano y cebolla caramelizada',
    price: 4990,
    precioOferta: 3990, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',      defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 204, name: 'Cebolla Caramelizada',         defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
    ],
  },
  {
    id: 4,
    name: 'Onion Ring',
    description: 'Medallón 100g, cheddar americano y aritos de cebolla (x2)',
    price: 4990,
    precioOferta: 3990, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',      defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 205, name: 'Aritos de Cebolla (x2)',         defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
    ],
  },
  {
    id: 5,
    name: 'Real de la casa',
    description: 'Medallón de 100g, cheddar americano, cebolla caramelizada, tocino ahumado y aritos de cebolla (x2)',
    price: 6990,
    precioOferta: 5990, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 204, name: 'Cebolla Caramelizada',             defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
      { id: 203, name: 'Tocino Ahumado',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
      { id: 205, name: 'Aritos de Cebolla (x2)',               defaultQuantity: 1, currentQuantity: 1, extraPrice: 800 },
    ]
  },
  {
    id: 6,
    name: 'Onion Caramel Bacon',
    description: 'Medallón de 100g, cheddar americano, cebolla caramelizada y tocino ahumado',
    price: 5690,
    precioOferta: 4690, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 204, name: 'Cebolla Caramelizada',             defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
      { id: 203, name: 'Tocino Ahumado',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
    ]
  },
  {
    id: 7,
    name: 'Onion Ring Bacon',
    description: 'Medallón de 100g, cheddar americano, tocino ahumado y aritos de cebolla (x2)',
    price: 5690,
    precioOferta: 4690, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 203, name: 'Tocino Ahumado',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
      { id: 205, name: 'Aritos de Cebolla (x2)',               defaultQuantity: 1, currentQuantity: 1, extraPrice: 800 },
    ]
  },
  {
    id: 8,
    name: 'Avocado Bacon',
    description: 'Medallón de 100g, cheddar americano, tocino ahumado y palta',
    price: 6190,
    precioOferta: 5190, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 203, name: 'Tocino Ahumado',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
      { id: 206, name: 'Palta',               defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
    ]
  },
  {
    id: 9,
    name: 'Avocado Egg',
    description: 'Medallón de 100g, cheddar americano, palta y huevo frito',
    price: 6190,
    precioOferta: 5190, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 206, name: 'Palta',               defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
      { id: 207, name: 'Huevo Frito',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
    ]
  },
  {
    id: 10,
    name: 'La Trilogía del Rey (by @selvaenlaluna)',
    description: 'Medallón de 100g, cheddar americano, cebolla caramelizada y huevo frito',
    price: 5590,
    precioOferta: 4590, // <--- ¡Agregamos esto para activar el banner y el botón!
    category: 'hamburguesas',
    customizable: true,
    ingredients: [
      { id: 201, name: 'Medallón de Vacuno', defaultQuantity: 1, currentQuantity: 1, extraPrice: 1500, isRequired: true },
      { id: 202, name: 'Cheddar Americano',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 600 },
      { id: 204, name: 'Cebolla Caramelizada',             defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
      { id: 207, name: 'Huevo Frito',            defaultQuantity: 1, currentQuantity: 1, extraPrice: 1000 },
    ]
  },




  //─── Acompañamientos ───
  {
    id: 11, // ID único numérico o string
    name: 'Papas Fritas Reales',
    description: 'Ricas papitas caseras acompañadas con salsa de la casa',
    price: 1990, // Precio base (el que acompaña al "desde")
    category: 'acompañamientos', // <--- ¡OBLIGATORIO! Debe coincidir exactamente con este string (con la 'ñ')
    customizable: true, // Idealmente true para que permita elegir porciones/variantes
    image: 'assets/images/papas.webp', // O una URL de Unsplash
    variants: [         // Las opciones de porción que se abrirán en el modal
      { id: 501, name: 'Porción Normal (150g)', shortName: '150g', extraPrice: 0 },
      { id: 502, name: 'Porción Mediana (250g)', shortName: '250g', extraPrice: 2990 },
      { id: 503, name: 'Porción Grande (300g)', shortName: '300g', extraPrice: 3990 },
    ],
    ingredients: [], // O los ingredientes si se pueden personalizar
  },
  {
    id: 12, // ID único numérico o string
    name: 'Aritos de Cebolla',
    description: 'Porción de crujientes aritos de cebolla para acompañar tu pedido',
    price: 1190, // Precio base (el que acompaña al "desde")
    category: 'acompañamientos', // <--- ¡OBLIGATORIO! Debe coincidir exactamente con este string (con la 'ñ')
    customizable: true, // Idealmente true para que permita elegir porciones/variantes
    allowExtras: false, // <--- ¡Con esto ocultas la sección de extras!
    image: 'assets/images/aritos.webp', // O una URL de Unsplash
    variants: [         // Las opciones de porción que se abrirán en el modal
      { id: 601, name: 'Porción Normal (x5)', shortName: 'x5', extraPrice: 0 },
      { id: 602, name: 'Porción Mediana (x10)', shortName: 'x10', extraPrice: 2390 },
      { id: 603, name: 'Porción Grande (x15)', shortName: 'x15', extraPrice: 3590 },
    ],
    ingredients: [], // O los ingredientes si se pueden personalizar
  },




  // ─── Bebestibles ───
  {
    id: 21,
    name: 'Coca-Cola 350ml',
    description: 'Lata fría de Coca-Cola',
    price: 1500,
    category: 'bebestibles',
    customizable: false,
    ingredients: [],
  },
  {
    id: 22,
    name: 'Fanta 350ml',
    description: 'Lata fría de Fanta',
    price: 1500,
    category: 'bebestibles',
    customizable: false,
    ingredients: [],
  },
  {
    id: 23,
    name: 'Sprite 350ml',
    description: 'Lata fría de Sprite',
    price: 1500,
    category: 'bebestibles',
    customizable: false,
    ingredients: [],
  },
  {
    id: 24,
    name: 'Agua Gasificada 500cc',
    description: 'Agua mineral alcalina con gas',
    price: 1200,
    category: 'bebestibles',
    customizable: false,
    ingredients: [],
  },
  {
    id: 25,
    name: 'Jugo Jumex Piña Coco',
    description: 'Refrescante néctar de fruta en lata.',
    price: 1200,
    category: 'bebestibles',
    customizable: false,
    ingredients: [],
  },

  // ─── Extras ───
  
  {
    id: 31,
    name: 'Bacon Extra',
    description: 'Tira de bacon crocante adicional',
    price: 1500,
    category: 'extras',
    customizable: false,
    ingredients: [],
  },
  {
    id: 32,
    name: 'Queso Cheddar',
    description: 'Lámina adicional de queso cheddar fundido',
    price: 600,
    category: 'extras',
    customizable: false,
    ingredients: [],
  },
  {
    id: 33,
    name: 'Huevo Frito',
    description: 'Huevo frito sobre tu hamburguesa',
    price: 1000,
    category: 'extras',
    customizable: false,
    ingredients: [],
  },
  {
    id: 34,
    name: 'Aritos de Cebolla (x2)',
    description: 'Par de Aritos de Cebolla para tu hamburguesa',
    price: 1000,
    category: 'extras',
    customizable: false,
    ingredients: [],
  },
  {
    id: 35,
    name: 'Cebolla Caramelizada',
    description: 'Cebolla Caramelizada Real para tu hamburguesa',
    price: 1000,
    category: 'extras',
    customizable: false,
    ingredients: [],
  },
  {
    id: 36,
    name: 'Palta',
    description: 'La Reina Verde para tu hamburguesa',
    price: 1000,
    category: 'extras',
    customizable: false,
    ingredients: [],
  },
  {
    id: 37,
    name: 'Pepinillos',
    description: 'Los verdes infaltables, ¿o si?',
    price: 0,
    category: 'extras',
    customizable: false,
    ingredients: [],
  },
];

export const CATEGORIES = [
  { key: 'hamburguesas',    label: 'Hamburguesas',    emoji: '🍔' },
  { key: 'acompañamientos', label: 'Acompañamientos', emoji: '🍟' },
  { key: 'bebestibles',     label: 'Bebestibles',     emoji: '🥤' },
] as const;
