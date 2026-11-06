import { mapCatalog } from './catalog.mapper';
import { LOCAL_CATALOG_RECORDS } from './local/local-catalog.repository';
import { CatalogRecords } from './catalog.records';

describe('catalog.mapper', () => {
  const catalog = mapCatalog(LOCAL_CATALOG_RECORDS);

  it('mapea todas las tablas locales', () => {
    expect(catalog.products).toHaveLength(LOCAL_CATALOG_RECORDS.productos.length);
    expect(catalog.combos).toHaveLength(LOCAL_CATALOG_RECORDS.combos.length);
  });

  it('agrega a cada combo las papas incluidas de sus burgers, a $0', () => {
    const dobleBacon = catalog.combos.find(c => c.name === 'Doble Bacon')!;
    const papas = dobleBacon.lines.find(l => l.includedInProduct)!;
    expect(papas).toMatchObject({ name: 'Papas Fritas Reales', quantity: 2, unitPrice: 0, hidePortion: true });
  });

  it('las líneas de combo tienen id único (sirven como track)', () => {
    for (const c of catalog.combos) {
      const ids = c.lines.map(l => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('Pepinillos solo se ofrece como extra en hamburguesas', () => {
    const pepinillos = catalog.extras.find(e => e.name === 'Pepinillos')!;
    expect(pepinillos.categories).toEqual(['hamburguesas']);
    expect(pepinillos.control).toBe('toggle');
  });

  it('un producto agotado saca sus opciones del combo y agota los combos que lo usan', () => {
    const records: CatalogRecords = {
      ...LOCAL_CATALOG_RECORDS,
      productos: LOCAL_CATALOG_RECORDS.productos.map(p =>
        p.nombre === 'Fanta 350ml' || p.nombre === 'Cheese Burger' ? { ...p, disponible: false } : p
      ),
    };
    const result = mapCatalog(records);
    const clasico = result.combos.find(c => c.name === 'Clásico')!;
    const sabroso = result.combos.find(c => c.name === 'Sabroso')!;

    expect(clasico.available).toBe(false);
    expect(sabroso.available).toBe(true);
    expect(sabroso.lines.find(l => l.requiresSelection)!.options.map(o => o.shortName)).not.toContain('Fanta');
  });

  it('falla al arrancar si una receta apunta a un ingrediente inexistente', () => {
    const records: CatalogRecords = {
      ...LOCAL_CATALOG_RECORDS,
      productoIngredientes: [...LOCAL_CATALOG_RECORDS.productoIngredientes, { productoId: 1, ingredienteId: 999, cantidad: 1, obligatorio: false }],
    };
    expect(() => mapCatalog(records)).toThrow(/Ingrediente 999/);
  });
});
