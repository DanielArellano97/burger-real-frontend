import { combo, product, realCatalog } from '../../testing/catalog.fixture';
import { StoredCartLine } from './cart.models';
import { hydrateCart, parseStoredLines, quantitiesKey, toQuantities } from './cart-lines';

const TODAY = '2026-11-05';

describe('cart-lines', () => {
  const catalog = realCatalog();
  const papas = product(catalog, 'Papas Fritas Reales');
  const burger = product(catalog, 'Cheese Bacon');

  it('recalcula el precio desde el catálogo (no se guarda en el navegador)', () => {
    const lines: StoredCartLine[] = [
      { kind: 'product', id: 'a', productId: burger.id, quantity: 2, portionId: null, quantities: { 206: 1 }, promoDate: null },
      { kind: 'product', id: 'b', productId: papas.id, quantity: 1, portionId: 502, quantities: {}, promoDate: null },
    ];
    const [b, p] = hydrateCart(lines, catalog, TODAY);
    expect(b.unitPrice).toBe(5190 + 1000);
    expect(p.unitPrice).toBe(2990);
  });

  it('descarta productos inexistentes, porciones internas y combos con elecciones inválidas', () => {
    const clasico = combo(catalog, 'Clásico');
    const lines: StoredCartLine[] = [
      { kind: 'product', id: 'x', productId: 9999, quantity: 1, portionId: null, quantities: {}, promoDate: null },
      { kind: 'product', id: 'y', productId: papas.id, quantity: 1, portionId: 504, quantities: {}, promoDate: null },
      { kind: 'combo', id: 'z', comboId: clasico.id, quantity: 1, selectionIds: [12345] },
      { kind: 'combo', id: 'w', comboId: clasico.id, quantity: 1, selectionIds: [] },
    ];
    expect(hydrateCart(lines, catalog, TODAY)).toEqual([]);
  });

  it('la promo solo vale el día en que se agregó, a precio de oferta', () => {
    const promoBurger = product(catalog, 'Cheese Burger');
    const line: StoredCartLine = { kind: 'product', id: 'p', productId: promoBurger.id, quantity: 1, portionId: null, quantities: {}, promoDate: TODAY };
    expect(hydrateCart([line], catalog, TODAY)[0].unitPrice).toBe(3490);
    expect(hydrateCart([line], catalog, '2026-11-06')).toEqual([]);
  });

  it('corrige cantidades manipuladas: obligatorios no bajan de la base y el máximo es 5', () => {
    const line: StoredCartLine = { kind: 'product', id: 'm', productId: burger.id, quantity: 1, portionId: null, quantities: { 201: 0, 202: 99 }, promoDate: null };
    const [item] = hydrateCart([line], catalog, TODAY);
    if (item.kind !== 'product') throw new Error('esperaba producto');
    const qty = (name: string) => item.ingredients.find(i => i.name === name)!.currentQuantity;
    expect(qty('Medallón de Vacuno')).toBe(1);
    expect(qty('Cheddar Americano')).toBe(5);
  });

  it('parseStoredLines rechaza datos con forma inválida (otra versión o manipulados)', () => {
    const raw = [
      { kind: 'product', id: 'ok', productId: 1, quantity: 1, portionId: null, quantities: {}, promoDate: null },
      { kind: 'product', id: 'neg', productId: 1, quantity: -3, portionId: null, quantities: {}, promoDate: null },
      { cartItemId: 'v1', product: {}, unitPrice: 1 },
      'basura',
    ];
    expect(parseStoredLines(raw).map(l => l.id)).toEqual(['ok']);
    expect(parseStoredLines({ no: 'array' })).toEqual([]);
  });

  it('toQuantities guarda solo lo que cambia y la clave no depende del orden', () => {
    const ingredients = burger.ingredients.map(i => (i.name === 'Tocino Ahumado' ? { ...i, currentQuantity: 0 } : i));
    expect(toQuantities(ingredients)).toEqual({ 203: 0 });
    expect(quantitiesKey({ 206: 1, 203: 0 })).toBe(quantitiesKey({ 203: 0, 206: 1 }));
  });
});
