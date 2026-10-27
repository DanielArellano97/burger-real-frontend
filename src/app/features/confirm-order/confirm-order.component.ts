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

  paymentMethod = signal<'transfer' | 'cash'>('transfer');
  copied        = signal(false);

  notes      = signal('');
  cashAmount = signal('');

  bankDetails = environment.bankDetails;

  isNameValid = computed(() =>
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(this.name().trim()) &&
    this.name().trim().length > 0
  );

  isPhoneValid = computed(() =>
    /^\+56[2-9]\d{8}$/.test(this.phone().trim())
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

  sanitize(value: string): string {
    return value.replace(/[<>\/'";<>]/g, '');
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
    if (!navigator.geolocation) {
      this.gpsStatus.set('error');
      return;
    }
    this.gpsStatus.set('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.gpsCoords.set({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        this.gpsAccuracy.set(position.coords.accuracy ?? null);
        this.gpsStatus.set('success');
        this.saveFormToSession();
      },
      () => {
        this.gpsStatus.set('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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

    this.whatsappService.sendOrder(this.cartService.cartItems(), orderData);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.cartService.clearCart();
    this.router.navigate(['/menu']);
  }
}