import { Component, inject } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideX } from '@lucide/angular';
import { Combo, ComboDetalle } from '../../../core/models/combo.model';
import { formatearLineaCombo, LineaCombo } from '../../../core/utils/combo-format';

export interface ComboDetailModalData {
  combo: Combo;
}

@Component({
  selector: 'app-combo-detail-modal',
  standalone: true,
  imports: [A11yModule, LucideX],
  template: `
    <div
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      role="dialog"
      aria-modal="true"
      class="flex flex-col w-full overflow-hidden"
      style="background: #1A1A1A; border-top: 3px solid #F07800; border-radius: 16px; max-height: 85vh;"
    >
      <!-- Header -->
      <div class="flex-shrink-0 flex items-start justify-between px-5 pt-5 pb-4 border-b" style="border-color: #2A2A2A;">
        <div>
          <p class="font-body text-xs font-semibold uppercase tracking-widest mb-1" style="color: #F07800;">
            🍔 Combo
          </p>
          <h2 class="font-heading font-bold text-lg text-brand-white">{{ data.combo.name }}</h2>
        </div>
        <button
          (click)="close()"
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-brand-surface-2 mt-0.5"
          style="color: #888;"
          aria-label="Cerrar"
        >
          <svg lucideX class="w-5 h-5" aria-hidden="true"></svg>
        </button>
      </div>

      <!-- Body — detalle del combo -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        <p class="font-body text-xs font-semibold uppercase tracking-wider mb-3" style="color: #888;">
          📋 Este combo incluye
        </p>
        @for (detalle of data.combo.detalles; track $index) {
          @let linea = formatear(detalle);
          <div
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style="background: #242424; border: 1px solid #2A2A2A;"
          >
            <span style="color: #F07800; font-size: 18px;">•</span>
            <div class="flex-1 min-w-0">
              <p class="font-heading font-semibold text-sm text-brand-white">
                {{ linea.nombre }}
              </p>
              @if (linea.nota) {
                <p class="font-body text-xs mt-0.5" style="color: #888;">
                  {{ linea.nota }}
                </p>
              }
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              @if (linea.porcion) {
                <span
                  class="font-heading font-semibold text-xs px-2 py-0.5 rounded-full"
                  style="color: rgba(240,120,0,0.9); border: 1px solid rgba(240,120,0,0.4); white-space: nowrap;"
                >{{ linea.porcion }}</span>
              }
              @if (linea.cantidad) {
                <span
                  class="font-heading font-bold text-xs px-2 py-0.5 rounded-full"
                  style="color: #F07800; background: rgba(240,120,0,0.12); border: 1px solid rgba(240,120,0,0.35); white-space: nowrap;"
                >×{{ linea.cantidad }}</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="flex-shrink-0 px-5 pt-4 pb-5 border-t" style="border-color: #2A2A2A;">
        <p class="font-display text-3xl text-brand-orange text-center mb-3">
          {{ formatPrice(data.combo.price) }}
        </p>
        <button
          (click)="close()"
          class="w-full py-3 rounded-xl font-heading font-bold text-base transition-all hover:opacity-90 active:scale-95"
          style="background: #F07800; color: #0F0F0F;"
        >Entendido</button>
      </div>
    </div>
  `,
})
export class ComboDetailModalComponent {
  data = inject<ComboDetailModalData>(DIALOG_DATA);
  dialogRef = inject(DialogRef);

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-CL')}`;
  }

  formatear(detalle: ComboDetalle): LineaCombo {
    return formatearLineaCombo(detalle);
  }

  close(): void {
    this.dialogRef.close();
  }
}
