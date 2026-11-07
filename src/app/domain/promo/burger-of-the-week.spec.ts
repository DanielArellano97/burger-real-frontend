import { realCatalog } from '../../testing/catalog.fixture';
import { burgerOfTheDay, cyclePosition, dayKey, isOfferDay } from './burger-of-the-week';

const date = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

describe('burger de la semana', () => {
  const burgers = realCatalog().products;

  it('oferta solo de lunes a jueves', () => {
    expect(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'].map(d => isOfferDay(date(d)))).toEqual([true, true, true, true]);
    expect(['2026-11-06', '2026-11-07', '2026-11-08'].map(d => isOfferDay(date(d)))).toEqual([false, false, false]);
  });

  it('rota un día a la vez desde el lunes ancla (2026-01-05)', () => {
    expect(cyclePosition(date('2026-01-05'))).toBe(0);
    expect(cyclePosition(date('2026-01-08'))).toBe(3);
    expect(cyclePosition(date('2026-01-12'))).toBe(4);
  });

  it('el fin de semana muestra la burger del próximo lunes', () => {
    expect(burgerOfTheDay(burgers, date('2026-11-07'))!.id).toBe(burgerOfTheDay(burgers, date('2026-11-09'))!.id);
  });

  it('solo elige burgers con precio de oferta y recorre todas', () => {
    const picks = new Set(['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-12']
      .map(d => burgerOfTheDay(burgers, date(d))!.name));
    expect(picks).toEqual(new Set(['Cheese Burger', 'Onion Caramel', 'Onion Ring', 'Avocado Egg', 'La Trilogía del Rey']));
  });

  it('dayKey usa la fecha local YYYY-MM-DD', () => {
    expect(dayKey(date('2026-03-07'))).toBe('2026-03-07');
  });
});
