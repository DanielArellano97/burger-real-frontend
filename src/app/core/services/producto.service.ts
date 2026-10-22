import { Injectable, signal, computed } from '@angular/core';
import { MENU_DATA } from '../data/menu.data'; // Ajusta la ruta según donde tengas tu archivo de mock
import { Ingredient, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {

  private _products       = signal<Product[]>([]);
  private _allIngredients = signal<Ingredient[]>([]);
  private _loading        = signal(false);
  private _error          = signal<string | null>(null);

  products       = this._products.asReadonly();
  allIngredients = this._allIngredients.asReadonly();
  loading        = this._loading.asReadonly();
  error          = this._error.asReadonly();

  hamburguesas    = computed(() => this._products().filter(p => p.category === 'hamburguesas'));
  acompañamientos = computed(() => this._products().filter(p => p.category === 'acompañamientos'));
  bebestibles     = computed(() => this._products().filter(p => p.category === 'bebestibles'));

  loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    setTimeout(() => {
      try {
        const products = MENU_DATA;

        // Extraemos todos los ingredientes únicos que permiten agregarse/modificarse para los modales
        const ingredientMap = new Map<number | string, Ingredient>();
        products.forEach(p => {
          p.ingredients.forEach(i => {
            if (!ingredientMap.has(i.id)) {
              ingredientMap.set(i.id, { ...i });
            }
          });
        });

        this._allIngredients.set(Array.from(ingredientMap.values()));
        this._products.set(products);
        this._loading.set(false);
      } catch (err) {
        console.error('Error cargando mock de productos:', err);
        this._error.set('Error al mostrar el menú. Intenta nuevamente.');
        this._loading.set(false);
      }
    }, 150); // Un pequeño delay estético opcional para simular red si gustas, o déjalo en 0
  }
}
