import { Injectable } from '@angular/core';
import { OrderSender, SendResult } from '../../domain/order/order.sender';
import { environment } from '../../../environments/environment';

/**
 * Cuánto se espera a que el celular cambie a la app de WhatsApp antes de
 * concluir que el navegador bloqueó la apertura. Cubre el aviso
 * "¿Abrir en WhatsApp?" que muestran algunos sistemas.
 */
export const APP_SWITCH_TIMEOUT_MS = 3000;

/** Adaptador: envía el pedido abriendo WhatsApp (wa.me). */
@Injectable()
export class WhatsappOrderSender extends OrderSender {
  async send(message: string): Promise<SendResult> {
    const url = `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(message)}`;
    const win = window.open(url, '_blank');

    if (win) {
      // Escritorio: se abrió una pestaña real.
      // Equivale a rel="noopener": WhatsApp no puede manipular esta pestaña.
      try {
        win.opener = null;
      } catch {
        // Algunos navegadores no permiten tocar opener; la pestaña sigue abierta.
      }
      return { opened: true, url };
    }

    // Celular: el sistema suele abrir la app de WhatsApp directamente y
    // window.open devuelve null AUNQUE haya funcionado. La señal real es que
    // esta página pasa a segundo plano. Si eso no ocurre, sí fue un bloqueo.
    const switchedToApp = await waitForPageToHide(APP_SWITCH_TIMEOUT_MS);
    return { opened: switchedToApp, url };
  }
}

/** Resuelve `true` si la página se oculta (cambio de app) antes de `timeoutMs`. */
export function waitForPageToHide(timeoutMs: number): Promise<boolean> {
  return new Promise(resolve => {
    if (document.hidden) {
      resolve(true);
      return;
    }

    const finish = (switched: boolean) => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('blur', onHide);
      resolve(switched);
    };
    const onHide = () => finish(true);
    const onVisibilityChange = () => {
      if (document.hidden) finish(true);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onHide);
    window.addEventListener('blur', onHide);
  });
}
