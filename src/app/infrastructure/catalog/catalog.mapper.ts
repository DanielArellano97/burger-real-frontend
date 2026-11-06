import {
  Catalog, Combo, ComboLine, ComboOption, ExtraOption, IncludedItem, Ingredient,
  Portion, Product, ProductCategory,
} from '../../domain/catalog/catalog.models';
import { comboTotal, comboUnitPrice } from '../../domain/catalog/pricing';
import {
  CatalogRecords, CategoriaRecord, ComboDetalleRecord, ComboRecord, IngredienteRecord,
  PorcionRecord, ProductoRecord,
} from './catalog.records';

const CATEGORY: Record<CategoriaRecord, ProductCategory> = {
  HAMBURGUESA: 'hamburguesas',
  ACOMPANAMIENTO: 'acompañamientos',
  BEBESTIBLE: 'bebestibles',
};

/** Texto de la línea de combo cuando el cliente elige dentro de una categoría. */
const SELECTION_LABEL: Record<CategoriaRecord, string> = {
  HAMBURGUESA: 'Hamburguesa a elección',
  ACOMPANAMIENTO: 'Acompañamiento a elección',
  BEBESTIBLE: 'Bebida a elección',
};

/** Error de datos: se lanza al arrancar para no mostrar un catálogo incompleto. */
class CatalogDataError extends Error {}

function groupBy<T, K>(rows: readonly T[], key: (row: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const row of rows) {
    const k = key(row);
    map.set(k, [...(map.get(k) ?? []), row]);
  }
  return map;
}

function toPortion(r: PorcionRecord): Portion {
  return {
    id: r.id,
    name: r.nombre,
    shortName: r.nombreCorto,
    additionalPrice: r.precioAdicional,
    comboPrice: r.precioCombo,
    internal: r.interna,
  };
}

function toExtra(r: IngredienteRecord): ExtraOption {
  return {
    id: r.id,
    name: r.nombre,
    extraPrice: r.precioExtra,
    control: r.tipoControl === 'SI_NO' ? 'toggle' : 'counter',
    categories: r.categoriasExtra ? r.categoriasExtra.map(c => CATEGORY[c]) : null,
  };
}

/** Traduce los registros (forma de BD/API) a los modelos de dominio. */
export function mapCatalog(records: CatalogRecords): Catalog {
  const ingredientsById = new Map(records.ingredientes.map(i => [i.id, i]));
  const recipes = groupBy(records.productoIngredientes, r => r.productoId);
  const portions = groupBy(records.porciones, r => r.productoId);
  const includes = groupBy(records.productoIncluye, r => r.productoId);

  const toProduct = (r: ProductoRecord): Product => {
    const category = CATEGORY[r.categoria];
    const ingredients: Ingredient[] = (recipes.get(r.id) ?? []).map(line => {
      const master = ingredientsById.get(line.ingredienteId);
      if (!master) {
        throw new CatalogDataError(`Ingrediente ${line.ingredienteId} de "${r.nombre}" no existe`);
      }
      return {
        id: master.id,
        name: master.nombre,
        defaultQuantity: line.cantidad,
        currentQuantity: line.cantidad,
        extraPrice: master.precioExtra,
        isRequired: line.obligatorio,
        control: master.tipoControl === 'SI_NO' ? 'toggle' : 'counter',
        hidden: master.oculto,
      };
    });

    return {
      id: r.id,
      category,
      name: r.nombre,
      shortName: r.nombreCorto,
      description: r.descripcion,
      price: r.precio,
      offerPrice: r.precioOferta,
      comboPrice: r.precioCombo,
      customizable: category !== 'bebestibles',
      allowsExtras: r.permiteExtras,
      available: r.disponible,
      image: r.imagen,
      ingredients,
      portions: (portions.get(r.id) ?? []).map(toPortion),
      includes: (includes.get(r.id) ?? []).map((i): IncludedItem => ({
        productId: i.incluidoProductoId,
        portionId: i.porcionId,
        quantity: i.cantidad,
      })),
    };
  };

  const products = records.productos.map(toProduct);
  const productsById = new Map(products.map(p => [p.id, p]));

  const findProduct = (id: number, context: string): Product => {
    const product = productsById.get(id);
    if (!product) throw new CatalogDataError(`Producto ${id} de ${context} no existe`);
    return product;
  };

  const findPortion = (product: Product, portionId: number | null, context: string): Portion | null => {
    if (portionId === null) return null;
    const portion = product.portions.find(p => p.id === portionId);
    if (!portion) throw new CatalogDataError(`Porción ${portionId} de ${context} no existe en "${product.name}"`);
    return portion;
  };

  const optionsFor = (category: CategoriaRecord): ComboOption[] =>
    products
      .filter(p => p.category === CATEGORY[category] && p.available)
      .map(p => ({ id: p.id, name: p.name, shortName: p.shortName ?? p.name }));

  const toLines = (detail: ComboDetalleRecord, combo: ComboRecord): ComboLine[] => {
    const context = `combo "${combo.nombre}"`;

    if (detail.productoId === null) {
      if (!detail.categoriaSeleccion || detail.precioUnitario === null) {
        throw new CatalogDataError(`Detalle ${detail.id} de ${context}: selección incompleta`);
      }
      return [{
        id: `${detail.id}`,
        productId: null,
        name: SELECTION_LABEL[detail.categoriaSeleccion],
        quantity: detail.cantidad,
        portion: null,
        hidePortion: false,
        includedInProduct: false,
        unitPrice: detail.precioUnitario,
        requiresSelection: true,
        options: optionsFor(detail.categoriaSeleccion),
      }];
    }

    const product = findProduct(detail.productoId, context);
    const portion = findPortion(product, detail.porcionId, context);
    const main: ComboLine = {
      id: `${detail.id}`,
      productId: product.id,
      name: product.name,
      quantity: detail.cantidad,
      portion,
      hidePortion: portion?.internal ?? false,
      includedInProduct: false,
      unitPrice: comboUnitPrice(product, portion),
      requiresSelection: false,
      options: [],
    };

    // Lo que trae el producto (ej. papas 100g de la burger) se muestra como
    // línea propia a $0: el costo ya es del producto que lo incluye.
    const included = product.includes.map((inc, index): ComboLine => {
      const incProduct = findProduct(inc.productId, `"${product.name}"`);
      const incPortion = findPortion(incProduct, inc.portionId, `"${product.name}"`);
      return {
        id: `${detail.id}.${index + 1}`,
        productId: incProduct.id,
        name: incProduct.name,
        quantity: inc.quantity * detail.cantidad,
        portion: incPortion,
        hidePortion: incPortion?.internal ?? false,
        includedInProduct: true,
        unitPrice: 0,
        requiresSelection: false,
        options: [],
      };
    });

    return [main, ...included];
  };

  const detailsByCombo = groupBy(records.comboDetalles, d => d.comboId);

  const combos = records.combos.map((r): Combo => {
    const lines = (detailsByCombo.get(r.id) ?? []).flatMap(d => toLines(d, r));
    const fixedProductsAvailable = lines
      .filter(l => l.productId !== null)
      .every(l => productsById.get(l.productId!)?.available);
    const selectionsPossible = lines.every(l => !l.requiresSelection || l.options.length > 0);

    return {
      id: r.id,
      name: r.nombre,
      description: r.descripcion,
      image: r.imagen,
      price: comboTotal(lines),
      // Agotado si se marca así o si falta alguno de sus componentes.
      available: r.disponible && fixedProductsAvailable && selectionsPossible,
      lines,
    };
  });

  const extras = records.ingredientes.filter(i => i.permiteExtra).map(toExtra);

  return { products, combos, extras };
}
