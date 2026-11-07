import { Injectable, computed, inject } from '@angular/core';
import { BUSINESS_HOURS } from '../config/business-hours.config';
import { hoursLabel, isOpenAt } from '../domain/schedule/business-hours';
import { ClockService } from './clock.service';

/** Estado del local (abierto/cerrado), reactivo al reloj. */
@Injectable({ providedIn: 'root' })
export class StoreStatusService {
  private readonly clock = inject(ClockService);

  readonly isOpen = computed(() => isOpenAt(this.clock.now(), BUSINESS_HOURS));
  readonly hoursLabel = hoursLabel(BUSINESS_HOURS);
}
