import { BUSINESS_HOURS } from '../../config/business-hours.config';
import { hoursLabel, isOpenAt } from './business-hours';

/** Hora en Chile (UTC-3 en noviembre), sin importar la zona de la máquina de tests. */
const chile = (hhmm: string) => new Date(`2026-11-06T${hhmm}:00-03:00`);

describe('horario de atención', () => {
  it.each([
    ['17:59', false], ['18:00', true], ['20:30', true], ['21:59', true], ['22:00', false], ['02:00', false],
  ])('a las %s abierto = %s', (hhmm, open) => {
    expect(isOpenAt(chile(hhmm as string), BUSINESS_HOURS)).toBe(open);
  });

  it('respeta los días configurados', () => {
    expect(isOpenAt(chile('19:00'), { ...BUSINESS_HOURS, days: [1, 2, 3] })).toBe(false); // viernes
  });

  it('texto para la UI', () => {
    expect(hoursLabel(BUSINESS_HOURS)).toBe('18:00 a 22:00');
  });
});
