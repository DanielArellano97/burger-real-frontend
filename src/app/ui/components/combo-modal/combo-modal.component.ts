import { Component, inject, signal } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideX, LucideCheck } from '@lucide/angular';
import { Combo, ComboLine, ComboOption } from '../../../domain/catalog/catalog.models';

export interface ComboModalData {
  combo: Combo;
  line: ComboLine;
  /** Paso actual (1..totalSteps) cuando el combo pide varias elecciones. */
  step: number;
  totalSteps: number;
  /** Opción ya elegida, para cuando se vuelve desde el paso siguiente. */
  initialSelection?: ComboOption;
  /** Elecciones hechas antes de este paso, para mostrarlas como resumen. */
  previousSelections: readonly ComboOption[];
  /** `true` cuando existe un paso anterior al que volver. */
  canGoBack: boolean;
}

export type ComboModalResult =
  | { selected: ComboOption }
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
            Elige tu {{ lineLabel }}
          </h2>
          <p class="font-heading font-bold text-sm text-brand-orange mt-1 truncate">
            {{ data.combo.name }}
          </p>
          @if (showStep) {
            <span
              class="inline-flex items-center mt-2 font-heading font-semibold text-xs px-2 py-0.5 rounded-full"
              style="color: rgba(240,120,0,0.9); border: 1px solid rgba(240,120,0,0.4); white-space: nowrap;"
            >
              {{ lineLabelCapitalized }} {{ data.step }} de {{ data.totalSteps }}
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
        @if (data.previousSelections.length) {
          <div class="rounded-lg px-3 py-2" style="background: #242424; border: 1px solid #2A2A2A;">
            <!-- track $index: la misma opción puede repetirse (ej. 2 Coca-Cola). -->
            @for (previous of data.previousSelections; track $index) {
              <p class="font-body text-xs" style="color: #AAA;">
                {{ lineLabelCapitalized }} {{ $index + 1 }}:
                <span style="color: #F0F0F0;">{{ previous.name }}</span>
              </p>
            }
          </div>
        }

        <p class="font-body text-sm" style="color: #888;">{{ instruction }}</p>

        @for (option of data.line.options; track option.id) {
          <button
            (click)="selectedOption.set(option)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            [style.background]="selectedOption()?.id === option.id ? '#F07800' : '#242424'"
            [style.color]="selectedOption()?.id === option.id ? '#0F0F0F' : '#F0F0F0'"
            [attr.aria-pressed]="selectedOption()?.id === option.id"
          >
            <span class="font-body text-sm font-medium flex-1">{{ option.name }}</span>
            @if (selectedOption()?.id === option.id) {
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
          {{ data.canGoBack ? 'Atrás' : 'Cancelar' }}
        </button>
        <button
          (click)="confirm()"
          [disabled]="!selectedOption()"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-heading font-semibold text-sm transition-all"
          [style.background]="selectedOption() ? '#F07800' : '#333'"
          [style.color]="selectedOption() ? '#0F0F0F' : '#555'"
          [style.cursor]="selectedOption() ? 'pointer' : 'not-allowed'"
          [attr.aria-label]="confirmText"
        >
          <svg lucideCheck class="w-4 h-4" aria-hidden="true"></svg>
          {{ confirmText }}
        </button>
      </div>
    </div>
  `,
})
export class ComboModalComponent {
  readonly data = inject<ComboModalData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<ComboModalResult>>(DialogRef);

  readonly selectedOption = signal<ComboOption | null>(this.data.initialSelection ?? null);

  /** Nombre de la línea sin "a elección" y en minúsculas: "bebida". */
  readonly lineLabel = this.data.line.name.replace(/\s+a elección$/i, '').toLowerCase();
  readonly lineLabelCapitalized = this.lineLabel.charAt(0).toUpperCase() + this.lineLabel.slice(1);
  readonly showStep = this.data.totalSteps > 1;

  get instruction(): string {
    if (!this.showStep) return 'Elige una opción';
    const ordinals = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta'];
    const ordinal = ordinals[this.data.step - 1] ?? `${this.data.step}ª`;
    return `Elige la ${ordinal} ${this.lineLabel}`;
  }

  get confirmText(): string {
    return this.showStep && this.data.step < this.data.totalSteps
      ? `Confirmar ${this.lineLabel} ${this.data.step}`
      : 'Agregar combo';
  }

  confirm(): void {
    const option = this.selectedOption();
    if (option) this.dialogRef.close({ selected: option });
  }

  secondaryAction(): void {
    if (this.data.canGoBack) this.dialogRef.close({ back: true });
    else this.cancel();
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
