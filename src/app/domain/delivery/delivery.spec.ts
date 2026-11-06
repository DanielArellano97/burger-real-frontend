import { DELIVERY_CONFIG } from '../../config/delivery.config';
import { distanceKm, quoteDelivery, routeMapUrl } from './delivery';

/** Punto a `km` en línea recta al norte del local. */
const north = (km: number) => ({ lat: DELIVERY_CONFIG.origin.lat + km / 111.195, lng: DELIVERY_CONFIG.origin.lng });

describe('delivery', () => {
  it('Haversine: 1° de latitud ≈ 111 km', () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1);
  });

  it('aplica el factor de ruta (1.25) y redondea hacia arriba a 0,1 km', () => {
    const quote = quoteDelivery(north(1.6), DELIVERY_CONFIG); // 1,6 × 1,25 = 2,0
    expect(quote.km).toBeGreaterThanOrEqual(2.0);
    expect(quote.km).toBeLessThanOrEqual(2.1);
  });

  it('usa el primer tramo que cubre la distancia', () => {
    expect(quoteDelivery(north(0.5), DELIVERY_CONFIG).price).toBe(1000);
    expect(quoteDelivery(north(2.0), DELIVERY_CONFIG).price).toBe(1800); // 2,5 km
  });

  it('fuera de 10 km no hay precio', () => {
    expect(quoteDelivery(north(9), DELIVERY_CONFIG)).toMatchObject({ price: null, outOfRange: true });
  });

  it('arma la ruta de Google Maps local → cliente', () => {
    expect(routeMapUrl({ lat: 1, lng: 2 }, { lat: 3, lng: 4 })).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=1,2&destination=3,4'
    );
  });
});
