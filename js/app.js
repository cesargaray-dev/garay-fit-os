// js/app.js - Main Application Controller for GARAY FIT OS // Marcy Pro & Circadian Edition

import {
  MARCY_MACHINE_INFO,
  WORKOUT_ROUTINES,
  CIRCADIAN_SCHEDULE,
  CIRCADIAN_SCHEDULE_TRAINING,
  CIRCADIAN_SCHEDULE_REST,
  DAILY_MEALS_DATA,
  HYPERCALORIC_SHAKE_RECIPE,
  getRoutineForDay,
  getCircadianScheduleForDay
} from './data.js';
import { sound } from './audio.js';
import { storage, getTodayKey } from './storage.js';
import { wakeLock } from './wakelock.js';
import { notify } from './notifications.js';
import { renderBiomechanicalPanel, renderMarcyDiagram } from './marcy-svg.js';

class GarayFitApp {
  constructor() {
    this.currentTab = 'today';
    const todayPlan = getRoutineForDay(new Date().getDay());
    this.activeRoutine = todayPlan.type === 'workout' ? todayPlan.routine : WORKOUT_ROUTINES[0];
    this.currentExerciseIndex = 0;
    this.activeWorkoutSession = null;
    this.restTimerInterval = null;
    this.restSecondsLeft = 0;
    this.totalRestSeconds = 90;
    this.tempoInterval = null;
    this.activePacerTimer = null;
    this.tempoPhase = 'idle';
    this.tempoCount = 0;
    this.deferredInstallPrompt = null;
    this.scheduleOverrideMode = null; // null = auto by weekday, 'training' = Lun-Mié, 'rest' = Jue-Dom
    this.selectedStationFilter = 'all';

    this.init();
  }

  init() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['today', 'workout', 'marcy', 'nutrition', 'progress'].includes(tabParam)) {
      this.currentTab = tabParam;
    }

    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupCircadianRhythm();

    wakeLock.onStatusChange((active, status) => {
      this.updateWakeLockUI(active, status);
    });

    storage.subscribe(() => {
      this.render();
    });

    this.setupGlobalEvents();
    this.render();
    this.refreshIcons();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('Service Worker registered successfully with scope:', reg.scope);
          // Check for newer SW version immediately
          reg.update().catch(() => {});

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (typeof notify !== 'undefined' && notify.showInAppToast) {
                    notify.showInAppToast('🚀 Actualización v2.0 instalada. Recargando...', 'info', 2000);
                  }
                  setTimeout(() => {
                    window.location.reload();
                  }, 1200);
                }
              });
            }
          });
        }).catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      });
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.add('hidden');
      notify.showInAppToast('🎉 GARAY FIT OS instalado en tu pantalla de inicio', 'success');
    });
  }

  async triggerPwaInstall() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      const { outcome } = await this.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted PWA install');
      }
      this.deferredInstallPrompt = null;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.add('hidden');
    } else {
      this.showPwaHelpModal();
    }
  }

  showPwaHelpModal() {
    const httpsUrl = window.location.origin;

    const helpHtml = `
      <div class="space-y-4 text-left text-sm text-gray-300">
        <div class="p-4 rounded-2xl bg-black/70 border border-orange-500/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div class="w-28 h-28 rounded-xl bg-white p-2 shrink-0 shadow-lg flex items-center justify-center">
            <img src="./icons/qr-install.png" alt="QR Instalación" class="w-full h-full object-contain" />
          </div>
          <div class="space-y-1.5">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              INSTALACIÓN PWA STANDALONE
            </span>
            <h4 class="text-xs font-bold text-white">Instala GARAY FIT OS como App Nativa</h4>
            <p class="text-[11px] text-gray-300 leading-relaxed">
              Abre este enlace en el navegador de tu teléfono para instalarla a pantalla completa sin barras del navegador y con funcionamiento 100% offline.
            </p>
            <a href="${httpsUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-mono text-cyan-400 hover:underline block break-all font-bold">
              ${httpsUrl} ↗
            </a>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5 border border-white/10 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <span>🤖 En Android (Google Chrome):</span>
          </div>
          <ol class="list-decimal pl-5 space-y-1.5 text-xs text-gray-300">
            <li>Abre la app en Chrome y toca el botón naranja <strong class="text-orange-400 font-bold">"INSTALAR"</strong> arriba, o el menú de tres puntos (⋮).</li>
            <li>Selecciona <strong class="text-emerald-400 font-bold">"Instalar aplicación"</strong> o "Agregar a la pantalla principal".</li>
            <li>Confirma tocando <strong class="text-white font-bold">"Instalar"</strong> para tener el ícono <strong>GF</strong> en tu cajón de apps.</li>
          </ol>
        </div>

        <div class="glass-card rounded-2xl p-3.5 border border-white/10 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <span>🍏 En iPhone (Safari):</span>
          </div>
          <ol class="list-decimal pl-5 space-y-1.5 text-xs text-gray-300">
            <li>Abre la app en <strong class="text-white">Safari</strong>.</li>
            <li>Toca el botón <strong class="text-cyan-400">Compartir</strong> (cuadrado con flecha hacia arriba ⎋).</li>
            <li>Selecciona <strong class="text-orange-400">"Agregar a pantalla de inicio"</strong> ⊞ y toca "Agregar".</li>
          </ol>
        </div>
      </div>
    `;

    this.showModal('📲 Instalar GARAY FIT OS en tu Teléfono', helpHtml);
  }

  setupCircadianRhythm() {
    const activeSchedule = getCircadianScheduleForDay(new Date().getDay());
    notify.startCircadianMonitor(activeSchedule, (item) => {
      sound.playScheduleAlert();
      notify.showInAppToast(`⏰ ${item.title}: ${item.actionRequired}`, 'warning', 6000);
      this.render();
    });

    setInterval(() => {
      if (this.currentTab === 'today') {
        this.renderTodayCircadianStatus();
      }
    }, 60000);
  }

  setupGlobalEvents() {
    // Navigation bar click handler
    document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Sound toggle in top bar
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const muted = !sound.isMuted();
        sound.setMuted(muted);
        storage.state.settings.soundEnabled = !muted;
        storage.saveState();
        notify.vibrate([40]);
        this.updateSoundButtonUI();
        notify.showInAppToast(muted ? '🔇 Sonidos silenciados' : '🔊 Sintetizador de audio activado', 'info', 2000);
      });
    }

    // Wake lock toggle in top bar
    const wakeBtn = document.getElementById('btn-wakelock-toggle');
    if (wakeBtn) {
      wakeBtn.addEventListener('click', async () => {
        notify.vibrate([40]);
        await wakeLock.toggle();
      });
    }

    // Notifications permission button
    const notifBtn = document.getElementById('btn-notif-toggle');
    if (notifBtn) {
      notifBtn.addEventListener('click', async () => {
        notify.vibrate([40]);
        const granted = await notify.requestPermission();
        if (granted) {
          storage.state.settings.notificationsEnabled = true;
          storage.saveState();
        }
      });
    }
  }

  updateSoundButtonUI() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (!soundBtn) return;
    const isMuted = sound.isMuted();
    soundBtn.innerHTML = isMuted 
      ? '<i data-lucide="volume-x" class="w-4 h-4 text-gray-500"></i>'
      : '<i data-lucide="volume-2" class="w-4 h-4 text-cyan-400"></i>';
    this.refreshIcons();
  }

  updateWakeLockUI(active, status) {
    const wakeBtn = document.getElementById('btn-wakelock-toggle');
    if (!wakeBtn) return;
    if (active) {
      wakeBtn.classList.remove('text-gray-500', 'border-white/10');
      wakeBtn.classList.add('text-orange-400', 'border-orange-500/40', 'bg-orange-500/10');
      wakeBtn.innerHTML = '<i data-lucide="sun-medium" class="w-4 h-4 animate-spin text-orange-400"></i><span class="text-[10px] font-mono hidden sm:inline">PANTALLA ACTIVA</span>';
    } else {
      wakeBtn.classList.remove('text-orange-400', 'border-orange-500/40', 'bg-orange-500/10');
      wakeBtn.classList.add('text-gray-500', 'border-white/10');
      wakeBtn.innerHTML = '<i data-lucide="sun" class="w-4 h-4 text-gray-500"></i><span class="text-[10px] font-mono hidden sm:inline">PANTALLA AUTO</span>';
    }
    this.refreshIcons();
  }

  switchTab(tabName) {
    notify.vibrate([30]);
    this.currentTab = tabName;

    // Update bottom nav visual state
    document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
      const tab = btn.getAttribute('data-tab');
      if (tab === tabName) {
        btn.classList.add('text-orange-400');
        btn.classList.remove('text-gray-400');
        const ind = btn.querySelector('.nav-indicator');
        if (ind) ind.classList.remove('opacity-0', 'scale-x-0');
      } else {
        btn.classList.remove('text-orange-400');
        btn.classList.add('text-gray-400');
        const ind = btn.querySelector('.nav-indicator');
        if (ind) ind.classList.add('opacity-0', 'scale-x-0');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  render() {
    const container = document.getElementById('main-content');
    if (!container) return;

    switch (this.currentTab) {
      case 'today':
        container.innerHTML = this.renderTodayTab();
        this.bindTodayEvents();
        break;
      case 'workout':
        container.innerHTML = this.renderWorkoutTab();
        this.bindWorkoutEvents();
        break;
      case 'marcy':
        container.innerHTML = this.renderMarcyGuideTab();
        this.bindMarcyGuideEvents();
        break;
      case 'nutrition':
        container.innerHTML = this.renderNutritionTab();
        this.bindNutritionEvents();
        break;
      case 'progress':
        container.innerHTML = this.renderProgressTab();
        this.bindProgressEvents();
        break;
    }

    this.refreshIcons();
  }

  // ==========================================
  // TAB 1: MI DÍA (PROTOCOLO 07:30 AM)
  // ==========================================
  renderTodayTab() {
    const todayLog = storage.getTodayLog();
    const streak = storage.state.streak.current || 0;
    const user = storage.state.user || {};
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const totalMinutesNow = currentH * 60 + currentM;

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayOfWeekName = dayNames[dayOfWeek];
    const fullDateFormatted = `${dayOfWeekName}, ${now.getDate()} de ${monthNames[now.getMonth()]} de ${now.getFullYear()}`;
    const todayPlan = getRoutineForDay(dayOfWeek);
    const isTrainingDayToday = todayPlan.type === 'workout';

    // Active schedule for today (or user preview toggle)
    const activeSchedule = getCircadianScheduleForDay(dayOfWeek, this.scheduleOverrideMode);
    const showingTrainingSchedule = activeSchedule === CIRCADIAN_SCHEDULE_TRAINING;

    // Determine current circadian phase & next immediate action
    let currentEvent = activeSchedule[0];
    let nextEvent = activeSchedule[1] || activeSchedule[0];

    for (let i = 0; i < activeSchedule.length; i++) {
      const item = activeSchedule[i];
      const itemMinutes = item.hour * 60 + item.minute;
      if (totalMinutesNow >= itemMinutes) {
        currentEvent = item;
        nextEvent = activeSchedule[i + 1] || activeSchedule[0];
      }
    }

    // Calculate daily completion percentage against active schedule
    const totalHabits = activeSchedule.length;
    const completedHabits = activeSchedule.filter(item => Boolean(todayLog.habits && todayLog.habits[item.id])).length;
    const progressPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    return `
      <div class="space-y-5 animate-fade-in pb-12">
        <!-- Hero Header -->
        <div class="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
          <div class="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
          <div class="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
                  PROTOCOLO ${user.wakeUpTime || '07:30 AM'}
                </span>
                <span class="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  📅 ${fullDateFormatted.toUpperCase()}
                </span>
                <span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${isTrainingDayToday ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
                  ${isTrainingDayToday ? '🔥 DÍA DE ENTRENO (LUN-MIÉ)' : '🔋 DÍA DE DESCANSO LIBRE (JUE-DOM)'}
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ${user.name || 'César Garay'} <span class="text-orange-400 text-lg font-mono font-normal">// FIT OS</span>
              </h1>
              <p class="text-xs text-gray-400">
                ${user.role || 'Ingeniería en Desarrollo de Software'} • Marcy MWM-4965SC + 2 Mancuernas
              </p>

              <!-- Personal Metrics Summary Bar -->
              <div class="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-300">
                <span class="font-mono text-cyan-400 font-bold">Edad: <strong class="text-white">${user.age || 21} años</strong></span>
                <span class="text-gray-600">•</span>
                <span class="font-mono text-cyan-400 font-bold">Estatura: <strong class="text-white">${user.heightCm || 178} cm</strong></span>
                <span class="text-gray-600">•</span>
                <span class="font-mono text-orange-400 font-bold">Peso: <strong class="text-white">${user.currentWeightKg ? user.currentWeightKg + ' kg' : '66 kg'}</strong></span>
                <span class="text-gray-600">•</span>
                <span class="font-mono text-emerald-400 font-bold">Meta: <strong class="text-white">${user.targetWeightKg || 74} kg</strong></span>
                <button id="btn-edit-profile-hero" class="text-[11px] font-mono font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-0.5 rounded-lg border border-orange-500/30 flex items-center gap-1 active:scale-95 transition-all">
                  <i data-lucide="edit-3" class="w-3 h-3"></i> Personalizar
                </button>
              </div>
            </div>

            <!-- Streak Badge -->
            <div class="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-gradient-to-b from-orange-500/20 to-orange-950/40 border border-orange-500/30 shadow-lg shadow-orange-950/50 shrink-0">
              <span class="text-xl">🔥</span>
              <span class="text-lg font-black font-mono text-orange-400 leading-none mt-0.5">${streak}</span>
              <span class="text-[9px] font-bold uppercase tracking-wider text-orange-300/80">Días Racha</span>
            </div>
          </div>

          <!-- Circadian Real-Time Status Gauge -->
          <div class="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <i data-lucide="${currentEvent.icon || 'activity'}" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  ESTADO BIOLÓGICO ACTUAL (${currentEvent.time})
                </div>
                <div class="text-sm font-bold text-white">
                  ${currentEvent.title}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
              <div class="text-right">
                <div class="text-[10px] text-gray-400">Progreso de Hoy</div>
                <div class="text-xs font-mono font-bold text-emerald-400">${completedHabits}/${totalHabits} Hitos (${progressPercent}%)</div>
              </div>
              <div class="w-14 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-orange-500 to-emerald-400 transition-all duration-500" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🎯 AUTONOMOUS: Plan Programado Para Hoy (Lunes a Miércoles vs Jueves a Domingo) -->
        ${isTrainingDayToday ? `
          <div class="glass-card rounded-2xl p-4 sm:p-5 border border-orange-500/40 bg-gradient-to-r from-orange-950/30 via-slate-900 to-black relative overflow-hidden shadow-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-2xl shrink-0 shadow-lg shadow-orange-500/20">
                  🏋️
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                      HOY ES ${dayOfWeekName.toUpperCase()} • TOCA ENTRENAR
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ${todayPlan.routine.badge}
                    </span>
                    <span class="text-[11px] font-mono text-gray-400">⏱️ ~${todayPlan.routine.estimatedMinutes} min</span>
                  </div>
                  <h2 class="text-base sm:text-lg font-black text-white mt-1 leading-tight">
                    ${todayPlan.routine.title}
                  </h2>
                  <p class="text-xs text-gray-300 mt-0.5">
                    ${todayPlan.routine.subtitle}
                  </p>
                  <div class="text-[11px] text-cyan-300/90 font-mono mt-1">
                    ✦ ${todayPlan.routine.exercises.length} ejercicios guiados paso a paso en tu Marcy + 2 Mancuernas.
                  </div>
                </div>
              </div>

              <button id="btn-jump-today-routine" class="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all shrink-0">
                <span>Iniciar Rutina de Hoy</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        ` : `
          <div class="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-black relative overflow-hidden shadow-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl shrink-0 shadow-lg shadow-emerald-500/20">
                  🔋
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      HOY ES ${dayOfWeekName.toUpperCase()} • DESCANSO DE PESAS (JUE-DOM)
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Mañana Libre
                    </span>
                  </div>
                  <h2 class="text-base sm:text-lg font-black text-white mt-1 leading-tight">
                    ${todayPlan.title}
                  </h2>
                  <p class="text-xs text-gray-300 mt-0.5">
                    ${todayPlan.subtitle}
                  </p>
                  <div class="text-[11px] text-emerald-300/90 font-mono mt-1">
                    ✦ Tu agenda de hoy solo te recuerda comidas, batido + creatina, 3L de agua y sueño.
                  </div>
                </div>
              </div>

              <button id="btn-jump-today-routine" class="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shrink-0">
                <span>Explorar Rutinas Lun-Mié</span>
                <i data-lucide="dumbbell" class="w-4 h-4 text-orange-400"></i>
              </button>
            </div>
          </div>
        `}

        <!-- Weekly 3-Day Split Overview Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          ${WORKOUT_ROUTINES.map((r) => {
            const isTodayDay = dayOfWeek === r.dayNumber;
            return `
              <button class="weekly-day-card glass-card rounded-2xl p-3.5 border ${isTodayDay ? 'border-orange-500/60 bg-orange-950/20' : 'border-white/10 hover:border-white/25'} text-left transition-all active:scale-98 flex items-center justify-between gap-2" data-routine-id="${r.id}">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${isTodayDay ? 'bg-orange-500 text-white' : 'bg-white/10 text-cyan-400'}">${r.dayName}</span>
                    ${isTodayDay ? '<span class="text-[9px] font-mono font-black text-emerald-400 uppercase">• HOY</span>' : ''}
                  </div>
                  <div class="text-xs font-bold text-white mt-1 leading-snug">${r.title.replace(/^DÍA \d:\s*/, '')}</div>
                  <div class="text-[10px] text-gray-400 font-mono mt-0.5">${r.exercises.length} ejercicios • ~${r.estimatedMinutes} min</div>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-500 shrink-0"></i>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Next Immediate Action Card -->
        <div class="glass-card rounded-2xl p-4 border border-orange-500/30 bg-gradient-to-r from-orange-950/30 via-black to-slate-900/40 relative overflow-hidden">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-base">
                ⚡
              </div>
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                  SIGUIENTE ACCIÓN INMEDIATA (${nextEvent.time})
                </span>
                <div class="text-sm font-bold text-white leading-tight">
                  ${nextEvent.title}
                </div>
                <div class="text-xs text-gray-300 mt-0.5">
                  ${nextEvent.actionRequired}
                </div>
              </div>
            </div>

            <button id="btn-quick-action" data-action="${nextEvent.id}" class="shrink-0 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/30 transition-all active:scale-95 flex items-center gap-1.5">
              ${nextEvent.id === 'workout_session' ? '🏋️ Entrenar' : '✓ Realizar'}
            </button>
          </div>
        </div>

        <!-- Quick Habits Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button class="quick-habit-toggle glass-card rounded-2xl p-3 border ${todayLog.habits['wake_up'] ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' : 'border-white/10 text-gray-300'} text-left flex items-center justify-between transition-all active:scale-95" data-habit="wake_up">
            <div>
              <div class="text-[10px] font-mono text-gray-400">07:30 AM</div>
              <div class="text-xs font-bold leading-tight mt-0.5">500ml Agua + Sol</div>
            </div>
            <span class="text-lg">${todayLog.habits['wake_up'] ? '✅' : '☀️'}</span>
          </button>

          <button class="quick-habit-toggle glass-card rounded-2xl p-3 border ${todayLog.shakeTaken ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' : 'border-white/10 text-gray-300'} text-left flex items-center justify-between transition-all active:scale-95" data-action="toggle-shake">
            <div>
              <div class="text-[10px] font-mono text-gray-400">10:30 AM</div>
              <div class="text-xs font-bold leading-tight mt-0.5">Batido 755 kcal</div>
            </div>
            <span class="text-lg">${todayLog.shakeTaken ? '✅' : '🥤'}</span>
          </button>

          <button class="quick-habit-toggle glass-card rounded-2xl p-3 border ${todayLog.creatineTaken ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' : 'border-white/10 text-gray-300'} text-left flex items-center justify-between transition-all active:scale-95" data-action="toggle-creatine">
            <div>
              <div class="text-[10px] font-mono text-gray-400">Todos los días</div>
              <div class="text-xs font-bold leading-tight mt-0.5">5g Creatina</div>
            </div>
            <span class="text-lg">${todayLog.creatineTaken ? '✅' : '⚡'}</span>
          </button>

          <button class="quick-habit-toggle glass-card rounded-2xl p-3 border ${(todayLog.waterMl || 0) >= 3000 ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' : 'border-white/10 text-gray-300'} text-left flex items-center justify-between transition-all active:scale-95" data-tab-switch="nutrition">
            <div>
              <div class="text-[10px] font-mono text-gray-400">Meta Diaria</div>
              <div class="text-xs font-bold leading-tight mt-0.5">${(todayLog.waterMl || 0)} / 3000 ml</div>
            </div>
            <span class="text-lg">${(todayLog.waterMl || 0) >= 3000 ? '✅' : '💧'}</span>
          </button>
        </div>

        <!-- Full Hourly Interactive Timeline -->
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 px-1">
            <h2 class="text-sm font-mono font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="clock" class="w-4 h-4 text-orange-400"></i>
              ${showingTrainingSchedule ? 'Agenda Día de Entreno (Lun - Mié)' : 'Agenda Descanso & Nutrición (Jue - Dom)'}
            </h2>

            <!-- Mode Switcher Pill so César can view Training vs Rest day schedule anytime -->
            <div class="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
              <button id="btn-sched-mode-training" class="px-2.5 py-1 rounded-lg transition-all ${showingTrainingSchedule ? 'bg-orange-500 text-white font-bold' : 'text-gray-400 hover:text-white'}">
                🏋️ Lun-Mié (Entreno)
              </button>
              <button id="btn-sched-mode-rest" class="px-2.5 py-1 rounded-lg transition-all ${!showingTrainingSchedule ? 'bg-emerald-500 text-black font-bold' : 'text-gray-400 hover:text-white'}">
                🔋 Jue-Dom (Descanso)
              </button>
            </div>
          </div>

          <div class="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-cyan-500 before:to-purple-600">
            ${activeSchedule.map((item) => {
              const isDone = todayLog.habits[item.id];
              const isCurrent = (currentEvent.id === item.id);
              return `
                <div class="relative glass-card rounded-2xl p-4 border ${isDone ? 'border-emerald-500/40 bg-emerald-950/10' : isCurrent ? 'border-orange-500/60 bg-orange-950/20 glow-orange' : 'border-white/10'} transition-all">
                  <div class="absolute -left-[19px] top-5 w-4 h-4 rounded-full border-2 ${isDone ? 'bg-emerald-500 border-emerald-300' : isCurrent ? 'bg-orange-500 border-white animate-ping' : 'bg-slate-900 border-gray-600'} flex items-center justify-center">
                  </div>

                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-md ${isCurrent ? 'bg-orange-500 text-white' : 'bg-white/10 text-cyan-400'}">
                          ${item.time} ${item.endTime ? `→ ${item.endTime}` : ''}
                        </span>
                        ${item.calories ? `<span class="text-[10px] font-mono text-emerald-400 font-bold">${item.calories} • ${item.protein}</span>` : ''}
                        ${item.energyLevel ? `<span class="text-[10px] font-mono text-orange-400 font-bold">${item.energyLevel}</span>` : ''}
                      </div>

                      <h3 class="text-sm font-bold text-white mt-1.5 flex items-center gap-2 ${isDone ? 'line-through text-gray-400' : ''}">
                        ${item.title}
                      </h3>
                      <p class="text-xs text-gray-300 mt-1 leading-relaxed">
                        ${item.desc}
                      </p>
                    </div>

                    <button class="habit-check-btn shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/40' : 'border-white/20 bg-white/5 text-gray-500 hover:border-orange-500'}" data-id="${item.id}">
                      ${isDone ? '✓' : ''}
                    </button>
                  </div>

                  ${item.id === 'workout_session' ? `
                    <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <div class="text-[11px] text-gray-300 font-mono">
                        Toca hoy: <strong class="text-orange-400">${this.getTodayRecommendedRoutineTitle()}</strong>
                      </div>
                      <button class="btn-goto-workout px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/30 flex items-center gap-1 active:scale-95 shrink-0">
                        <i data-lucide="play" class="w-3.5 h-3.5"></i> Ir a Entrenar
                      </button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  getTodayRecommendedRoutineTitle() {
    const plan = getRoutineForDay(new Date().getDay());
    if (plan.type === 'workout' && plan.routine) {
      return `${plan.routine.dayName}: ${plan.routine.title}`;
    }
    return 'Descanso Muscular (Entrenos: Lunes a Miércoles)';
  }

  bindTodayEvents() {
    // Schedule mode toggle (Training Lun-Mié vs Rest Jue-Dom)
    const btnTrainMode = document.getElementById('btn-sched-mode-training');
    const btnRestMode = document.getElementById('btn-sched-mode-rest');
    if (btnTrainMode) {
      btnTrainMode.addEventListener('click', () => {
        this.scheduleOverrideMode = 'training';
        notify.vibrate([20]);
        this.render();
      });
    }
    if (btnRestMode) {
      btnRestMode.addEventListener('click', () => {
        this.scheduleOverrideMode = 'rest';
        notify.vibrate([20]);
        this.render();
      });
    }

    // Weekly 3-day split cards
    document.querySelectorAll('.weekly-day-card').forEach((card) => {
      card.addEventListener('click', () => {
        const rId = card.getAttribute('data-routine-id');
        const found = WORKOUT_ROUTINES.find(r => r.id === rId);
        if (found) {
          this.activeRoutine = found;
          this.currentExerciseIndex = 0;
          notify.vibrate([30]);
          this.switchTab('workout');
        }
      });
    });

    // Habit check buttons
    document.querySelectorAll('.habit-check-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          const newState = storage.toggleHabit(id);
          if (newState) {
            sound.playSetCompleted();
            notify.vibrate([60, 40, 100]);
            notify.showInAppToast('¡Hito cumplido! Excelente disciplina César.', 'success', 2500);
          } else {
            notify.vibrate([30]);
          }
          this.render();
        }
      });
    });

    // Quick habit toggle buttons
    document.querySelectorAll('.quick-habit-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const habit = btn.getAttribute('data-habit');
        const action = btn.getAttribute('data-action');
        const tabSwitch = btn.getAttribute('data-tab-switch');

        if (habit) {
          storage.toggleHabit(habit);
          sound.playSetCompleted();
          notify.vibrate([60]);
          this.render();
        } else if (action === 'toggle-shake') {
          storage.toggleShake();
          sound.playSetCompleted();
          notify.vibrate([60]);
          this.render();
        } else if (action === 'toggle-creatine') {
          storage.toggleCreatine();
          sound.playSetCompleted();
          notify.vibrate([60]);
          this.render();
        } else if (tabSwitch) {
          this.switchTab(tabSwitch);
        }
      });
    });

    // Quick action hero button
    const quickBtn = document.getElementById('btn-quick-action');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        const action = quickBtn.getAttribute('data-action');
        if (action === 'workout_session') {
          this.switchTab('workout');
        } else {
          storage.toggleHabit(action);
          sound.playSetCompleted();
          notify.vibrate([60, 40, 100]);
          this.render();
        }
      });
    }

    // Go to workout buttons
    document.querySelectorAll('.btn-goto-workout').forEach((b) => {
      b.addEventListener('click', () => this.switchTab('workout'));
    });

    // Edit profile hero button
    const editHeroBtn = document.getElementById('btn-edit-profile-hero');
    if (editHeroBtn) {
      editHeroBtn.addEventListener('click', () => {
        this.openEditProfileModal();
      });
    }

    // Jump directly to today's scheduled routine
    const jumpRoutineBtn = document.getElementById('btn-jump-today-routine');
    if (jumpRoutineBtn) {
      jumpRoutineBtn.addEventListener('click', () => {
        const todayPlan = getRoutineForDay(new Date().getDay());
        this.activeRoutine = todayPlan.type === 'workout' ? todayPlan.routine : WORKOUT_ROUTINES[0];
        this.currentExerciseIndex = 0;
        notify.vibrate([40]);
        this.switchTab('workout');
      });
    }
  }

  renderTodayCircadianStatus() {
    const el = document.getElementById('main-content');
    if (el && this.currentTab === 'today') {
      this.render();
    }
  }

  // ==========================================
  // TAB 2: ENTRENAR (LIVE WORKOUT - MARCY MWM-4965SC + 2 MANCUERNAS)
  // ==========================================
  renderWorkoutTab() {
    const todayPlan = getRoutineForDay(new Date().getDay());
    const isTrainingDayToday = todayPlan.type === 'workout';
    const todayRoutineObj = isTrainingDayToday ? todayPlan.routine : null;

    if (!this.activeRoutine || !this.activeRoutine.exercises) {
      this.activeRoutine = todayRoutineObj || WORKOUT_ROUTINES[0];
    }
    const routine = this.activeRoutine;
    if (this.currentExerciseIndex >= routine.exercises.length) {
      this.currentExerciseIndex = 0;
    }

    const isViewingToday = todayRoutineObj && routine.id === todayRoutineObj.id;
    const currentEx = routine.exercises[this.currentExerciseIndex];
    const record = currentEx ? storage.state.exerciseRecords[currentEx.id] : null;
    const suggestOverload = record && record.suggestIncrease;

    // Overall routine sets progress
    const dayProgress = storage.getDayCompletedSetsSummary(routine.id, routine.exercises);
    const dayProgressPct = dayProgress.totalSets > 0
      ? Math.round((dayProgress.completedSets / dayProgress.totalSets) * 100)
      : 0;

    return `
      <div class="space-y-4 animate-fade-in pb-16">
        <!-- Routine Selector Header Pills (Lunes, Martes, Miércoles) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          ${WORKOUT_ROUTINES.map((r) => {
            const isSelected = r.id === routine.id;
            const isToday = todayRoutineObj && r.id === todayRoutineObj.id;
            const rProg = storage.getDayCompletedSetsSummary(r.id, r.exercises);
            return `
              <button class="routine-select-btn shrink-0 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${isSelected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 border border-orange-400' : 'bg-slate-900/90 text-gray-300 border border-white/10 hover:border-white/25'}" data-routine="${r.id}">
                <span>${r.dayName}</span>
                ${isToday ? `<span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-400 text-black shadow-sm">HOY</span>` : ''}
                <span class="text-[10px] font-mono px-2 py-0.5 rounded ${isSelected ? 'bg-black/30 text-white' : 'bg-white/5 text-gray-400'}">${r.badge.replace(/\s*\(.*\)/, '')}</span>
                ${rProg.completedSets > 0 ? `<span class="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">${rProg.completedSets}/${rProg.totalSets}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Contextual Day Banner -->
        ${!isTrainingDayToday ? `
          <div class="glass-card rounded-2xl p-3.5 border border-emerald-500/40 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">🔋</span>
              <div class="text-xs text-gray-200">
                <strong class="text-emerald-400 font-bold">${todayPlan.title}:</strong> Tus entrenamientos son de <strong>Lunes a Miércoles</strong>. Puedes revisar aquí la técnica de tus 3 rutinas o adelantar sesión si lo deseas.
              </div>
            </div>
          </div>
        ` : !isViewingToday ? `
          <div class="glass-card rounded-2xl p-3 border border-cyan-500/40 bg-cyan-950/20 flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">📅</span>
              <div class="text-xs text-gray-300">
                Estás viendo la rutina de <strong class="text-white">${routine.dayName}</strong>. Hoy toca <strong class="text-cyan-400 font-bold">${todayRoutineObj.dayName} (${todayRoutineObj.title})</strong>.
              </div>
            </div>
            <button id="btn-switch-to-today-routine" class="shrink-0 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs font-mono active:scale-95 transition-all shadow-md shadow-cyan-500/30 flex items-center gap-1">
              ⚡ Cargar Hoy
            </button>
          </div>
        ` : ''}

        <!-- Routine Title & Overall Session Progress Banner -->
        <div class="glass-card rounded-3xl p-4 sm:p-5 border border-white/10 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                  ${routine.title}
                </span>
                ${isViewingToday ? `
                  <span class="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    RUTINA DE HOY
                  </span>
                ` : ''}
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  ⏱️ ~${routine.estimatedMinutes} MIN • ${routine.exercises.length} EJERCICIOS
                </span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-white mt-1">
                ${routine.subtitle}
              </h2>
            </div>

            <!-- Session Progress & Finish Action -->
            <div class="flex items-center gap-2.5 shrink-0">
              <div class="px-3 py-1.5 rounded-2xl bg-black/50 border border-white/10 text-right font-mono">
                <span class="text-[9px] text-gray-400 uppercase block">Series Hoy</span>
                <span class="text-xs font-black ${dayProgress.completedSets === dayProgress.totalSets ? 'text-emerald-400' : 'text-cyan-400'}">${dayProgress.completedSets} / ${dayProgress.totalSets} (${dayProgressPct}%)</span>
              </div>
              <button id="btn-finish-workout-session" class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs shadow-lg shadow-emerald-900/50 hover:brightness-110 active:scale-95 flex items-center gap-1.5 shrink-0">
                <i data-lucide="check-circle" class="w-4 h-4"></i> Finalizar Sesión
              </button>
            </div>
          </div>

          <!-- Progressive Overload Alert Banner -->
          ${suggestOverload ? `
            <div class="mt-3.5 p-3 rounded-2xl bg-orange-500/15 border border-orange-500/50 flex items-center gap-3">
              <span class="text-xl">⚡</span>
              <div class="text-xs text-orange-200">
                <strong class="text-white font-bold">SOBRECARGA PROGRESIVA RECOMENDADA:</strong> En tu sesión anterior dominaste este ejercicio (${record.maxReps} reps con ${record.maxPlates} placas).
                <span class="text-orange-400 font-bold block mt-0.5">¡Hoy intenta subir 1 placa (+10 lb) o añadir 1-2 repeticiones más!</span>
              </div>
            </div>
          ` : ''}
        </div>

        ${this.renderActiveExerciseRunner(routine, currentEx)}
      </div>
    `;
  }

  renderActiveExerciseRunner(routine, currentEx) {
    if (!currentEx) return '';

    const exIndex = this.currentExerciseIndex;
    const totalExercises = routine.exercises.length;
    const matches = (currentEx.repsRange || '').match(/\d+/g);
    const defaultReps = matches && matches.length > 0 ? parseInt(matches[matches.length - 1], 10) : 12;

    // Retrieve persistent draft for this exercise so completed sets are never lost
    const setsDraft = storage.getExerciseDraft(
      routine.id,
      currentEx.id,
      currentEx.seriesCount,
      currentEx.defaultPlates,
      defaultReps
    );
    const completedInCurrentEx = setsDraft.filter(s => s.completed).length;

    const unitLabel = currentEx.equipmentType === 'dumbbell'
      ? 'NIVEL / MANCUERNA'
      : currentEx.equipmentType === 'bodyweight'
      ? 'NIVEL / LASTRADO'
      : 'PLACAS (10 LB C/U)';

    return `
      <!-- Interactive Exercise Stepper & Direct Jump Bar -->
      <div class="glass-card rounded-2xl p-3 border border-white/10 space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <button id="btn-prev-exercise" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono font-bold flex items-center gap-1 active:scale-95" ${exIndex === 0 ? 'disabled' : ''}>
            ◀ Anterior
          </button>

          <div class="text-center">
            <span class="text-[11px] font-mono text-orange-400 font-bold uppercase tracking-wider">
              EJERCICIO ${exIndex + 1} DE ${totalExercises} • ${completedInCurrentEx}/${currentEx.seriesCount} SERIES HECHAS
            </span>
          </div>

          <button id="btn-next-exercise" class="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono font-bold flex items-center gap-1 active:scale-95" ${exIndex === totalExercises - 1 ? 'disabled' : ''}>
            Siguiente ▶
          </button>
        </div>

        <!-- Clickable Exercise Pills for Quick Navigation -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          ${routine.exercises.map((ex, i) => {
            const exRepsMatch = (ex.repsRange || '').match(/\d+/g);
            const exDefReps = exRepsMatch ? parseInt(exRepsMatch[exRepsMatch.length - 1], 10) : 12;
            const draft = storage.getExerciseDraft(routine.id, ex.id, ex.seriesCount, ex.defaultPlates, exDefReps);
            const doneCount = draft.filter(s => s.completed).length;
            const allDone = doneCount === ex.seriesCount;
            const isCurrent = i === exIndex;
            return `
              <button class="exercise-jump-pill shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 border ${
                isCurrent
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/30'
                  : allDone
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
              }" data-ex-index="${i}">
                <span>${i + 1}. ${ex.name.split('(')[0].trim().slice(0, 22)}</span>
                <span class="px-1.5 py-0.2 rounded text-[9px] ${allDone ? 'bg-emerald-500 text-black font-black' : 'bg-black/40 text-gray-300'}">${allDone ? '✓' : `${doneCount}/${ex.seriesCount}`}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- RESPONSIVE 2-COLUMN GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- ============================================== -->
        <!-- LEFT COLUMN: Biomechanical Visualizer & Guides -->
        <!-- ============================================== -->
        <div class="lg:col-span-7 space-y-4">
          ${renderBiomechanicalPanel(currentEx)}

          <!-- Action Buttons Bar: Video & 3-Phase Step-by-Step & Tempo Pacer -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button id="btn-watch-video" class="px-3 py-2.5 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <i data-lucide="video" class="w-4 h-4"></i> 🎥 Ver Video Demo
            </button>

            <button id="btn-view-steps" class="px-3 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs shadow-md shadow-cyan-950/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <i data-lucide="layers" class="w-4 h-4"></i> 🔍 3 Fases + Respiración
            </button>

            <button id="btn-open-tempo-modal" class="px-3 py-2.5 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 font-bold text-xs shadow-md shadow-orange-950/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <i data-lucide="activity" class="w-4 h-4"></i> ⏱️ Metrónomo ${currentEx.tempo}
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- RIGHT COLUMN: Series Logging & Machine Control -->
        <!-- ============================================== -->
        <div class="lg:col-span-5 space-y-4">
          <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-3.5">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold">
                  ${currentEx.seriesCount} Series × ${currentEx.repsRange}
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                  Descanso: ${currentEx.restSeconds}s
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                  Tempo: ${currentEx.tempo}
                </span>
              </div>
              <h3 class="text-xl font-black text-white leading-tight">
                ${currentEx.name}
              </h3>
            </div>

            <!-- Quick Summary of Station & Pin -->
            <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1.5 text-xs">
              <div class="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold flex items-center justify-between">
                <span>⚙️ RESUMEN DE ESTACIÓN</span>
                <span class="text-orange-400 font-mono">${currentEx.equipmentType === 'dumbbell' ? '2 MANCUERNAS' : currentEx.equipmentType === 'bodyweight' ? 'PESO CORPORAL' : 'MARCY 150 LB'}</span>
              </div>
              <div class="space-y-1 text-gray-200">
                <div><span class="text-cyan-400 font-bold">• Estación:</span> ${currentEx.station}</div>
                <div><span class="text-cyan-400 font-bold">• Accesorio:</span> ${currentEx.attachment}</div>
                <div><span class="text-orange-400 font-bold">• Configuración:</span> ${currentEx.pinConfig}</div>
              </div>
            </div>

            <!-- Series Logging Table (Persisted in Real Time) -->
            <div class="space-y-2 pt-2 border-t border-white/10">
              <div class="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase px-1">
                <span>SERIE</span>
                <span class="text-center">${unitLabel}</span>
                <span class="text-center">REPETICIONES</span>
                <span class="text-right">ESTADO</span>
              </div>

              <div class="space-y-2" id="series-inputs-container">
                ${setsDraft.map((setObj, sIdx) => {
                  const platesVal = setObj.plates;
                  const repsVal = setObj.reps;
                  const isDone = Boolean(setObj.completed);
                  const lbVal = platesVal * 10;
                  return `
                    <div class="set-row flex items-center justify-between gap-2 p-2.5 rounded-2xl transition-all border ${isDone ? 'border-emerald-500/50 bg-emerald-950/20' : 'bg-slate-900/90 border-white/5'}" data-set-index="${sIdx}">
                      <div class="w-7 h-7 rounded-xl ${isDone ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-300'} flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        S${sIdx + 1}
                      </div>

                      <div class="flex items-center gap-1">
                        <input type="number" class="set-plates-input w-12 px-1.5 py-1.5 rounded-xl bg-black border border-white/15 text-white font-mono font-bold text-center text-sm focus:border-orange-500 outline-none" value="${platesVal}" min="0" max="15" step="1" data-set-index="${sIdx}">
                        <span class="text-[10px] font-mono text-cyan-400 font-bold set-lb-indicator">(${lbVal} lb)</span>
                      </div>

                      <div class="flex items-center gap-1">
                        <input type="number" class="set-reps-input w-12 px-1.5 py-1.5 rounded-xl bg-black border border-white/15 text-white font-mono font-bold text-center text-sm focus:border-orange-500 outline-none" value="${repsVal}" min="1" max="60" data-set-index="${sIdx}">
                        <span class="text-[10px] font-mono text-gray-400">reps</span>
                      </div>

                      <button class="btn-complete-set px-3 py-1.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1 active:scale-90 shrink-0 ${isDone ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30' : 'bg-white/10 hover:bg-emerald-500 hover:text-black border-white/10 text-gray-200'}" data-set-index="${sIdx}" data-rest="${currentEx.restSeconds}">
                        <span>${isDone ? '✓ Hecho' : '✓ Marcar'}</span>
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>

              <p class="text-[11px] text-gray-400 font-mono text-center pt-1">
                💾 Tus series se guardan automáticamente aunque cambies de ejercicio
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rest Timer HUD Overlay -->
      <div id="rest-timer-hud" class="fixed inset-x-4 bottom-24 z-50 hidden transition-all duration-300 max-w-lg mx-auto">
        <div class="glass-card rounded-3xl p-4 border border-orange-500/50 bg-[#090D16]/95 backdrop-blur-xl shadow-2xl shadow-orange-950/90 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg class="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#1E293B" stroke-width="4" fill="none" />
                <circle id="rest-circle-progress" cx="24" cy="24" r="20" stroke="#F97316" stroke-width="4" fill="none" stroke-dasharray="125.6" stroke-dashoffset="0" stroke-linecap="round" />
              </svg>
              <span id="rest-seconds-display" class="absolute font-mono font-black text-sm text-white">90</span>
            </div>

            <div>
              <div class="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider animate-pulse">
                RECUPERACIÓN MUSCULAR
              </div>
              <div class="text-xs text-gray-300">
                Respira profundo por la nariz y prepárate para la siguiente serie
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button id="btn-add-rest" class="px-2.5 py-1.5 rounded-xl bg-white/10 text-white font-mono text-xs hover:bg-white/20 active:scale-95">
              +15s
            </button>
            <button id="btn-skip-rest" class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs active:scale-95">
              Listo ⚡
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindWorkoutEvents() {
    const routine = this.activeRoutine;
    const currentEx = routine && routine.exercises ? routine.exercises[this.currentExerciseIndex] : null;
    const matches = currentEx ? (currentEx.repsRange || '').match(/\d+/g) : null;
    const defaultReps = matches && matches.length > 0 ? parseInt(matches[matches.length - 1], 10) : 12;

    // Routine selector pills
    document.querySelectorAll('.routine-select-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-routine');
        const found = WORKOUT_ROUTINES.find(r => r.id === id);
        if (found) {
          notify.vibrate([30]);
          this.activeRoutine = found;
          this.currentExerciseIndex = 0;
          this.render();
        }
      });
    });

    // Direct exercise jump pills
    document.querySelectorAll('.exercise-jump-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const idx = parseInt(pill.getAttribute('data-ex-index'), 10);
        if (!isNaN(idx) && idx >= 0 && idx < routine.exercises.length) {
          notify.vibrate([25]);
          this.currentExerciseIndex = idx;
          this.render();
        }
      });
    });

    // Switch to Today's routine button
    const switchTodayBtn = document.getElementById('btn-switch-to-today-routine');
    if (switchTodayBtn) {
      switchTodayBtn.addEventListener('click', () => {
        const todayPlan = getRoutineForDay(new Date().getDay());
        if (todayPlan.type === 'workout' && todayPlan.routine) {
          this.activeRoutine = todayPlan.routine;
          this.currentExerciseIndex = 0;
          notify.vibrate([40]);
          this.render();
        }
      });
    }

    // Previous / Next Exercise Buttons
    const prevBtn = document.getElementById('btn-prev-exercise');
    const nextBtn = document.getElementById('btn-next-exercise');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentExerciseIndex > 0) {
          notify.vibrate([30]);
          this.currentExerciseIndex--;
          this.render();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentExerciseIndex < this.activeRoutine.exercises.length - 1) {
          notify.vibrate([30]);
          this.currentExerciseIndex++;
          this.render();
        }
      });
    }

    // Video demo modal
    const videoBtn = document.getElementById('btn-watch-video');
    if (videoBtn && currentEx) {
      videoBtn.addEventListener('click', () => {
        this.openVideoModal(currentEx);
      });
    }

    // Step by step 3-phase guide modal
    const stepsBtn = document.getElementById('btn-view-steps');
    if (stepsBtn && currentEx) {
      stepsBtn.addEventListener('click', () => {
        this.openStepByStepModal(currentEx);
      });
    }

    // Open Tempo Metronome modal
    const tempoBtn = document.getElementById('btn-open-tempo-modal');
    if (tempoBtn && currentEx) {
      tempoBtn.addEventListener('click', () => {
        this.openTempoModal(currentEx);
      });
    }

    // Photo / SVG View Toggles
    const photoBtn = document.getElementById('btn-toggle-view-photo');
    const svgBtn = document.getElementById('btn-toggle-view-svg');
    const photoViewport = document.getElementById('exercise-visual-photo');
    const svgViewport = document.getElementById('exercise-visual-svg');

    if (photoBtn && svgBtn && photoViewport && svgViewport) {
      photoBtn.addEventListener('click', () => {
        photoViewport.classList.remove('hidden');
        svgViewport.classList.add('hidden');
        photoBtn.classList.add('bg-orange-500', 'text-white', 'font-bold');
        photoBtn.classList.remove('text-gray-400');
        svgBtn.classList.remove('bg-orange-500', 'text-white', 'font-bold');
        svgBtn.classList.add('text-gray-400');
        notify.vibrate([20]);
      });

      svgBtn.addEventListener('click', () => {
        photoViewport.classList.add('hidden');
        svgViewport.classList.remove('hidden');
        svgBtn.classList.add('bg-orange-500', 'text-white', 'font-bold');
        svgBtn.classList.remove('text-gray-400');
        photoBtn.classList.remove('bg-orange-500', 'text-white', 'font-bold');
        photoBtn.classList.add('text-gray-400');
        notify.vibrate([20]);
      });
    }

    if (photoViewport && currentEx) {
      photoViewport.addEventListener('click', () => {
        this.openStepByStepModal(currentEx);
      });
    }

    // Persist Plates & Reps changes in real time
    document.querySelectorAll('.set-row').forEach((row) => {
      const sIdx = parseInt(row.getAttribute('data-set-index'), 10);
      const platesInput = row.querySelector('.set-plates-input');
      const repsInput = row.querySelector('.set-reps-input');
      const lbIndicator = row.querySelector('.set-lb-indicator');

      if (platesInput && currentEx) {
        platesInput.addEventListener('change', () => {
          const val = Math.max(0, Math.min(15, parseInt(platesInput.value, 10) || 0));
          if (lbIndicator) lbIndicator.textContent = `(${val * 10} lb)`;
          storage.updateExerciseSetDraft(
            routine.id,
            currentEx.id,
            sIdx,
            { plates: val },
            currentEx.seriesCount,
            currentEx.defaultPlates,
            defaultReps
          );
        });
        platesInput.addEventListener('input', () => {
          const val = Math.max(0, parseInt(platesInput.value, 10) || 0);
          if (lbIndicator) lbIndicator.textContent = `(${val * 10} lb)`;
        });
      }

      if (repsInput && currentEx) {
        repsInput.addEventListener('change', () => {
          const val = Math.max(1, Math.min(100, parseInt(repsInput.value, 10) || defaultReps));
          storage.updateExerciseSetDraft(
            routine.id,
            currentEx.id,
            sIdx,
            { reps: val },
            currentEx.seriesCount,
            currentEx.defaultPlates,
            defaultReps
          );
        });
      }
    });

    // Complete Set Buttons (Persisted)
    document.querySelectorAll('.btn-complete-set').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!currentEx) return;
        const sIdx = parseInt(btn.getAttribute('data-set-index'), 10);
        const row = btn.closest('.set-row');
        const platesInput = row ? row.querySelector('.set-plates-input') : null;
        const repsInput = row ? row.querySelector('.set-reps-input') : null;
        const platesVal = platesInput ? (parseInt(platesInput.value, 10) || currentEx.defaultPlates) : currentEx.defaultPlates;
        const repsVal = repsInput ? (parseInt(repsInput.value, 10) || defaultReps) : defaultReps;
        const restSec = parseInt(btn.getAttribute('data-rest'), 10) || 90;

        const currentDraft = storage.getExerciseDraft(routine.id, currentEx.id, currentEx.seriesCount, currentEx.defaultPlates, defaultReps);
        const wasCompleted = currentDraft[sIdx] && currentDraft[sIdx].completed;
        const nextCompleted = !wasCompleted;

        storage.updateExerciseSetDraft(
          routine.id,
          currentEx.id,
          sIdx,
          { plates: platesVal, reps: repsVal, completed: nextCompleted },
          currentEx.seriesCount,
          currentEx.defaultPlates,
          defaultReps
        );

        if (nextCompleted) {
          sound.playSetCompleted();
          notify.vibrateSetCompleted();
          this.startRestTimer(restSec);
        } else {
          notify.vibrate([30]);
        }
      });
    });

    // Rest Timer HUD buttons
    const skipRestBtn = document.getElementById('btn-skip-rest');
    if (skipRestBtn) {
      skipRestBtn.addEventListener('click', () => this.stopRestTimer());
    }

    const addRestBtn = document.getElementById('btn-add-rest');
    if (addRestBtn) {
      addRestBtn.addEventListener('click', () => {
        this.restSecondsLeft += 15;
        this.totalRestSeconds += 15;
        notify.vibrate([30]);
      });
    }

    // Finish Workout Button
    const finishBtn = document.getElementById('btn-finish-workout-session');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => this.finishWorkoutSession());
    }
  }

  startRestTimer(seconds) {
    if (this.restTimerInterval) clearInterval(this.restTimerInterval);

    this.restSecondsLeft = seconds;
    this.totalRestSeconds = seconds;

    const hud = document.getElementById('rest-timer-hud');
    const display = document.getElementById('rest-seconds-display');
    const circle = document.getElementById('rest-circle-progress');

    if (hud) hud.classList.remove('hidden');

    const circumference = 2 * Math.PI * 20;

    const updateDisplay = () => {
      if (display) display.textContent = this.restSecondsLeft;

      if (circle) {
        const fraction = this.restSecondsLeft / this.totalRestSeconds;
        const offset = circumference - fraction * circumference;
        circle.style.strokeDashoffset = offset;
      }

      if (this.restSecondsLeft <= 3 && this.restSecondsLeft >= 1) {
        sound.playCountdown(this.restSecondsLeft);
        notify.vibrate([100]);
      } else if (this.restSecondsLeft === 0) {
        sound.playRestFinished();
        notify.vibrateRestDone();
        this.stopRestTimer();
        notify.showInAppToast('¡Tiempo de descanso cumplido! A por la siguiente serie 💪', 'success');
      }
    };

    updateDisplay();

    this.restTimerInterval = setInterval(() => {
      this.restSecondsLeft--;
      updateDisplay();
      if (this.restSecondsLeft < 0) {
        this.stopRestTimer();
      }
    }, 1000);
  }

  stopRestTimer() {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval);
      this.restTimerInterval = null;
    }
    const hud = document.getElementById('rest-timer-hud');
    if (hud) hud.classList.add('hidden');
  }

  openStepByStepModal(exercise) {
    notify.vibrate([40]);
    const steps = exercise.stepByStep || [];
    const youtubeId = exercise.youtubeId || 'xUm0BiZCWlQ';
    const directUrl = exercise.videoUrl || `https://www.youtube.com/watch?v=${youtubeId}`;
    const imgUrl = exercise.image || './assets/chest_press.jpg';
    const tempoParts = (exercise.tempo || '1-1-3').split('-');
    const concBadge = `${tempoParts[0] || 1}s FUERZA + ${tempoParts[1] || 1}s PAUSA`;
    const eccBadge = `${tempoParts[2] || 3}s REGRESO LENTO`;

    const content = `
      <div class="space-y-4 text-left">
        <div class="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
          <img src="${imgUrl}" alt="${exercise.name}" class="w-full h-[210px] sm:h-[250px] object-cover object-center" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none"></div>
          <div class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-orange-400 border border-orange-500/40">
            ${exercise.station}
          </div>
          <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-white drop-shadow-md">
              ${exercise.name}
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500 text-white font-bold shrink-0">
              Tempo: ${exercise.tempo}
            </span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>LAS 3 FASES DEL MOVIMIENTO</span>
            <span class="text-cyan-400 font-mono">${exercise.repsRange}</span>
          </div>

          ${steps.map((st, i) => `
            <div class="glass-card rounded-2xl p-4 border border-white/10 space-y-2 bg-gradient-to-r ${i === 0 ? 'from-cyan-950/25 to-black/50' : i === 1 ? 'from-orange-950/25 to-black/50' : 'from-purple-950/25 to-black/50'}">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg ${i === 0 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : i === 1 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'} flex items-center justify-center font-mono font-black text-xs">
                    ${i + 1}
                  </span>
                  <h4 class="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    ${st.phase}
                  </h4>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300 font-bold shrink-0">
                  ${i === 0 ? 'PREPARACIÓN' : i === 1 ? concBadge : eccBadge}
                </span>
              </div>

              <p class="text-xs text-gray-200 leading-relaxed pl-8">
                ${st.action}
              </p>

              <div class="ml-8 p-2 rounded-xl bg-black/50 border border-white/10 flex items-center gap-2 text-[11px] text-cyan-300 font-mono">
                <span>🌬️</span>
                <span><strong>Respiración:</strong> ${st.breathing}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="p-4 rounded-2xl bg-black/85 border border-white/10 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold text-white">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>VIDEO DEMOSTRATIVO DE TÉCNICA</span>
            </div>
            <a href="${directUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-bold">
              <span>Abrir en YouTube</span> ↗
            </a>
          </div>

          <div class="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            <iframe 
              class="w-full h-full" 
              src="https://www.youtube.com/embed/${youtubeId}?rel=0&enablejsapi=1" 
              title="${exercise.name}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          </div>

          <a href="${directUrl}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all active:scale-95">
            <span>▶ Abrir Video Directamente en YouTube</span>
          </a>
        </div>
      </div>
    `;

    this.showModal(`🔍 Guía Paso a Paso // ${exercise.name}`, content);
    this.refreshIcons();
  }

  openVideoModal(exercise) {
    this.openStepByStepModal(exercise);
  }

  openTempoModal(exercise) {
    notify.vibrate([40]);
    if (this.activePacerTimer) {
      clearInterval(this.activePacerTimer);
      this.activePacerTimer = null;
    }

    const matches = (exercise.repsRange || '').match(/\d+/g);
    let targetReps = matches && matches.length > 0 ? parseInt(matches[matches.length - 1], 10) : 12;
    if (isNaN(targetReps) || targetReps <= 0) targetReps = 12;

    const tempoParts = (exercise.tempo || '1-1-3').split('-').map(n => parseInt(n, 10) || 0);
    const concSec = Math.max(1, tempoParts[0] || 1);
    const holdSec = Math.max(0, tempoParts[1] !== undefined ? tempoParts[1] : 1);
    const eccSec = Math.max(1, tempoParts[2] || 3);
    const totalSecPerRep = concSec + holdSec + eccSec;

    let repsCompletedInPacer = 0;
    let goalAlarmTriggered = false;
    let isPacing = false;
    let secInRep = 0;

    const modalContent = `
      <div class="text-center space-y-4" id="tempo-pacer-box">
        <div class="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/10 pb-2">
          <span class="truncate max-w-[220px] text-white font-bold">${exercise.name}</span>
          <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">Tempo: ${exercise.tempo}</span>
        </div>

        <div class="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
          <div class="text-left">
            <span class="text-[10px] font-mono text-gray-400 block uppercase font-bold tracking-wider">Objetivo de Serie</span>
            <span class="text-xs text-white font-bold">Meta de Repeticiones con Alarma</span>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-tempo-minus-reps" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center active:scale-95 transition-all">
              -
            </button>
            <div class="flex items-center gap-1 font-mono">
              <span id="tempo-target-reps-val" class="text-xl font-black text-orange-400">${targetReps}</span>
              <span class="text-xs text-gray-400">reps</span>
            </div>
            <button id="btn-tempo-plus-reps" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center active:scale-95 transition-all">
              +
            </button>
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px] font-mono">
            <span class="text-gray-400">Progreso Serie Actual:</span>
            <span id="tempo-reps-progress-text" class="text-orange-400 font-bold">0 / ${targetReps} reps</span>
          </div>
          <div class="w-full h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
            <div id="tempo-progress-bar" class="h-full bg-gradient-to-r from-orange-500 to-emerald-400 w-0 transition-all duration-300"></div>
          </div>
        </div>

        <div class="relative w-36 h-36 mx-auto flex items-center justify-center my-1">
          <div id="tempo-glow-ring" class="absolute inset-0 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 transition-all duration-300"></div>
          <div id="tempo-core-circle" class="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300">
            <span id="tempo-phase-text" class="text-[10px] font-mono font-black uppercase tracking-wider text-center px-1">LISTO</span>
            <span id="tempo-seconds-counter" class="text-2xl font-black font-mono">--</span>
          </div>
        </div>

        <div id="tempo-instruction-text" class="text-xs font-bold text-white px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 leading-snug min-h-[46px] flex items-center justify-center">
          Toca "Iniciar Marcapasos" para guiar cada repetición con voz sintética y alarma final
        </div>

        <div id="tempo-alarm-banner" class="hidden p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-black border border-emerald-500/60 text-center space-y-2">
          <div class="text-xs font-black text-emerald-300 flex items-center justify-center gap-1.5">
            <span class="text-base">🔔</span>
            <span id="tempo-alarm-banner-text">¡ALARMA ACTIVADA // META CUMPLIDA!</span>
          </div>
          <p class="text-[11px] text-gray-300">
            Registra automáticamente esta serie como completada e inicia tu descanso.
          </p>
          <button id="btn-tempo-start-rest" class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs shadow-lg shadow-emerald-950/80 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>✅ Guardar Serie + Descansar ${exercise.restSeconds || 90}s</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <button id="btn-toggle-tempo-pacer" class="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5">
            ▶ Iniciar Marcapasos
          </button>
          <button id="btn-stop-tempo-pacer" class="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs active:scale-95 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    `;

    this.showModal(`⏱️ Marcapasos & Alarma // ${exercise.tempo}`, modalContent);

    const toggleBtn = document.getElementById('btn-toggle-tempo-pacer');
    const stopBtn = document.getElementById('btn-stop-tempo-pacer');
    const phaseText = document.getElementById('tempo-phase-text');
    const secCounter = document.getElementById('tempo-seconds-counter');
    const instrText = document.getElementById('tempo-instruction-text');
    const repsProgressText = document.getElementById('tempo-reps-progress-text');
    const progressBar = document.getElementById('tempo-progress-bar');
    const glowRing = document.getElementById('tempo-glow-ring');
    const coreCircle = document.getElementById('tempo-core-circle');
    const targetRepsVal = document.getElementById('tempo-target-reps-val');
    const minusBtn = document.getElementById('btn-tempo-minus-reps');
    const plusBtn = document.getElementById('btn-tempo-plus-reps');
    const alarmBanner = document.getElementById('tempo-alarm-banner');
    const startRestBtn = document.getElementById('btn-tempo-start-rest');

    const updateProgressBar = () => {
      if (repsProgressText) {
        repsProgressText.textContent = `${repsCompletedInPacer} / ${targetReps} reps`;
        if (repsCompletedInPacer >= targetReps) {
          repsProgressText.className = 'text-emerald-400 font-black';
        }
      }
      if (progressBar) {
        const pct = Math.min(100, Math.round((repsCompletedInPacer / targetReps) * 100));
        progressBar.style.width = `${pct}%`;
        if (pct >= 100) {
          progressBar.className = 'h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-300';
        }
      }
    };

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        if (targetReps > 1) {
          targetReps--;
          if (targetRepsVal) targetRepsVal.textContent = targetReps;
          updateProgressBar();
          notify.vibrate([20]);
        }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        if (targetReps < 40) {
          targetReps++;
          if (targetRepsVal) targetRepsVal.textContent = targetReps;
          updateProgressBar();
          notify.vibrate([20]);
        }
      });
    }

    if (startRestBtn) {
      startRestBtn.addEventListener('click', () => {
        if (this.activePacerTimer) {
          clearInterval(this.activePacerTimer);
          this.activePacerTimer = null;
        }
        // Automatically mark the first uncompleted serie of this exercise as completed!
        if (this.activeRoutine) {
          const draft = storage.getExerciseDraft(
            this.activeRoutine.id,
            exercise.id,
            exercise.seriesCount,
            exercise.defaultPlates,
            targetReps
          );
          const nextIncompleteIdx = draft.findIndex(s => !s.completed);
          const idxToMark = nextIncompleteIdx >= 0 ? nextIncompleteIdx : draft.length - 1;
          storage.updateExerciseSetDraft(
            this.activeRoutine.id,
            exercise.id,
            idxToMark,
            { reps: repsCompletedInPacer || targetReps, completed: true },
            exercise.seriesCount,
            exercise.defaultPlates,
            targetReps
          );
        }
        this.closeModal();
        this.startRestTimer(exercise.restSeconds || 90);
      });
    }

    const runTempoTick = () => {
      secInRep++;

      if (secInRep <= concSec) {
        phaseText.textContent = 'FUERZA';
        secCounter.textContent = `${secInRep}s`;
        instrText.innerHTML = '💥 <strong class="text-cyan-300">Empuja / Jala con fuerza</strong> (Exhala el aire)';
        glowRing.className = 'absolute inset-0 rounded-full bg-cyan-500/30 border-2 border-cyan-400 scale-110 transition-all duration-300';
        coreCircle.className = 'w-24 h-24 rounded-full bg-cyan-500 flex flex-col items-center justify-center text-black shadow-xl transition-all duration-300';
        sound.playTempoTick('concentric');
        notify.vibrate([35]);
      } else if (secInRep <= concSec + holdSec) {
        const holdCurrent = secInRep - concSec;
        phaseText.textContent = 'APRIETA';
        secCounter.textContent = `${holdCurrent}s`;
        instrText.innerHTML = '🔥 <strong class="text-emerald-300">¡Contracción máxima!</strong> Aprieta el músculo 1s';
        glowRing.className = 'absolute inset-0 rounded-full bg-emerald-500/30 border-2 border-emerald-400 scale-125 transition-all duration-300';
        coreCircle.className = 'w-24 h-24 rounded-full bg-emerald-500 flex flex-col items-center justify-center text-black shadow-xl transition-all duration-300';
        sound.playTempoTick('hold');
        notify.vibrate([50]);
      } else if (secInRep <= totalSecPerRep) {
        const eccCurrent = secInRep - (concSec + holdSec);
        const eccRemaining = totalSecPerRep - secInRep + 1;
        phaseText.textContent = 'REGRESA';
        secCounter.textContent = `${eccRemaining}s`;
        instrText.innerHTML = `⏳ <strong class="text-orange-300">Bajada controlada (${eccRemaining}s)</strong> — inhala y resiste el peso`;
        glowRing.className = 'absolute inset-0 rounded-full bg-orange-500/20 border-2 border-orange-400 scale-95 transition-all duration-300';
        coreCircle.className = 'w-24 h-24 rounded-full bg-orange-600 flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300';
        sound.playTempoTick('eccentric', eccCurrent);
        notify.vibrate([25]);

        if (secInRep === totalSecPerRep) {
          repsCompletedInPacer++;
          secInRep = 0;
          updateProgressBar();

          if (repsCompletedInPacer >= targetReps && !goalAlarmTriggered) {
            goalAlarmTriggered = true;
            sound.playRepGoalAlarm();
            notify.vibrate([150, 80, 200, 80, 300, 100, 400]);
            notify.showInAppToast(`🔔 ¡Meta cumplida! ${targetReps} repeticiones completadas.`, 'success');

            if (this.activePacerTimer) {
              clearInterval(this.activePacerTimer);
              this.activePacerTimer = null;
            }
            isPacing = false;

            if (toggleBtn) {
              toggleBtn.textContent = '▶ Hacer +Reps al Fallo';
              toggleBtn.className = 'w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5';
            }

            phaseText.textContent = '¡META!';
            secCounter.textContent = '🏆';
            instrText.innerHTML = `🎉 <strong class="text-yellow-400">¡Alarma de Serie Cumplida!</strong> Completaste <strong>${targetReps} reps</strong> con tempo perfecto.`;
            glowRing.className = 'absolute inset-0 rounded-full bg-yellow-400/40 border-4 border-yellow-400 scale-125 animate-pulse transition-all duration-300';
            coreCircle.className = 'w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex flex-col items-center justify-center text-black font-black shadow-2xl transition-all duration-300';

            if (alarmBanner) {
              const bannerText = document.getElementById('tempo-alarm-banner-text');
              if (bannerText) bannerText.textContent = `¡META DE ${targetReps} REPETICIONES CUMPLIDA!`;
              alarmBanner.classList.remove('hidden');
              alarmBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }
      }
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (!isPacing) {
          isPacing = true;
          toggleBtn.textContent = '⏸ Pausar';
          toggleBtn.className = 'w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-lg shadow-yellow-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5';
          runTempoTick();
          this.activePacerTimer = setInterval(runTempoTick, 1000);
        } else {
          isPacing = false;
          toggleBtn.textContent = '▶ Reanudar';
          toggleBtn.className = 'w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5';
          if (this.activePacerTimer) {
            clearInterval(this.activePacerTimer);
            this.activePacerTimer = null;
          }
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (this.activePacerTimer) {
          clearInterval(this.activePacerTimer);
          this.activePacerTimer = null;
        }
        isPacing = false;
        secInRep = 0;
        this.closeModal();
      });
    }
  }

  finishWorkoutSession() {
    notify.vibrate([100, 50, 150]);
    sound.playRepGoalAlarm();

    const routine = this.activeRoutine;
    let totalReps = 0;
    let totalVolumeLb = 0;
    let completedSetsCount = 0;
    const exerciseResults = [];

    if (routine && routine.exercises) {
      for (const ex of routine.exercises) {
        const matches = (ex.repsRange || '').match(/\d+/g);
        const defReps = matches && matches.length > 0 ? parseInt(matches[matches.length - 1], 10) : 12;
        const draftSets = storage.getExerciseDraft(routine.id, ex.id, ex.seriesCount, ex.defaultPlates, defReps);

        // Include sets marked completed; if none marked on an exercise, include all drafted sets
        const activeSets = draftSets.some(s => s.completed) ? draftSets.filter(s => s.completed) : draftSets;
        const rowSets = [];

        for (const s of activeSets) {
          const plates = parseInt(s.plates, 10) || ex.defaultPlates;
          const reps = parseInt(s.reps, 10) || defReps;
          rowSets.push({ plates, reps });
          totalVolumeLb += (plates * 10) * reps;
          totalReps += reps;
          completedSetsCount++;
        }

        exerciseResults.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets: rowSets
        });
      }
    }

    const sessionData = {
      id: 'session-' + Date.now(),
      date: getTodayKey(),
      routineId: routine.id,
      routineTitle: routine.title,
      durationMinutes: routine.estimatedMinutes || 50,
      totalVolumeLb,
      totalReps,
      completedSets: completedSetsCount,
      exerciseResults
    };

    const newPRs = storage.recordWorkoutSession(sessionData) || [];

    const summaryHtml = `
      <div class="text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-3xl flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
          🏆
        </div>
        <div>
          <h3 class="text-xl font-black text-white">¡Entrenamiento Completado, César!</h3>
          <p class="text-xs text-gray-300 mt-1">
            ${routine.title} registrado con tus cargas y repeticiones reales.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/50 border border-white/10 font-mono">
          <div>
            <div class="text-[10px] text-gray-400">VOLUMEN REAL</div>
            <div class="text-sm font-bold text-orange-400">${totalVolumeLb.toLocaleString()} lb</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-400">SERIES / REPS</div>
            <div class="text-sm font-bold text-cyan-400">${completedSetsCount} (${totalReps}r)</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-400">RACHA</div>
            <div class="text-sm font-bold text-emerald-400">${storage.state.streak.current} días 🔥</div>
          </div>
        </div>

        ${newPRs.length > 0 ? `
          <div class="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-left space-y-1.5">
            <div class="text-[11px] font-mono font-bold text-emerald-400 uppercase">
              ⚡ Nuevos Récords Personales Hoy (${newPRs.length}):
            </div>
            <div class="space-y-1 max-h-28 overflow-y-auto">
              ${newPRs.map(pr => `
                <div class="flex items-center justify-between text-xs text-gray-200 font-mono">
                  <span class="truncate pr-2">• ${pr.exerciseName}</span>
                  <span class="text-orange-400 font-bold shrink-0">${pr.plates} placas × ${pr.reps} reps</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-200">
          🥤 <strong>Siguiente paso crucial:</strong> Prepara tu <strong>Batido Hipercalórico de 755 kcal + 5g de Creatina</strong> para recuperar y construir masa muscular.
        </div>

        <button id="btn-confirm-workout-finish" class="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/40 active:scale-95 transition-all">
          Ir al Batido & Nutrición 🥤
        </button>
      </div>
    `;

    this.showModal('¡Sesión Registrada con Éxito!', summaryHtml);

    const confirmBtn = document.getElementById('btn-confirm-workout-finish');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.closeModal();
        this.switchTab('nutrition');
      });
    }
  }

  // ==========================================
  // TAB 3: GUÍA VISUAL MARCY (MWM-4965SC + 2 MANCUERNAS)
  // ==========================================
  renderMarcyGuideTab() {
    const allExercises = [];
    WORKOUT_ROUTINES.forEach((r) => {
      if (r.exercises) {
        r.exercises.forEach((ex) => {
          allExercises.push({ ...ex, dayId: r.id, dayTitle: r.dayName });
        });
      }
    });

    const selectedFilter = this.marcyGuideStationFilter || 'all';
    const stationMatchMap = {
      'press-arm': ['Chest Press', 'Butterfly', 'Pec Deck', 'Respaldo de la Marcy', 'Superserie'],
      'high-pulley': ['Polea Alta'],
      'low-pulley': ['Polea Baja'],
      'leg-developer': ['Desarrollador de Piernas'],
      'dumbbells': ['2 Mancuernas', 'Mancuerna', 'Suelo / Tapete']
    };

    const filteredExercises = selectedFilter === 'all'
      ? allExercises
      : allExercises.filter((ex) => {
          const keywords = stationMatchMap[selectedFilter] || [];
          const stationText = `${ex.station || ''} ${ex.machineSetup?.station || ''}`;
          return keywords.some(k => stationText.toLowerCase().includes(k.toLowerCase()));
        });

    return `
      <div class="space-y-5 animate-fade-in pb-16">
        <!-- Blueprint Header -->
        <div class="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                MANUAL TÉCNICO INTERACTIVO • 18 EJERCICIOS EXPLICADOS
              </span>
              <h2 class="text-2xl font-black text-white mt-1">
                Marcy MWM-4965SC + 2 Mancuernas
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">
                Configuración paso a paso de estaciones, seguro Dual-Function, poleas y catálogo interactivo de ejercicios
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg font-mono font-black shrink-0">
              150#
            </div>
          </div>

          <!-- Machine Specs Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-white/5 font-mono text-xs">
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 uppercase block">Torre de Pesas</span>
              <span class="font-bold text-orange-400">14 placas (10 lb c/u)</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 uppercase block">Brazos Duales</span>
              <span class="font-bold text-cyan-400">Press & Butterfly</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 uppercase block">Poleas</span>
              <span class="font-bold text-emerald-400">Alta y Baja (Acero)</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 uppercase block">Desarrollador</span>
              <span class="font-bold text-purple-400">Rodillos de Espuma</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
              <span class="text-[10px] text-gray-500 uppercase block">Peso Libre</span>
              <span class="font-bold text-amber-400">2 Mancuernas</span>
            </div>
          </div>
        </div>

        <!-- Interactive Pin Mode Guide -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="glass-card rounded-2xl p-4 border border-orange-500/30 bg-orange-950/10">
            <div class="flex items-center gap-2">
              <span class="text-lg">🔒</span>
              <h3 class="text-sm font-bold text-white">Modo Chest Press (Pasador Puesto)</h3>
            </div>
            <p class="text-xs text-gray-300 mt-1.5 leading-relaxed">
              El pasador metálico superior bloquea ambos brazos en un solo bloque rígido. Úsalo para <strong>Press de Pecho Horizontal</strong> (Lunes) y <strong>Press Agarre Neutro Cerrado</strong> (Miércoles).
            </p>
            <div class="mt-2 text-[11px] font-mono text-orange-400">
              ✓ Verifica que el pin atraviese completamente la articulación superior.
            </div>
          </div>

          <div class="glass-card rounded-2xl p-4 border border-cyan-500/30 bg-cyan-950/10">
            <div class="flex items-center gap-2">
              <span class="text-lg">🔓</span>
              <h3 class="text-sm font-bold text-white">Modo Pec Deck / Butterfly (Pasador Retirado)</h3>
            </div>
            <p class="text-xs text-gray-300 mt-1.5 leading-relaxed">
              Al retirar el pasador superior, cada brazo gira de forma independiente hacia el centro. Úsalo para <strong>Aperturas de Pecho en Mariposa</strong> apoyando antebrazos en las almohadillas.
            </p>
            <div class="mt-2 text-[11px] font-mono text-cyan-400">
              ✓ Guarda el pasador en su soporte lateral para no extraviarlo.
            </div>
          </div>
        </div>

        <!-- Machine Stations Step-by-Step Setup Cards -->
        <div class="space-y-3">
          <h3 class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            Estaciones de la Máquina & Cómo Configurarlas
          </h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            ${MARCY_MACHINE_INFO.stations.map((st) => `
              <div class="glass-card rounded-2xl p-4 border border-white/10 space-y-2.5 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h4 class="text-sm font-bold text-white">${st.name}</h4>
                      <p class="text-xs text-gray-400 mt-0.5">${st.description}</p>
                    </div>
                    <span class="text-[10px] font-mono text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 shrink-0">
                      ${st.pulleys}
                    </span>
                  </div>

                  ${st.setupSteps ? `
                    <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span class="text-[10px] font-mono font-bold text-cyan-400 uppercase block">Configuración Paso a Paso:</span>
                      ${st.setupSteps.map((step, i) => `
                        <p class="text-[11px] text-gray-300 leading-snug"><strong class="text-orange-400 font-mono">${i + 1}.</strong> ${step}</p>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>

                ${st.attachments ? `
                  <div class="text-[11px] font-mono text-cyan-300 pt-1 border-t border-white/5">
                    <strong class="text-gray-400">Accesorios:</strong> ${st.attachments.join(' • ')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Interactive Exercise Library by Station -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                Enciclopedia Interactiva de Ejercicios (${filteredExercises.length})
              </h3>
              <p class="text-[11px] text-gray-400">Toca cualquier ejercicio para abrir su Guía Paso a Paso en 3 Fases o ir a entrenarlo</p>
            </div>

            <!-- Station Filter Pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              ${[
                { id: 'all', label: 'Todos (18)' },
                { id: 'press-arm', label: 'Prensa / Mariposa' },
                { id: 'high-pulley', label: 'Polea Alta' },
                { id: 'low-pulley', label: 'Polea Baja' },
                { id: 'leg-developer', label: 'Piernas' },
                { id: 'dumbbells', label: '2 Mancuernas / Core' }
              ].map((tab) => `
                <button class="marcy-filter-btn px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all ${selectedFilter === tab.id ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}" data-filter="${tab.id}">
                  ${tab.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${filteredExercises.map((ex) => {
              const setup = ex.machineSetup || {};
              return `
                <div class="glass-card rounded-2xl p-4 border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between gap-3">
                  <div class="space-y-2">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          ${ex.dayTitle} • ${ex.station}
                        </span>
                        <h4 class="text-sm font-black text-white mt-1">${ex.name}</h4>
                        <p class="text-[11px] text-orange-400 font-medium">${ex.muscleTarget}</p>
                      </div>
                      <div class="text-right font-mono shrink-0">
                        <span class="text-xs font-bold text-white block">${ex.sets} × ${ex.reps}</span>
                        <span class="text-[10px] text-cyan-400">${ex.recommendedPlates > 0 ? `${ex.recommendedPlates} Placas (${ex.recommendedWeightLb} lb)` : ex.recommendedWeightLb}</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-1.5 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span class="text-[9px] font-mono text-gray-500 uppercase block">Accesorio:</span>
                        <span class="text-gray-200 font-semibold">${setup.accessory || ex.station}</span>
                      </div>
                      <div>
                        <span class="text-[9px] font-mono text-gray-500 uppercase block">Pasador / Modo:</span>
                        <span class="text-cyan-300 font-semibold">${setup.pinLock || 'Estándar'}</span>
                      </div>
                    </div>

                    ${ex.executionSteps && ex.executionSteps.length > 0 ? `
                      <div class="space-y-1 pt-0.5">
                        <span class="text-[10px] font-mono text-gray-400 uppercase font-bold block">Resumen de Ejecución:</span>
                        <p class="text-[11px] text-gray-300 leading-relaxed">• ${ex.executionSteps[0]}</p>
                        <p class="text-[11px] text-gray-300 leading-relaxed">• ${ex.executionSteps[1] || ''}</p>
                      </div>
                    ` : ''}
                  </div>

                  <div class="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button class="btn-guide-open-modal flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all" data-day="${ex.dayId}" data-ex="${ex.id}">
                      <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Ver 3 Fases & Video
                    </button>
                    <button class="btn-guide-train-now py-2 px-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all" data-day="${ex.dayId}" data-ex="${ex.id}">
                      <i data-lucide="dumbbell" class="w-3.5 h-3.5"></i> Entrenar
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Longevity & Safety Tips for César -->
        <div class="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
          <h4 class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="shield-check" class="w-4 h-4"></i> Consejos de Mantenimiento & Seguridad
          </h4>
          <ul class="text-xs text-gray-300 space-y-1.5 list-disc pl-5">
            <li><strong>Varillas de guía:</strong> Aplica una capa ligera de lubricante de silicona cada 2 meses para que las placas se deslicen suavemente y sin fricción.</li>
            <li><strong>Fase excéntrica sin impacto:</strong> Jamás dejes caer el peso de golpe al bajar. Mantén 1 cm de separación antes del tope para proteger los cables de acero y mantener tensión muscular continua.</li>
            <li><strong>Revisión de mosquetones:</strong> Asegúrate de que los mosquetones de acople rápido cierren completamente antes de cada serie pesada en Polea Alta o Baja.</li>
          </ul>
        </div>
      </div>
    `;
  }

  bindMarcyGuideEvents() {
    document.querySelectorAll('.marcy-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.marcyGuideStationFilter = btn.getAttribute('data-filter') || 'all';
        notify.vibrate([25]);
        this.render();
      });
    });

    document.querySelectorAll('.btn-guide-open-modal').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dayId = btn.getAttribute('data-day');
        const exId = btn.getAttribute('data-ex');
        const routine = WORKOUT_ROUTINES.find(r => r.id === dayId);
        const exercise = routine?.exercises?.find(e => e.id === exId);
        if (exercise) {
          this.openStepByStepModal(exercise);
        }
      });
    });

    document.querySelectorAll('.btn-guide-train-now').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dayId = btn.getAttribute('data-day');
        const exId = btn.getAttribute('data-ex');
        const routine = WORKOUT_ROUTINES.find(r => r.id === dayId);
        if (routine && routine.exercises) {
          const exIdx = routine.exercises.findIndex(e => e.id === exId);
          this.activeRoutine = routine;
          this.activeExerciseIndex = exIdx >= 0 ? exIdx : 0;
          notify.vibrate([40]);
          this.switchTab('workout');
        }
      });
    });
  }

  // ==========================================
  // TAB 4: NUTRICIÓN & MASA (750 KCAL SHAKE & 5 MEALS)
  // ==========================================
  renderNutritionTab() {
    const todayLog = storage.getTodayLog();
    const waterMl = todayLog.waterMl || 0;
    const waterGlasses = Math.floor(waterMl / 250);
    const shakeDone = todayLog.shakeTaken;
    const creatineDone = todayLog.creatineTaken;

    const mealsList = DAILY_MEALS_DATA || [];
    const consumedTotals = mealsList.reduce(
      (acc, m) => {
        if (todayLog.meals && todayLog.meals[m.id]) {
          acc.cals += m.calsNum || 0;
          acc.protein += m.proteinNum || 0;
          acc.count += 1;
        }
        return acc;
      },
      { cals: 0, protein: 0, count: 0 }
    );

    const targetCals = storage.state.user?.targetCalories || 2850;
    const targetProtein = storage.state.user?.targetProteinG || 145;
    const calsPercent = Math.min(100, Math.round((consumedTotals.cals / targetCals) * 100));
    const proteinPercent = Math.min(100, Math.round((consumedTotals.protein / targetProtein) * 100));

    return `
      <div class="space-y-5 animate-fade-in pb-16">
        <!-- Nutrition Header -->
        <div class="glass-card rounded-3xl p-5 border border-emerald-500/30 relative overflow-hidden">
          <div class="flex items-start justify-between">
            <div>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ECTOMORFO / METABOLISMO RÁPIDO (1.78m • 66kg → 74kg)
              </span>
              <h2 class="text-2xl font-black text-white mt-1">
                Nutrición & Masa Muscular
              </h2>
              <p class="text-xs text-gray-300 mt-0.5">
                Superávit calórico limpio: ${targetCals} kcal • ${targetProtein}g+ proteína diaria
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
              🥗
            </div>
          </div>

          <!-- Live Daily Macro Targets Progress -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-white/5 font-mono">
            <div class="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-gray-400">CALORÍAS HOY</span>
                <span class="text-orange-400 font-bold">${calsPercent}%</span>
              </div>
              <div class="text-xs font-black text-white">${consumedTotals.cals} / ${targetCals} kcal</div>
              <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500" style="width: ${calsPercent}%;"></div>
              </div>
            </div>

            <div class="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-gray-400">PROTEÍNA HOY</span>
                <span class="text-emerald-400 font-bold">${proteinPercent}%</span>
              </div>
              <div class="text-xs font-black text-emerald-400">${consumedTotals.protein}g / ${targetProtein}g</div>
              <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style="width: ${proteinPercent}%;"></div>
              </div>
            </div>

            <div class="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-gray-400">AGUA (3.0 L)</span>
                <span class="text-cyan-400 font-bold">${Math.min(100, Math.round((waterMl / 3000) * 100))}%</span>
              </div>
              <div class="text-xs font-black text-cyan-400">${waterMl} / 3000 ml</div>
              <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style="width: ${Math.min(100, Math.round((waterMl / 3000) * 100))}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Water Tracker (3L / 12 Glasses) -->
        <div class="glass-card rounded-3xl p-5 border border-cyan-500/30 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-white flex items-center gap-1.5">
                <i data-lucide="droplet" class="w-4 h-4 text-cyan-400"></i> Hidratación Muscular (3L Objetivo)
              </h3>
              <p class="text-xs text-gray-400">El músculo es 75% agua; indispensable con los 5g de Creatina</p>
            </div>
            <span class="text-sm font-mono font-black text-cyan-400">${waterMl} / 3000 ml</span>
          </div>

          <!-- Visual Water Bar -->
          <div class="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style="width: ${Math.min(100, Math.round((waterMl / 3000) * 100))}%;"></div>
          </div>

          <!-- Glass Grid Icons -->
          <div class="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-1">
            ${Array.from({ length: 12 }).map((_, i) => {
              const isFilled = i < waterGlasses;
              return `
                <div class="h-9 rounded-xl border flex items-center justify-center transition-all ${isFilled ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300' : 'bg-black/30 border-white/5 text-gray-600'}">
                  💧
                </div>
              `;
            }).join('')}
          </div>

          <!-- Quick Water Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button id="btn-reset-water" class="px-3 py-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white text-xs font-mono">
              Reiniciar
            </button>
            <button id="btn-add-water-250" class="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono active:scale-95">
              +250 ml (1 Vaso)
            </button>
            <button id="btn-add-water-500" class="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono active:scale-95 shadow-md shadow-cyan-500/30">
              +500 ml (Termo)
            </button>
          </div>
        </div>

        <!-- Interactive Hypercaloric Shake Calculator (~750 kcal) -->
        <div class="glass-card rounded-3xl p-5 border border-orange-500/30 space-y-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-lg">🥤</span>
                <h3 class="text-base font-bold text-white">Calculadora del Batido Hipercalórico</h3>
              </div>
              <p class="text-xs text-gray-300 mt-0.5">
                La fórmula post-entrenamiento de las 10:30 AM para subir de 66 kg a 74 kg limpios
              </p>
            </div>

            <!-- Shake Taken Toggle Button -->
            <button id="btn-toggle-shake-taken" class="px-3.5 py-1.5 rounded-2xl border font-bold text-xs transition-all active:scale-95 flex items-center gap-1 shrink-0 ${shakeDone ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/10 text-white border-white/20'}">
              <span>${shakeDone ? '✓ Tomado Hoy' : 'Marcar Tomado'}</span>
            </button>
          </div>

          <!-- Recipe Macro Overview -->
          <div class="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-black/50 border border-white/5 font-mono text-center">
            <div>
              <div class="text-[10px] text-gray-400">CALORÍAS</div>
              <div class="text-xs sm:text-sm font-bold text-orange-400">~${HYPERCALORIC_SHAKE_RECIPE.totals.calories} kcal</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-400">PROTEÍNA</div>
              <div class="text-xs sm:text-sm font-bold text-emerald-400">${HYPERCALORIC_SHAKE_RECIPE.totals.protein}g</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-400">CARBOS</div>
              <div class="text-xs sm:text-sm font-bold text-cyan-400">${HYPERCALORIC_SHAKE_RECIPE.totals.carbs}g</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-400">GRASAS</div>
              <div class="text-xs sm:text-sm font-bold text-yellow-400">${HYPERCALORIC_SHAKE_RECIPE.totals.fat}g</div>
            </div>
          </div>

          <!-- Ingredients List with details -->
          <div class="space-y-2 pt-1">
            <span class="text-[11px] font-mono text-gray-400 uppercase tracking-wider block font-bold">
              Ingredientes Exactos (Licuadora Post-Entreno):
            </span>
            <div class="space-y-1.5">
              ${HYPERCALORIC_SHAKE_RECIPE.ingredients.map((ing) => `
                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span class="text-white font-medium">${ing.name}</span>
                  </div>
                  <div class="font-mono text-right">
                    <span class="text-cyan-300 font-bold">${ing.amount}</span>
                    <span class="text-[10px] text-gray-500 block">${ing.cals} kcal • ${ing.protein}g pro</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Creatine 5g Quick Checklist -->
          <div class="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">⚡</span>
              <div>
                <div class="text-xs font-bold text-white">Creatina Monohidrato (5g Diarios)</div>
                <div class="text-[11px] text-cyan-300">Tómala todos los días (entrenes o descanses) para saturación muscular</div>
              </div>
            </div>
            <button id="btn-toggle-creatine-taken" class="px-3 py-1.5 rounded-xl border font-bold text-xs active:scale-95 transition-all shrink-0 ${creatineDone ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/10 text-white border-white/20'}">
              ${creatineDone ? '✓ 5g Tomados' : 'Tomar 5g'}
            </button>
          </div>

          <!-- Preparation Steps Collapsible -->
          <div class="text-xs text-gray-300 space-y-1 pt-1">
            <span class="font-mono text-[10px] text-gray-400 uppercase font-bold block">Modo de Preparación:</span>
            ${HYPERCALORIC_SHAKE_RECIPE.preparationSteps.map(step => `<p class="leading-relaxed">• ${step}</p>`).join('')}
          </div>
        </div>

        <!-- 5 Meals Checklist for the Day -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              Checklist de las 5 Ingestas Diarias (${consumedTotals.count}/5)
            </h3>
            <span class="text-[11px] font-mono text-emerald-400 font-bold">Sincronizado con "Mi Día"</span>
          </div>

          <div class="space-y-2">
            ${mealsList.map((m) => {
              const checked = todayLog.meals && todayLog.meals[m.id];
              return `
                <div class="glass-card rounded-2xl p-3.5 border ${checked ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-white/10'} flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-cyan-400">${m.time}</span>
                      <span class="text-[10px] font-mono text-orange-400 font-bold">${m.cals}</span>
                      <span class="text-[10px] font-mono text-emerald-400 font-bold">• ${m.protein} proteína</span>
                    </div>
                    <div class="text-xs font-bold text-white mt-1 ${checked ? 'line-through text-gray-400' : ''}">${m.name}</div>
                    <div class="text-[11px] text-gray-400 mt-0.5">${m.desc}</div>
                  </div>

                  <button class="meal-toggle-btn shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${checked ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : 'border-white/20 bg-white/5 text-gray-400 hover:border-emerald-500'}" data-meal="${m.id}">
                    ${checked ? '✓' : ''}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindNutritionEvents() {
    // Water buttons
    const btn250 = document.getElementById('btn-add-water-250');
    const btn500 = document.getElementById('btn-add-water-500');
    const btnReset = document.getElementById('btn-reset-water');

    if (btn250) {
      btn250.addEventListener('click', () => {
        storage.addWater(250);
        sound.playBeep(880, 0.08);
        notify.vibrate([40]);
        this.render();
      });
    }

    if (btn500) {
      btn500.addEventListener('click', () => {
        storage.addWater(500);
        sound.playBeep(988, 0.1);
        notify.vibrate([60]);
        this.render();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        storage.resetWater();
        notify.vibrate([30]);
        this.render();
      });
    }

    // Shake taken button
    const shakeBtn = document.getElementById('btn-toggle-shake-taken');
    if (shakeBtn) {
      shakeBtn.addEventListener('click', () => {
        const res = storage.toggleShake();
        if (res) {
          sound.playSetCompleted();
          notify.vibrate([80, 40, 100]);
          notify.showInAppToast('🥤 ¡Batido registrado! 750 kcal para masa muscular.', 'success');
        }
        this.render();
      });
    }

    // Creatine taken button
    const creatineBtn = document.getElementById('btn-toggle-creatine-taken');
    if (creatineBtn) {
      creatineBtn.addEventListener('click', () => {
        const res = storage.toggleCreatine();
        if (res) {
          sound.playSetCompleted();
          notify.vibrate([60]);
          notify.showInAppToast('⚡ 5g Creatina ingerida.', 'success');
        }
        this.render();
      });
    }

    // Meals toggle buttons
    document.querySelectorAll('.meal-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mId = btn.getAttribute('data-meal');
        const res = storage.toggleMeal(mId);
        if (res) {
          sound.playSetCompleted();
          notify.vibrate([60]);
        }
        this.render();
      });
    });
  }

  // ==========================================
  // TAB 5: PROGRESO & RÉCORDS (CHARTS & BACKUP)
  // ==========================================
  renderProgressTab() {
    const user = storage.state.user || {};
    const weightLogs = storage.state.weightLogs || [];
    const exerciseRecords = storage.state.exerciseRecords || {};
    const workoutHistory = storage.state.workoutHistory || [];

    const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : (user.currentWeightKg || 66.0);
    const startWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : currentWeight;
    const gainedKg = (currentWeight !== null && startWeight !== null && weightLogs.length > 1) ? (currentWeight - startWeight).toFixed(1) : null;
    const heightM = (user.heightCm || 178) / 100;
    const imc = currentWeight ? (currentWeight / (heightM * heightM)).toFixed(1) : '20.8';

    return `
      <div class="space-y-5 animate-fade-in pb-16">
        <!-- Athlete Profile & Goals Card -->
        <div class="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-orange-500/30 shrink-0">
                ${user.name ? user.name.charAt(0) : 'C'}
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    PERFIL DEL ATLETA
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    ${user.trainingDays || 'Lunes a Miércoles (3 Días)'}
                  </span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-white mt-0.5">
                  ${user.name || 'César Enrique Garay García'}
                </h2>
                <p class="text-xs text-gray-400">
                  ${user.role || 'Ingeniería en Desarrollo de Software'} • 21 años • Marcy 150lb
                </p>
              </div>
            </div>

            <!-- Edit Profile Button -->
            <button id="btn-edit-profile-progress" class="px-3.5 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono active:scale-95 flex items-center gap-1.5 transition-all shrink-0">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Personalizar
            </button>
          </div>

          <!-- User Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-white/5 font-mono text-center">
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 block uppercase">Edad</span>
              <span class="font-bold text-white text-sm">${user.age || 21} años</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 block uppercase">Estatura</span>
              <span class="font-bold text-white text-sm">${user.heightCm || 178} cm</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 block uppercase">Peso Actual</span>
              <span class="font-bold text-orange-400 text-sm">${currentWeight ? `${currentWeight} kg` : '66.0 kg'}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 block uppercase">Peso Objetivo</span>
              <span class="font-bold text-emerald-400 text-sm">${user.targetWeightKg || 75} kg</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 block uppercase">IMC Corporal</span>
              <span class="font-bold text-cyan-400 text-sm">${imc ? `${imc} kg/m²` : '20.8 kg/m²'}</span>
            </div>
          </div>
        </div>

        <!-- Weight Tracking Header -->
        <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                TRANSFORMACIÓN FÍSICA
              </span>
              <h3 class="text-lg font-black text-white mt-1">
                Evolución de Peso Corporal
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Registros reales para controlar tu superávit hipercalórico
              </p>
            </div>

            <!-- Add Weight Log Button -->
            <button id="btn-add-weight-modal" class="px-3.5 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/40 active:scale-95 flex items-center gap-1.5 transition-all">
              <i data-lucide="plus" class="w-4 h-4"></i> Pesarme
            </button>
          </div>

          <!-- Weight Stats Summary Cards -->
          <div class="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 font-mono text-center">
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 block">PESO ACTUAL</span>
              <span class="font-black text-white text-base">${currentWeight ? `${currentWeight} kg` : '--'}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-[10px] text-gray-500 block">INICIAL</span>
              <span class="font-bold text-gray-400 text-base">${startWeight ? `${startWeight} kg` : '--'}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 bg-emerald-950/20">
              <span class="text-[10px] text-emerald-400 block font-bold">GANANCIA</span>
              <span class="font-black text-emerald-400 text-base">${gainedKg !== null ? `+${gainedKg} kg 🔥` : '0.0 kg'}</span>
            </div>
          </div>

          <!-- Weight Trajectory Canvas Chart or Empty State -->
          <div class="space-y-2 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="trending-up" class="w-4 h-4 text-orange-400"></i> Curva de Peso Corporal (kg)
              </span>
              <span class="text-[10px] font-mono text-cyan-400">Superávit Constante</span>
            </div>

            ${weightLogs.length === 0 ? `
              <div class="w-full py-8 px-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-2">
                <div class="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-2xl flex items-center justify-center">
                  ⚖️
                </div>
                <h4 class="text-sm font-bold text-white">Sin registros de pesaje todavía</h4>
                <p class="text-xs text-gray-400 max-w-sm">
                  Tus datos iniciales están listos. Registra tu peso actual para generar tu gráfica de evolución muscular en tiempo real.
                </p>
                <button id="btn-first-weight" class="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-orange-500/30 active:scale-95 transition-all">
                  + Registrar Mi Peso Ahora
                </button>
              </div>
            ` : `
              <div class="relative w-full h-48 bg-black/40 rounded-2xl border border-white/5 p-2">
                <canvas id="weight-chart-canvas" class="w-full h-full"></canvas>
              </div>
            `}
          </div>
        </div>

        <!-- Personal Records on Marcy MWM-4965SC -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              Récords de Carga en la Marcy (Placas & lb)
            </h3>
            <span class="text-[10px] font-mono text-orange-400">Máx: 150 lb</span>
          </div>

          ${Object.keys(exerciseRecords).length === 0 ? `
            <div class="glass-card rounded-2xl p-5 border border-white/5 text-center space-y-1">
              <p class="text-xs font-bold text-white">Aún no hay récords de placas registrados</p>
              <p class="text-[11px] text-gray-400">Al completar tus ejercicios en la Marcy, tus mejores marcas de placas y repeticiones se registrarán aquí automáticamente.</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${Object.entries(exerciseRecords).map(([exId, rec]) => {
                const name = this.getExerciseName(exId);
                const plates = rec.maxPlates || 0;
                const lb = plates * 10;
                const percentOfStack = Math.round((lb / 150) * 100);

                return `
                  <div class="glass-card rounded-2xl p-3.5 border border-white/10 space-y-2">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="text-xs font-bold text-white">${name}</h4>
                        <span class="text-[10px] font-mono text-gray-400">Récord: ${rec.maxReps} reps</span>
                      </div>
                      <div class="text-right">
                        <span class="text-xs font-mono font-black text-orange-400">${plates} Placas</span>
                        <span class="text-[10px] font-mono text-cyan-400 block font-bold">${lb} lb</span>
                      </div>
                    </div>

                    <!-- Stack fill bar -->
                    <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-orange-500 to-cyan-400" style="width: ${percentOfStack}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Monthly Consistency & Mon-Wed Workout Calendar -->
        ${this.renderMonthlyConsistencyCalendar()}

        <!-- Recent Workout Logs History -->
        <div class="space-y-3">
          <h3 class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            Historial de Sesiones Registradas
          </h3>

          ${workoutHistory.length === 0 ? `
            <div class="glass-card rounded-2xl p-5 border border-white/5 text-center space-y-1">
              <p class="text-xs font-bold text-white">Sin sesiones completadas aún</p>
              <p class="text-[11px] text-gray-400">Entrena hoy con la rutina programada y toca "Finalizar" para comenzar tu historial real.</p>
            </div>
          ` : `
            <div class="space-y-2">
              ${workoutHistory.slice(0, 5).map((w) => `
                <div class="glass-card rounded-2xl p-3.5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-white">${w.routineTitle}</div>
                    <div class="text-[10px] font-mono text-gray-400">${w.date} • ${w.durationMinutes} min</div>
                  </div>
                  <div class="text-right font-mono">
                    <span class="text-xs font-bold text-emerald-400">${w.totalVolumeLb} lb</span>
                    <span class="text-[10px] text-gray-500 block">${w.completedSets} series</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Backup & Restore System (.JSON) -->
        <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
          <h3 class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="database" class="w-4 h-4 text-cyan-400"></i> Respaldo & Control de Datos
          </h3>
          <p class="text-xs text-gray-300">
            Exporta tu progreso completo a un archivo .json para no perder tus récords si limpias el navegador o cambias de teléfono.
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button id="btn-export-backup" class="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono active:scale-95 flex items-center gap-1.5 transition-all">
              <i data-lucide="download" class="w-3.5 h-3.5"></i> Exportar Respaldo (.json)
            </button>

            <label class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold font-mono active:scale-95 flex items-center gap-1.5 cursor-pointer transition-all">
              <i data-lucide="upload" class="w-3.5 h-3.5"></i> Importar Respaldo
              <input type="file" id="file-import-backup" accept=".json" class="hidden">
            </label>

            <button id="btn-force-update-cache" class="px-4 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-bold font-mono active:scale-95 flex items-center gap-1.5 transition-all">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Actualizar App a v2.0 (Limpiar Caché)
            </button>

            <button id="btn-clear-all-data" class="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold font-mono active:scale-95 flex items-center gap-1.5 transition-all">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Limpiar Todo a Cero
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderMonthlyConsistencyCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-first offset (0 = Lunes, 6 = Domingo)
    const firstDayJs = new Date(year, month, 1).getDay();
    const startOffset = firstDayJs === 0 ? 6 : firstDayJs - 1;

    const dailyLogs = storage.state.dailyLogs || {};
    const workoutHistory = storage.state.workoutHistory || [];

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(`<div class="h-10 rounded-xl bg-transparent"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dJs = new Date(year, month, day).getDay();
      const isTrainingDay = dJs >= 1 && dJs <= 3; // Lunes (1), Martes (2), Miércoles (3)
      const isToday = day === todayDate;
      const log = dailyLogs[dateStr];
      const didWorkout = (log && log.workoutCompleted) || workoutHistory.some(w => w.date === dateStr);
      const habitsCount = log && log.habitsCompleted ? Object.values(log.habitsCompleted).filter(Boolean).length : 0;

      let cellStyle = 'bg-black/40 border-white/5 text-gray-400';
      let badge = '';

      if (didWorkout) {
        cellStyle = 'bg-emerald-500/25 border-emerald-400 text-white font-bold shadow-sm shadow-emerald-500/20';
        badge = '🏋️';
      } else if (habitsCount >= 3) {
        cellStyle = 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200 font-bold';
        badge = '✓';
      } else if (isTrainingDay) {
        cellStyle = 'bg-orange-500/10 border-orange-500/25 text-orange-300';
      }

      if (isToday) {
        cellStyle += ' ring-2 ring-orange-400';
      }

      cells.push(`
        <div class="h-11 rounded-xl border ${cellStyle} flex flex-col items-center justify-center relative text-xs font-mono transition-all" title="${dateStr}">
          <span>${day}</span>
          ${badge ? `<span class="text-[9px] leading-none">${badge}</span>` : (isTrainingDay ? `<span class="w-1 h-1 rounded-full bg-orange-400 mt-0.5"></span>` : '')}
        </div>
      `);
    }

    return `
      <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="calendar" class="w-4 h-4"></i> Calendario de Constancia — ${monthNames[month]} ${year}
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5">
              Días clave de hipertrofia marcados en naranja (Lunes, Martes y Miércoles)
            </p>
          </div>
          <div class="flex items-center gap-3 text-[10px] font-mono">
            <span class="flex items-center gap-1 text-emerald-400">🏋️ Entreno Hecho</span>
            <span class="flex items-center gap-1 text-orange-300"><span class="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> Lun-Mié</span>
            <span class="flex items-center gap-1 text-cyan-300">✓ Hábitos</span>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] text-gray-400 pt-1">
          <div class="text-orange-400 font-bold">LUN</div>
          <div class="text-orange-400 font-bold">MAR</div>
          <div class="text-orange-400 font-bold">MIÉ</div>
          <div>JUE</div>
          <div>VIE</div>
          <div>SÁB</div>
          <div>DOM</div>
        </div>

        <div class="grid grid-cols-7 gap-1.5">
          ${cells.join('')}
        </div>
      </div>
    `;
  }

  getExerciseName(exId) {
    for (const r of WORKOUT_ROUTINES) {
      if (r.exercises) {
        const found = r.exercises.find(e => e.id === exId);
        if (found) return found.name;
      }
    }
    return exId;
  }

  bindProgressEvents() {
    // Render Weight Canvas Chart if canvas exists
    setTimeout(() => {
      this.drawWeightChart();
    }, 50);

    // Edit Profile Button
    const editProfBtn = document.getElementById('btn-edit-profile-progress');
    if (editProfBtn) {
      editProfBtn.addEventListener('click', () => {
        this.openEditProfileModal();
      });
    }

    // First Weight Button (from empty state)
    const firstWeightBtn = document.getElementById('btn-first-weight');
    if (firstWeightBtn) {
      firstWeightBtn.addEventListener('click', () => {
        this.openAddWeightModal();
      });
    }

    // Add Weight Button
    const addWeightBtn = document.getElementById('btn-add-weight-modal');
    if (addWeightBtn) {
      addWeightBtn.addEventListener('click', () => {
        this.openAddWeightModal();
      });
    }

    // Export Backup Button
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        notify.vibrate([40]);
        storage.exportBackup();
        notify.showInAppToast('Archivo de respaldo descargado correctamente', 'success');
      });
    }

    // Import Backup File Input
    const importInput = document.getElementById('file-import-backup');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target.result;
          const res = storage.importBackup(content);
          if (res.success) {
            notify.vibrateSetCompleted();
            sound.playSetCompleted();
            notify.showInAppToast('¡Respaldo importado y restaurado con éxito!', 'success');
            this.render();
          } else {
            notify.showInAppToast(`Error al importar: ${res.error}`, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Force Update PWA Cache Button
    const forceUpdateBtn = document.getElementById('btn-force-update-cache');
    if (forceUpdateBtn) {
      forceUpdateBtn.addEventListener('click', async () => {
        notify.vibrate([40, 40]);
        notify.showInAppToast('🔄 Limpiando caché y actualizando a v2.0...', 'info', 3000);
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
          }
        } catch (e) {
          console.warn('Error clearing caches:', e);
        }
        setTimeout(() => {
          window.location.reload(true);
        }, 1000);
      });
    }

    // Clear All Data Button
    const clearBtn = document.getElementById('btn-clear-all-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('¿Deseas reiniciar todos los datos a cero? Se borrarán registros de prueba y comenzarás completamente limpio.')) {
          storage.clearAllData();
          notify.vibrate([60, 40, 60]);
          notify.showInAppToast('Datos reiniciados a cero correctamente', 'info');
          this.render();
        }
      });
    }
  }

  drawWeightChart() {
    const canvas = document.getElementById('weight-chart-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const logs = storage.state.weightLogs || [];
    if (logs.length === 0) return;

    // Resize canvas to match display container
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = rect.width;
    const h = rect.height;
    const padding = 30;

    ctx.clearRect(0, 0, w, h);

    const weights = logs.map(l => l.weightKg);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const range = maxW - minW || 1;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (h - padding * 2) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();

      const labelVal = (maxW - range * (i / 4)).toFixed(1);
      ctx.fillStyle = '#64748B';
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillText(`${labelVal} kg`, 4, y + 3);
    }

    // Points
    const points = logs.map((item, idx) => {
      const x = padding + (w - padding * 2) * (idx / (logs.length - 1 || 1));
      const y = padding + (h - padding * 2) * (1 - (item.weightKg - minW) / range);
      return { x, y, val: item.weightKg, date: item.date };
    });

    // Gradient fill under the line
    const grad = ctx.createLinearGradient(0, padding, 0, h - padding);
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
    grad.addColorStop(1, 'rgba(249, 115, 22, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padding);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, h - padding);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Data points & tooltips
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#090D16';
      ctx.fill();
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Weight label above point
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.val}`, p.x, p.y - 8);
    });
  }

  openAddWeightModal() {
    notify.vibrate([30]);
    const user = storage.state.user || {};
    const defaultVal = user.currentWeightKg || 65.0;
    const modalContent = `
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-mono text-gray-400 mb-1">PESO CORPORAL HOY (KG)</label>
          <input type="number" id="input-new-weight" step="0.1" min="40" max="150" class="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono font-bold text-xl outline-none focus:border-orange-500" value="${defaultVal}">
        </div>

        <div>
          <label class="block text-xs font-mono text-gray-400 mb-1">NOTAS / CONDICIÓN</label>
          <input type="text" id="input-weight-notes" placeholder="Ej: Pesado en ayunas al despertar" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs outline-none focus:border-orange-500">
        </div>

        <button id="btn-save-weight-entry" class="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-orange-500/30">
          Guardar Registro
        </button>
      </div>
    `;

    this.showModal('⚖️ Registrar Peso Corporal', modalContent);

    const saveBtn = document.getElementById('btn-save-weight-entry');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const val = document.getElementById('input-new-weight').value;
        const notes = document.getElementById('input-weight-notes').value;
        if (val) {
          storage.addWeightEntry(val, notes);
          notify.vibrateSetCompleted();
          sound.playSetCompleted();
          this.closeModal();
          this.render();
          notify.showInAppToast(`Peso de ${val} kg registrado. ¡Constancia pura!`, 'success');
        }
      });
    }
  }

  openEditProfileModal() {
    notify.vibrate([30]);
    const user = storage.state.user || {};
    const modalContent = `
      <form id="form-edit-profile" class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-mono text-gray-400 mb-1">NOMBRE COMPLETO</label>
          <input type="text" id="input-prof-name" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white font-bold text-sm outline-none focus:border-cyan-500" value="${user.name || 'César Enrique Garay García'}">
        </div>

        <div>
          <label class="block text-xs font-mono text-gray-400 mb-1">ROL / CARRERA</label>
          <input type="text" id="input-prof-role" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs outline-none focus:border-cyan-500" value="${user.role || 'Ingeniería en Desarrollo de Software'}">
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1">EDAD (AÑOS)</label>
            <input type="number" id="input-prof-age" step="1" min="15" max="90" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white font-mono font-bold text-base outline-none focus:border-cyan-500" value="${user.age || 21}">
          </div>

          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1">ESTATURA (CM)</label>
            <input type="number" id="input-prof-height" step="1" min="120" max="230" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white font-mono font-bold text-base outline-none focus:border-cyan-500" value="${user.heightCm || 178}">
          </div>

          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1">PESO ACTUAL (KG)</label>
            <input type="number" id="input-prof-weight" step="0.1" min="40" max="150" placeholder="Ej: 66.0" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white font-mono font-bold text-base outline-none focus:border-cyan-500" value="${user.currentWeightKg || 66}">
          </div>
        </div>

        <div>
          <label class="block text-xs font-mono text-gray-400 mb-1">BLOQUE DE ENTRENAMIENTO</label>
          <input type="text" id="input-prof-split" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs outline-none focus:border-cyan-500" value="${user.trainingDays || 'Lunes a Miércoles (3 días consecutivos)'}">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1">PESO OBJETIVO (KG)</label>
            <input type="number" id="input-prof-target" step="0.5" min="45" max="130" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white font-mono font-bold text-base outline-none focus:border-cyan-500" value="${user.targetWeightKg || 75}">
          </div>

          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1">META AGUA (ML/DÍA)</label>
            <input type="number" id="input-prof-water" step="250" min="1500" max="6000" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white font-mono font-bold text-base outline-none focus:border-cyan-500" value="${user.targetWaterMl || 3000}">
          </div>
        </div>

        <div>
          <label class="block text-xs font-mono text-gray-400 mb-1">HORARIO DE DESPERTAR FIJO</label>
          <input type="text" id="input-prof-wake" class="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs outline-none focus:border-cyan-500" value="${user.wakeUpTime || '07:30 AM'}">
        </div>

        <button type="submit" class="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-cyan-500/30 mt-2">
          Guardar Mi Perfil Personalizado
        </button>
      </form>
    `;

    this.showModal('⚙️ Personalizar Perfil & Medidas', modalContent);

    const form = document.getElementById('form-edit-profile');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-prof-name').value.trim();
        const role = document.getElementById('input-prof-role').value.trim();
        const age = parseInt(document.getElementById('input-prof-age').value, 10) || 21;
        const heightCm = parseInt(document.getElementById('input-prof-height').value, 10) || 178;
        const currentWeightVal = document.getElementById('input-prof-weight').value;
        const currentWeightKg = currentWeightVal ? parseFloat(currentWeightVal) : 66.0;
        const trainingDays = document.getElementById('input-prof-split').value.trim() || 'Lunes a Miércoles (3 días consecutivos)';
        const targetWeightKg = parseFloat(document.getElementById('input-prof-target').value) || 75;
        const targetWaterMl = parseInt(document.getElementById('input-prof-water').value, 10) || 3000;
        const wakeUpTime = document.getElementById('input-prof-wake').value.trim() || '07:30 AM';

        storage.updateUserProfile({
          name,
          role,
          age,
          heightCm,
          currentWeightKg,
          trainingDays,
          targetWeightKg,
          targetWaterMl,
          wakeUpTime
        });

        notify.vibrateSetCompleted();
        sound.playSetCompleted();
        this.closeModal();
        this.render();
        notify.showInAppToast('✅ Perfil guardado con tus datos reales.', 'success');
      });
    }
  }

  // ==========================================
  // GLOBAL MODAL HELPERS
  // ==========================================
  showModal(title, htmlContent) {
    let overlay = document.getElementById('app-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'app-modal-overlay';
      overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 opacity-0 pointer-events-none';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="glass-card rounded-3xl p-5 sm:p-6 border border-white/15 w-full max-w-lg lg:max-w-2xl max-h-[88vh] overflow-y-auto transform scale-95 transition-all duration-300 relative shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 class="text-base font-black text-white">${title}</h3>
          <button id="btn-modal-close" class="w-8 h-8 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm font-bold active:scale-90">
            ✕
          </button>
        </div>
        <div class="mt-4">
          ${htmlContent}
        </div>
      </div>
    `;

    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.querySelector('.glass-card').classList.remove('scale-95');

    const closeBtn = document.getElementById('btn-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    this.refreshIcons();
  }

  closeModal() {
    if (this.activePacerTimer) {
      clearInterval(this.activePacerTimer);
      this.activePacerTimer = null;
    }
    const overlay = document.getElementById('app-modal-overlay');
    if (overlay) {
      overlay.classList.add('opacity-0', 'pointer-events-none');
      const card = overlay.querySelector('.glass-card');
      if (card) card.classList.add('scale-95');
    }
  }
}

// Instantiate on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.garayApp = new GarayFitApp();
});
