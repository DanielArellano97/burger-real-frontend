import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CartDrawerComponent } from './features/cart/cart-drawer.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
