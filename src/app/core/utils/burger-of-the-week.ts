import { Product } from '../models/product.model';

/** Burger con oferta garantizada: es la única que puede ser "de la semana". */
export type BurgerEnOferta = Product & { precioOferta: number };

/** Primer lunes del ciclo. Solo define el punto de partida de la rotación. */
const LUNES_ANCLA = Date.UTC(2026, 0, 5);

const MS_DIA = 86_400_000;

/** ¿Corresponde mostrar el precio de oferta? Solo lunes a jueves. */
export function esDiaDeOferta(fecha: Date): boolean {
  const dia = fecha.getDay(); // 0 = domingo … 6 = sábado
  return dia >= 1 && dia <= 4;
}

/**
 * Posición dentro del ciclo lunes→jueves, contando un día hábil por vez.
 *
 * Lunes = 0, martes = 1, miércoles = 2, jueves = 3,
 * lunes siguiente = 4, martes = 5…
 *
 * Viernes, sábado y domingo devuelven la posición del próximo lunes, así el
 * aviso de fin de semana muestra la burger que viene.
 */
export function posicionDelDia(fecha: Date): number {
  const dia = fecha.getDay();
  const diasHastaElLunes = dia === 5 ? 3 : dia === 6 ? 2 : dia === 0 ? 1 : 0;

  const objetivo = new Date(
    fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + diasHastaElLunes
  );

  const posicionEnSemana = objetivo.getDay() - 1; // 0..3
  const dias = Math.round(
    (Date.UTC(
      objetivo.getFullYear(), objetivo.getMonth(), objetivo.getDate()
    ) - LUNES_ANCLA) / MS_DIA
  );

  return Math.floor(dias / 7) * 4 + posicionEnSemana;
}

/**
 * Burger de la semana: rota un día a la vez entre las burgers que tienen
 * `precioOferta`, en el orden en que aparecen en el menú.
 *
 * Lunes → 1ª, martes → 2ª, miércoles → 3ª, jueves → 4ª,
 * lunes siguiente → 5ª… y al terminar la lista vuelve a la primera.
 *
 * La burger siempre se resuelve; quien decide si se muestra la oferta es
 * `esDiaDeOferta`.
 */
export function burgerDelDia(
  burgers: readonly Product[],
  fecha: Date = new Date()
): BurgerEnOferta | null {
  const ofertas = burgers.filter(
    (burger): burger is BurgerEnOferta => typeof burger.precioOferta === 'number'
  );

  if (ofertas.length === 0) return null;

  const posicion = posicionDelDia(fecha);
  return ofertas[posicion % ofertas.length];
}
