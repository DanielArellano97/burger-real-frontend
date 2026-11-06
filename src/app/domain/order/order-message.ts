import { CartItem, ProductCartItem } from '../cart/cart.models';
import { comboLinesText } from '../catalog/combo-format';
import { ProductCategory } from '../catalog/catalog.models';
import { routeMapUrl } from '../delivery/delivery';
import { formatPrice } from '../shared/money';
import { OrderData, OrderMessageConfig } from './order.models';

const SEPARATOR = '━━━━━━━━━━━━━━━━━━━━━━━\n';

const CATEGORY_HEADERS: Record<ProductCategory, string> = {
  hamburguesas: '🍔 *HAMBURGUESAS*',
  acompañamientos: '🍟 *ACOMPAÑAMIENTOS*',
  bebestibles: '🥤 *BEBESTIBLES*',
};

/** Texto libre en una sola línea: evita que el cliente simule secciones (ej. "TOTAL"). */
export function singleLine(text: string): string {
  return text.replace(/\s*\r?\n+\s*/g, ' ').trim();
}

function quantityLine(name: string, quantity: number, unitPrice: number): string {
  const total = formatPrice(unitPrice * quantity);
  return quantity > 1
    ? `• ${quantity}x ${name} — ${formatPrice(unitPrice)} c/u → *${total}*\n`
    : `• 1x ${name} — *${total}*\n`;
}

function productDetail(item: ProductCartItem): string {
  if (!item.product.customizable) return '';
  let text = '';

  const removed = item.ingredients.filter(i => i.defaultQuantity > 0 && i.currentQuantity === 0);
  if (removed.length > 0) text += `   - Sin: ${removed.map(i => i.name).join(', ')}\n`;

  for (const extra of item.ingredients.filter(i => i.currentQuantity > i.defaultQuantity)) {
    const units = extra.currentQuantity - extra.defaultQuantity;
    const cost = units * extra.extraPrice;
    text += `   - Extra: ${extra.name}${units > 1 ? ` x${units}` : ''}${cost > 0 ? ` (+${formatPrice(cost)})` : ''}\n`;
  }
  return text;
}

/** Arma el mensaje de WhatsApp del pedido. */
export function buildOrderMessage(
  items: readonly CartItem[],
  order: OrderData,
  config: OrderMessageConfig,
  now: Date = new Date()
): string {
  const time = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('es-CL');

  let msg = `🍔 *NUEVO PEDIDO — ${config.localName.toUpperCase()}*\n${SEPARATOR}\n`;

  msg += `👤 *CLIENTE*\n• Nombre: ${singleLine(order.name)}\n• Teléfono: ${order.phone}\n\n`;
  msg += `📋 *DETALLE DEL PEDIDO*\n\n`;

  const combos = items.filter(i => i.kind === 'combo');
  if (combos.length > 0) {
    msg += `🍔➕ *COMBOS*\n`;
    for (const item of combos) {
      msg += quantityLine(`Combo ${item.name}`, item.quantity, item.unitPrice);
      for (const line of comboLinesText(item.combo.lines, item.selections)) msg += `   - ${line}\n`;
    }
    msg += '\n';
  }

  const products = items.filter((i): i is ProductCartItem => i.kind === 'product');
  for (const [category, header] of Object.entries(CATEGORY_HEADERS)) {
    const group = products.filter(i => i.product.category === category);
    if (group.length === 0) continue;

    msg += `${header}\n`;
    for (const item of group) {
      const portion = item.portion ? ` — ${item.portion.name}` : '';
      const promo = item.isPromo ? ' (Burger de la semana)' : '';
      msg += quantityLine(`${item.name}${portion}${promo}`, item.quantity, item.unitPrice);
      msg += productDetail(item);
    }
    msg += '\n';
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const isDelivery = order.deliveryMethod === 'delivery';
  const pending = isDelivery && order.deliveryPending;
  const fee = isDelivery && !pending ? order.deliveryFee ?? 0 : 0;

  msg += SEPARATOR;
  if (isDelivery) {
    msg += `💰 *RESUMEN*\n• Subtotal: ${formatPrice(subtotal)}\n`;
    msg += pending ? `• Delivery: por confirmar\n` : `• Delivery: ${formatPrice(fee)}\n`;
    msg += pending
      ? `• *TOTAL PRODUCTOS: ${formatPrice(subtotal)}*\n⚠️ No incluye delivery — se confirma por WhatsApp.\n`
      : `• *TOTAL: ${formatPrice(subtotal + fee)}*\n`;
  } else {
    msg += `💰 *TOTAL: ${formatPrice(subtotal)}*\n`;
  }
  msg += SEPARATOR + '\n';

  msg += `🚀 *ENTREGA*\n`;
  if (isDelivery) {
    msg += `• Modalidad: Delivery a Domicilio\n`;
    const address = singleLine(order.address);
    if (address) msg += `• Dirección: ${address}\n`;
    if (order.coordinates) msg += `• Ubicación GPS: ${routeMapUrl(config.origin, order.coordinates)}\n`;
    if (order.distanceKm !== null) msg += `• Distancia aprox.: ${order.distanceKm.toFixed(1)} km\n`;
    msg += pending ? `• Delivery: por confirmar\n` : `• Delivery: ${formatPrice(fee)}\n`;
  } else {
    msg += `• Modalidad: Retiro en Local\n`;
  }

  msg += `\n💳 *PAGO*\n`;
  if (order.paymentMethod === 'transfer') {
    msg += `• Método: Transferencia\n`;
  } else {
    msg += `• Método: Efectivo\n• Paga con: ${formatPrice(order.cashAmount)}\n`;
    if (pending) msg += `• Vuelto: se confirma junto con el delivery\n`;
    else if (order.change > 0) msg += `• Vuelto requerido: ${formatPrice(order.change)}\n`;
    else msg += `• Pago justo — sin vuelto\n`;
  }

  const notes = singleLine(order.notes);
  if (notes) msg += `\n📝 *NOTAS*\n• ${notes}\n`;

  if (order.paymentMethod === 'transfer') {
    const b = config.bank;
    msg += `\n🏦 *DATOS DE TRANSFERENCIA*\n`;
    msg += `• Banco: ${b.bank}\n• Tipo: ${b.accountType}\n• N° Cuenta: ${b.accountNumber}\n`;
    msg += `• RUT: ${b.rut}\n• Nombre: ${b.ownerName}\n• Email: ${b.email}\n`;
  }

  msg += `\n${SEPARATOR}⏰ ${time} — ${date}`;
  return msg;
}
