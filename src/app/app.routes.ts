import { Routes } from '@angular/router';
import { cartGuard } from './routing/cart.guard';
import { MenuComponent } from './ui/pages/menu/menu.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    // Carga directa (no lazy): es la página más visitada y su foto principal es
    // el LCP. Así el navegador no espera un JS extra antes de pedir esa foto.
    path: 'menu',
    component: MenuComponent,
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