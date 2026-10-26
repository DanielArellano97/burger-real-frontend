import { ComboDetalle } from '../models/combo.model';

export interface LineaCombo {
  nombre: string;
  /** Porción/variante, ej. "Porción x10". Se muestra como pill secundaria. */
  porcion: string | null;
  /** Cantidad para mostrar como badge `×2`; `null` cuando es 1. */
  cantidad: number | null;
  /** Aviso de selección pendiente, ej. "Elige tu sabor al agregar". */
  nota: string | null;
}

/**
 * Formatea un componente de combo separando los dos datos que antes se
 * confundían:
 *
 * - **Cantidad de la línea** → badge `×2`.
 * - **Porción/variante** → badge "Porción x10".
 * - **Selección pendiente** → nota aparte, en singular o plural.
 */
export function formatearLineaCombo(detalle: ComboDetalle): LineaCombo {
  const porcion =
    !detalle.requiereSeleccion &&
    detalle.varianteSeleccionada &&
    !detalle.ocultarVariante
      ? `Porción ${detalle.varianteSeleccionada.shortName}`
      : null;

  return {
    nombre: detalle.productoNombre,
    porcion,
    cantidad: detalle.cantidad > 1 ? detalle.cantidad : null,
    nota: detalle.requiereSeleccion
      ? detalle.cantidad > 1
        ? 'Elige los sabores al agregar'
        : 'Elige tu sabor al agregar'
      : null,
  };
}

/**
 * Versión de una sola línea para carrito y WhatsApp.
 *
 * `seleccion` trae las opciones ya elegidas (ej. "Coca-Cola ×2"). Cuando
 * existe, reemplaza a la porción y a la cantidad, porque ya expresa ambas.
 */
export function formatearLineaComboTexto(
  detalle: ComboDetalle,
  seleccion?: string | null
): string {
  const { nombre, porcion, cantidad, nota } = formatearLineaCombo(detalle);
  const notaMinuscula = nota ? nota.charAt(0).toLowerCase() + nota.slice(1) : null;

  const secundario = seleccion ?? porcion ?? notaMinuscula;

  const partes = [nombre];
  if (secundario) partes.push(secundario);

  const texto = partes.join(' · ');
  return cantidad && !seleccion ? `${texto} ×${cantidad}` : texto;
}
