import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!route.data?.['preload']) return of(null);

    // menu precarga casi inmediato (500ms)
    // confirm-order espera más (3s) — se carga cuando el usuario ya está en el menú
    const delay = route.path === 'menu' ? 500 : 3000;

    return timer(delay).pipe(switchMap(() => load()));
  }
}