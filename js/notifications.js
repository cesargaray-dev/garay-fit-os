// js/notifications.js - Web Notifications & Vibration API Manager

class NotificationManager {
  constructor() {
    this.isNotificationSupported = 'Notification' in window;
    this.isVibrationSupported = 'vibrate' in navigator;
    this.checkInterval = null;
    this.lastTriggeredHourMinute = '';
  }

  // Vibration Presets
  vibrate(pattern = [100]) {
    if (!this.isVibrationSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration error:', e);
    }
  }

  vibrateSetCompleted() {
    // Crisp double-tap
    this.vibrate([80, 50, 120]);
  }

  vibrateRestDone() {
    // Energetic triple pulse
    this.vibrate([200, 100, 200, 100, 400]);
  }

  vibrateAlert() {
    // Distinct alert pattern
    this.vibrate([300, 150, 300]);
  }

  // Web Notifications Permission
  async requestPermission() {
    if (!this.isNotificationSupported) {
      this.showInAppToast('Notificaciones no soportadas en este navegador', 'info');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showInAppToast('🔔 Alertas biológicas activadas con éxito', 'success');
        this.sendNotification('GARAY FIT OS Activado', {
          body: 'Protocolo Circadiano 07:30 AM sincronizado. ¡A romper marcas en la Marcy!',
          icon: './icons/icon-192.png'
        });
        return true;
      } else {
        this.showInAppToast('Permiso de notificaciones denegado', 'warning');
        return false;
      }
    } catch (err) {
      console.error('Notification permission error:', err);
      return false;
    }
  }

  getPermissionStatus() {
    if (!this.isNotificationSupported) return 'unsupported';
    return Notification.permission;
  }

  sendNotification(title, options = {}) {
    if (!this.isNotificationSupported || Notification.permission !== 'granted') {
      // Fallback to in-app toast
      this.showInAppToast(`${title}: ${options.body || ''}`, 'info');
      return null;
    }

    try {
      const defaultOptions = {
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        vibrate: [200, 100, 200],
        ...options
      };

      // If service worker is active, use showNotification for better mobile background support
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, defaultOptions);
        });
        return null;
      }

      return new Notification(title, defaultOptions);
    } catch (e) {
      console.warn('Send notification error:', e);
      this.showInAppToast(`${title}: ${options.body || ''}`, 'info');
      return null;
    }
  }

  // In-app floating toast banner
  showInAppToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-11/12 max-w-md pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const borderColors = {
      success: 'border-emerald-500 bg-emerald-950/90 text-emerald-100 shadow-emerald-900/40',
      warning: 'border-orange-500 bg-orange-950/90 text-orange-100 shadow-orange-900/40',
      info: 'border-cyan-500 bg-cyan-950/90 text-cyan-100 shadow-cyan-900/40',
      error: 'border-red-500 bg-red-950/90 text-red-100 shadow-red-900/40'
    };

    const icons = {
      success: '✓',
      warning: '⚠️',
      info: 'ℹ️',
      error: '✕'
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 transform -translate-y-4 opacity-0 pointer-events-auto ${borderColors[type] || borderColors.info}`;
    toast.innerHTML = `
      <span class="text-base font-bold">${icons[type] || '•'}</span>
      <div class="text-xs sm:text-sm font-medium flex-1">${message}</div>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('-translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.add('-translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Start background periodic check for circadian schedule
  startCircadianMonitor(scheduleItems, onScheduleTrigger) {
    if (this.checkInterval) clearInterval(this.checkInterval);

    const check = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;

      if (this.lastTriggeredHourMinute === timeStr) return;

      for (const item of scheduleItems) {
        if (item.hour === currentH && item.minute === currentM) {
          this.lastTriggeredHourMinute = timeStr;
          this.vibrateAlert();
          this.sendNotification(`⏰ ${item.title}`, {
            body: item.desc,
            tag: item.id
          });
          if (onScheduleTrigger) onScheduleTrigger(item);
          break;
        }
      }
    };

    this.checkInterval = setInterval(check, 30000); // Check every 30s
    check();
  }
}

export const notify = new NotificationManager();
