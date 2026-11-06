import { DeliveryConfig } from '../domain/delivery/delivery';

/**
 * Reglas de delivery editables sin tocar la lógica.
 *
 * Los tramos se evalúan en orden: se usa el primero donde
 * `distancia <= upToKm`. El precio del tramo reemplaza al anterior, no se suma.
 */
export const DELIVERY_CONFIG: DeliveryConfig = {
  /** Coordenada del local (origen de todos los repartos). */
  origin: { lat: -36.61925, lng: -72.07626 },
  /** Radio máximo de reparto en kilómetros. */
  maxKm: 10,
  /** Ajuste de línea recta a recorrido real (1.25 cubre calles y vueltas). */
  routeFactor: 1.25,
  tiers: [
    { upToKm: 1, price: 1_000 },
    { upToKm: 2, price: 1_200 },
    { upToKm: 3, price: 1_800 },
    { upToKm: 4, price: 2_200 },
    { upToKm: 5, price: 2_800 },
    { upToKm: 6, price: 3_300 },
    { upToKm: 7, price: 3_800 },
    { upToKm: 8, price: 4_300 },
    { upToKm: 9, price: 4_900 },
    { upToKm: 10, price: 5_500 },
  ],
};
