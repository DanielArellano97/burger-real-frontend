/**
 * Reglas de delivery editables sin tocar la lógica.
 *
 * Los tramos se evalúan en orden: se usa el primero donde
 * `distancia <= hastaKm`. El precio del tramo reemplaza al anterior,
 * no se suma.
 */
export const DELIVERY_CONFIG = {
  /** Coordenada del local (origen de todos los repartos). */
  origen: { lat: -36.619144, lng: -72.076267 },
  /** Radio máximo de reparto en kilómetros. */
  maxKm: 10,
  /**
   * Ajuste de distancia en línea recta a recorrido real.
   * 1 = sin ajuste. 1.25 cubre calles y vueltas típicas.
   */
  factorRuta: 1.25,
  tramos: [
    { hastaKm: 2, precio: 1_000 },
    { hastaKm: 5, precio: 2_000 },
    { hastaKm: 10, precio: 3_000 },
  ],
};
