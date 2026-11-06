import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Combo, ComboOption, Ingredient, Portion, Product } from '../domain/catalog/catalog.models';
import { CartItem, ProductCartItem, StoredCartLine, StoredProductLine } from '../domain/cart/cart.models';
import { hydrateCart, parseStoredLines, quantitiesKey, toQuantities } from '../domain/cart/cart-lines';
import { CartStorage } from '../domain/cart/cart.storage';
import { dayKey } from '../domain/promo/burger-of-the-week';
import { CatalogService } from './catalog.service';
import { ClockService } from './clock.service';
import { StoreStatusService } from './store-status.service';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Estado del carrito.
 *
 * Guarda solo referencias (`StoredCartLine`) y expone `items`, reconstruidos
 * en cada cambio desde el catálogo vigente: precios siempre actuales y nada
 * manipulable desde el almacenamiento del navegador.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storage = inject(CartStorage);
  private readonly catalog = inject(CatalogService);
  private readonly clock = inject(ClockService);
  private readonly store = inject(StoreStatusService);

  private readonly lines = signal<StoredCartLine[]>(parseStoredLines(this.storage.load()));
  private readonly today = computed(() => dayKey(this.clock.now()));

  readonly items = computed<CartItem[]>(() => {
    const catalog = this.catalog.catalog();
    return catalog ? hydrateCart(this.lines(), catalog, this.today()) : [];
  });

  readonly totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly totalPrice = computed(() =>
    this.items().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  );

  readonly isDrawerOpen = signal(false);

  constructor() {
    // Persiste solo las líneas válidas (las inválidas se descartan al guardar).
    effect(() => {
      if (!this.catalog.catalog()) return;
      const valid = new Set(this.items().map(i => i.id));
      this.storage.save(this.lines().filter(l => valid.has(l.id)));
    });
  }

  /* ─── Agregar ─── */

  /** Fuera de horario no se puede agregar ni aumentar cantidades. */
  get canAdd(): boolean {
    return this.store.isOpen();
  }

  /** Producto de carta (con su porción y personalización). Une líneas idénticas. */
  addProduct(product: Product, ingredients: readonly Ingredient[], portion: Portion | null = null): void {
    this.addProductLine({
      productId: product.id,
      portionId: portion?.id ?? null,
      quantities: toQuantities(ingredients),
      promoDate: null,
    });
  }

  /** "Burger de la semana": receta original, precio de oferta del día. */
  addPromo(product: Product, date: Date): void {
    if (!this.canAdd) return;
    this.addProductLine({ productId: product.id, portionId: null, quantities: {}, promoDate: dayKey(date) });
  }

  addCombo(combo: Combo, selections: readonly ComboOption[]): void {
    if (!this.canAdd) return;
    const selectionIds = selections.map(s => s.id);
    const key = selectionIds.join(',');
    const existing = this.lines().find(
      l => l.kind === 'combo' && l.comboId === combo.id && l.selectionIds.join(',') === key
    );

    if (existing) {
      this.updateQuantity(existing.id, existing.quantity + 1);
      return;
    }
    this.lines.update(lines => [
      ...lines,
      { kind: 'combo', id: generateId(), comboId: combo.id, quantity: 1, selectionIds },
    ]);
  }

  private addProductLine(line: Omit<StoredProductLine, 'kind' | 'id' | 'quantity'>): void {
    if (!this.canAdd) return;
    const key = quantitiesKey(line.quantities);
    const existing = this.lines().find(
      (l): l is StoredProductLine =>
        l.kind === 'product' &&
        l.productId === line.productId &&
        l.portionId === line.portionId &&
        l.promoDate === line.promoDate &&
        quantitiesKey(l.quantities) === key
    );

    if (existing) {
      this.updateQuantity(existing.id, existing.quantity + 1);
      return;
    }
    this.lines.update(lines => [...lines, { kind: 'product', id: generateId(), quantity: 1, ...line }]);
  }

  /* ─── Modificar ─── */

  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(id);
      return;
    }
    const current = this.lines().find(l => l.id === id);
    if (current && quantity > current.quantity && !this.canAdd) return;
    this.lines.update(lines => lines.map(l => (l.id === id ? { ...l, quantity } : l)));
  }

  updateCustomization(id: string, ingredients: readonly Ingredient[], portion: Portion | null): void {
    this.lines.update(lines =>
      lines.map(l =>
        l.id === id && l.kind === 'product'
          ? { ...l, quantities: toQuantities(ingredients), portionId: portion?.id ?? null }
          : l
      )
    );
  }

  remove(id: string): void {
    this.lines.update(lines => lines.filter(l => l.id !== id));
  }

  clear(): void {
    this.lines.set([]);
  }

  /* ─── Consultas para la UI ─── */

  /** Primera línea de carta del producto (excluye la promo). */
  findProductItem(productId: number): ProductCartItem | undefined {
    return this.items().find(
      (i): i is ProductCartItem => i.kind === 'product' && i.product.id === productId && !i.isPromo
    );
  }

  /** Línea con la receta original, sin porción ni promo. */
  findOriginalItem(productId: number): ProductCartItem | undefined {
    return this.items().find(
      (i): i is ProductCartItem =>
        i.kind === 'product' &&
        i.product.id === productId &&
        !i.isPromo &&
        i.portion === null &&
        i.ingredients.every(ing => ing.currentQuantity === ing.defaultQuantity)
    );
  }

  comboQuantity(comboId: number): number {
    return this.items()
      .filter(i => i.kind === 'combo' && i.combo.id === comboId)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  /** Resta una unidad a la última línea agregada de ese combo. */
  removeOneCombo(comboId: number): void {
    const last = this.items().filter(i => i.kind === 'combo' && i.combo.id === comboId).at(-1);
    if (last) this.updateQuantity(last.id, last.quantity - 1);
  }

  /* ─── Drawer ─── */

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }
}
