import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers, provideRouter([])],
    }).compileComponents();
  });

  it('se crea con todas sus dependencias (puertos → adaptadores)', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra la barra de navegación con el carrito', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('app-navbar')).not.toBeNull();
    expect(html.querySelector('[aria-label*="arrito"]')).not.toBeNull();
  });

  it('la URL canónica sigue a la página actual, sin parámetros', async () => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);

    TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/?cat=bebestibles');
    expect(link.getAttribute('href')).toBe('https://burgerreal.netlify.app/');

    link.remove();
  });
});
