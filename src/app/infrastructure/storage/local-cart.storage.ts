import { Injectable } from '@angular/core';
import { StoredCartLine } from '../../domain/cart/cart.models';
import { CartStorage } from '../../domain/cart/cart.storage';

/** v2: solo referencias (ids y cantidades). La v1 guardaba productos y precios. */
const STORAGE_KEY = 'burger-real-cart-v2';
const LEGACY_KEYS = ['burger-real-cart'];

/** Adaptador: carrito en `localStorage` del navegador. */
@Injectable()
export class LocalCartStorage extends CartStorage {
  constructor() {
    super();
    try {
      LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
    } catch {
      // localStorage no disponible (modo privado estricto): se ignora.
    }
  }

  load(): unknown {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  save(lines: readonly StoredCartLine[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Sin almacenamiento el carrito sigue funcionando durante la visita.
    }
  }
}
