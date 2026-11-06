/** Formato de precio chileno: 4490 → "$4.490". */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('es-CL')}`;
}
