export interface ApiIngrediente {
  id: number;
  nombre: string;
  precioExtra: number;
  permiteQuitar: boolean;
  permiteAgregar: boolean;
}

export interface ApiVariante {
  id: number;
  nombre: string;
  nombreCorto: string;
  precioExtra: number;
}

export interface ApiProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precioVenta: number;
  imagenUrl: string;
  categoria: 'HAMBURGUESA' | 'ACOMPAÑAMIENTO' | 'BEBESTIBLE';
  disponible: boolean;
  ingredientes: ApiIngrediente[];
  variantes: ApiVariante[];
  precioOferta?: number;
}
