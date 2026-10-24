import { Combo } from '../models/combo.model';
import { SizeVariant } from '../models/product.model';

/** Variantes reales de MENU_DATA, para que el combo muestre la porción correcta. */
const PAPAS_250G: SizeVariant = {
  id: 502,
  name: 'Porción Mediana (250g)',
  shortName: '250g',
  extraPrice: 2990,
};

const ARITOS_X5: SizeVariant = {
  id: 601,
  name: 'Porción Normal (x5)',
  shortName: 'x5',
  extraPrice: 0,
};

/** Opciones de bebida: ids reales de MENU_DATA (21 a 25). */
const BEBIDAS: SizeVariant[] = [
  { id: 21, name: 'Coca-Cola 350ml', shortName: 'Coca-Cola', extraPrice: 0 },
  { id: 22, name: 'Fanta 350ml', shortName: 'Fanta', extraPrice: 0 },
  { id: 23, name: 'Sprite 350ml', shortName: 'Sprite', extraPrice: 0 },
  { id: 24, name: 'Agua Gasificada 500cc', shortName: 'Agua', extraPrice: 0 },
  { id: 25, name: 'Jugo Jumex Piña Coco', shortName: 'Jumex', extraPrice: 0 },
];

export const COMBOS_DATA: Combo[] = [
  {
    id: 1,
    name: 'Clásico',
    description: 'Cheese Burger + Papas 250g + Bebida a elección',
    price: 8490,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 1,
        productoNombre: 'Cheese Burger',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: null,
        opcionesDisponibles: [],
      },
      {
        productoId: 11,
        productoNombre: 'Papas Fritas Reales',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: PAPAS_250G,
        opcionesDisponibles: [],
      },
      {
        // 0 = selector genérico: no apunta a un producto puntual del menú.
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 2,
    name: 'Bacon',
    description: 'Cheese Bacon + Papas 250g + Bebida a elección',
    price: 9190,
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 2,
        productoNombre: 'Cheese Bacon',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: null,
        opcionesDisponibles: [],
      },
      {
        productoId: 11,
        productoNombre: 'Papas Fritas Reales',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: PAPAS_250G,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 3,
    name: 'Real',
    description: 'Real de la casa + Papas 250g + Bebida a elección',
    price: 10990,
    imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 5,
        productoNombre: 'Real de la casa',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: null,
        opcionesDisponibles: [],
      },
      {
        productoId: 11,
        productoNombre: 'Papas Fritas Reales',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: PAPAS_250G,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 4,
    name: 'Onion',
    description: 'Onion Ring + Aritos x5 + Bebida a elección',
    price: 7290,
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 4,
        productoNombre: 'Onion Ring',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: null,
        opcionesDisponibles: [],
      },
      {
        productoId: 12,
        productoNombre: 'Aritos de Cebolla',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: ARITOS_X5,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
];
