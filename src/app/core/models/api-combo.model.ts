export interface ApiVarianteSeleccionada {
  id: number;
  nombre: string;
  nombreCorto: string;
  precioExtra: number;
}

export interface ApiComboDetalle {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  requiereSeleccion: boolean;
  varianteSeleccionada: ApiVarianteSeleccionada | null;
  opcionesDisponibles: ApiVarianteSeleccionada[];
}

export interface ApiCombo {
  id: number;
  nombre: string;
  descripcion: string;
  precioCombo: number;
  disponible: boolean;
  detalles: ApiComboDetalle[];
}
