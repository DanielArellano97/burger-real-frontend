import { ComboDetalleRecord } from '../../catalog.records';

/**
 * Tabla `combo_detalles`: componentes de cada combo.
 * - `productoId` fijo, o `null` + `categoriaSeleccion` cuando el cliente elige (ej. bebida).
 * - `precioUnitario` solo para líneas de selección; el resto usa `precioCombo` del producto/porción.
 */
export const COMBO_DETALLES: readonly ComboDetalleRecord[] = [
  { id: 1, comboId: 1, productoId: 1, porcionId: null, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 2, comboId: 1, productoId: 12, porcionId: 601, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 3, comboId: 1, productoId: null, porcionId: null, cantidad: 1, categoriaSeleccion: 'BEBESTIBLE', precioUnitario: 1000 },
  { id: 4, comboId: 2, productoId: 6, porcionId: null, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 5, comboId: 2, productoId: 12, porcionId: 601, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 6, comboId: 2, productoId: null, porcionId: null, cantidad: 1, categoriaSeleccion: 'BEBESTIBLE', precioUnitario: 1000 },
  { id: 7, comboId: 3, productoId: 7, porcionId: null, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 8, comboId: 3, productoId: 12, porcionId: 601, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 9, comboId: 3, productoId: null, porcionId: null, cantidad: 1, categoriaSeleccion: 'BEBESTIBLE', precioUnitario: 1000 },
  { id: 10, comboId: 4, productoId: 5, porcionId: null, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 11, comboId: 4, productoId: 12, porcionId: 602, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 12, comboId: 4, productoId: null, porcionId: null, cantidad: 1, categoriaSeleccion: 'BEBESTIBLE', precioUnitario: 1000 },
  { id: 13, comboId: 5, productoId: 2, porcionId: null, cantidad: 2, categoriaSeleccion: null, precioUnitario: null },
  { id: 14, comboId: 5, productoId: 12, porcionId: 602, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 15, comboId: 5, productoId: null, porcionId: null, cantidad: 2, categoriaSeleccion: 'BEBESTIBLE', precioUnitario: 1000 },
  { id: 16, comboId: 6, productoId: 5, porcionId: null, cantidad: 2, categoriaSeleccion: null, precioUnitario: null },
  { id: 17, comboId: 6, productoId: null, porcionId: null, cantidad: 2, categoriaSeleccion: 'BEBESTIBLE', precioUnitario: 1000 },
  { id: 18, comboId: 7, productoId: 5, porcionId: null, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 19, comboId: 7, productoId: 13, porcionId: 701, cantidad: 1, categoriaSeleccion: null, precioUnitario: null },
  { id: 20, comboId: 7, productoId: null, porcionId: null, cantidad: 1, categoriaSeleccion: 'BEBESTIBLE', precioUnitario: 1000 },
];
