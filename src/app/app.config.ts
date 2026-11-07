import {
  ApplicationConfig, importProvidersFrom, inject, provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { IMAGE_LOADER } from '@angular/common';
import { DialogModule } from '@angular/cdk/dialog';

import { routes } from './app.routes';
import { SelectivePreloadStrategy } from './routing/selective-preload.strategy';
import { CatalogService } from './application/catalog.service';
import { CatalogRepository } from './domain/catalog/catalog.repository';
import { CartStorage } from './domain/cart/cart.storage';
import { OrderSender } from './domain/order/order.sender';
import { LocalCatalogRepository } from './infrastructure/catalog/local/local-catalog.repository';
import { LocalCartStorage } from './infrastructure/storage/local-cart.storage';
import { WhatsappOrderSender } from './infrastructure/whatsapp/whatsapp-order.sender';
import { cloudinaryImageLoader } from './infrastructure/images/cloudinary-image.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(SelectivePreloadStrategy)),
    importProvidersFrom(DialogModule),

    // ─── Puertos → adaptadores (cambiar aquí para conectar el backend) ───
    { provide: CatalogRepository, useClass: LocalCatalogRepository },
    { provide: CartStorage, useClass: LocalCartStorage },
    { provide: OrderSender, useClass: WhatsappOrderSender },

    // Todas las <img ngSrc> piden a Cloudinary el tamaño exacto que se muestra.
    { provide: IMAGE_LOADER, useValue: cloudinaryImageLoader },

    // El catálogo se carga antes de mostrar la app: carrito y guard lo necesitan.
    provideAppInitializer(() => inject(CatalogService).load()),
  ],
};
