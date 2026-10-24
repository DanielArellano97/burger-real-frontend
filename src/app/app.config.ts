import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DialogModule } from '@angular/cdk/dialog';

import { routes } from './app.routes';
import { SelectivePreloadStrategy } from './core/strategies/selective-preload.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(SelectivePreloadStrategy)),
    provideAnimationsAsync(),
    importProvidersFrom(DialogModule),
  ],
};