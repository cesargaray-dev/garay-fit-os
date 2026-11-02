// js/audio.js - Procedural Web Audio API Synthesizer (No external MP3 dependencies)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initOnUserGesture();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initOnUserGesture() {
    const unlock = () => {
      this.initContext();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
  }

  setMuted(isMuted) {
    this.muted = isMuted;
  }

  isMuted() {
    return this.muted;
  }

  // Short clean beep for countdowns
  playBeep(freq = 880, duration = 0.12, type = 'sine', volume = 0.3) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Countdown Beeps (3, 2, 1, GO)
  playCountdown(secondsLeft) {
    if (this.muted) return;
    if (secondsLeft === 3) {
      this.playBeep(659.25, 0.15, 'sine', 0.25); // E5
    } else if (secondsLeft === 2) {
      this.playBeep(659.25, 0.15, 'sine', 0.25); // E5
    } else if (secondsLeft === 1) {
      this.playBeep(880.00, 0.20, 'sine', 0.3); // A5
    } else if (secondsLeft === 0) {
      this.playRestFinished();
    }
  }

  // Rest timer completed fanfare
  playRestFinished() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.35, 'triangle', 0.3);
      }, idx * 90);
    });
  }

  // Set completed victory chime
  playSetCompleted() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { freq: 440.00, delay: 0 },    // A4
      { freq: 554.37, delay: 80 },   // C#5
      { freq: 659.25, delay: 160 },  // E5
      { freq: 880.00, delay: 240 }   // A5
    ];

    notes.forEach((n) => {
      setTimeout(() => {
        this.playBeep(n.freq, 0.4, 'sine', 0.28);
      }, n.delay);
    });
  }

  // Circadian schedule notification alert (Cyber chime)
  playScheduleAlert() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, t); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, t + 0.3); // A5
      osc2.frequency.setValueAtTime(880, t);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, t + 0.3); // D6

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.5);
      osc2.stop(t + 0.5);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  // Metronome for 1-1-3 Tempo
  playTempoTick(phase, countInPhase = 1) {
    if (this.muted) return;
    this.initContext();

    if (phase === 'concentric') {
      // 1s Push / Pull - energetic high tone
      this.playBeep(987.77, 0.08, 'sawtooth', 0.15); // B5
    } else if (phase === 'hold') {
      // 1s Peak Contraction - crisp pure sine
      this.playBeep(1318.51, 0.12, 'sine', 0.22); // E6
    } else if (phase === 'eccentric') {
      // 3s Lowering descent - deep guiding pulse per second
      const pitches = [587.33, 493.88, 392.00]; // D5, B4, G4
      const p = pitches[countInPhase - 1] || 440;
      this.playBeep(p, 0.07, 'triangle', 0.18);
    }
  }

  // Rep Target Goal Achieved Alarm (energetic victory bell chime)
  playRepGoalAlarm() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    // Sequence of ringing bell tones: G5, C6, E6, G6 fanfare
    const bellNotes = [
      { freq: 783.99, delay: 0, dur: 0.22 },   // G5
      { freq: 1046.50, delay: 130, dur: 0.22 }, // C6
      { freq: 1318.51, delay: 260, dur: 0.28 }, // E6
      { freq: 1567.98, delay: 420, dur: 0.55 }, // G6
      { freq: 1046.50, delay: 750, dur: 0.20 }, // C6
      { freq: 1567.98, delay: 920, dur: 0.65 }  // G6 prolonged ring
    ];

    bellNotes.forEach((n) => {
      setTimeout(() => {
        this.playBeep(n.freq, n.dur, 'triangle', 0.35);
      }, n.delay);
    });
  }
}

export const sound = new SoundEngine();
