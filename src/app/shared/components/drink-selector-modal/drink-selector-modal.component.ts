import { Component, inject, signal } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideX, LucideCheck } from '@lucide/angular';
import { SizeVariant } from '../../../core/models/product.model';

export interface DrinkSelectorModalData {
  productName: string;
  opciones: SizeVariant[];
}

export interface DrinkSelectorModalResult {
  selectedVariant: SizeVariant;
}

@Component({
  selector: 'app-drink-selector-modal',
  standalone: true,
  imports: [A11yModule, LucideX, LucideCheck],
  template: `
    <div
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drink-modal-title"
      class="flex flex-col w-full overflow-hidden"
      style="background: #1A1A1A; border-top: 3px solid #F07800; border-radius: 16px;"
    >
      <!-- Header -->
      <div class="flex items-start justify-between px-5 pt-5 pb-4 border-b" style="border-color: #2A2A2A;">
        <div>
          <h2 id="drink-modal-title" class="font-heading font-semibold text-base text-brand-white">
            Elige tu {{ data.productName }}
          </h2>
          <p class="font-body text-sm mt-1" style="color: #888;">
            Seleccioná el sabor de tu bebida
          </p>
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
          (click)="cancel()"
          class="flex-1 py-3 rounded-xl font-heading font-semibold text-sm transition-all border"
          style="color: #888; border-color: #2A2A2A; background: transparent;"
        >
          Cancelar
        </button>
        <button
          (click)="confirm()"
          [disabled]="!selectedOption()"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-heading font-semibold text-sm transition-all"
          [style.background]="selectedOption() ? '#F07800' : '#333'"
          [style.color]="selectedOption() ? '#0F0F0F' : '#555'"
          [style.cursor]="selectedOption() ? 'pointer' : 'not-allowed'"
          aria-label="Confirmar selección de bebida"
        >
          <svg lucideCheck class="w-4 h-4" aria-hidden="true"></svg>
          Confirmar
        </button>
      </div>
    </div>
  `,
})
export class DrinkSelectorModalComponent {
  data = inject<DrinkSelectorModalData>(DIALOG_DATA);
  dialogRef = inject<DialogRef<DrinkSelectorModalResult>>(DialogRef);

  selectedOption = signal<SizeVariant | null>(null);

  confirm(): void {
    const opt = this.selectedOption();
    if (!opt) return;
    this.dialogRef.close({ selectedVariant: opt });
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
