import { SizeVariant } from './product.model';

export interface ComboDetalle {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  requiereSeleccion: boolean;
  varianteSeleccionada: SizeVariant | null;
  opcionesDisponibles: SizeVariant[];
  /** `true` = la variante se guarda para costos pero no se muestra al cliente. */
  ocultarVariante?: boolean;
  /**
   * `true` = el componente viene incluido dentro de otro producto del combo
   * (ej. las papas 100g de una burger). Es solo visual: no se cobra y no debe
   * sumarse otra vez al costo.
   */
  incluidoEnProducto?: boolean;
  /**
   * Precio unitario dentro del combo cuando no se puede resolver desde el
   * producto (ej. selector genérico de bebida, `productoId: 0`).
   */
  precioComboUnitario?: number;
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  /** Precio final calculado desde los componentes del combo. */
  price: number;
  detalles: ComboDetalle[];
}
