import { DELIVERY_CONFIG } from '../config/delivery.config';

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface DeliveryCalculo {
  /** Distancia estimada de recorrido, redondeada hacia arriba a 0,1 km. */
  km: number;
  /** Precio del tramo; `null` si está fuera de cobertura. */
  precio: number | null;
  fueraDeCobertura: boolean;
}

const RADIO_TIERRA_KM = 6371;

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

/**
 * Distancia en línea recta entre dos coordenadas (fórmula de Haversine).
 */
export function distanciaKm(origen: Coordenadas, destino: Coordenadas): number {
  const dLat = aRadianes(destino.lat - origen.lat);
  const dLng = aRadianes(destino.lng - origen.lng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(origen.lat)) *
      Math.cos(aRadianes(destino.lat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
}

/**
 * Calcula el delivery a partir de la ubicación del cliente.
 *
 * Aplica `factorRuta` para acercarse al recorrido real y redondea hacia
 * arriba: 2,01 km cuenta como 2,1 km, nunca como 2,0.
 */
export function calcularDelivery(destino: Coordenadas): DeliveryCalculo {
  const recta = distanciaKm(DELIVERY_CONFIG.origen, destino);
  const km = Math.ceil(recta * DELIVERY_CONFIG.factorRuta * 10) / 10;

  const fueraDeCobertura = km > DELIVERY_CONFIG.maxKm;
  const tramo = DELIVERY_CONFIG.tramos.find(t => km <= t.hastaKm);

  return {
    km,
    precio: fueraDeCobertura || !tramo ? null : tramo.precio,
    fueraDeCobertura: fueraDeCobertura || !tramo,
  };
}

/**
 * Link de Google Maps con la ruta local → cliente.
 * Sirve para que el cliente revise el pin antes de confirmar y para
 * que el repartidor navegue directo.
 */
export function urlRutaMapa(destino: Coordenadas): string {
  const { lat, lng } = DELIVERY_CONFIG.origen;
  return `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destino.lat},${destino.lng}`;
}
