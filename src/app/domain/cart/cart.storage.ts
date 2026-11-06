import { StoredCartLine } from './cart.models';

/** Puerto: dónde se persiste el carrito entre visitas. */
export abstract class CartStorage {
  abstract load(): unknown;
  abstract save(lines: readonly StoredCartLine[]): void;
}
