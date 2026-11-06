import { Injectable } from '@angular/core';
import { OrderSender, SendResult } from '../../domain/order/order.sender';
import { environment } from '../../../environments/environment';

/** Adaptador: envía el pedido abriendo WhatsApp (wa.me) en otra pestaña. */
@Injectable()
export class WhatsappOrderSender extends OrderSender {
  send(message: string): SendResult {
    const url = `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(message)}`;
    const win = window.open(url, '_blank');
    if (!win) return { opened: false, url };

    // Equivale a rel="noopener": WhatsApp no puede manipular esta pestaña.
    try {
      win.opener = null;
    } catch {
      // Algunos navegadores no permiten tocar opener; la pestaña sigue abierta.
    }
    return { opened: true, url };
  }
}
