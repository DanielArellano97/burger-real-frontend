/**
 * Registros del catálogo con la forma de las tablas de la futura base de
 * datos (y de lo que devolverá la API). Nombres en español, igual que el
 * backend. Nada fuera de `infrastructure/` debe importar estos tipos: la app
 * trabaja con los modelos de `domain/catalog`, y `catalog.mapper.ts` traduce.
 */

export type CategoriaRecord = 'HAMBURGUESA' | 'ACOMPANAMIENTO' | 'BEBESTIBLE';

/** `CONTADOR` = 0..5 unidades · `SI_NO` = interruptor. */
export type TipoControlRecord = 'CONTADOR' | 'SI_NO';

/** Tabla `ingredientes`. */
export interface IngredienteRecord {
  id: number;
  nombre: string;
  /** Precio por unidad agregada como extra. */
  precioExtra: number;
  /** Se ofrece en "¿Deseas agregar extras?". */
  permiteExtra: boolean;
  tipoControl: TipoControlRecord;
  /** Existe en recetas (costos) pero no se muestra (ej. pan). */
  oculto: boolean;
  /** Categorías donde se ofrece como extra; `null` = todas. */
  categoriasExtra: CategoriaRecord[] | null;
}

/** Tabla `productos`. */
export interface ProductoRecord {
  id: number;
  categoria: CategoriaRecord;
  nombre: string;
  nombreCorto: string | null;
  descripcion: string;
  /** Precio de la porción base. */
  precio: number;
  /** Precio en "Burger de la semana"; `null` = no participa. */
  precioOferta: number | null;
  /** Precio dentro de un combo; `null` = usa `precio`. */
  precioCombo: number | null;
  permiteExtras: boolean;
  disponible: boolean;
  /** Id público de Cloudinary (ej. `v123/foto.png`); `null` = sin foto. */
  imagen: string | null;
}

/** Tabla `producto_ingredientes` (receta). */
export interface ProductoIngredienteRecord {
  productoId: number;
  ingredienteId: number;
  cantidad: number;
  /** No se puede quitar ni bajar de `cantidad`. */
  obligatorio: boolean;
}

/** Tabla `porciones`. Precio de venta = `productos.precio` + `precioAdicional`. */
export interface PorcionRecord {
  id: number;
  productoId: number;
  nombre: string;
  nombreCorto: string;
  precioAdicional: number;
  /** Precio absoluto dentro de un combo; `null` = precio de venta. */
  precioCombo: number | null;
  /** Uso interno (costos); nunca se ofrece al cliente. */
  interna: boolean;
}

/** Tabla `producto_incluye`: productos dentro de otro (ej. papas de la burger). */
export interface ProductoIncluyeRecord {
  productoId: number;
  incluidoProductoId: number;
  porcionId: number | null;
  cantidad: number;
}

/** Tabla `combos`. El precio no se guarda: se calcula desde los detalles. */
export interface ComboRecord {
  id: number;
  nombre: string;
  descripcion: string;
  disponible: boolean;
  /** Id público de Cloudinary; `null` = sin foto. */
  imagen: string | null;
}

/** Tabla `combo_detalles`. */
export interface ComboDetalleRecord {
  id: number;
  comboId: number;
  /** Producto fijo; `null` cuando el cliente elige dentro de `categoriaSeleccion`. */
  productoId: number | null;
  porcionId: number | null;
  cantidad: number;
  categoriaSeleccion: CategoriaRecord | null;
  /** Precio por unidad solo para líneas de selección. */
  precioUnitario: number | null;
}

/** Todo el catálogo tal como lo entregaría la API. */
export interface CatalogRecords {
  ingredientes: readonly IngredienteRecord[];
  productos: readonly ProductoRecord[];
  productoIngredientes: readonly ProductoIngredienteRecord[];
  porciones: readonly PorcionRecord[];
  productoIncluye: readonly ProductoIncluyeRecord[];
  combos: readonly ComboRecord[];
  comboDetalles: readonly ComboDetalleRecord[];
}
