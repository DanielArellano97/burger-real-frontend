import { BusinessHoursConfig } from '../domain/schedule/business-hours';

/** Horario en que se reciben pedidos. Fuera de él el menú se ve, pero no se puede pedir. */
export const BUSINESS_HOURS: BusinessHoursConfig = {
  timeZone: 'America/Santiago',
  opensAt: '18:00',
  closesAt: '22:00',
  days: [0, 1, 2, 3, 4, 5, 6],
};
