import { Injectable, isDevMode, signal } from '@angular/core';

/**
 * Fecha/hora simulada solo en desarrollo, para probar promo y horario:
 * `?fecha=2026-10-26` y/o `?hora=21:30`. En producción siempre es `null`.
 */
function readSimulatedNow(): Date | null {
  if (!isDevMode() || typeof location === 'undefined') return null;

  const params = new URLSearchParams(location.search);
  const dateParam = params.get('fecha');
  const timeParam = params.get('hora');
  if (!dateParam && !timeParam) return null;

  const now = new Date();
  const [year, month, day] = dateParam
    ? dateParam.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1, now.getDate()];
  const [hours, minutes] = timeParam ? timeParam.split(':').map(Number) : [now.getHours(), now.getMinutes()];

  const simulated = new Date(year, month - 1, day, hours, minutes);
  return Number.isNaN(simulated.getTime()) ? null : simulated;
}

/** Reloj reactivo de la app: se actualiza cada 30 s y al volver a la pestaña. */
@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly simulated = readSimulatedNow();
  readonly now = signal(this.simulated ?? new Date());

  constructor() {
    if (this.simulated) return;
    setInterval(() => this.now.set(new Date()), 30_000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.now.set(new Date());
    });
  }
}
