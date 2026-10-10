import { Routes } from '@angular/router';
import { cartGuard } from './core/guards/cart.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'menu',
    data: { preload: true },
    loadComponent: () =>
      import('./features/menu/menu.component').then(m => m.MenuComponent),
  },
  {
    path: 'confirmar-pedido',
    data: { preload: true },
    loadComponent: () =>
      import('./features/confirm-order/confirm-order.component').then(m => m.ConfirmOrderComponent),
    canActivate: [cartGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];