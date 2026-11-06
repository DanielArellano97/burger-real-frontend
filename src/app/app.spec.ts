import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
});
