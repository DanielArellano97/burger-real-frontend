import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideFlame, LucideStar, LucideZap, LucideArrowRight } from '@lucide/angular';
import { CATEGORIES } from '../../shared/categories';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideFlame, LucideStar, LucideZap, LucideArrowRight],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  logoError = signal(false);
  readonly benefits = [
    {
      icon: 'flame' as const,
      title: 'Sabor Casero',
      desc: 'Recetas elaboradas con amor',
    },
    {
      icon: 'star' as const,
      title: 'Ingredientes Frescos',
      desc: 'Calidad en cada mordida',
    },
    {
      icon: 'zap' as const,
      title: 'Listo Rápido',
      desc: 'Tu pedido sin esperas',
    },
  ];

  readonly categories = CATEGORIES;

  readonly currentYear = new Date().getFullYear();
}
