import { PorcionRecord } from '../../catalog.records';

/**
 * Tabla `porciones`: tamaños de un producto. Precio de venta = `productos.precio` + `precioAdicional`.
 */
export const PORCIONES: readonly PorcionRecord[] = [
  { id: 501, productoId: 11, nombre: 'Porción Normal (150g)', nombreCorto: '150g', precioAdicional: 0, precioCombo: null, interna: false },
  { id: 502, productoId: 11, nombre: 'Porción Mediana (250g)', nombreCorto: '250g', precioAdicional: 1000, precioCombo: null, interna: false },
  { id: 503, productoId: 11, nombre: 'Porción Grande (300g)', nombreCorto: '300g', precioAdicional: 2000, precioCombo: null, interna: false },
  { id: 504, productoId: 11, nombre: 'Porción Burger (100g)', nombreCorto: '100g', precioAdicional: 0, precioCombo: 0, interna: true },
  { id: 601, productoId: 12, nombre: 'Porción Normal (x5)', nombreCorto: 'x5', precioAdicional: 0, precioCombo: 1000, interna: false },
  { id: 602, productoId: 12, nombre: 'Porción Mediana (x10)', nombreCorto: 'x10', precioAdicional: 1200, precioCombo: 2000, interna: false },
  { id: 603, productoId: 12, nombre: 'Porción Grande (x15)', nombreCorto: 'x15', precioAdicional: 2400, precioCombo: 3000, interna: false },
  { id: 701, productoId: 13, nombre: 'Porción Normal (x3)', nombreCorto: 'x3', precioAdicional: 0, precioCombo: 1500, interna: false },
  { id: 702, productoId: 13, nombre: 'Porción Mediana (x6)', nombreCorto: 'x6', precioAdicional: 1700, precioCombo: 3000, interna: false },
  { id: 703, productoId: 13, nombre: 'Porción Grande (x9)', nombreCorto: 'x9', precioAdicional: 3400, precioCombo: 4500, interna: false },
];
