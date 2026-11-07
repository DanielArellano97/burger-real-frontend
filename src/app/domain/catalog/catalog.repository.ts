import { Catalog } from './catalog.models';

/**
 * Puerto de salida: de dónde se obtiene el catálogo.
 *
 * Hoy lo implementa `LocalCatalogRepository` (tablas en el front). Cuando
 * exista el backend, basta crear `HttpCatalogRepository` y cambiar el
 * provider en `app.config.ts`; el resto de la app no se entera.
 */
export abstract class CatalogRepository {
  abstract getCatalog(): Promise<Catalog>;
}
