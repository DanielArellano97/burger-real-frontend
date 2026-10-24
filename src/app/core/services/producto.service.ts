import { Injectable, signal, computed } from '@angular/core';
import { MENU_DATA } from '../data/menu.data';
import { INGREDIENTS_DATA } from '../data/ingredients.data';
import { IngredientMaster, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {

  private _products = signal<Product[]>([]);
  private _loading  = signal(false);
  private _error    = signal<string | null>(null);

  products = this._products.asReadonly();
  loading  = this._loading.asReadonly();
  error    = this._error.asReadonly();

  /** Extras disponibles para personalizar: salen del catálogo maestro, no de las recetas. */
  readonly extrasCatalog: readonly IngredientMaster[] = INGREDIENTS_DATA.filter(i => i.canBeExtra);

  hamburguesas    = computed(() => this._products().filter(p => p.category === 'hamburguesas'));
  acompañamientos = computed(() => this._products().filter(p => p.category === 'acompañamientos'));
  bebestibles     = computed(() => this._products().filter(p => p.category === 'bebestibles'));

  loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    setTimeout(() => {
      try {
        this._products.set(MENU_DATA);
        this._loading.set(false);
      } catch (err) {
        console.error('Error cargando mock de productos:', err);
        this._error.set('Error al mostrar el menú. Intenta nuevamente.');
        this._loading.set(false);
      }
    }, 150); // Un pequeño delay estético opcional para simular red si gustas, o déjalo en 0
  }
}
