import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideChevronLeft, LucideCheck, LucideCopy } from '@lucide/angular';
import { CartService } from '../../core/services/cart.service';
import { WhatsappService, OrderData } from '../../core/services/whatsapp.service';
import { calcularDelivery, urlRutaMapa } from '../../core/utils/delivery';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-confirm-order',
  standalone: true,
  imports: [LucideChevronLeft, LucideCheck, LucideCopy],
  templateUrl: './confirm-order.component.html',
})
export class ConfirmOrderComponent implements OnInit {
  cartService = inject(CartService);
  private whatsappService = inject(WhatsappService);
  private router = inject(Router);

  private readonly STORAGE_KEY = 'burger-real-checkout-form';

  name    = signal('');
  phone   = signal('+569');
  address = signal('');

  deliveryMethod = signal<'pickup' | 'delivery'>('pickup');
  gpsCoords      = signal<{ lat: number; lng: number } | null>(null);
  gpsAccuracy    = signal<number | null>(null);
  gpsStatus      = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  gpsError       = signal<string | null>(null);
  gpsErrorCode   = signal<number | null>(null);

  paymentMethod = signal<'transfer' | 'cash'>('transfer');
  copied        = signal(false);
  /** URL de respaldo cuando el navegador bloquea la ventana de WhatsApp. */
  whatsappFallbackUrl = signal<string | null>(null);

  notes      = signal('');
  cashAmount = signal('');

  bankDetails = environment.bankDetails;

  isNameValid = computed(() => {
    const value = this.name().trim();
    return (
      value.length > 0 &&
      value.length <= 80 &&
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'’.\-\s]+$/.test(value)
    );
  });

  /** Ignora espacios, guiones y paréntesis al validar el teléfono. */
  private phoneNormalizado = computed(() =>
    this.phone().replace(/[\s\-().]/g, '')
  );

  isPhoneValid = computed(() =>
    /^\+56[2-9]\d{8}$/.test(this.phoneNormalizado())
  );

  cashAmountNumber = computed(() => {
    const n = parseInt(this.cashAmount().replace(/\D/g, ''), 10);
    return isNaN(n) ? 0 : n;
  });

  /** Subtotal de productos, sin delivery. */
  subtotal = computed(() => this.cartService.totalPrice());

  /** Cálculo de delivery; `null` si es retiro o aún no hay GPS. */
  deliveryInfo = computed(() => {
    if (this.deliveryMethod() !== 'delivery') return null;
    const coords = this.gpsCoords();
    return coords ? calcularDelivery(coords) : null;
  });

  /** Delivery elegido pero sin ubicación capturada: valor por confirmar. */
  deliveryPendiente = computed(() =>
    this.deliveryMethod() === 'delivery' && !this.gpsCoords()
  );

  deliveryFueraDeCobertura = computed(() =>
    this.deliveryInfo()?.fueraDeCobertura ?? false
  );

  /** Precio del delivery. `0` en retiro, `null` si falta confirmar. */
  deliveryFee = computed<number | null>(() => {
    if (this.deliveryMethod() !== 'delivery') return 0;
    const info = this.deliveryInfo();
    return info && !info.fueraDeCobertura ? info.precio : null;
  });

  /** Total a pagar. Con delivery pendiente equivale al subtotal. */
  total = computed(() => this.subtotal() + (this.deliveryFee() ?? 0));

  /** El resumen no puede llamarse "Total" si el delivery aún no está incluido. */
  totalEsProvisional = computed(() =>
    this.deliveryMethod() === 'delivery' &&
    (this.deliveryPendiente() || this.deliveryFueraDeCobertura())
  );

  mapaUrl = computed(() => {
    const coords = this.gpsCoords();
    return coords ? urlRutaMapa(coords) : null;
  });

  gpsPrecisionBaja = computed(() => {
    const precision = this.gpsAccuracy();
    return precision !== null && precision > 100;
  });

  gpsAccuracyTexto = computed(() => {
    const precision = this.gpsAccuracy();
    return precision === null ? null : Math.round(precision).toString();
  });

  isDeliveryAddressRequired = computed(() =>
    this.deliveryMethod() === 'delivery' && !this.gpsCoords()
  );

  change = computed(() =>
    this.cashAmountNumber() >= this.total()
      ? this.cashAmountNumber() - this.total()
      : null
  );

  isCashAmountValid = computed(() =>
    this.cashAmountNumber() >= this.total()
  );

  isFormValid = computed(() => {
    const base = this.isNameValid() && this.isPhoneValid();
    const deliveryOk =
      this.deliveryMethod() === 'pickup' ||
      (!this.deliveryFueraDeCobertura() &&
        (!!this.gpsCoords() || this.address().trim().length > 0));
    const cashOk = this.paymentMethod() === 'transfer' || this.isCashAmountValid();
    return base && deliveryOk && cashOk;
  });

  ngOnInit(): void {
    window.scrollTo(0, 0);

    const saved = sessionStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name)           this.name.set(data.name);
        if (data.phone)          this.phone.set(data.phone);
        if (data.deliveryMethod) this.deliveryMethod.set(data.deliveryMethod);
        if (data.paymentMethod)  this.paymentMethod.set(data.paymentMethod);
        if (data.notes)          this.notes.set(data.notes);
        if (data.address)        this.address.set(data.address);
        if (data.gpsCoords) {
          this.gpsCoords.set(data.gpsCoords);
          this.gpsAccuracy.set(data.gpsAccuracy ?? null);
          this.gpsStatus.set('success');
        }
      } catch {
        sessionStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }

  formatPrice(n: number): string {
    return this.whatsappService.formatPrice(n);
  }

  saveFormToSession(): void {
    const data = {
      name:           this.name(),
      phone:          this.phone(),
      deliveryMethod: this.deliveryMethod(),
      paymentMethod:  this.paymentMethod(),
      notes:          this.notes(),
      address:        this.address(),
      gpsCoords:      this.gpsCoords(),
      gpsAccuracy:    this.gpsAccuracy(),
    };
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  requestGPS(): void {
    this.gpsError.set(null);
    this.gpsErrorCode.set(null);

    if (!window.isSecureContext) {
      this.gpsStatus.set('error');
      this.gpsError.set(
        'La ubicación solo funciona en sitios HTTPS. Abre la página con https:// y vuelve a intentar.'
      );
      return;
    }

    if (!navigator.geolocation) {
      this.gpsStatus.set('error');
      this.gpsError.set(
        'Tu navegador no soporta geolocalización. Escribe tu dirección para continuar.'
      );
      return;
    }

    this.gpsStatus.set('loading');
    navigator.geolocation.getCurrentPosition(
      position => this.aplicarPosicion(position),
      error => this.handleGpsError(error, true),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  private aplicarPosicion(position: GeolocationPosition): void {
    this.gpsCoords.set({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
    this.gpsAccuracy.set(position.coords.accuracy ?? null);
    this.gpsStatus.set('success');
    this.gpsError.set(null);
    this.gpsErrorCode.set(null);
    this.saveFormToSession();
  }

  /**
   * Si la captura de alta precisión falla por timeout o GPS no disponible,
   * reintenta una vez en modo normal. En interiores el GPS estricto suele no
   * responder y la ubicación por red/wifi basta para calcular el tramo.
   */
  private handleGpsError(error: GeolocationPositionError, altaPrecision: boolean): void {
    console.warn(
      `[GPS] code=${error.code} message="${error.message}" secure=${window.isSecureContext}`
    );

    if (altaPrecision && (error.code === 2 || error.code === 3)) {
      navigator.geolocation.getCurrentPosition(
        position => this.aplicarPosicion(position),
        segundoError => this.handleGpsError(segundoError, false),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
      return;
    }

    this.gpsStatus.set('error');
    this.gpsErrorCode.set(error.code);
    this.gpsError.set(this.mensajeGps(error.code));
  }

  private mensajeGps(code: number): string {
    if (code === 1) {
      return 'El navegador bloqueó el permiso de ubicación. En iPhone: toca «aA» en la barra de direcciones → Ajustes del sitio web → Ubicación → Permitir, y recarga la página. Revisa también Ajustes → Privacidad y seguridad → Localización → Safari.';
    }
    if (code === 2) {
      return 'No pudimos obtener tu ubicación. Revisa que el GPS esté activo y que el navegador tenga permiso de ubicación.';
    }
    if (code === 3) {
      return 'La ubicación tardó demasiado. Intenta de nuevo cerca de una ventana o escribe tu dirección.';
    }
    return 'No se pudo obtener la ubicación. Escribe tu dirección para continuar.';
  }

  copyAccountNumber(): void {
  const details = this.bankDetails;
  const text = [
    `Banco: ${details.bank}`,
    `Tipo de cuenta: ${details.accountType}`,
    `N° de cuenta: ${details.accountNumber}`,
    `RUT: ${details.rut}`,
    `Nombre: ${details.ownerName}`,
    `Email: ${details.email}`,
  ].join('\n');

  if (navigator.clipboard && window.isSecureContext) {
    // HTTPS — método moderno
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  } else {
    // HTTP fallback — funciona en desarrollo local
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }
}

  confirmOrder(): void {
    if (!this.isFormValid()) return;

    const deliveryInfo = this.deliveryInfo();

    const orderData: OrderData = {
      name:           this.name().trim(),
      phone:          this.phone().trim(),
      deliveryMethod: this.deliveryMethod(),
      gpsCoords:      this.gpsCoords(),
      paymentMethod:  this.paymentMethod(),
      notes:          this.notes().trim(),
      address:        this.address().trim(),
      cashAmount:     this.cashAmountNumber(),
      change:         this.change() ?? 0,
      subtotal:       this.subtotal(),
      deliveryFee:    this.deliveryFee(),
      deliveryPending: this.deliveryPendiente(),
      distanceKm:     deliveryInfo?.km ?? null,
    };

    const { opened, url } = this.whatsappService.sendOrder(
      this.cartService.cartItems(),
      orderData
    );

    if (!opened) {
      // El popup fue bloqueado: no borramos nada y mostramos un enlace
      // directo para que el cliente no pierda el pedido.
      this.whatsappFallbackUrl.set(url);
      return;
    }

    this.finalizeOrder();
  }

  /** Se ejecuta cuando el cliente usa el enlace de respaldo de WhatsApp. */
  onFallbackOpened(): void {
    this.finalizeOrder();
  }

  private finalizeOrder(): void {
    this.whatsappFallbackUrl.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.cartService.clearCart();
    this.router.navigate(['/menu']);
  }
}