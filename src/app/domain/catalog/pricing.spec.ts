import { combo, product, realCatalog } from '../../testing/catalog.fixture';
import { comboUnitPrice, portionPrice, productUnitPrice, sellablePortions } from './pricing';

describe('pricing', () => {
  const catalog = realCatalog();

  it('porción = precio base + adicional (Papas 250g = 1.990 + 1.000)', () => {
    const papas = product(catalog, 'Papas Fritas Reales');
    const [base, mediana, grande] = sellablePortions(papas);
    expect(portionPrice(papas, base)).toBe(1990);
    expect(portionPrice(papas, mediana)).toBe(2990);
    expect(portionPrice(papas, grande)).toBe(3990);
  });

  it('nunca ofrece porciones internas (papas 100g de las burgers)', () => {
    const papas = product(catalog, 'Papas Fritas Reales');
    expect(sellablePortions(papas).map(p => p.shortName)).toEqual(['150g', '250g', '300g']);
  });

  it('suma extraPrice por cada unidad sobre la receta', () => {
    const burger = product(catalog, 'Cheese Burger');
    const ingredients = burger.ingredients.map(i =>
      i.name === 'Medallón de Vacuno' ? { ...i, currentQuantity: 3 } : i
    );
    expect(productUnitPrice(burger, ingredients, null)).toBe(4490 + 2 * 1500);
  });

  it('quitar ingredientes NO descuenta el precio', () => {
    const burger = product(catalog, 'Cheese Burger');
    const ingredients = burger.ingredients.map(i => (i.isRequired ? i : { ...i, currentQuantity: 0 }));
    expect(productUnitPrice(burger, ingredients, null)).toBe(4490);
  });

  it('en combos usa precioCombo de la porción y nunca el precio de oferta', () => {
    const aritos = product(catalog, 'Aritos de Cebolla');
    expect(comboUnitPrice(aritos, sellablePortions(aritos)[1])).toBe(2000);
    expect(comboUnitPrice(product(catalog, 'Cheese Burger'), null)).toBe(4490);
  });

  it.each([
    ['Clásico', 6490], ['Sabroso', 7690], ['Crunchy', 7690], ['Real', 9690],
    ['Doble Bacon', 14380], ['Real Real', 15380], ['Pollo Real', 9190],
  ])('precio del combo %s = %i (suma de sus líneas)', (name, expected) => {
    expect(combo(catalog, name as string).price).toBe(expected);
  });
});
