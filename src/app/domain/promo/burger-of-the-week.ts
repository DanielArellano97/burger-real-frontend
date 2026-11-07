import { Product } from '../catalog/catalog.models';

/** Burger con precio de oferta garantizado: única candidata a la promo. */
export type OfferBurger = Product & { offerPrice: number };

/** Primer lunes del ciclo. Solo define el punto de partida de la rotación. */
const ANCHOR_MONDAY = Date.UTC(2026, 0, 5);
const MS_PER_DAY = 86_400_000;

/** Clave local `YYYY-MM-DD`, usada para saber a qué día pertenece una promo. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** ¿Corresponde mostrar el precio de oferta? Solo lunes a jueves. */
export function isOfferDay(date: Date): boolean {
  const weekday = date.getDay(); // 0 = domingo … 6 = sábado
  return weekday >= 1 && weekday <= 4;
}

/**
 * Posición dentro del ciclo lunes→jueves, contando solo días de oferta.
 * Lunes = 0 … jueves = 3, lunes siguiente = 4…
 * Viernes a domingo devuelven la posición del próximo lunes, así el aviso
 * de fin de semana muestra la burger que viene.
 */
export function cyclePosition(date: Date): number {
  const weekday = date.getDay();
  const daysUntilMonday = weekday === 5 ? 3 : weekday === 6 ? 2 : weekday === 0 ? 1 : 0;

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysUntilMonday);
  const positionInWeek = target.getDay() - 1; // 0..3
  const days = Math.round(
    (Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()) - ANCHOR_MONDAY) / MS_PER_DAY
  );

  return Math.floor(days / 7) * 4 + positionInWeek;
}

/**
 * Burger del día: rota un día a la vez entre las burgers con `offerPrice`,
 * en el orden del menú, y vuelve a la primera al terminar la lista.
 * Siempre resuelve una burger; si se muestra la oferta lo decide `isOfferDay`.
 */
export function burgerOfTheDay(
  burgers: readonly Product[],
  date: Date
): OfferBurger | null {
  const candidates = burgers.filter(
    (b): b is OfferBurger => b.category === 'hamburguesas' && b.offerPrice !== null
  );
  if (candidates.length === 0) return null;
  return candidates[cyclePosition(date) % candidates.length];
}
