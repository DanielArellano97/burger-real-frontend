import { Component, inject, computed } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideX } from '@lucide/angular';
import { Product } from '../../../core/models/product.model';

export interface BurgerOfTheWeekModalData {
  burger: Product;
}

export interface BurgerOfTheWeekModalResult {
  confirmed: boolean;
}

@Component({
  selector: 'app-burger-of-the-week-modal',
  standalone: true,
  imports: [LucideX],
  template: `
    <div
      class="flex flex-col w-full overflow-hidden"
      style="background: #1A1A1A; border-top: 3px solid #F07800; border-radius: 16px; max-height: 85vh;"
    >
      <!-- HEADER -->
      <div class="flex-shrink-0 flex items-start justify-between px-5 pt-5 pb-4 border-b" style="border-color: #2A2A2A;">
        <div>
          <p class="font-body text-xs font-semibold uppercase tracking-widest mb-1" style="color: #F07800;">
            🍔 Burger de la Semana
          </p>
          <h2 class="font-heading font-bold text-lg text-brand-white leading-tight">
            {{ data.burger.name }}
          </h2>
        </div>
        <button
          (click)="cancel()"
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-brand-surface-2 mt-0.5"
          style="color: #888;"
          aria-label="Cerrar"
        >
          <svg lucideX class="w-5 h-5" aria-hidden="true"></svg>
        </button>
      </div>

      <!-- BODY -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        <!-- Aviso no modificable -->
        <div
          class="flex items-start gap-2 px-3 py-2.5 rounded-lg"
          style="background: rgba(240,120,0,0.08); border: 1px solid rgba(240,120,0,0.25);"
        >
          <span class="flex-shrink-0 text-sm">⚠️</span>
          <p class="font-body text-sm leading-relaxed" style="color: #F0DCC8;">
            Esta burger <strong style="color: #F0F0F0;">NO admite modificaciones</strong> en sus ingredientes.
          </p>
        </div>

        <!-- Ingredientes dinámicos -->
        <div>
          <p class="font-body text-xs font-semibold uppercase tracking-wider mb-2" style="color: #888;">
            📋 Ingredientes
          </p>
          <ul class="space-y-1.5">
            @for (ing of includedIngredients(); track ing.id) {
              <li class="flex items-center gap-2">
                <span style="color: #F07800; font-size: 10px;">●</span>
                <span class="font-body text-sm" style="color: #F0F0F0;">
                  {{ ing.name }}
                  @if (ing.defaultQuantity > 1) {
                    <span style="color: #888;"> x{{ ing.defaultQuantity }}</span>
                  }
                </span>
              </li>
            }
          </ul>
        </div>

        <!-- Incluye papas y salsa -->
        <div
          class="flex items-center gap-2 px-3 py-2.5 rounded-lg"
          style="background: #242424; border: 1px solid #2A2A2A;"
        >
          <span class="flex-shrink-0">🍟</span>
          <p class="font-body text-sm" style="color: #F0DCC8;">
            Incluye <strong style="color: #F0F0F0;">porción de papas fritas caseras</strong> y <strong style="color: #F0F0F0;">salsa de la casa</strong>.
          </p>
        </div>

      </div>

      <!-- FOOTER -->
      <div class="flex-shrink-0 px-5 pt-4 pb-5 border-t flex gap-3" style="border-color: #2A2A2A;">
        <button
          (click)="cancel()"
          class="flex-1 py-3 rounded-xl font-heading font-semibold text-base transition-colors border"
          style="background: transparent; color: #888; border-color: #2A2A2A;"
        >Cancelar</button>
        <button
          (click)="confirm()"
          class="flex-[2] py-3 rounded-xl font-heading font-bold text-base transition-all hover:opacity-90 active:scale-95"
          style="background: #F07800; color: #0F0F0F;"
        >
          Agregar — {{ formatPrice(data.burger.precioOferta ?? data.burger.price) }}
        </button>
      </div>
    </div>
  `,
})
export class BurgerOfTheWeekModalComponent {
  data = inject<BurgerOfTheWeekModalData>(DIALOG_DATA);
  dialogRef = inject<DialogRef<BurgerOfTheWeekModalResult>>(DialogRef);

  includedIngredients = computed(() =>
    this.data.burger.ingredients.filter(i => i.defaultQuantity > 0)
  );

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-CL')}`;
  }

  confirm(): void {
    this.dialogRef.close({ confirmed: true });
  }

  cancel(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
