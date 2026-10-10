import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiCombo, ApiComboDetalle, ApiVarianteSeleccionada } from '../models/api-combo.model';
import { Combo, ComboDetalle } from '../models/combo.model';
import { SizeVariant } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ComboService {
  private http = inject(HttpClient);

  private _combos  = signal<Combo[]>([]);
  private _loading = signal(false);
  private _error   = signal<string | null>(null);

  combos  = this._combos.asReadonly();
  loading = this._loading.asReadonly();
  error   = this._error.asReadonly();

  loadCombos(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http.get<ApiCombo[]>(`${environment.apiUrl}/api/v1/combos`).subscribe({
      next: (data) => {
        const mapped = data
          .filter(c => c.disponible)
          .map(c => this.mapApiCombo(c));
        this._combos.set(mapped);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando combos:', err);
        this._error.set('No se pudieron cargar los combos.');
        this._loading.set(false);
      },
    });
  }

  private mapApiCombo(api: ApiCombo): Combo {
    return {
      id: api.id,
      name: api.nombre,
      description: api.descripcion,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      price: api.precioCombo,
      detalles: api.detalles.map(d => this.mapDetalle(d)),
    };
  }

  private mapDetalle(api: ApiComboDetalle): ComboDetalle {
    return {
      productoId: api.productoId,
      productoNombre: api.productoNombre,
      cantidad: api.cantidad,
      requiereSeleccion: api.requiereSeleccion,
      varianteSeleccionada: api.varianteSeleccionada
        ? this.mapVariante(api.varianteSeleccionada)
        : null,
      opcionesDisponibles: api.opcionesDisponibles.map(o => this.mapVariante(o)),
    };
  }

  private mapVariante(api: ApiVarianteSeleccionada): SizeVariant {
    return {
      id: api.id,
      name: api.nombre,
      shortName: api.nombreCorto,
      extraPrice: api.precioExtra,
    };
  }
}
