export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DeliveryTier {
  upToKm: number;
  price: number;
}

export interface DeliveryConfig {
  origin: Coordinates;
  maxKm: number;
  routeFactor: number;
  tiers: readonly DeliveryTier[];
}

export interface DeliveryQuote {
  /** Distancia estimada de recorrido, redondeada hacia arriba a 0,1 km. */
  km: number;
  /** Precio del tramo; `null` si está fuera de cobertura. */
  price: number | null;
  outOfRange: boolean;
}

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Distancia en línea recta entre dos coordenadas (fórmula de Haversine). */
export function distanceKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Cotiza el delivery: aplica `routeFactor` para acercarse al recorrido real
 * y redondea hacia arriba (2,01 km cuenta como 2,1 km).
 */
export function quoteDelivery(destination: Coordinates, config: DeliveryConfig): DeliveryQuote {
  const straight = distanceKm(config.origin, destination);
  const km = Math.ceil(straight * config.routeFactor * 10) / 10;
  const tier = config.tiers.find(t => km <= t.upToKm);
  const outOfRange = km > config.maxKm || !tier;

  return { km, price: outOfRange || !tier ? null : tier.price, outOfRange };
}

/** Link de Google Maps con la ruta local → cliente (revisión del pin y navegación). */
export function routeMapUrl(origin: Coordinates, destination: Coordinates): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
}
