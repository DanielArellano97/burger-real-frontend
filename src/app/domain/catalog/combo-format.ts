import { ComboLine, ComboOption } from './catalog.models';

export interface ComboLineView {
  name: string;
  /** Porción, ej. "Porción x10". Se muestra como pill secundaria. */
  portion: string | null;
  /** Cantidad para el badge `×2`; `null` cuando es 1. */
  quantity: number | null;
  /** Aviso de selección pendiente, ej. "Elige tu sabor al agregar". */
  note: string | null;
}

/** Separa cantidad, porción y aviso de selección de una línea de combo. */
export function formatComboLine(line: ComboLine): ComboLineView {
  const portion =
    !line.requiresSelection && line.portion && !line.hidePortion
      ? `Porción ${line.portion.shortName}`
      : null;

  return {
    name: line.name,
    portion,
    quantity: line.quantity > 1 ? line.quantity : null,
    note: line.requiresSelection
      ? line.quantity > 1
        ? 'Elige los sabores al agregar'
        : 'Elige tu sabor al agregar'
      : null,
  };
}

/** Agrupa opciones repetidas: [Coca, Coca, Fanta] → "Coca-Cola ×2, Fanta". */
export function summarizeSelections(options: readonly ComboOption[]): string | null {
  if (options.length === 0) return null;

  const counts = new Map<number, { option: ComboOption; count: number }>();
  for (const option of options) {
    const entry = counts.get(option.id);
    if (entry) entry.count++;
    else counts.set(option.id, { option, count: 1 });
  }

  return [...counts.values()]
    .map(({ option, count }) => (count > 1 ? `${option.shortName} ×${count}` : option.shortName))
    .join(', ');
}

/**
 * Versión de una línea para carrito y WhatsApp.
 * `selection` (ej. "Coca-Cola ×2") reemplaza porción y cantidad.
 */
export function formatComboLineText(line: ComboLine, selection?: string | null): string {
  const { name, portion, quantity, note } = formatComboLine(line);
  const lowerNote = note ? note.charAt(0).toLowerCase() + note.slice(1) : null;
  const secondary = selection ?? portion ?? lowerNote;

  const text = secondary ? `${name} · ${secondary}` : name;
  return quantity && !selection ? `${text} ×${quantity}` : text;
}

/**
 * Textos de todas las líneas de un combo, repartiendo las selecciones del
 * cliente (en orden) entre las líneas que las requieren.
 */
export function comboLinesText(
  lines: readonly ComboLine[],
  selections: readonly ComboOption[]
): string[] {
  let cursor = 0;
  return lines.map(line => {
    if (!line.requiresSelection) return formatComboLineText(line);
    const chosen = selections.slice(cursor, cursor + line.quantity);
    cursor += line.quantity;
    return formatComboLineText(line, summarizeSelections(chosen));
  });
}

/** Cantidad total de elecciones que pide un combo (ej. 2 bebidas). */
export function requiredSelections(lines: readonly ComboLine[]): number {
  return lines
    .filter(l => l.requiresSelection)
    .reduce((sum, l) => sum + l.quantity, 0);
}
