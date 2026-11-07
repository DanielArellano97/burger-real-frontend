import { Component, DOCUMENT, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SITE_URL } from './config/site.config';
import { NavbarComponent } from './ui/layout/navbar/navbar.component';
import { CartDrawerComponent } from './ui/layout/cart-drawer/cart-drawer.component';
import { ToastComponent } from './ui/layout/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    const document = inject(DOCUMENT);

    // La URL canónica sigue a la página actual, sin parámetros (?cat=, ?fecha=):
    // así Google trata /menu y /menu?cat=bebestibles como una misma página.
    inject(Router)
      .events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(e => {
        const path = e.urlAfterRedirects.split(/[?#]/)[0];
        document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}${path}`);
      });
  }
}
