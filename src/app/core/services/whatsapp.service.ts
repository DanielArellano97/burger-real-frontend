import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { formatearLineaComboTexto } from '../utils/combo-format';
import { urlRutaMapa } from '../utils/delivery';
import { environment } from '../../../environments/environment';

export interface OrderData {
  name: string;
  phone: string;
  deliveryMethod: 'pickup' | 'delivery';
  gpsCoords: { lat: number; lng: number } | null;
  paymentMethod: 'transfer' | 'cash';
  notes: string;
  address: string;
  cashAmount: number;
  change: number;
  /** Subtotal de productos, sin delivery. */
  subtotal: number;
  /** Precio del delivery; `null` cuando queda por confirmar. */
  deliveryFee: number | null;
  /** `true` si el cliente no capturó GPS y el valor se confirma por WhatsApp. */
  deliveryPending: boolean;
  /** Distancia estimada local → cliente; `null` en retiro o sin GPS. */
  distanceKm: number | null;
}

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  hamburguesas:    { emoji: '🍔', label: 'HAMBURGUESAS' },
  acompañamientos: { emoji: '🍟', label: 'ACOMPAÑAMIENTOS' },
  bebestibles:     { emoji: '🥤', label: 'BEBESTIBLES' },
  extras:          { emoji: '➕', label: 'EXTRAS' },
};

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-CL')}`;
  }

  buildMessage(items: CartItem[], order?: OrderData): string {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-CL');

    let msg = `🍔 *NUEVO PEDIDO — ${environment.localName.toUpperCase()}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (order) {
      msg += `👤 *CLIENTE*\n`;
      msg += `• Nombre: ${order.name}\n`;
      msg += `• Teléfono: ${order.phone}\n\n`;
    }

    msg += `📋 *DETALLE DEL PEDIDO*\n\n`;

    const comboItems = items.filter(i => i.isCombo);
    const regularItems = items.filter(i => !i.isCombo);

    if (comboItems.length > 0) {
      msg += `🍔➕ *COMBOS*\n`;
      for (const item of comboItems) {
        const lineTotal = item.unitPrice * item.quantity;
        if (item.quantity > 1) {
          msg += `• ${item.quantity}x Combo ${item.combo!.name} — ${this.formatPrice(item.unitPrice)} c/u → *${this.formatPrice(lineTotal)}*\n`;
        } else {
          msg += `• 1x Combo ${item.combo!.name} — *${this.formatPrice(lineTotal)}*\n`;
        }

        const variants = item.selectedVariants ?? [];
        let variantIndex = 0;

        for (const d of item.combo!.detalles) {
          let seleccion: string | null = null;

          if (d.requiereSeleccion && d.cantidad > 0) {
            const variantesDeEsteDetalle = variants.slice(variantIndex, variantIndex + d.cantidad);
            variantIndex += d.cantidad;

            if (variantesDeEsteDetalle.length > 0) {
              const conteo = new Map<number, { variant: typeof variantesDeEsteDetalle[0]; count: number }>();
              for (const v of variantesDeEsteDetalle) {
                if (conteo.has(v.id)) conteo.get(v.id)!.count++;
                else conteo.set(v.id, { variant: v, count: 1 });
              }
              seleccion = Array.from(conteo.values())
                .map(({ variant, count }) => count > 1 ? `${variant.shortName} ×${count}` : variant.shortName)
                .join(', ');
            }
          }

          msg += `   - ${formatearLineaComboTexto(d, seleccion)}\n`;
        }
      }
      msg += '\n';
    }

    for (const [cat, meta] of Object.entries(CATEGORY_META)) {
      const catItems = regularItems.filter(i => i.product.category === cat);
      if (catItems.length === 0) continue;

      msg += `${meta.emoji} *${meta.label}*\n`;

      for (const item of catItems) {
        const lineTotal = item.unitPrice * item.quantity;
        const removed = item.customizedIngredients.filter(
          i => i.defaultQuantity > 0 && i.currentQuantity === 0
        );
        const extras = item.customizedIngredients.filter(
          i => i.currentQuantity > i.defaultQuantity
        );
        const variantStr = item.selectedVariant ? ` — ${item.selectedVariant.name}` : '';

        if (item.quantity > 1) {
          msg += `• ${item.quantity}x ${item.product.name}${variantStr} — ${this.formatPrice(item.unitPrice)} c/u → *${this.formatPrice(lineTotal)}*\n`;
        } else {
          msg += `• 1x ${item.product.name}${variantStr} — *${this.formatPrice(lineTotal)}*\n`;
        }

        if (item.product.customizable) {
          if (removed.length > 0) {
            msg += `   - Sin: ${removed.map(i => i.name).join(', ')}\n`;
          }
          for (const e of extras) {
            const extraUnits = e.currentQuantity - e.defaultQuantity;
            const extraCost  = extraUnits * e.extraPrice;
            const costStr    = extraCost > 0 ? ` (+${this.formatPrice(extraCost)})` : '';
            const qtyStr     = extraUnits > 1 ? ` x${extraUnits}` : '';
            msg += `   - Extra: ${e.name}${qtyStr}${costStr}\n`;
          }
        }
      }

      msg += '\n';
    }

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const deliveryPendiente = order?.deliveryMethod === 'delivery' && order.deliveryPending;
    const deliveryFee = order?.deliveryMethod === 'delivery' && !deliveryPendiente
      ? order.deliveryFee ?? 0
      : null;
    const total = subtotal + (deliveryFee ?? 0);

    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (order?.deliveryMethod === 'delivery') {
      msg += `💰 *RESUMEN*\n`;
      msg += `• Subtotal: ${this.formatPrice(subtotal)}\n`;
      msg += deliveryPendiente
        ? `• Delivery: por confirmar\n`
        : `• Delivery: ${this.formatPrice(deliveryFee ?? 0)}\n`;

      if (deliveryPendiente) {
        msg += `• *TOTAL PRODUCTOS: ${this.formatPrice(subtotal)}*\n`;
        msg += `⚠️ No incluye delivery — se confirma por WhatsApp.\n`;
      } else {
        msg += `• *TOTAL: ${this.formatPrice(total)}*\n`;
      }
    } else {
      msg += `💰 *TOTAL: ${this.formatPrice(total)}*\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (order) {
      msg += '\n';
      msg += `🚀 *ENTREGA*\n`;
      if (order.deliveryMethod === 'delivery') {
        msg += `• Modalidad: Delivery a Domicilio\n`;
        if (order.address) msg += `• Dirección: ${order.address}\n`;
        if (order.gpsCoords) {
          msg += `• Ubicación GPS: ${urlRutaMapa(order.gpsCoords)}\n`;
        }
        if (order.distanceKm !== null) {
          msg += `• Distancia aprox.: ${order.distanceKm.toFixed(1)} km\n`;
        }
        msg += order.deliveryPending
          ? `• Delivery: por confirmar\n`
          : `• Delivery: ${this.formatPrice(order.deliveryFee ?? 0)}\n`;
      } else {
        msg += `• Modalidad: Retiro en Local\n`;
      }

      msg += '\n';
      msg += `💳 *PAGO*\n`;
      if (order.paymentMethod === 'transfer') {
        msg += `• Método: Transferencia\n`;
      } else {
        msg += `• Método: Efectivo\n`;
        msg += `• Paga con: ${this.formatPrice(order.cashAmount)}\n`;
        if (order.deliveryPending) {
          msg += `• Vuelto: se confirma junto con el delivery\n`;
        } else if (order.change > 0) {
          msg += `• Vuelto requerido: ${this.formatPrice(order.change)}\n`;
        } else {
          msg += `• Pago justo — sin vuelto\n`;
        }
      }

      if (order.notes) {
        msg += '\n';
        msg += `📝 *NOTAS*\n`;
        msg += `• ${order.notes}\n`;
      }

      if (order.paymentMethod === 'transfer') {
        const b = environment.bankDetails;
        msg += '\n';
        msg += `🏦 *DATOS DE TRANSFERENCIA*\n`;
        msg += `• Banco: ${b.bank}\n`;
        msg += `• Tipo: ${b.accountType}\n`;
        msg += `• N° Cuenta: ${b.accountNumber}\n`;
        msg += `• RUT: ${b.rut}\n`;
        msg += `• Nombre: ${b.ownerName}\n`;
        msg += `• Email: ${b.email}\n`;
      }

      msg += '\n';
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `⏰ ${time} — ${date}`;

    return msg;
  }

  sendOrder(items: CartItem[], order?: OrderData): void {
    const msg = this.buildMessage(items, order);
    const url = `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
}
