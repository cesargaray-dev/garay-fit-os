// js/storage.js - State Management & Persistence for GARAY FIT OS

const STORAGE_KEY = 'garay_fit_os_state_v1';

export function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_STATE = {
  user: {
    name: 'César Enrique Garay García',
    role: 'Ingeniería en Desarrollo de Software',
    machine: 'Marcy MWM-4965SC + 2 Mancuernas',
    age: 21,
    heightCm: 178,
    currentWeightKg: 66,
    targetWeightKg: 74,
    targetCalories: 2850,
    targetProteinG: 145,
    trainingDays: 'Lunes a Miércoles (Torso, Espalda, Brazos y Abdomen)',
    trainingSplit: 'mon-wed-3day',
    wakeUpTime: '07:30 AM',
    bedTime: '11:30 PM',
    targetWaterMl: 3000,
    targetCreatineG: 5,
    startDate: getTodayKey()
  },
  settings: {
    soundEnabled: true,
    hapticsEnabled: true,
    wakeLockEnabled: true,
    notificationsEnabled: false
  },
  streak: {
    current: 0,
    best: 0,
    lastActiveDate: ''
  },
  // Keyed by date YYYY-MM-DD: { habits: {}, meals: {}, waterMl: 0, creatineTaken: false, shakeTaken: false, notes: '' }
  dailyLogs: {},
  // Live workout draft so switching exercises or tabs never loses completed sets or custom plates/reps
  // Structure: { [dayId]: { date: 'YYYY-MM-DD', exercises: { [exerciseId]: [ { plates, reps, completed } ] } } }
  activeWorkoutDraft: {},
  // Exercise performance records: { [exerciseId]: { maxPlates: 5, maxReps: 12, lastDate: '', suggestIncrease: false } }
  exerciseRecords: {},
  // Workout history sessions
  workoutHistory: [],
  // Body weight tracking entries
  weightLogs: [
    { date: getTodayKey(), weightKg: 66.0, notes: 'Peso inicial (21 años, 1.78m)' }
  ]
};

class StorageManager {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
    this.ensureTodayLog();
  }

  loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      const parsed = JSON.parse(serialized);

      // Auto-purge legacy fictitious test data if found
      if (parsed.workoutHistory && parsed.workoutHistory.some(s => s.id && s.id.startsWith('session-sample'))) {
        parsed.workoutHistory = [];
      }
      if (parsed.weightLogs && parsed.weightLogs.some(w => w.date === '2026-09-15')) {
        parsed.weightLogs = [];
      }
      if (parsed.streak && parsed.streak.best === 18 && (!parsed.workoutHistory || parsed.workoutHistory.length === 0)) {
        parsed.streak = { current: 0, best: 0, lastActiveDate: '' };
      }
      if (parsed.exerciseRecords && parsed.exerciseRecords['chest-press-marcy'] && parsed.exerciseRecords['chest-press-marcy'].lastDate === '2026-10-13' && (!parsed.workoutHistory || parsed.workoutHistory.length === 0)) {
        parsed.exerciseRecords = {};
      }

      // Migrate legacy defaults only if not already customized by César
      if (parsed.user) {
        if (!parsed.user.age) parsed.user.age = 21;
        if (!parsed.user.heightCm || parsed.user.heightCm === 175 || parsed.user.heightCm === 176) {
          parsed.user.heightCm = 178;
        }
        if (!parsed.user.currentWeightKg || parsed.user.currentWeightKg === 68.5) {
          parsed.user.currentWeightKg = 66;
        }
        if (!parsed.user.targetCalories) parsed.user.targetCalories = 2850;
        if (!parsed.user.targetProteinG || parsed.user.targetProteinG === 135) parsed.user.targetProteinG = 145;
        parsed.user.trainingDays = 'Lunes a Miércoles (Torso, Espalda, Brazos y Abdomen)';
        parsed.user.trainingSplit = 'mon-wed-3day';
      }

      if (!parsed.weightLogs || parsed.weightLogs.length === 0) {
        parsed.weightLogs = [
          { date: getTodayKey(), weightKg: parsed.user?.currentWeightKg || 66.0, notes: 'Peso inicial (21 años, 1.78m)' }
        ];
      }

      return {
        ...DEFAULT_STATE,
        ...parsed,
        user: { ...DEFAULT_STATE.user, ...(parsed.user || {}) },
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
        streak: { ...DEFAULT_STATE.streak, ...(parsed.streak || {}) },
        activeWorkoutDraft: { ...(parsed.activeWorkoutDraft || {}) },
        exerciseRecords: { ...DEFAULT_STATE.exerciseRecords, ...(parsed.exerciseRecords || {}) }
      };
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  notify() {
    for (const callback of this.subscribers) {
      try {
        callback(this.state);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    }
  }

  ensureTodayLog() {
    const today = getTodayKey();
    if (!this.state.dailyLogs[today]) {
      this.state.dailyLogs[today] = {
        habits: {},
        meals: {
          meal_1: false,
          meal_2: false,
          meal_3: false,
          meal_4: false,
          meal_5: false
        },
        waterMl: 0,
        creatineTaken: false,
        shakeTaken: false,
        notes: ''
      };
      this.saveState();
    }
  }

  getTodayLog() {
    this.ensureTodayLog();
    return this.state.dailyLogs[getTodayKey()];
  }

  toggleHabit(habitId) {
    const todayLog = this.getTodayLog();
    const newVal = !todayLog.habits[habitId];
    todayLog.habits[habitId] = newVal;

    // Sync with meals if this habit is one of the 5 daily meals (meal_1 .. meal_5)
    if (habitId && habitId.startsWith('meal_') && todayLog.meals && habitId in todayLog.meals) {
      todayLog.meals[habitId] = newVal;
    }

    this.updateStreak();
    this.saveState();
    return newVal;
  }

  setHabitCompleted(habitId, isCompleted = true) {
    const todayLog = this.getTodayLog();
    todayLog.habits[habitId] = isCompleted;
    if (habitId && habitId.startsWith('meal_') && todayLog.meals && habitId in todayLog.meals) {
      todayLog.meals[habitId] = isCompleted;
    }
    this.updateStreak();
    this.saveState();
    return isCompleted;
  }

  toggleMeal(mealId) {
    const todayLog = this.getTodayLog();
    const newVal = !todayLog.meals[mealId];
    todayLog.meals[mealId] = newVal;

    // Keep Circadian Timeline in Tab 1 synced with Nutrition Tab
    todayLog.habits[mealId] = newVal;

    this.updateStreak();
    this.saveState();
    return newVal;
  }

  // Active Workout Draft persistence so sets are never lost when navigating exercises
  getExerciseDraft(dayId, exerciseId, seriesCount = 4, defaultPlates = 4, defaultReps = 12) {
    const today = getTodayKey();
    if (!this.state.activeWorkoutDraft) {
      this.state.activeWorkoutDraft = {};
    }
    if (!this.state.activeWorkoutDraft[dayId] || this.state.activeWorkoutDraft[dayId].date !== today) {
      this.state.activeWorkoutDraft[dayId] = {
        date: today,
        exercises: {}
      };
    }
    const dayDraft = this.state.activeWorkoutDraft[dayId];
    if (!dayDraft.exercises[exerciseId] || dayDraft.exercises[exerciseId].length !== seriesCount) {
      const rec = this.state.exerciseRecords[exerciseId];
      const startPlates = rec && rec.maxPlates ? rec.maxPlates : defaultPlates;
      dayDraft.exercises[exerciseId] = Array.from({ length: seriesCount }, () => ({
        plates: startPlates,
        reps: defaultReps,
        completed: false
      }));
    }
    return dayDraft.exercises[exerciseId];
  }

  updateExerciseSetDraft(dayId, exerciseId, setIndex, patch, seriesCount = 4, defaultPlates = 4, defaultReps = 12) {
    const sets = this.getExerciseDraft(dayId, exerciseId, seriesCount, defaultPlates, defaultReps);
    if (sets[setIndex]) {
      sets[setIndex] = {
        ...sets[setIndex],
        ...patch
      };
      this.saveState();
    }
    return sets[setIndex];
  }

  getDayCompletedSetsSummary(dayId, routineExercises = []) {
    let completedSets = 0;
    let totalSets = 0;
    for (const ex of routineExercises) {
      const targetRepsMatch = String(ex.repsRange).match(/(\d+)/g);
      const defaultReps = targetRepsMatch ? parseInt(targetRepsMatch[targetRepsMatch.length - 1], 10) : 12;
      const sets = this.getExerciseDraft(dayId, ex.id, ex.seriesCount, ex.defaultPlates, defaultReps);
      totalSets += sets.length;
      completedSets += sets.filter(s => s.completed).length;
    }
    return { completedSets, totalSets };
  }

  clearDayWorkoutDraft(dayId) {
    if (this.state.activeWorkoutDraft && this.state.activeWorkoutDraft[dayId]) {
      delete this.state.activeWorkoutDraft[dayId];
      this.saveState();
    }
  }

  addWater(amountMl = 250) {
    const todayLog = this.getTodayLog();
    todayLog.waterMl = Math.min(5000, (todayLog.waterMl || 0) + amountMl);
    this.saveState();
    return todayLog.waterMl;
  }

  resetWater() {
    const todayLog = this.getTodayLog();
    todayLog.waterMl = 0;
    this.saveState();
    return 0;
  }

  toggleCreatine() {
    const todayLog = this.getTodayLog();
    todayLog.creatineTaken = !todayLog.creatineTaken;
    this.saveState();
    return todayLog.creatineTaken;
  }

  toggleShake() {
    const todayLog = this.getTodayLog();
    todayLog.shakeTaken = !todayLog.shakeTaken;
    this.saveState();
    return todayLog.shakeTaken;
  }

  updateStreak() {
    const today = getTodayKey();
    if (this.state.streak.lastActiveDate === today) {
      return;
    }

    const lastActive = this.state.streak.lastActiveDate;
    if (!lastActive) {
      this.state.streak.current = 1;
      this.state.streak.best = 1;
      this.state.streak.lastActiveDate = today;
      return;
    }

    const lastDate = new Date(lastActive);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.state.streak.current = (this.state.streak.current || 0) + 1;
    } else if (diffDays > 1) {
      this.state.streak.current = 1;
    }

    if (this.state.streak.current > (this.state.streak.best || 0)) {
      this.state.streak.best = this.state.streak.current;
    }
    this.state.streak.lastActiveDate = today;
  }

  recordWorkoutSession(sessionData) {
    this.state.workoutHistory.unshift(sessionData);

    if (this.state.workoutHistory.length > 100) {
      this.state.workoutHistory = this.state.workoutHistory.slice(0, 100);
    }

    const newPRs = [];

    if (sessionData.exerciseResults) {
      for (const res of sessionData.exerciseResults) {
        const id = res.exerciseId;
        const currentRec = this.state.exerciseRecords[id] || { maxPlates: 0, maxReps: 0 };
        
        let sessionMaxPlates = 0;
        let sessionMaxReps = 0;
        let completedSetsCount = 0;
        let allSetsAtTarget = true;

        for (const set of res.sets) {
          const plates = parseInt(set.plates, 10) || 0;
          const reps = parseInt(set.reps, 10) || 0;
          completedSetsCount++;
          if (plates > sessionMaxPlates) sessionMaxPlates = plates;
          if (reps > sessionMaxReps) sessionMaxReps = reps;
          if (reps < 12) allSetsAtTarget = false;
        }

        if (completedSetsCount === 0) continue;

        const isNewPR = sessionMaxPlates > currentRec.maxPlates ||
          (sessionMaxPlates === currentRec.maxPlates && sessionMaxReps > currentRec.maxReps);

        if (isNewPR) {
          newPRs.push({
            exerciseId: id,
            exerciseName: res.exerciseName || id,
            plates: sessionMaxPlates,
            reps: sessionMaxReps
          });
        }

        const shouldSuggestIncrease = (sessionMaxPlates >= currentRec.maxPlates && allSetsAtTarget && completedSetsCount >= 3);

        this.state.exerciseRecords[id] = {
          maxPlates: Math.max(sessionMaxPlates, currentRec.maxPlates),
          maxReps: Math.max(sessionMaxReps, currentRec.maxReps),
          lastDate: getTodayKey(),
          previousPlates: currentRec.maxPlates,
          suggestIncrease: shouldSuggestIncrease
        };
      }
    }

    this.setHabitCompleted('workout_session', true);
    this.updateStreak();
    this.saveState();
    return newPRs;
  }

  addWeightEntry(weightKg, notes = '') {
    const today = getTodayKey();
    const parsedW = parseFloat(weightKg);
    if (isNaN(parsedW) || parsedW <= 0) return;

    const existingIndex = this.state.weightLogs.findIndex(w => w.date === today);
    if (existingIndex >= 0) {
      this.state.weightLogs[existingIndex].weightKg = parsedW;
      if (notes) this.state.weightLogs[existingIndex].notes = notes;
    } else {
      this.state.weightLogs.push({
        date: today,
        weightKg: parsedW,
        notes: notes
      });
      this.state.weightLogs.sort((a, b) => a.date.localeCompare(b.date));
    }
    this.state.user.currentWeightKg = parsedW;
    this.saveState();
  }

  updateUserProfile(updatedFields) {
    this.state.user = {
      ...this.state.user,
      ...updatedFields
    };

    if (updatedFields.currentWeightKg) {
      const weight = parseFloat(updatedFields.currentWeightKg);
      if (!isNaN(weight) && weight > 0) {
        this.addWeightEntry(weight, 'Actualización de perfil');
      }
    }

    this.saveState();
  }

  clearAllData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.ensureTodayLog();
    this.saveState();
  }

  exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `garay-fit-os-backup-${getTodayKey()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.user || !parsed.exerciseRecords) {
        throw new Error('Formato de respaldo JSON no válido para GARAY FIT OS');
      }
      this.state = {
        ...DEFAULT_STATE,
        ...parsed
      };
      this.saveState();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export const storage = new StorageManager();
