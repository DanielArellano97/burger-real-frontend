import { Injectable, signal, computed, effect } from '@angular/core';
import { Product, Ingredient, SizeVariant } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { Combo } from '../models/combo.model';

function buildIngredientKey(ingredients: Ingredient[]): string {
  return JSON.stringify(ingredients.map(i => ({ id: i.id, qty: i.currentQuantity })));
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  cartItems = signal<CartItem[]>(this.loadFromStorage());
  isDrawerOpen = signal(false);

  totalItems = computed(() =>
    this.cartItems().reduce((sum, i) => sum + i.quantity, 0)
  );

  totalPrice = computed(() =>
    this.cartItems().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  );

  constructor() {
    effect(() => {
      try {
        localStorage.setItem('burger-real-cart', JSON.stringify(this.cartItems()));
      } catch {
        // localStorage unavailable
      }
    });
  }

  private loadFromStorage(): CartItem[] {
    try {
      const data = JSON.parse(localStorage.getItem('burger-real-cart') || '[]');
      if (!Array.isArray(data) || data.some((item: CartItem) => !item.cartItemId)) {
        return [];
      }
      return data;
    } catch {
      return [];
    }
  }

  addItem(
    product: Product,
    ingredients: Ingredient[],
    unitPrice: number,
    selectedVariant?: SizeVariant,
    isPromo = false
  ): void {
    const key = buildIngredientKey(ingredients);
    const variantKey = selectedVariant?.id ?? null;

    this.cartItems.update(items => {
      const existing = items.find(i =>
        i.product.id === product.id &&
        !!i.isPromo === isPromo &&
        (i.selectedVariant?.id ?? null) === variantKey &&
        buildIngredientKey(i.customizedIngredients) === key
      );

      if (existing) {
        return items.map(i =>
          i.cartItemId === existing.cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...items, {
        cartItemId: generateId(),
        product,
        quantity: 1,
        customizedIngredients: ingredients,
        unitPrice,
        selectedVariant,
        isPromo: isPromo || undefined,
      }];
    });
  }

  removeItem(cartItemId: string): void {
    this.cartItems.set(this.cartItems().filter(i => i.cartItemId !== cartItemId));
  }

  updateQuantity(cartItemId: string, qty: number): void {
    if (qty <= 0) {
      this.removeItem(cartItemId);
      return;
    }
    this.cartItems.set(
      this.cartItems().map(i =>
        i.cartItemId === cartItemId ? { ...i, quantity: qty } : i
      )
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  updateItemCustomization(
    cartItemId: string,
    newIngredients: Ingredient[],
    newUnitPrice: number,
    selectedVariant?: SizeVariant
  ): void {
    this.cartItems.update(items =>
      items.map(i =>
        i.cartItemId === cartItemId
          ? { ...i, customizedIngredients: newIngredients, unitPrice: newUnitPrice, selectedVariant }
          : i
      )
    );
  }

  /** Línea de carta del producto (excluye la promo "Burger de la semana"). */
  getCartItemByProductId(productId: number, isPromo = false): CartItem | undefined {
    return this.cartItems().find(i =>
      i.product.id === productId && !!i.isPromo === isPromo
    );
  }

  addCombo(combo: Combo, selectedVariants: SizeVariant[]): void {
    const variantsKey = JSON.stringify(selectedVariants.map(v => v.id));

    const existing = this.cartItems().find(i =>
      i.isCombo &&
      i.combo?.id === combo.id &&
      JSON.stringify((i.selectedVariants ?? []).map(v => v.id)) === variantsKey
    );

    if (existing) {
      this.cartItems.update(items =>
        items.map(i =>
          i.cartItemId === existing.cartItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      const newItem: CartItem = {
        cartItemId: generateId(),
        product: {
          id: combo.id + 90000,
          name: combo.name,
          description: combo.description,
          price: combo.price,
          category: 'hamburguesas',
          customizable: false,
          ingredients: [],
        },
        quantity: 1,
        customizedIngredients: [],
        unitPrice: combo.price,
        isCombo: true,
        combo,
        selectedVariants,
      };
      this.cartItems.update(items => [...items, newItem]);
    }
  }
}
