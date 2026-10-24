import { IngredientMaster } from '../models/product.model';

/**
 * Catálogo maestro de ingredientes.
 *
 * - Las recetas de `menu.data.ts` referencian estos ids.
 * - Los `canBeExtra: true` alimentan la sección de extras del modal.
 * - `hidden: true` = está en la receta (para costos de producción) pero no se
 *   muestra en el modal porque no tiene sentido agregarlo o quitarlo.
 *
 * Mapeo a la futura API (`ApiIngrediente`):
 *   canBeExtra  → permiteAgregar
 *   isRequired  → !permiteQuitar
 *   hidden      → !permiteQuitar && !permiteAgregar
 *   extraPrice  → precioExtra
 */
export const INGREDIENTS_DATA: IngredientMaster[] = [
  // ─── Bases (no se ofrecen como extra) ───
  {
    id: 200,
    name: 'Pan Brioche',
    extraPrice: 0,
    canBeExtra: false,
    control: 'counter',
    hidden: true,
  },

  // ─── Booleanos (sí/no) ───
  // Para futuras salsas (BBQ, tártara, etc.) basta agregarlas acá con
  // `control: 'toggle'`, su `extraPrice` y `canBeExtra: true`.
  {
    id: 208,
    name: 'Pepinillos',
    extraPrice: 0,
    canBeExtra: true,
    control: 'toggle',
    // Por ahora solo se ofrece en hamburguesas. Para habilitarlo también en
    // acompañamientos basta con borrar esta línea (o agregar 'acompañamientos').
    extraCategories: ['hamburguesas'],
  },

  // ─── Personalizables con contador ───
  {
    id: 201,
    name: 'Medallón de Vacuno',
    extraPrice: 1500,
    canBeExtra: true,
    control: 'counter',
  },
  {
    id: 202,
    name: 'Cheddar Americano',
    extraPrice: 600,
    canBeExtra: true,
    control: 'counter',
  },
  {
    id: 203,
    name: 'Tocino Ahumado',
    extraPrice: 1000,
    canBeExtra: true,
    control: 'counter',
  },
  {
    id: 204,
    name: 'Cebolla Caramelizada',
    extraPrice: 1000,
    canBeExtra: true,
    control: 'counter',
  },
  {
    id: 205,
    name: 'Aritos de Cebolla (x2)',
    extraPrice: 800,
    canBeExtra: true,
    control: 'counter',
  },
  {
    id: 206,
    name: 'Palta',
    extraPrice: 1000,
    canBeExtra: true,
    control: 'counter',
  },
  {
    id: 207,
    name: 'Huevo Frito',
    extraPrice: 1000,
    canBeExtra: true,
    control: 'counter',
  }
];
