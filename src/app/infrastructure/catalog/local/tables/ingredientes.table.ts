import { IngredienteRecord } from '../../catalog.records';

/**
 * Tabla `ingredientes`: catálogo maestro. Las recetas y los extras referencian estos ids.
 */
export const INGREDIENTES: readonly IngredienteRecord[] = [
  { id: 200, nombre: 'Pan Brioche', precioExtra: 0, permiteExtra: false, tipoControl: 'CONTADOR', oculto: true, categoriasExtra: null },
  { id: 208, nombre: 'Pepinillos', precioExtra: 0, permiteExtra: true, tipoControl: 'SI_NO', oculto: false, categoriasExtra: ["HAMBURGUESA"] },
  { id: 201, nombre: 'Medallón de Vacuno', precioExtra: 1500, permiteExtra: true, tipoControl: 'CONTADOR', oculto: false, categoriasExtra: null },
  { id: 202, nombre: 'Cheddar Americano', precioExtra: 600, permiteExtra: true, tipoControl: 'CONTADOR', oculto: false, categoriasExtra: null },
  { id: 203, nombre: 'Tocino Ahumado', precioExtra: 1000, permiteExtra: true, tipoControl: 'CONTADOR', oculto: false, categoriasExtra: null },
  { id: 204, nombre: 'Cebolla Caramelizada', precioExtra: 1000, permiteExtra: true, tipoControl: 'CONTADOR', oculto: false, categoriasExtra: null },
  { id: 205, nombre: 'Aritos de Cebolla (x2)', precioExtra: 800, permiteExtra: true, tipoControl: 'CONTADOR', oculto: false, categoriasExtra: null },
  { id: 206, nombre: 'Palta', precioExtra: 1000, permiteExtra: true, tipoControl: 'CONTADOR', oculto: false, categoriasExtra: null },
  { id: 207, nombre: 'Huevo Frito', precioExtra: 1000, permiteExtra: true, tipoControl: 'CONTADOR', oculto: false, categoriasExtra: null },
];
