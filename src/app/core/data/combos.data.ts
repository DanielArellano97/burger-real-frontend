import { Combo, ComboDetalle } from '../models/combo.model';
import { SizeVariant } from '../models/product.model';
import { calcularPrecioCombo } from '../utils/combo-pricing';
import { MENU_DATA } from './menu.data';

/**
 * Las variantes se toman de MENU_DATA para no duplicar nombre ni precios.
 * El precio dentro del combo sale de `comboPrice`.
 */
function varianteDe(productoId: number, varianteId: number): SizeVariant {
  const producto = MENU_DATA.find(p => p.id === productoId);
  const variante = producto?.variants?.find(v => v.id === varianteId);

  if (!variante) {
    throw new Error(
      `La variante ${varianteId} no existe en el producto ${productoId}`
    );
  }

  return variante;
}

const ARITOS_X5 = varianteDe(12, 601);
const ARITOS_X10 = varianteDe(12, 602);
const DEDITOS_X3 = varianteDe(13, 701);

/** Nombres cortos para el selector de bebidas. */
const BEBIDA_SHORT_NAMES: Record<number, string> = {
  21: 'Coca-Cola',
  22: 'Fanta',
  23: 'Sprite',
  24: 'Agua',
  25: 'Jumex',
};

/** Opciones de bebida: se arman desde los bebestibles reales del menú. */
const BEBIDAS: SizeVariant[] = MENU_DATA
  .filter(producto => producto.category === 'bebestibles')
  .map(producto => ({
    id: producto.id,
    name: producto.name,
    shortName: BEBIDA_SHORT_NAMES[producto.id] ?? producto.name,
    extraPrice: producto.price,
    comboPrice: producto.comboPrice,
  }));

/**
 * Expande los productos incluidos dentro de otro componente (ej. las papas
 * 100g de cada burger) a líneas visuales del combo.
 *
 * La burger sigue siendo la dueña del costo de esas papas. La línea generada:
 * - vale $0 dentro del combo;
 * - se marca `incluidoEnProducto` para que un motor de costos no la sume dos veces;
 * - oculta la variante si es una porción interna (ej. 100g).
 */
function construirDetalles(detalles: ComboDetalle[]): ComboDetalle[] {
  return detalles.flatMap(detalle => {
    const producto = MENU_DATA.find(p => p.id === detalle.productoId);

    const incluidos = (producto?.incluye ?? []).map((incluido): ComboDetalle => {
      const productoIncluido = MENU_DATA.find(p => p.id === incluido.productoId);

      if (!productoIncluido) {
        throw new Error(
          `El producto ${incluido.productoId} incluido en ${detalle.productoNombre} no existe en MENU_DATA`
        );
      }

      const variante = incluido.varianteId != null
        ? productoIncluido.variants?.find(v => v.id === incluido.varianteId) ?? null
        : null;

      return {
        productoId: productoIncluido.id,
        productoNombre: productoIncluido.name,
        cantidad: incluido.cantidad * detalle.cantidad,
        requiereSeleccion: false,
        varianteSeleccionada: variante,
        ocultarVariante: variante?.internal ?? false,
        incluidoEnProducto: true,
        precioComboUnitario: 0,
        opcionesDisponibles: [],
      };
    });

    return [detalle, ...incluidos];
  });
}

/** Combo sin precio final: se calcula desde sus componentes. */
type ComboConfig = Omit<Combo, 'price'>;

const COMBOS_CONFIG: ComboConfig[] = [
  {
    id: 1,
    name: 'Clásico',
    description: 'Cheese Burger + Papas 100g + Aritos de Cebolla (x5) + Bebida a elección',
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
        productoId: 12,
        productoNombre: 'Aritos de Cebolla',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: ARITOS_X5,
        ocultarVariante: false,
        opcionesDisponibles: [],
      },
      {
        // 0 = selector genérico: no apunta a un producto puntual del menú.
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        precioComboUnitario: 1000,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 2,
    name: 'Sabroso',
    description: 'Onion Caramel Bacon + Papas 100g + Aritos de Cebolla (x5) + Bebida a elección',
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 6,
        productoNombre: 'Onion Caramel Bacon',
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
        ocultarVariante: false,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        precioComboUnitario: 1000,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 3,
    name: 'Crunchy',
    description: 'Onion Ring Bacon + Papas 100g + Aritos de Cebolla (x5) + Bebida a elección',
    imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 7,
        productoNombre: 'Onion Ring Bacon',
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
        ocultarVariante: false,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        precioComboUnitario: 1000,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 4,
    name: 'Real',
    description: 'Real + Papas 100g + Aritos de Cebolla (x10) + Bebida a elección',
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop',
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
        productoId: 12,
        productoNombre: 'Aritos de Cebolla',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: ARITOS_X10,
        ocultarVariante: false,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        precioComboUnitario: 1000,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 5,
    name: 'Doble Bacon',
    description: '2 x Cheese Bacon + 2 x Papas 100g + Aritos de Cebolla (x10) + 2 x Bebidas a elección',
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 2,
        productoNombre: 'Cheese Bacon',
        cantidad: 2,
        requiereSeleccion: false,
        varianteSeleccionada: null,
        opcionesDisponibles: [],
      },
      {
        productoId: 12,
        productoNombre: 'Aritos de Cebolla',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: ARITOS_X10,
        ocultarVariante: false,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 2,
        requiereSeleccion: true,
        precioComboUnitario: 1000,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 6,
    name: 'Real Real',
    description: '2 x Real + 2 x Papas 100g + 2 x Bebidas a elección',
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop',
    detalles: [
      {
        productoId: 5,
        productoNombre: 'Real de la casa',
        cantidad: 2,
        requiereSeleccion: false,
        varianteSeleccionada: null,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 2,
        requiereSeleccion: true,
        precioComboUnitario: 1000,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
  {
    id: 7,
    name: 'Pollo Real',
    description: 'Real + Papas 100g + Deditos de Pollo (x3) + Bebida a elección',
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop',
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
        productoId: 13,
        productoNombre: 'Deditos de Pollo',
        cantidad: 1,
        requiereSeleccion: false,
        varianteSeleccionada: DEDITOS_X3,
        ocultarVariante: false,
        opcionesDisponibles: [],
      },
      {
        productoId: 0,
        productoNombre: 'Bebida a elección',
        cantidad: 1,
        requiereSeleccion: true,
        precioComboUnitario: 1000,
        varianteSeleccionada: null,
        opcionesDisponibles: [...BEBIDAS],
      },
    ],
  },
];

/**
 * El precio de cada combo se calcula desde sus componentes (`comboPrice` en
 * MENU_DATA). Las papas de las burgers se generan desde su `incluye` y valen $0
 * dentro del combo, así no hay que declararlas a mano.
 */
export const COMBOS_DATA: Combo[] = COMBOS_CONFIG.map(combo => {
  const detalles = construirDetalles(combo.detalles);

  return {
    ...combo,
    detalles,
    price: calcularPrecioCombo({ detalles }),
  };
});
