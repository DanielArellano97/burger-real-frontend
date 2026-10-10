import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiIngrediente, ApiProduct, ApiVariante } from '../models/api-product.model';
import { Ingredient, Product, SizeVariant } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);

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

    this.http.get<ApiProduct[]>(`${environment.apiUrl}/api/productos`).subscribe({
      next: (data) => {
        const disponibles = data.filter(p => p.disponible);
        const mapped = disponibles.map(p => this.mapApiProductToProduct(p));

        const ingredientMap = new Map<number, Ingredient>();
        disponibles.forEach(p =>
          p.ingredientes
            .filter(i => i.permiteAgregar)
            .forEach(i => {
              if (!ingredientMap.has(i.id)) {
                ingredientMap.set(i.id, this.mapIngrediente(i));
              }
            })
        );

        this._allIngredients.set(Array.from(ingredientMap.values()));
        this._products.set(mapped);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this._error.set('Error al mostrar el menú. Intenta nuevamente.');
        this._loading.set(false);
      },
    });
  }

  private mapApiProductToProduct(api: ApiProduct): Product {
    const ingredientesModal = api.ingredientes
      .filter(i => i.permiteQuitar || i.permiteAgregar)
      .map(i => this.mapIngrediente(i));


    const precioOferta = api.precioOferta ?? undefined;

    return {
      id: api.id,
      name: api.nombre,
      description: api.descripcion,
      price: api.precioVenta,
      image: api.imagenUrl,
      category: this.mapCategoria(api.categoria),
      customizable: api.categoria === 'HAMBURGUESA' || api.categoria === 'ACOMPAÑAMIENTO',
      ingredients: ingredientesModal,
      variants: api.variantes.map(v => this.mapVariante(v)),
      precioOferta,
    };
  }

  private mapVariante(api: ApiVariante): SizeVariant {
    return {
      id: api.id,
      name: api.nombre,
      shortName: api.nombreCorto,
      extraPrice: api.precioExtra,
    };
  }

  private mapIngrediente(api: ApiIngrediente): Ingredient {
    return {
      id: api.id,
      name: api.nombre,
      defaultQuantity: 1,
      currentQuantity: 1,
      extraPrice: api.precioExtra,
      isRequired: !api.permiteQuitar,
    };
  }

  private mapCategoria(cat: string): 'hamburguesas' | 'acompañamientos' | 'bebestibles' {
    const map: Record<string, 'hamburguesas' | 'acompañamientos' | 'bebestibles'> = {
      'HAMBURGUESA':    'hamburguesas',
      'ACOMPAÑAMIENTO': 'acompañamientos',
      'BEBESTIBLE':     'bebestibles',
    };
    return map[cat] ?? 'hamburguesas';
  }
}
