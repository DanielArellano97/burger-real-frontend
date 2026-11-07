import { Injectable } from '@angular/core';
import { Catalog } from '../../../domain/catalog/catalog.models';
import { CatalogRepository } from '../../../domain/catalog/catalog.repository';
import { CatalogRecords } from '../catalog.records';
import { mapCatalog } from '../catalog.mapper';
import { COMBO_DETALLES } from './tables/combo-detalles.table';
import { COMBOS } from './tables/combos.table';
import { INGREDIENTES } from './tables/ingredientes.table';
import { PORCIONES } from './tables/porciones.table';
import { PRODUCTO_INCLUYE } from './tables/producto-incluye.table';
import { PRODUCTO_INGREDIENTES } from './tables/producto-ingredientes.table';
import { PRODUCTOS } from './tables/productos.table';

/** Las tablas locales, agrupadas igual que las entregaría la API. */
export const LOCAL_CATALOG_RECORDS: CatalogRecords = {
  ingredientes: INGREDIENTES,
  productos: PRODUCTOS,
  productoIngredientes: PRODUCTO_INGREDIENTES,
  porciones: PORCIONES,
  productoIncluye: PRODUCTO_INCLUYE,
  combos: COMBOS,
  comboDetalles: COMBO_DETALLES,
};

/**
 * Adaptador del MVP: el catálogo vive en `./tables`.
 * El futuro `HttpCatalogRepository` hará `http.get<CatalogRecords>(...)` y
 * usará el mismo `mapCatalog`.
 */
@Injectable()
export class LocalCatalogRepository extends CatalogRepository {
  getCatalog(): Promise<Catalog> {
    return Promise.resolve(mapCatalog(LOCAL_CATALOG_RECORDS));
  }
}
