import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class App {}
