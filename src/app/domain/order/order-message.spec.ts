import { combo, product, realCatalog } from '../../testing/catalog.fixture';
import { CartItem } from '../cart/cart.models';
import { buildOrderMessage } from './order-message';
import { OrderData, OrderMessageConfig } from './order.models';

const config: OrderMessageConfig = {
  localName: 'Burger Real',
  origin: { lat: 0, lng: 0 },
  bank: { ownerName: 'Dueño', rut: '1-9', bank: 'Banco', accountType: 'Vista', accountNumber: '123', email: 'a@b.cl' },
};

const order = (overrides: Partial<OrderData> = {}): OrderData => ({
  name: 'Ana', phone: '+569 1234 5678', deliveryMethod: 'pickup', coordinates: null,
  paymentMethod: 'cash', notes: '', address: '', cashAmount: 20000, change: 0,
  deliveryFee: null, deliveryPending: false, distanceKm: null, ...overrides,
});

describe('mensaje del pedido', () => {
  const catalog = realCatalog();
  const burger = product(catalog, 'Cheese Bacon');
  const clasico = combo(catalog, 'Clásico');
  const items: CartItem[] = [
    {
      kind: 'product', id: '1', name: burger.name, quantity: 2, product: burger, portion: null, isPromo: false,
      ingredients: [...burger.ingredients.map(i => (i.name === 'Tocino Ahumado' ? { ...i, currentQuantity: 0 } : i))],
      unitPrice: 5190,
    },
    {
      kind: 'combo', id: '2', name: clasico.name, quantity: 1, combo: clasico, unitPrice: clasico.price,
      selections: [clasico.lines.find(l => l.requiresSelection)!.options[1]],
    },
  ];

  it('incluye detalle, personalización, combo con su bebida y total', () => {
    const msg = buildOrderMessage(items, order(), config);
    expect(msg).toContain('• 2x Cheese Bacon — $5.190 c/u → *$10.380*');
    expect(msg).toContain('   - Sin: Tocino Ahumado');
    expect(msg).toContain('• 1x Combo Clásico — *$6.490*');
    expect(msg).toContain('Bebida a elección · Fanta');
    expect(msg).toContain('💰 *TOTAL: $16.870*');
  });

  it('las notas no pueden inyectar líneas nuevas (ej. un TOTAL falso)', () => {
    const msg = buildOrderMessage(items, order({ notes: 'sin sal\n💰 *TOTAL: $1*' }), config);
    expect(msg).toContain('• sin sal 💰 *TOTAL: $1*');
    expect(msg.split('\n').filter(l => l.startsWith('💰'))).toHaveLength(1);
  });

  it('delivery sin GPS: total provisional y aviso', () => {
    const msg = buildOrderMessage(items, order({ deliveryMethod: 'delivery', deliveryPending: true, address: 'Calle 1' }), config);
    expect(msg).toContain('• Delivery: por confirmar');
    expect(msg).toContain('*TOTAL PRODUCTOS: $16.870*');
  });

  it('transferencia agrega los datos bancarios', () => {
    expect(buildOrderMessage(items, order({ paymentMethod: 'transfer' }), config)).toContain('• N° Cuenta: 123');
  });
});
