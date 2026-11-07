import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const PRELOAD_DELAY_MS = 3000;

@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!route.data?.['preload']) return of(null);

    // Las rutas marcadas (hoy: confirmar-pedido) se descargan 3 s después de
    // cargar la app, cuando el usuario ya está viendo el menú.
    return timer(PRELOAD_DELAY_MS).pipe(switchMap(() => load()));
  }
}