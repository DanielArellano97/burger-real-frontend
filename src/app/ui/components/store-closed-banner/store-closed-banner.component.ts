import { Component, inject } from '@angular/core';
import { StoreStatusService } from '../../../application/store-status.service';

/** Aviso "Estamos cerrados" con el horario. Solo se muestra fuera de horario. */
@Component({
  selector: 'app-store-closed-banner',
  standalone: true,
  template: `
    @if (!store.isOpen()) {
      <div
        class="flex items-start gap-2 px-3 py-2.5 rounded-lg"
        style="background: rgba(240,120,0,0.08); border: 1px solid rgba(240,120,0,0.35);"
        role="status"
      >
        <span class="flex-shrink-0 text-base" aria-hidden="true">🕕</span>
        <p class="font-body text-xs leading-relaxed" style="color: #F0DCC8;">
          <strong style="color: #F0F0F0;">Estamos cerrados.</strong>
          Recibimos pedidos todos los días de
          <strong style="color: #F07800;">{{ store.hoursLabel }} hrs</strong>.
          Mientras tanto puedes revisar el menú.
        </p>
      </div>
    }
  `,
})
export class StoreClosedBannerComponent {
  readonly store = inject(StoreStatusService);
}
