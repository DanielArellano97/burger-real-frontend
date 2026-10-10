import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (notification.toast(); as toast) {
    <div class="toast-wrapper">
      <div
        class="toast-container"
        [class.toast-pulse]="toast.isPulsing"
        role="alert"
        aria-live="polite"
      >
        <div class="flex items-center gap-2">
          <span style="font-size: 16px; color: #1A1A1A;">✓</span>
          <p class="font-heading font-semibold text-sm" style="color: #1A1A1A;">
            {{ toast.productName }}
            @if (toast.count > 1) {
              <span style="color: #1A1A1A; font-weight: 800;"> (x{{ toast.count }})</span>
            }
            <span class="font-heading font-semibold text-sm" style="color: #1A1A1A;"> agregado</span>
          </p>
        </div>
      </div>
      </div>
    }
  `,
  styles: [`

    .toast-wrapper {
      position: fixed;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      animation: toastIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .toast-container {
      background: #F07800;
      border: 1px solid #F07800;
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 4px 24px rgba(240, 120, 0, 0.4);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
      text-align: center;
      transform-origin: center;
}

    @keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) scale(0.9); }
  to   { opacity: 1; transform: translateX(-50%) scale(1); }
}

.toast-pulse {
  animation: toastPulse 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes toastPulse {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
  `],
})
export class ToastComponent {
  notification = inject(NotificationService);
}
