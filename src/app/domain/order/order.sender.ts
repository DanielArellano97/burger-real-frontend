/** Resultado de intentar enviar el pedido. */
export interface SendResult {
  /** `false` si el navegador bloqueó la ventana (no se debe vaciar el carrito). */
  opened: boolean;
  /** URL para un enlace de respaldo. */
  url: string;
}

/** Puerto: canal por el que sale el pedido (hoy WhatsApp). */
export abstract class OrderSender {
  abstract send(message: string): SendResult;
}
