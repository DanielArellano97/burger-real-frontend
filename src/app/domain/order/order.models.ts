import { Coordinates } from '../delivery/delivery';

export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'transfer' | 'cash';

export interface BankDetails {
  ownerName: string;
  rut: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  email: string;
}

/** Datos del checkout que acompañan al carrito en el pedido. */
export interface OrderData {
  name: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  coordinates: Coordinates | null;
  paymentMethod: PaymentMethod;
  notes: string;
  address: string;
  cashAmount: number;
  change: number;
  /** Precio del delivery; `null` cuando queda por confirmar. */
  deliveryFee: number | null;
  /** `true` si no hay GPS y el delivery se confirma por WhatsApp. */
  deliveryPending: boolean;
  /** Distancia estimada local → cliente; `null` en retiro o sin GPS. */
  distanceKm: number | null;
}

/** Datos fijos del negocio que aparecen en el mensaje. */
export interface OrderMessageConfig {
  localName: string;
  bank: BankDetails;
  origin: Coordinates;
}
