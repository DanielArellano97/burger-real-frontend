import { Injectable, signal } from '@angular/core';

export interface ToastNotification {
  message: string;
  productName: string;
  count: number;
  isPulsing: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  toast = signal<ToastNotification | null>(null);

  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private pulseTimeout: ReturnType<typeof setTimeout> | null = null;

  show(productName: string): void {
    const current = this.toast();

    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.pulseTimeout) clearTimeout(this.pulseTimeout);

    if (current && current.productName === productName) {
      this.toast.set({ ...current, count: current.count + 1, isPulsing: true });

      this.pulseTimeout = setTimeout(() => {
        const t = this.toast();
        if (t) this.toast.set({ ...t, isPulsing: false });
      }, 400);
    } else {
      this.toast.set({ productName, message: productName, count: 1, isPulsing: false });
    }

    this.hideTimeout = setTimeout(() => {
      this.toast.set(null);
    }, 2500);
  }

  hide(): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.pulseTimeout) clearTimeout(this.pulseTimeout);
    this.toast.set(null);
  }
}
