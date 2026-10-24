import { MENU_DATA } from '../data/menu.data';
import { Combo, ComboDetalle } from '../models/combo.model';
import { Product } from '../models/product.model';

/**
 * Precios de los componentes dentro de un combo.
 *
 * Reglas de negocio:
 * - La burger mantiene su precio normal (no usa `precioOferta`).
 * - Las papas de 100g que acompañan a cada burger valen $0 dentro del combo.
 * - Aritos y deditos usan `comboPrice` de su variante (precio rebajado).
 * - Las bebidas usan `comboPrice` del producto.
 * - Los componentes incluidos en otro producto (`incluidoEnProducto`) valen $0.
 *
 * `comboPrice` es la única fuente de verdad del precio dentro del combo; el
 * precio de venta individual sigue en `price` / `extraPrice`.
 */

const PRODUCTS_BY_ID = new Map<number, Product>(MENU_DATA.map(p => [p.id, p]));

/** Precio unitario de una línea del combo, según producto y variante. */
export function precioUnitarioCombo(detalle: ComboDetalle): number {
  // Líneas sin producto real (ej. selector genérico de bebida).
  if (detalle.precioComboUnitario != null) {
    return detalle.precioComboUnitario;
  }

  const producto = PRODUCTS_BY_ID.get(detalle.productoId);

  if (!producto) {
    throw new Error(
      `El combo referencia el producto ${detalle.productoId}, que no existe en MENU_DATA`
    );
  }

  const varianteSeleccionada = detalle.varianteSeleccionada;

  if (varianteSeleccionada) {
    const variante = producto.variants?.find(v => v.id === varianteSeleccionada.id);

    if (!variante) {
      throw new Error(
        `La variante ${varianteSeleccionada.id} no existe en el producto ${producto.id}`
      );
    }

    if (variante.comboPrice != null) {
      return variante.comboPrice;
    }

    // Variantes sin precio de combo: si la porción tiene precio propio, se usa;
    // si es la porción base (extraPrice 0), se usa el precio del producto.
    if (variante.extraPrice > 0) {
      return variante.extraPrice;
    }

    return producto.comboPrice ?? producto.price;
  }

  return producto.comboPrice ?? producto.price;
}

/** Precio final del combo: suma de sus componentes. */
export function calcularPrecioCombo(
  combo: Pick<Combo, 'detalles'>
): number {
  return combo.detalles.reduce(
    (suma, detalle) => suma + precioUnitarioCombo(detalle) * detalle.cantidad,
    0
  );
}
