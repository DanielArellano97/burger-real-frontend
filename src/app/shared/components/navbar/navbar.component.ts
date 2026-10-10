import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideShoppingCart } from '@lucide/angular';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, LucideShoppingCart],
  template: `
    <nav
      class="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
      style="background: rgba(15,15,15,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06);"
      role="banner"
    >
      <a routerLink="/" aria-label="Ir al inicio — Burger Real" class="flex items-center">
        @if (!logoError()) {
          <img
            src="images/logo-burger-real.webp"
            alt="Burger Real"
            class="h-9 w-auto object-contain"
            (error)="logoError.set(true)"
          />
        } @else {
          <span class="font-display text-xl text-brand-orange tracking-wider">BURGER REAL</span>
        }
      </a>

      <button
        (click)="cartService.openDrawer()"
        class="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-surface-2 transition-colors duration-150"
        aria-label="Abrir carrito de compras"
        [attr.aria-expanded]="cartService.isDrawerOpen()"
      >
        <svg lucideShoppingCart class="w-6 h-6 text-brand-orange" aria-hidden="true"></svg>

        @if (cartService.totalItems() > 0) {
          <span
            class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-orange text-brand-dark text-[10px] font-bold leading-none px-1"
            [class.cart-badge-pop]="badgeAnimating()"
            aria-live="polite"
          >{{ cartService.totalItems() }}</span>
        }
      </button>
    </nav>
  `,
})
export class NavbarComponent {
  cartService = inject(CartService);
  logoError = signal(false);
  badgeAnimating = signal(false);

  constructor() {
    let prev = 0;
    effect(() => {
      const total = this.cartService.totalItems();
      if (total > prev) {
        this.badgeAnimating.set(true);
        setTimeout(() => this.badgeAnimating.set(false), 350);
      }
      prev = total;
    });
  }
}
