import { Component, inject, signal } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideX, LucideCheck } from '@lucide/angular';
import { SizeVariant } from '../../../core/models/product.model';
import { Combo, ComboDetalle } from '../../../core/models/combo.model';

export interface ComboModalData {
  combo: Combo;
  detalle: ComboDetalle;
  opciones: SizeVariant[];
  turno?: number;
  total?: number;
  /** Variante ya elegida, para cuando se vuelve desde el paso siguiente. */
  seleccionInicial?: SizeVariant;
  /** Selecciones hechas antes de este paso, para mostrarlas como resumen. */
  seleccionesPrevias?: SizeVariant[];
  /** `true` cuando existe un paso anterior al que volver. */
  puedeVolver?: boolean;
}

export type ComboModalResult =
  | { selectedVariant: SizeVariant }
  | { back: true };

@Component({
  selector: 'app-combo-modal',
  standalone: true,
  imports: [A11yModule, LucideX, LucideCheck],
  template: `
    <div
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="combo-modal-title"
      class="flex flex-col w-full overflow-hidden"
      style="background: #1A1A1A; border-top: 3px solid #F07800; border-radius: 16px;"
    >
      <!-- Header -->
      <div class="flex items-start justify-between px-5 pt-5 pb-4 border-b" style="border-color: #2A2A2A;">
        <div class="min-w-0">
          <h2 id="combo-modal-title" class="font-heading font-semibold text-base text-brand-white">
            Elige tu {{ nombreDetalle }}
          </h2>
          <p class="font-heading font-bold text-sm text-brand-orange mt-1 truncate">
            {{ data.combo.name }}
          </p>
          @if (mostrarPaso) {
            <span
              class="inline-flex items-center mt-2 font-heading font-semibold text-xs px-2 py-0.5 rounded-full"
              style="color: rgba(240,120,0,0.9); border: 1px solid rgba(240,120,0,0.4); white-space: nowrap;"
            >
              {{ nombreDetalleCap }} {{ data.turno }} de {{ data.total }}
            </span>
          }
        </div>
        <button
          (click)="cancel()"
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-brand-surface-2"
          style="color: #888;"
          aria-label="Cerrar"
        >
          <svg lucideX class="w-5 h-5" aria-hidden="true"></svg>
        </button>
      </div>

      <!-- Options -->
      <div class="px-5 py-4 flex flex-col gap-3">
        @if (data.seleccionesPrevias?.length) {
          <div class="rounded-lg px-3 py-2" style="background: #242424; border: 1px solid #2A2A2A;">
            @for (previa of data.seleccionesPrevias; track $index) {
              <p class="font-body text-xs" style="color: #AAA;">
                {{ nombreDetalleCap }} {{ $index + 1 }}:
                <span style="color: #F0F0F0;">{{ previa.name }}</span>
              </p>
            }
          </div>
        }

        <p class="font-body text-sm" style="color: #888;">{{ instruccion }}</p>

        @for (opcion of data.opciones; track opcion.id) {
          <button
            (click)="selectedOption.set(opcion)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            [style.background]="selectedOption()?.id === opcion.id ? '#F07800' : '#242424'"
            [style.color]="selectedOption()?.id === opcion.id ? '#0F0F0F' : '#F0F0F0'"
            [attr.aria-pressed]="selectedOption()?.id === opcion.id"
          >
            <span class="font-body text-sm font-medium flex-1">{{ opcion.name }}</span>
            @if (selectedOption()?.id === opcion.id) {
              <svg lucideCheck class="w-4 h-4 flex-shrink-0" aria-hidden="true"></svg>
            }
          </button>
        }
      </div>

      <!-- Footer -->
      <div class="flex gap-3 px-5 pb-5">
        <button
          (click)="secondaryAction()"
          class="flex-1 py-3 rounded-xl font-heading font-semibold text-sm transition-all border"
          style="color: #888; border-color: #2A2A2A; background: transparent;"
        >
          {{ data.puedeVolver ? 'Atrás' : 'Cancelar' }}
        </button>
        <button
          (click)="confirm()"
          [disabled]="!selectedOption()"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-heading font-semibold text-sm transition-all"
          [style.background]="selectedOption() ? '#F07800' : '#333'"
          [style.color]="selectedOption() ? '#0F0F0F' : '#555'"
          [style.cursor]="selectedOption() ? 'pointer' : 'not-allowed'"
          [attr.aria-label]="textoConfirmar"
        >
          <svg lucideCheck class="w-4 h-4" aria-hidden="true"></svg>
          {{ textoConfirmar }}
        </button>
      </div>
    </div>
  `,
})
export class ComboModalComponent {
  data = inject<ComboModalData>(DIALOG_DATA);
  dialogRef = inject<DialogRef<ComboModalResult>>(DialogRef);

  selectedOption = signal<SizeVariant | null>(this.data.seleccionInicial ?? null);

  /** Nombre del detalle sin el "a elección" y en minúsculas: "bebida". */
  get nombreDetalle(): string {
    return this.data.detalle.productoNombre
      .replace(/\s+a elección$/i, '')
      .toLowerCase();
  }

  get nombreDetalleCap(): string {
    const nombre = this.nombreDetalle;
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  get mostrarPaso(): boolean {
    return (this.data.total ?? 1) > 1;
  }

  get instruccion(): string {
    if (!this.mostrarPaso) return 'Elige una opción';

    const ordinales = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta'];
    const turno = this.data.turno ?? 1;
    const ordinal = ordinales[turno - 1] ?? `${turno}ª`;

    return `Elige la ${ordinal} ${this.nombreDetalle}`;
  }

  get textoConfirmar(): string {
    const total = this.data.total ?? 1;
    const turno = this.data.turno ?? 1;

    return total > 1 && turno < total
      ? `Confirmar ${this.nombreDetalle} ${turno}`
      : 'Agregar combo';
  }

  confirm(): void {
    const opt = this.selectedOption();
    if (!opt) return;
    this.dialogRef.close({ selectedVariant: opt });
  }

  secondaryAction(): void {
    if (this.data.puedeVolver) {
      this.dialogRef.close({ back: true });
      return;
    }
    this.cancel();
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
