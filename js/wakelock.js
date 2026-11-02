// js/wakelock.js - Screen Wake Lock API Manager for Live Workout Sessions

class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.isActive = false;
    this.statusListeners = [];
    this.isSupported = 'wakeLock' in navigator;

    // Handle tab visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isActive) {
        this.request();
      }
    });
  }

  async request() {
    if (!this.isSupported) {
      this.notifyListeners(false, 'No soportado en este navegador');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.isActive = true;

      this.wakeLock.addEventListener('release', () => {
        // Only mark inactive if intentionally released
        if (!this.isActive) {
          this.notifyListeners(false, 'Pantalla liberada');
        }
      });

      this.notifyListeners(true, 'Pantalla activa durante el entrenamiento');
      return true;
    } catch (err) {
      console.warn(`Wake Lock error: ${err.name}, ${err.message}`);
      this.isActive = false;
      this.notifyListeners(false, err.message);
      return false;
    }
  }

  async release() {
    this.isActive = false;
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
    }
    this.notifyListeners(false, 'Inactivo');
  }

  toggle() {
    if (this.isActive) {
      return this.release();
    } else {
      return this.request();
    }
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.isActive, this.isSupported ? (this.isActive ? 'Activo' : 'Inactivo') : 'No soportado');
  }

  notifyListeners(active, status) {
    for (const cb of this.statusListeners) {
      try {
        cb(active, status);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export const wakeLock = new WakeLockManager();
