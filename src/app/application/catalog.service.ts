import { Injectable, computed, inject, signal } from '@angular/core';
import { Catalog, ProductCategory } from '../domain/catalog/catalog.models';
import { CatalogRepository } from '../domain/catalog/catalog.repository';

/**
 * Único punto de acceso al catálogo para la UI y los demás servicios.
 * Nadie más importa las tablas: si cambia la fuente (API), solo cambia el
 * adaptador de `CatalogRepository`.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly repository = inject(CatalogRepository);

  private readonly _catalog = signal<Catalog | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly catalog = this._catalog.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly products = computed(() => this._catalog()?.products ?? []);
  readonly combos = computed(() => this._catalog()?.combos ?? []);
  readonly extras = computed(() => this._catalog()?.extras ?? []);
  readonly burgers = computed(() => this.byCategory('hamburguesas'));

  byCategory(category: ProductCategory) {
    return this.products().filter(p => p.category === category);
  }

  /** Carga el catálogo. Nunca lanza: el error queda en `error()` para la UI. */
  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      this._catalog.set(await this.repository.getCatalog());
    } catch (err) {
      console.error('[Catálogo] No se pudo cargar:', err);
      this._error.set('Error al mostrar el menú. Intenta nuevamente.');
    } finally {
      this._loading.set(false);
    }
  }
}
