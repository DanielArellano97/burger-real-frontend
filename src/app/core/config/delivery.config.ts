/**
 * Reglas de delivery editables sin tocar la lógica.
 *
 * Los tramos se evalúan en orden: se usa el primero donde
 * `distancia <= hastaKm`. El precio del tramo reemplaza al anterior,
 * no se suma.
 */
export const DELIVERY_CONFIG = {
  /** Coordenada del local (origen de todos los repartos). */
  origen: { lat: -36.61925, lng: -72.07626 },
  /** Radio máximo de reparto en kilómetros. */
  maxKm: 10,
  /**
   * Ajuste de distancia en línea recta a recorrido real.
   * 1 = sin ajuste. 1.25 cubre calles y vueltas típicas.
   */
  factorRuta: 1.25,
  tramos: [
    { hastaKm: 1, precio: 1_000 },
    { hastaKm: 2, precio: 1_200 },
    { hastaKm: 3, precio: 1_800 },
    { hastaKm: 4, precio: 2_200 },
    { hastaKm: 5, precio: 2_800 },
    { hastaKm: 6, precio: 3_300 },
    { hastaKm: 7, precio: 3_800 },
    { hastaKm: 8, precio: 4_300 },
    { hastaKm: 9, precio: 4_900 },
    { hastaKm: 10, precio: 5_500 }
  ],
};
