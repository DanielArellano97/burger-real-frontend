import {
  Catalog, ExtraOption, Ingredient, MAX_INGREDIENT_QUANTITY, Product,
} from '../catalog/catalog.models';
import { productUnitPrice } from '../catalog/pricing';
import { requiredSelections } from '../catalog/combo-format';
import {
  CartItem, ComboCartItem, IngredientQuantities, ProductCartItem,
  StoredCartLine, StoredComboLine, StoredProductLine,
} from './cart.models';

/** Extras que un producto puede recibir (excluye los que ya trae su receta). */
export function extrasFor(product: Product, extras: readonly ExtraOption[]): ExtraOption[] {
  if (!product.allowsExtras) return [];
  const inRecipe = new Set(product.ingredients.map(i => i.id));
  return extras.filter(
    e => !inRecipe.has(e.id) && (!e.categories || e.categories.includes(product.category))
  );
}

/** Convierte la lista de ingredientes elegidos en el mapa mínimo que se guarda. */
export function toQuantities(ingredients: readonly Ingredient[]): IngredientQuantities {
  const result: Record<number, number> = {};
  for (const i of ingredients) {
    if (i.currentQuantity !== i.defaultQuantity) result[i.id] = i.currentQuantity;
  }
  return result;
}

/** Clave estable de una personalización, para unir líneas iguales. */
export function quantitiesKey(quantities: IngredientQuantities): string {
  return Object.keys(quantities)
    .map(Number)
    .sort((a, b) => a - b)
    .map(id => `${id}:${quantities[id]}`)
    .join('|');
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Reconstruye los ingredientes desde la receta vigente + las cantidades
 * guardadas. Cantidades inválidas se corrigen (rango 0..5, obligatorios no
 * bajan de la base) y extras que ya no existen se ignoran.
 */
export function buildIngredients(
  product: Product,
  quantities: IngredientQuantities,
  extras: readonly ExtraOption[]
): Ingredient[] {
  const recipe = product.ingredients.map(i => {
    const saved = quantities[i.id];
    const min = i.isRequired ? i.defaultQuantity : 0;
    const qty = typeof saved === 'number' ? clamp(Math.trunc(saved), min, MAX_INGREDIENT_QUANTITY) : i.defaultQuantity;
    return { ...i, currentQuantity: qty };
  });

  const added = extrasFor(product, extras)
    .map(e => {
      const saved = quantities[e.id];
      const max = e.control === 'toggle' ? 1 : MAX_INGREDIENT_QUANTITY;
      const qty = typeof saved === 'number' ? clamp(Math.trunc(saved), 0, max) : 0;
      return {
        id: e.id,
        name: e.name,
        defaultQuantity: 0,
        currentQuantity: qty,
        extraPrice: e.extraPrice,
        isRequired: false,
        control: e.control,
        hidden: false,
      } satisfies Ingredient;
    })
    .filter(e => e.currentQuantity > 0);

  return [...recipe, ...added];
}

function hydrateProductLine(
  line: StoredProductLine,
  catalog: Catalog,
  today: string
): ProductCartItem | null {
  const product = catalog.products.find(p => p.id === line.productId);
  if (!product || !product.available) return null;

  const isPromo = line.promoDate !== null;
  if (isPromo) {
    // La promo rota a diario: una línea de otro día ya no es válida.
    if (line.promoDate !== today || product.offerPrice === null) return null;
    return {
      kind: 'product', id: line.id, name: product.name, quantity: line.quantity,
      product, portion: null, ingredients: product.ingredients, isPromo: true,
      unitPrice: product.offerPrice,
    };
  }

  let portion = null;
  if (line.portionId !== null) {
    portion = product.portions.find(p => p.id === line.portionId && !p.internal) ?? null;
    if (!portion) return null;
  }

  const ingredients = buildIngredients(product, line.quantities, catalog.extras);
  return {
    kind: 'product', id: line.id, name: product.name, quantity: line.quantity,
    product, portion, ingredients, isPromo: false,
    unitPrice: productUnitPrice(product, ingredients, portion),
  };
}

function hydrateComboLine(line: StoredComboLine, catalog: Catalog): ComboCartItem | null {
  const combo = catalog.combos.find(c => c.id === line.comboId);
  if (!combo || !combo.available) return null;
  if (line.selectionIds.length !== requiredSelections(combo.lines)) return null;

  // Cada elección debe ser una opción válida de la línea que le corresponde.
  const selections = [];
  let cursor = 0;
  for (const comboLine of combo.lines.filter(l => l.requiresSelection)) {
    for (let i = 0; i < comboLine.quantity; i++) {
      const option = comboLine.options.find(o => o.id === line.selectionIds[cursor]);
      if (!option) return null;
      selections.push(option);
      cursor++;
    }
  }

  return {
    kind: 'combo', id: line.id, name: combo.name, quantity: line.quantity,
    combo, selections, unitPrice: combo.price,
  };
}

/**
 * Convierte las líneas guardadas en ítems del carrito usando el catálogo
 * vigente. Lo que ya no existe, está agotado o es una promo vencida se
 * descarta; los precios siempre se recalculan.
 */
export function hydrateCart(
  lines: readonly StoredCartLine[],
  catalog: Catalog,
  today: string
): CartItem[] {
  return lines
    .map(line =>
      line.kind === 'product'
        ? hydrateProductLine(line, catalog, today)
        : hydrateComboLine(line, catalog)
    )
    .filter((item): item is CartItem => item !== null);
}

/** Valida datos leídos del almacenamiento (pueden venir de otra versión o manipulados). */
export function parseStoredLines(raw: unknown): StoredCartLine[] {
  if (!Array.isArray(raw)) return [];

  const isPositiveInt = (n: unknown): n is number => Number.isInteger(n) && (n as number) > 0;
  const isQuantities = (q: unknown) =>
    typeof q === 'object' && q !== null && Object.values(q).every(v => Number.isInteger(v));

  return raw.filter((l: any): l is StoredCartLine => {
    if (!l || typeof l.id !== 'string' || !isPositiveInt(l.quantity) || l.quantity > 99) return false;
    if (l.kind === 'product') {
      return Number.isInteger(l.productId) &&
        (l.portionId === null || Number.isInteger(l.portionId)) &&
        isQuantities(l.quantities) &&
        (l.promoDate === null || typeof l.promoDate === 'string');
    }
    if (l.kind === 'combo') {
      return Number.isInteger(l.comboId) &&
        Array.isArray(l.selectionIds) && l.selectionIds.every((s: unknown) => Number.isInteger(s));
    }
    return false;
  });
}
