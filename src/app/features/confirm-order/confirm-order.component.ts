import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideChevronLeft, LucideCheck, LucideCopy } from '@lucide/angular';
import { CartService } from '../../core/services/cart.service';
import { WhatsappService, OrderData } from '../../core/services/whatsapp.service';
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

  change = computed(() =>
    this.cashAmountNumber() >= this.cartService.totalPrice()
      ? this.cashAmountNumber() - this.cartService.totalPrice()
      : null
  );

  isCashAmountValid = computed(() =>
    this.cashAmountNumber() >= this.cartService.totalPrice()
  );

  isFormValid = computed(() => {
    const base = this.isNameValid() && this.isPhoneValid();
    const deliveryOk = this.deliveryMethod() === 'pickup' || this.address().trim().length > 0;
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
        this.gpsStatus.set('success');
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
    };

    this.whatsappService.sendOrder(this.cartService.cartItems(), orderData);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.cartService.clearCart();
    this.router.navigate(['/menu']);
  }
}