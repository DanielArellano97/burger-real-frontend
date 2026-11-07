import { Catalog } from '../domain/catalog/catalog.models';
import { mapCatalog } from '../infrastructure/catalog/catalog.mapper';
import { LOCAL_CATALOG_RECORDS } from '../infrastructure/catalog/local/local-catalog.repository';

/** Catálogo real del MVP, para tests de reglas de negocio. */
export function realCatalog(): Catalog {
  return mapCatalog(LOCAL_CATALOG_RECORDS);
}

export function product(catalog: Catalog, name: string) {
  const found = catalog.products.find(p => p.name === name);
  if (!found) throw new Error(`Producto de prueba no encontrado: ${name}`);
  return found;
}

export function combo(catalog: Catalog, name: string) {
  const found = catalog.combos.find(c => c.name === name);
  if (!found) throw new Error(`Combo de prueba no encontrado: ${name}`);
  return found;
}
