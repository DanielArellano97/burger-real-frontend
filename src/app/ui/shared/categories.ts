import { ProductCategory } from '../../domain/catalog/catalog.models';

/** Orden y textos de las categorías en el menú y el home. */
export const CATEGORIES: readonly { key: ProductCategory; label: string; emoji: string }[] = [
  { key: 'hamburguesas', label: 'Hamburguesas', emoji: '🍔' },
  { key: 'acompañamientos', label: 'Acompañamientos', emoji: '🍟' },
  { key: 'bebestibles', label: 'Bebestibles', emoji: '🥤' },
];
