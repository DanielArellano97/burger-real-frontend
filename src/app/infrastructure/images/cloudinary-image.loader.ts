import { ImageLoaderConfig } from '@angular/common';

/** Cuenta de Cloudinary donde viven las fotos del menú. */
export const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/zas3mkmm/image/upload';

/** Parámetros extra que acepta el loader vía `[loaderParams]`. */
export interface CloudinaryParams {
  /**
   * Recorta a esta proporción (ancho/alto) centrando lo importante
   * (`c_fill,g_auto`). Ej. `1` para cuadrado, `1.97` para el hero.
   */
  aspectRatio?: number;
}

/** `true` si `src` no es un id de Cloudinary sino una URL o un asset local. */
function isDirectUrl(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith('/') || src.startsWith('images/');
}

/**
 * Construye la URL de Cloudinary para un id público
 * (ej. `v1793550658/Cheeseburger.png`).
 *
 * - `f_auto,q_auto`: formato (AVIF/WebP) y calidad óptimos por navegador.
 * - `w_<ancho>`: solo los píxeles que se van a mostrar.
 * - `c_fill,g_auto,ar_<proporción>`: recorte inteligente a la forma de la tarjeta.
 *
 * URLs absolutas y assets locales se devuelven tal cual.
 */
export function cloudinaryUrl(src: string, width?: number, params: CloudinaryParams = {}): string {
  if (isDirectUrl(src)) return src;

  const transforms = ['f_auto', 'q_auto'];
  if (params.aspectRatio) transforms.push('c_fill', 'g_auto', `ar_${params.aspectRatio}`);
  if (width) transforms.push(`w_${Math.round(width)}`);

  return `${CLOUDINARY_BASE_URL}/${transforms.join(',')}/${src}`;
}

/** Loader para `NgOptimizedImage` (`ngSrc`). Lo registra `app.config.ts`. */
export function cloudinaryImageLoader(config: ImageLoaderConfig): string {
  return cloudinaryUrl(config.src, config.width, (config.loaderParams ?? {}) as CloudinaryParams);
}
