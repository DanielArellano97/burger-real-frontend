import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CartService } from './cart.service';
import { CatalogService } from './catalog.service';
import { ClockService } from './clock.service';
import { CartStorage } from '../domain/cart/cart.storage';
import { StoredCartLine } from '../domain/cart/cart.models';
import { CatalogRepository } from '../domain/catalog/catalog.repository';
import { LocalCatalogRepository } from '../infrastructure/catalog/local/local-catalog.repository';
import { product } from '../testing/catalog.fixture';

class MemoryStorage extends CartStorage {
  saved: readonly StoredCartLine[] = [];
  load() { return []; }
  save(lines: readonly StoredCartLine[]) { this.saved = lines; }
}

async function setup(isoTime: string) {
  const storage = new MemoryStorage();
  TestBed.configureTestingModule({
    providers: [
      { provide: CatalogRepository, useClass: LocalCatalogRepository },
      { provide: CartStorage, useValue: storage },
      { provide: ClockService, useValue: { now: signal(new Date(isoTime)) } },
    ],
  });
  await TestBed.inject(CatalogService).load();
  return { cart: TestBed.inject(CartService), catalog: TestBed.inject(CatalogService).catalog()!, storage };
}

describe('CartService', () => {
  it('une líneas idénticas y separa personalizaciones distintas', async () => {
    const { cart, catalog } = await setup('2026-11-06T19:00:00-03:00');
    const burger = product(catalog, 'Cheese Burger');
    cart.addProduct(burger, burger.ingredients);
    cart.addProduct(burger, burger.ingredients);
    cart.addProduct(burger, burger.ingredients.map(i => (i.isRequired ? i : { ...i, currentQuantity: 0 })));

    expect(cart.items().map(i => i.quantity)).toEqual([2, 1]);
    expect(cart.totalPrice()).toBe(3 * 4490);
  });

  it('persiste solo referencias, nunca precios', async () => {
    const { cart, catalog, storage } = await setup('2026-11-06T19:00:00-03:00');
    cart.addProduct(product(catalog, 'Coca-Cola 350ml'), []);
    TestBed.tick();
    expect(JSON.stringify(storage.saved)).not.toContain('1190');
    expect(storage.saved[0]).toMatchObject({ kind: 'product', productId: 21, quantity: 1 });
  });

  it('fuera de horario no agrega ni aumenta cantidades', async () => {
    const { cart, catalog } = await setup('2026-11-06T10:00:00-03:00');
    cart.addProduct(product(catalog, 'Coca-Cola 350ml'), []);
    expect(cart.items()).toEqual([]);
  });
});
