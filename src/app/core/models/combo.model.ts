import { SizeVariant } from './product.model';

export interface ComboDetalle {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  requiereSeleccion: boolean;
  varianteSeleccionada: SizeVariant | null;
  opcionesDisponibles: SizeVariant[];
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  detalles: ComboDetalle[];
}
