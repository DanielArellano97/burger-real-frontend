import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideFlame, LucideStar, LucideZap, LucideArrowRight } from '@lucide/angular';

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

  readonly categories = [
    { emoji: '🍔', label: 'Hamburguesas',    key: 'hamburguesas' },
    { emoji: '🍟', label: 'Acompañamientos', key: 'acompañamientos' },
    { emoji: '🥤', label: 'Bebestibles',     key: 'bebestibles' },
  ];

  readonly currentYear = new Date().getFullYear();
}
