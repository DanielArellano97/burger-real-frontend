import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideX } from '@lucide/angular';
import { cloudinaryUrl } from '../../../infrastructure/images/cloudinary-image.loader';

export interface ImageLightboxData {
  /** URL de la imagen que se muestra en grande. */
  src: string;
  /** Nombre del producto, usado como texto alternativo y pie de foto. */
  alt: string;
}

/**
 * Visor de imágenes a pantalla completa. Se cierra tocando en cualquier
 * parte, con la X o con Escape. Bloquea el scroll de la página de fondo.
 */
@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [LucideX],
  template: `
    <div
      class="fixed inset-0 flex flex-col items-center justify-center"
      style="background: #000; padding: 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom));"
      (click)="close()"
    >
      <button
        type="button"
        (click)="$event.stopPropagation(); close()"
        class="absolute flex items-center justify-center w-10 h-10 rounded-full transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        style="top: calc(12px + env(safe-area-inset-top)); right: 12px; background: rgba(255,255,255,0.12); color: #F0F0F0;"
        aria-label="Cerrar imagen ampliada"
      >
        <svg lucideX class="w-5 h-5" aria-hidden="true"></svg>
      </button>

      @if (error()) {
        <p class="font-body text-sm" style="color: #888;">No se pudo cargar la imagen.</p>
      } @else {
        <img
          [src]="fullSrc"
          [alt]="data.alt"
          (click)="$event.stopPropagation()"
          (error)="error.set(true)"
          style="max-width: 94vw; max-height: calc(100vh - 150px); max-height: calc(100dvh - 150px); width: auto; height: auto; object-fit: contain; border-radius: 12px; box-shadow: 0 24px 70px rgba(0,0,0,0.65);"
        />
        <p class="font-heading font-semibold text-base mt-3 text-center" style="color: #F0F0F0;">
          {{ data.alt }}
        </p>
        <p class="font-body text-xs mt-1" style="color: #888;">Toca fuera de la imagen para cerrar</p>
      }
    </div>
  `,
})
export class ImageLightboxComponent {
  data = inject<ImageLightboxData>(DIALOG_DATA);
  private dialogRef = inject<DialogRef<never>>(DialogRef);

  error = signal(false);

  /** Versión grande (1200 px) de la foto, sin recorte. */
  readonly fullSrc = cloudinaryUrl(this.data.src, 1200);

  constructor() {
    // Evita que la página de fondo se desplace mientras se ve la imagen.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = previousOverflow;
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

/** Abre el visor con la configuración común para todo el sitio. */
export function openImageLightbox(dialog: Dialog, data: ImageLightboxData): void {
  dialog.open<never, ImageLightboxData>(ImageLightboxComponent, {
    data,
    hasBackdrop: false,
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    maxHeight: '100%',
    autoFocus: 'first-tabbable',
  });
}
