import { Injectable, signal } from '@angular/core';
import { Combo } from '../models/combo.model';
import { COMBOS_DATA } from '../data/combos.data'; // Ajusta la ruta según donde tengas tu archivo mock de combos

@Injectable({ providedIn: 'root' })
export class ComboService {
  private _combos  = signal<Combo[]>([]);
  private _loading = signal(false);
  private _error   = signal<string | null>(null);

  combos  = this._combos.asReadonly();
  loading = this._loading.asReadonly();
  error   = this._error.asReadonly();

  loadCombos(): void {
    this._loading.set(true);
    this._error.set(null);

    // Simulamos carga limpia con el mock local
    setTimeout(() => {
      try {
        this._combos.set(COMBOS_DATA);
        this._loading.set(false);
      } catch (err) {
        console.error('Error cargando mock de combos:', err);
        this._error.set('No se pudieron cargar los combos.');
        this._loading.set(false);
      }
    }, 150);
  }
}