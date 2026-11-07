import { Injectable, inject } from '@angular/core';
import { CartItem } from '../domain/cart/cart.models';
import { OrderData } from '../domain/order/order.models';
import { buildOrderMessage } from '../domain/order/order-message';
import { OrderSender, SendResult } from '../domain/order/order.sender';
import { DELIVERY_CONFIG } from '../config/delivery.config';
import { environment } from '../../environments/environment';

/** Caso de uso: enviar el pedido. Arma el mensaje y lo entrega al canal configurado. */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly sender = inject(OrderSender);

  send(items: readonly CartItem[], order: OrderData): Promise<SendResult> {
    const message = buildOrderMessage(items, order, {
      localName: environment.localName,
      bank: environment.bankDetails,
      origin: DELIVERY_CONFIG.origin,
    });
    return this.sender.send(message);
  }
}
