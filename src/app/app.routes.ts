import { Routes } from '@angular/router';
import { cartGuard } from './routing/cart.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'menu',
    data: { preload: true },
    loadComponent: () =>
      import('./ui/pages/menu/menu.component').then(m => m.MenuComponent),
  },
  {
    path: 'confirmar-pedido',
    data: { preload: true },
    loadComponent: () =>
      import('./ui/pages/confirm-order/confirm-order.component').then(m => m.ConfirmOrderComponent),
    canActivate: [cartGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];