// js/marcy-svg.js - Advanced Biomechanical SVG Engine (Avatar + Marcy Machine + Dumbbells + Muscle Heatmap + Setup Blueprint)

export function renderMarcyDiagram(exerciseId, options = {}) {
  if (typeof exerciseId === 'string') {
    const mockEx = {
      id: exerciseId,
      station: 'Marcy MWM-4965SC',
      pinConfig: 'Estándar',
      howToFeel: 'Mantén la postura erguida y controla el peso en todo el recorrido.',
      whatToAvoid: 'No despegues la espalda ni dejes chocar las placas.',
      primaryMuscles: [],
      secondaryMuscles: []
    };
    return renderBiomechanicalPanel(mockEx);
  }
  return renderBiomechanicalPanel(exerciseId);
}

export function renderBiomechanicalPanel(exercise) {
  if (!exercise) return '';
  const imgUrl = exercise.image || './assets/chest_press.jpg';
  const setup = exercise.machineSetup || {
    station: exercise.station || 'Marcy MWM-4965SC',
    accessory: exercise.attachment || 'Estándar',
    pinLock: exercise.pinConfig || 'Verificar seguros',
    bodyPosition: 'Espalda recta, abdomen firme y control total del peso'
  };
  const equipBadge = exercise.equipmentType === 'dumbbell'
    ? '2 MANCUERNAS // PESO LIBRE'
    : exercise.equipmentType === 'bodyweight'
    ? 'PESO CORPORAL // CORE'
    : 'MARCY MWM-4965SC // 150 LB';

  return `
    <div class="space-y-4">
      <!-- Top Grid: Panel A (Avatar + Machine Visual) & Panel B (Muscle Heatmap) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <!-- Panel A: Interactive Visual Guide (Cols 8 on desktop) -->
        <div class="md:col-span-8 glass-card rounded-3xl p-4 sm:p-5 border border-white/10 relative overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#090D16]">
          <!-- Header Bar with View Mode Toggle -->
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
                GUÍA BIOMECÁNICA INTERACTIVA
              </span>
              <span class="text-[11px] font-mono text-cyan-400 font-bold hidden sm:inline">
                ${exercise.station}
              </span>
            </div>
            
            <!-- Mode switcher pills (Photo 3D vs SVG Vector) -->
            <div class="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
              <button id="btn-toggle-view-photo" class="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold transition-all active:scale-95 flex items-center gap-1">
                📸 Anatomía 3D
              </button>
              <button id="btn-toggle-view-svg" class="px-2.5 py-1 rounded-lg text-gray-400 hover:text-white transition-all active:scale-95 flex items-center gap-1">
                🔄 Vector 2 Fases
              </button>
            </div>
          </div>

          <!-- Main Visual Viewport: Realistic 3D Photo Mode with Numbered Callout Pins -->
          <div id="exercise-visual-photo" class="relative w-full rounded-2xl overflow-hidden border border-white/10 group cursor-pointer shadow-2xl bg-black">
            <img src="${imgUrl}" alt="${exercise.name}" class="w-full h-[225px] sm:h-[290px] object-cover object-center group-hover:scale-105 transition-all duration-500" />
            
            <!-- Dark Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none"></div>

            <!-- Interactive Numbered Callout Pins Overlaid on Image -->
            ${(exercise.callouts || []).map(c => `
              <div style="left: ${c.x || '50%'}; top: ${c.y || '50%'};" class="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-mono font-extrabold text-[11px] flex items-center justify-center shadow-lg shadow-orange-500/60 border-2 border-white animate-pulse">
                  ${c.num}
                </span>
              </div>
            `).join('')}

            <!-- Floating Badges over Photo -->
            <div class="absolute top-3 left-3 flex items-center gap-1.5">
              <span class="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-orange-400 border border-orange-500/40 shadow-lg">
                ${equipBadge}
              </span>
            </div>

            <div class="absolute top-3 right-3">
              <span class="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/10 flex items-center gap-1 shadow-lg">
                🔍 Toca para Guía en 3 Fases
              </span>
            </div>

            <!-- Bottom title overlay inside photo -->
            <div class="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2">
              <div>
                <span class="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider block">
                  EJECUCIÓN TÉCNICA EXACTA
                </span>
                <span class="text-xs sm:text-sm font-bold text-white drop-shadow-md">
                  ${exercise.name}
                </span>
              </div>
              <span class="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-black/85 text-emerald-400 border border-emerald-500/40 font-bold shrink-0">
                TEMPO: ${exercise.tempo}
              </span>
            </div>
          </div>

          <!-- Vector SVG Viewport (Toggled by button) -->
          <div id="exercise-visual-svg" class="hidden relative w-full h-[225px] sm:h-[290px] rounded-2xl overflow-hidden border border-white/10 bg-black/75">
            ${renderAthleteInMachineSVG(exercise)}
          </div>

          <!-- Floating Visual Cues Legend (Matches Pins 1, 2, 3) -->
          <div class="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
            ${(exercise.callouts || []).map(c => `
              <div class="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-black/50 border border-white/10">
                <span class="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/50">
                  ${c.num}
                </span>
                <span class="text-[11px] text-gray-200 font-medium leading-tight">
                  ${c.text}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Panel B: Muscle Heatmap (Cols 4 on desktop) -->
        <div class="md:col-span-4 glass-card rounded-3xl p-4 border border-white/10 flex flex-col justify-between bg-gradient-to-b from-[#0D1525] to-[#090D16]">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
                MAPA MUSCULAR ACTIVO
              </span>
              <span class="text-[10px] font-mono text-emerald-400 font-bold">
                HIPERTROFIA
              </span>
            </div>

            <!-- Heatmap Vector Graphic -->
            ${renderMuscleHeatmapSVG(exercise.primaryMuscles || [], exercise.secondaryMuscles || [])}
          </div>

          <!-- Color Legend & Muscle Names -->
          <div class="mt-3 pt-3 border-t border-white/10 space-y-2.5">
            <!-- Primary Muscle -->
            <div class="space-y-1">
              <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold text-orange-400 uppercase">
                <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500 animate-pulse"></span>
                Músculo Principal:
              </div>
              <div class="text-xs text-white font-bold pl-4 leading-snug">
                ${(exercise.primaryMuscles || []).map(m => m.name).join(' + ') || 'Torso / Core'}
              </div>
            </div>

            <!-- Secondary Muscle -->
            <div class="space-y-1">
              <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                Músculos Asistentes:
              </div>
              <div class="text-xs text-gray-300 font-medium pl-4 leading-snug">
                ${(exercise.secondaryMuscles || []).map(m => m.name).join(' + ') || 'Estabilizadores'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel C: Machine / Equipment Quick Setup Blueprint + Step-by-Step Instructions -->
      ${renderCompleteInstructionCard(exercise, setup)}

      <!-- Panel D: Technique vs Common Mistakes Card -->
      ${renderTechniqueCard(exercise)}
    </div>
  `;
}

// -------------------------------------------------------------
// PANEL C: COMPLETE MACHINE SETUP & 4-STEP EXECUTION GUIDE
// -------------------------------------------------------------
function renderCompleteInstructionCard(exercise, setup) {
  const steps = exercise.executionSteps || [];
  return `
    <div class="glass-card rounded-3xl p-4 sm:p-5 border border-cyan-500/25 bg-gradient-to-br from-slate-900/95 via-[#0B1220] to-[#090D16] space-y-4">
      <!-- Top Header -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
            🔧
          </span>
          <div>
            <h4 class="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wide">
              Cómo Preparar la Estación y Ejecutar el Ejercicio
            </h4>
            <p class="text-[11px] text-gray-400">
              Sigue este orden exacto antes de levantar la primera repetición
            </p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300">
          Ritmo: ${exercise.tempoExpl || exercise.tempo}
        </span>
      </div>

      <!-- 4-Box Equipment Configuration Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div class="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span class="text-[10px] font-mono uppercase text-orange-400 font-bold block mb-0.5">📍 1. Estación / Lugar</span>
          <p class="text-xs font-bold text-white leading-snug">${setup.station}</p>
        </div>
        <div class="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span class="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-0.5">🔗 2. Accesorio / Agarre</span>
          <p class="text-xs font-bold text-white leading-snug">${setup.accessory}</p>
        </div>
        <div class="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span class="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-0.5">🔒 3. Seguros / Clave</span>
          <p class="text-xs font-bold text-white leading-snug">${setup.pinLock}</p>
        </div>
        <div class="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span class="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-0.5">🧍 4. Postura del Cuerpo</span>
          <p class="text-xs font-bold text-white leading-snug">${setup.bodyPosition}</p>
        </div>
      </div>

      <!-- Step-by-step Execution List -->
      ${steps.length > 0 ? `
        <div class="space-y-2">
          <div class="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400">
            📋 Instrucciones Paso a Paso de Principio a Fin:
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${steps.map((stepText, idx) => `
              <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ${idx + 1}
                </span>
                <p class="text-xs text-gray-200 leading-relaxed">${stepText.replace(/^\d+\.\s*/, '')}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Warmup & Progression Tips Row -->
      ${(exercise.warmupTip || exercise.progressionRule) ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          ${exercise.warmupTip ? `
            <div class="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
              <span class="text-sm shrink-0">🔥</span>
              <div>
                <span class="text-[10px] font-mono font-bold uppercase text-amber-400 block">Tip de Aproximación / Calentamiento</span>
                <p class="text-[11px] text-gray-200 leading-relaxed">${exercise.warmupTip}</p>
              </div>
            </div>
          ` : ''}
          ${exercise.progressionRule ? `
            <div class="px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-start gap-2.5">
              <span class="text-sm shrink-0">📈</span>
              <div>
                <span class="text-[10px] font-mono font-bold uppercase text-cyan-400 block">Cuándo Subir de Peso (Sobrecarga)</span>
                <p class="text-[11px] text-gray-200 leading-relaxed">${exercise.progressionRule}</p>
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

// -------------------------------------------------------------
// PANEL A: ARTICULATED ATHLETE IN MARCY MACHINE / DUMBBELL SVG
// -------------------------------------------------------------
function renderAthleteInMachineSVG(exercise) {
  const id = exercise.id;

  return `
    <div class="relative w-full h-[225px] sm:h-[290px] overflow-hidden select-none">
      <svg viewBox="0 0 540 280" class="w-full h-full">
        <defs>
          <linearGradient id="avatarSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E2E8F0" />
            <stop offset="100%" stop-color="#94A3B8" />
          </linearGradient>
          <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#06B6D4" />
            <stop offset="100%" stop-color="#38BDF8" />
          </linearGradient>
          <filter id="neonGlowOrange" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrowHead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#F97316" />
          </marker>
        </defs>

        <!-- Floor and Base -->
        <line x1="20" y1="250" x2="520" y2="250" stroke="#1E293B" stroke-width="2.5" stroke-dasharray="4 4" />
        <rect x="50" y="244" width="440" height="7" rx="3" fill="#0F172A" stroke="#334155" stroke-width="1.5" />

        <!-- Legend top-left inside SVG -->
        <g transform="translate(15, 16)">
          <rect x="0" y="0" width="165" height="36" rx="6" fill="#090D16" stroke="#1E293B" opacity="0.9" />
          <line x1="10" y1="12" x2="26" y2="12" stroke="#38BDF8" stroke-width="2" stroke-dasharray="3 2" />
          <text x="32" y="15" font-family="'JetBrains Mono', monospace" font-size="8" fill="#94A3B8">Fase 1: Inicio (Estiramiento)</text>
          <line x1="10" y1="26" x2="26" y2="26" stroke="#F97316" stroke-width="3" />
          <text x="32" y="29" font-family="'JetBrains Mono', monospace" font-size="8" fill="#F97316" font-weight="bold">Fase 2: Contracción Activa</text>
        </g>

        <!-- === MARCY MWM-4965SC FRAMEWORK === -->
        <rect x="85" y="45" width="55" height="198" rx="4" fill="#0A0F1D" stroke="#1E293B" stroke-width="2" />
        <line x1="102" y1="50" x2="102" y2="238" stroke="#475569" stroke-width="2.5" />
        <line x1="122" y1="50" x2="122" y2="238" stroke="#475569" stroke-width="2.5" />

        <!-- 150 lb Stack Plates -->
        <g class="animate-[pulse_2s_infinite]">
          <rect x="93" y="115" width="38" height="10" rx="2" fill="#F97316" filter="url(#neonGlowOrange)" />
          <rect x="93" y="127" width="38" height="9" rx="2" fill="#F97316" />
          <rect x="93" y="138" width="38" height="9" rx="2" fill="#F97316" />
          <circle cx="112" cy="142" r="3" fill="#FFFFFF" stroke="#06B6D4" stroke-width="1.5" />
        </g>
        <rect x="93" y="155" width="38" height="9" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <rect x="93" y="166" width="38" height="9" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <rect x="93" y="177" width="38" height="9" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <rect x="93" y="188" width="38" height="9" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <rect x="93" y="199" width="38" height="9" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <rect x="93" y="210" width="38" height="9" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <rect x="93" y="221" width="38" height="9" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1" />

        <text x="112" y="75" font-family="'JetBrains Mono', monospace" font-size="8" fill="#06B6D4" text-anchor="middle" font-weight="bold">150 LB</text>
        <text x="112" y="86" font-family="'JetBrains Mono', monospace" font-size="7" fill="#64748B" text-anchor="middle">MARCY PRO</text>

        <!-- Main Upright Steel Post -->
        <rect x="175" y="48" width="14" height="196" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1.5" />

        <!-- Overhead Boom & High Pulley -->
        <path d="M 112 48 L 330 48 L 345 68 L 330 72 L 175 72 Z" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <circle cx="112" cy="48" r="8" fill="#0F172A" stroke="#64748B" stroke-width="2" />
        <circle cx="330" cy="56" r="10" fill="#0F172A" stroke="#06B6D4" stroke-width="2.5" />

        <!-- Low Base Pulley & Footplate -->
        <circle cx="205" cy="235" r="9" fill="#0F172A" stroke="#06B6D4" stroke-width="2.5" />
        <rect x="250" y="238" width="22" height="6" rx="1.5" fill="#334155" stroke="#64748B" stroke-width="1" />

        <!-- Padded Bench & Seat -->
        <rect x="225" y="168" width="65" height="12" rx="3" fill="#090D16" stroke="#475569" stroke-width="2" />
        <rect x="200" y="95" width="12" height="78" rx="3" fill="#090D16" stroke="#475569" stroke-width="2" />
        <rect x="245" y="180" width="10" height="65" fill="#1E293B" />

        <!-- Cable Connecting Pulleys -->
        <path d="M 112 115 L 112 48 L 330 56" fill="none" stroke="url(#cableGradient)" stroke-width="2.5" stroke-dasharray="4 2" />

        <!-- SPECIFIC ATHLETE POSE (GHOST + ACTIVE MOTION) -->
        ${renderSpecificAthleteExercise(id)}
      </svg>
    </div>
  `;
}

function renderSpecificAthleteExercise(exerciseId) {
  switch (exerciseId) {
    case 'chest-press-marcy':
    case 'vertical-grip-chest-press':
      return `
        <circle cx="185" cy="90" r="6" fill="#090D16" stroke="#F97316" stroke-width="2" />
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none" stroke-width="2">
          <line x1="210" y1="110" x2="225" y2="168" stroke-width="12" stroke-linecap="round" />
          <circle cx="210" cy="92" r="10" />
          <path d="M 215 115 L 205 138 L 245 138" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 185 90 L 235 100 L 245 138" stroke-width="4" stroke="#64748B" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="212" cy="92" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="212" y1="108" x2="226" y2="168" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <path d="M 220 115 Q 232 125 224 140" fill="none" stroke="#F97316" stroke-width="6" stroke-linecap="round" filter="url(#neonGlowOrange)" />
          <line x1="226" y1="168" x2="275" y2="170" stroke="url(#avatarSkin)" stroke-width="14" stroke-linecap="round" />
          <line x1="275" y1="170" x2="280" y2="242" stroke="url(#avatarSkin)" stroke-width="11" stroke-linecap="round" />
          <line x1="275" y1="244" x2="298" y2="244" stroke="#64748B" stroke-width="6" stroke-linecap="round" />
          <circle cx="218" cy="116" r="5" fill="#06B6D4" />
          <line x1="218" y1="116" x2="270" y2="128" stroke="url(#avatarSkin)" stroke-width="7" stroke-linecap="round" />
          <circle cx="270" cy="128" r="4.5" fill="#F97316" />
          <line x1="270" y1="128" x2="315" y2="132" stroke="url(#avatarSkin)" stroke-width="6" stroke-linecap="round" />
          <circle cx="315" cy="132" r="5" fill="#06B6D4" />
          <path d="M 185 90 L 290 102 L 315 132" fill="none" stroke="#F97316" stroke-width="5" stroke-linecap="round" filter="url(#neonGlowOrange)" />
          <line x1="315" y1="124" x2="315" y2="140" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
        </g>
        <line x1="275" y1="145" x2="335" y2="145" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" stroke-linecap="round" />
        <text x="305" y="160" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">EMPUJAR →</text>
      `;

    case 'pec-deck-butterfly':
      return `
        <circle cx="185" cy="90" r="6" fill="#090D16" stroke="#06B6D4" stroke-width="2" />
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <circle cx="210" cy="92" r="10" />
          <line x1="210" y1="108" x2="225" y2="168" stroke-width="12" />
          <path d="M 215 115 L 195 125 L 195 100" stroke-width="6" stroke-linecap="round" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="212" cy="92" r="11" fill="url(#avatarSkin)" stroke="#06B6D4" stroke-width="1.5" />
          <line x1="212" y1="108" x2="226" y2="168" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <line x1="226" y1="168" x2="275" y2="170" stroke="url(#avatarSkin)" stroke-width="14" stroke-linecap="round" />
          <line x1="275" y1="170" x2="280" y2="242" stroke="url(#avatarSkin)" stroke-width="11" stroke-linecap="round" />
          <line x1="275" y1="244" x2="298" y2="244" stroke="#64748B" stroke-width="6" stroke-linecap="round" />
          <circle cx="225" cy="125" r="8" fill="#F97316" opacity="0.7" filter="url(#neonGlowOrange)" />
          <line x1="218" y1="116" x2="260" y2="125" stroke="url(#avatarSkin)" stroke-width="8" stroke-linecap="round" />
          <circle cx="260" cy="125" r="5" fill="#F97316" />
          <line x1="260" y1="125" x2="260" y2="92" stroke="url(#avatarSkin)" stroke-width="7" stroke-linecap="round" />
          <circle cx="260" cy="92" r="4.5" fill="#06B6D4" />
          <rect x="254" y="90" width="12" height="38" rx="4" fill="#0F172A" stroke="#F97316" stroke-width="2.5" filter="url(#neonGlowOrange)" />
        </g>
        <path d="M 230 85 A 35 35 0 0 1 268 115" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <text x="250" y="80" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">CERRAR AL CENTRO ⟲</text>
      `;

    case 'lat-pulldown-wide':
    case 'underhand-lat-pulldown':
      return `
        <line x1="330" y1="56" x2="280" y2="110" stroke="#06B6D4" stroke-width="2.5" stroke-dasharray="5 2" />
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <circle cx="250" cy="115" r="10" />
          <line x1="250" y1="128" x2="245" y2="175" stroke-width="12" />
          <line x1="250" y1="132" x2="275" y2="70" stroke-width="6" />
          <line x1="245" y1="65" x2="315" y2="72" stroke-width="4" stroke="#64748B" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="252" cy="115" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="252" y1="128" x2="242" y2="175" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <path d="M 242 135 Q 230 148 240 162" fill="none" stroke="#F97316" stroke-width="8" stroke-linecap="round" filter="url(#neonGlowOrange)" />
          <line x1="242" y1="175" x2="285" y2="175" stroke="url(#avatarSkin)" stroke-width="14" stroke-linecap="round" />
          <circle cx="270" cy="170" r="7" fill="#1E293B" stroke="#06B6D4" stroke-width="1.5" />
          <line x1="285" y1="175" x2="285" y2="242" stroke="url(#avatarSkin)" stroke-width="11" stroke-linecap="round" />
          <circle cx="254" cy="132" r="5" fill="#06B6D4" />
          <line x1="254" y1="132" x2="245" y2="155" stroke="url(#avatarSkin)" stroke-width="8" stroke-linecap="round" />
          <circle cx="245" cy="155" r="5" fill="#F97316" />
          <line x1="245" y1="155" x2="280" y2="120" stroke="url(#avatarSkin)" stroke-width="6.5" stroke-linecap="round" />
          <circle cx="280" cy="120" r="4.5" fill="#06B6D4" />
          <line x1="250" y1="115" x2="310" y2="125" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
        </g>
        <line x1="295" y1="90" x2="295" y2="135" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" stroke-linecap="round" />
        <text x="305" y="118" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">JALAR AL PECHO ↓</text>
      `;

    case 'dumbbell-single-arm-row':
      return `
        <!-- === ONE-ARM DUMBBELL ROW SUPPORTED ON MARCY BENCH === -->
        <!-- GHOSTING: Arm hanging straight down stretching lat -->
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <line x1="340" y1="135" x2="340" y2="210" stroke-width="6" stroke-linecap="round" />
          <rect x="330" y="210" width="20" height="8" rx="2" stroke="#38BDF8" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <!-- Head looking forward/down -->
          <circle cx="305" cy="112" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <!-- Flat Back at 45° angle -->
          <line x1="315" y1="122" x2="375" y2="155" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <!-- Active Lat Glow -->
          <line x1="330" y1="130" x2="368" y2="150" stroke="#F97316" stroke-width="8" stroke-linecap="round" filter="url(#neonGlowOrange)" />
          <!-- Left Support Arm on Marcy Bench Seat -->
          <line x1="318" y1="125" x2="282" y2="168" stroke="#94A3B8" stroke-width="6" stroke-linecap="round" />
          <circle cx="282" cy="168" r="4.5" fill="#06B6D4" />
          <!-- Supporting Legs -->
          <line x1="375" y1="155" x2="365" y2="242" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <line x1="375" y1="155" x2="405" y2="242" stroke="url(#avatarSkin)" stroke-width="12" stroke-linecap="round" />
          <!-- Working Right Arm Pulling Dumbbell to Hip -->
          <circle cx="332" cy="132" r="5" fill="#06B6D4" />
          <line x1="332" y1="132" x2="368" y2="122" stroke="url(#avatarSkin)" stroke-width="8" stroke-linecap="round" />
          <circle cx="368" cy="122" r="5" fill="#F97316" />
          <line x1="368" y1="122" x2="362" y2="160" stroke="url(#avatarSkin)" stroke-width="6.5" stroke-linecap="round" />
          <!-- Dumbbell at Hip -->
          <rect x="348" y="156" width="28" height="10" rx="3" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5" filter="url(#neonGlowOrange)" />
        </g>
        <path d="M 342 205 A 35 35 0 0 0 365 168" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <text x="382" y="190" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">JALAR A CADERA ↗</text>
      `;

    case 'dumbbell-lateral-raise':
      return `
        <!-- === STANDING DUMBBELL LATERAL RAISE (3D DELTS) === -->
        <!-- GHOSTING: Arms at sides of thighs -->
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <line x1="365" y1="118" x2="352" y2="175" stroke-width="6" stroke-linecap="round" />
          <line x1="395" y1="118" x2="408" y2="175" stroke-width="6" stroke-linecap="round" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <!-- Head & Torso (Front-facing view next to machine) -->
          <circle cx="380" cy="92" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <path d="M 364 112 L 396 112 L 390 175 L 370 175 Z" fill="url(#avatarSkin)" />
          <!-- Legs -->
          <line x1="373" y1="175" x2="368" y2="242" stroke="url(#avatarSkin)" stroke-width="12" stroke-linecap="round" />
          <line x1="387" y1="175" x2="392" y2="242" stroke="url(#avatarSkin)" stroke-width="12" stroke-linecap="round" />
          <!-- Glowing Lateral Deltoids (Left & Right) -->
          <circle cx="362" cy="116" r="7" fill="#F97316" filter="url(#neonGlowOrange)" />
          <circle cx="398" cy="116" r="7" fill="#F97316" filter="url(#neonGlowOrange)" />
          <!-- Arms raised in T-pose to shoulder height -->
          <line x1="362" y1="116" x2="315" y2="118" stroke="url(#avatarSkin)" stroke-width="7" stroke-linecap="round" />
          <line x1="398" y1="116" x2="445" y2="118" stroke="url(#avatarSkin)" stroke-width="7" stroke-linecap="round" />
          <!-- 2 Dumbbells in hands -->
          <rect x="302" y="110" width="16" height="16" rx="3" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5" />
          <rect x="442" y="110" width="16" height="16" rx="3" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5" />
        </g>
        <path d="M 335 165 A 45 45 0 0 1 312 128" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <path d="M 425 165 A 45 45 0 0 0 448 128" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <text x="380" y="72" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" text-anchor="middle" font-weight="bold">ELEVAR EN "T" (HOMBROS 3D) ↖ ↗</text>
      `;

    case 'kneeling-cable-crunch':
    case 'core-360-plank-crunch':
      return `
        <!-- === KNEELING CABLE CRUNCH (ABS WITH WEIGHT) === -->
        <line x1="330" y1="56" x2="310" y2="145" stroke="#06B6D4" stroke-width="2.5" stroke-dasharray="4 2" />
        <!-- GHOSTING: Upright kneeling torso -->
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <circle cx="325" cy="128" r="10" />
          <line x1="325" y1="140" x2="335" y2="200" stroke-width="12" stroke-linecap="round" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <!-- Thighs Vertical & Knees on Mat -->
          <rect x="315" y="238" width="65" height="6" rx="3" fill="#06B6D4" opacity="0.6" />
          <line x1="335" y1="195" x2="335" y2="238" stroke="url(#avatarSkin)" stroke-width="14" stroke-linecap="round" />
          <line x1="335" y1="238" x2="372" y2="238" stroke="url(#avatarSkin)" stroke-width="11" stroke-linecap="round" />
          <!-- Curved Spine Crunching Downward -->
          <path d="M 335 195 Q 325 165 298 162" fill="none" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <!-- Glowing Abs Contraction -->
          <path d="M 325 188 Q 312 175 302 172" fill="none" stroke="#F97316" stroke-width="7" stroke-linecap="round" filter="url(#neonGlowOrange)" />
          <!-- Head & Hands fixed at forehead -->
          <circle cx="290" cy="162" r="10.5" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="305" y1="165" x2="308" y2="145" stroke="url(#avatarSkin)" stroke-width="6.5" stroke-linecap="round" />
          <circle cx="308" cy="145" r="5" fill="#F97316" />
          <line x1="300" y1="145" x2="316" y2="145" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
        </g>
        <path d="M 310 120 A 35 35 0 0 0 282 155" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <text x="360" y="145" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">ENROLLAR ABDOMEN ↙</text>
      `;

    case 'seated-cable-row':
      return `
        <line x1="205" y1="235" x2="320" y2="200" stroke="#06B6D4" stroke-width="2.5" stroke-dasharray="4 2" />
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <circle cx="340" cy="155" r="10" />
          <line x1="340" y1="168" x2="355" y2="225" stroke-width="12" />
          <line x1="340" y1="175" x2="270" y2="215" stroke-width="6" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="360" cy="155" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="360" y1="168" x2="370" y2="228" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <circle cx="362" cy="180" r="7" fill="#F97316" opacity="0.8" filter="url(#neonGlowOrange)" />
          <line x1="370" y1="228" x2="300" y2="232" stroke="url(#avatarSkin)" stroke-width="14" stroke-linecap="round" />
          <line x1="300" y1="232" x2="250" y2="238" stroke="url(#avatarSkin)" stroke-width="12" stroke-linecap="round" />
          <circle cx="250" cy="238" r="5" fill="#64748B" />
          <circle cx="358" cy="175" r="5" fill="#06B6D4" />
          <line x1="358" y1="175" x2="385" y2="195" stroke="url(#avatarSkin)" stroke-width="7.5" stroke-linecap="round" />
          <circle cx="385" cy="195" r="5" fill="#F97316" />
          <line x1="385" y1="195" x2="335" y2="202" stroke="url(#avatarSkin)" stroke-width="6.5" stroke-linecap="round" />
          <circle cx="335" cy="202" r="4.5" fill="#06B6D4" />
          <line x1="335" y1="192" x2="335" y2="212" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
        </g>
        <line x1="285" y1="190" x2="335" y2="190" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" stroke-linecap="round" />
        <text x="295" y="180" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">REMAR AL OMBLIGO →</text>
      `;

    case 'tricep-pushdown-high-pulley':
      return `
        <line x1="330" y1="56" x2="275" y2="135" stroke="#06B6D4" stroke-width="2.5" stroke-dasharray="4 2" />
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <circle cx="255" cy="95" r="10" />
          <line x1="255" y1="108" x2="245" y2="175" stroke-width="12" />
          <line x1="255" y1="120" x2="265" y2="145" stroke-width="6" />
          <line x1="265" y1="145" x2="275" y2="120" stroke-width="5" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="255" cy="95" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="255" y1="108" x2="245" y2="175" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <line x1="245" y1="175" x2="240" y2="244" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <line x1="248" y1="175" x2="265" y2="244" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <circle cx="255" cy="120" r="5" fill="#06B6D4" />
          <line x1="255" y1="120" x2="262" y2="152" stroke="url(#avatarSkin)" stroke-width="8" stroke-linecap="round" />
          <path d="M 256 122 L 260 148" stroke="#F97316" stroke-width="6" filter="url(#neonGlowOrange)" />
          <circle cx="262" cy="152" r="5" fill="#F97316" />
          <line x1="262" y1="152" x2="278" y2="195" stroke="url(#avatarSkin)" stroke-width="6.5" stroke-linecap="round" />
          <circle cx="278" cy="195" r="4.5" fill="#06B6D4" />
          <line x1="268" y1="195" x2="288" y2="195" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
        </g>
        <line x1="285" y1="150" x2="285" y2="190" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" stroke-linecap="round" />
        <text x="295" y="175" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">EXTENDER TRÍCEPS ↓</text>
      `;

    case 'standing-bicep-curl-low-pulley':
    case 'dumbbell-hammer-curl':
    case 'superset-arms-biceps-triceps':
      return `
        <line x1="205" y1="235" x2="275" y2="148" stroke="#06B6D4" stroke-width="2.5" stroke-dasharray="4 2" />
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <circle cx="265" cy="95" r="10" />
          <line x1="265" y1="108" x2="265" y2="175" stroke-width="12" />
          <line x1="265" y1="120" x2="270" y2="190" stroke-width="6" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="265" cy="95" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="265" y1="108" x2="265" y2="175" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <line x1="265" y1="175" x2="260" y2="244" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <line x1="265" y1="175" x2="275" y2="244" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <circle cx="265" cy="120" r="5" fill="#06B6D4" />
          <line x1="265" y1="120" x2="268" y2="152" stroke="url(#avatarSkin)" stroke-width="8" stroke-linecap="round" />
          <circle cx="266" cy="135" r="7" fill="#F97316" filter="url(#neonGlowOrange)" />
          <circle cx="268" cy="152" r="5" fill="#F97316" />
          <line x1="268" y1="152" x2="276" y2="125" stroke="url(#avatarSkin)" stroke-width="6.5" stroke-linecap="round" />
          <circle cx="276" cy="125" r="4.5" fill="#06B6D4" />
          <rect x="268" y="118" width="18" height="10" rx="2" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5" />
        </g>
        <path d="M 275 180 A 30 30 0 0 1 285 135" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <text x="295" y="155" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">SUBIR SIN MOVER CODOS ⟲</text>
      `;

    case 'dumbbell-overhead-tricep':
    case 'dumbbell-shoulder-press':
      return `
        <!-- === SEATED OVERHEAD TRICEP / SHOULDER PRESS WITH DUMBBELLS === -->
        <!-- GHOSTING: Arms bent at ear/nape level -->
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <line x1="215" y1="115" x2="202" y2="85" stroke-width="6" stroke-linecap="round" />
          <line x1="202" y1="85" x2="195" y2="112" stroke-width="5" stroke-linecap="round" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="212" cy="95" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="212" y1="108" x2="226" y2="168" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <line x1="226" y1="168" x2="275" y2="170" stroke="url(#avatarSkin)" stroke-width="14" stroke-linecap="round" />
          <line x1="275" y1="170" x2="280" y2="242" stroke="url(#avatarSkin)" stroke-width="11" stroke-linecap="round" />
          <!-- Active Shoulder & Triceps Glow -->
          <circle cx="216" cy="112" r="6.5" fill="#F97316" filter="url(#neonGlowOrange)" />
          <!-- Arm extended overhead -->
          <line x1="216" y1="112" x2="218" y2="54" stroke="url(#avatarSkin)" stroke-width="7.5" stroke-linecap="round" />
          <line x1="216" y1="95" x2="217" y2="72" stroke="#F97316" stroke-width="6" filter="url(#neonGlowOrange)" />
          <!-- Dumbbell Overhead -->
          <rect x="206" y="42" width="24" height="10" rx="3" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5" filter="url(#neonGlowOrange)" />
        </g>
        <line x1="242" y1="98" x2="242" y2="52" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" stroke-linecap="round" />
        <text x="252" y="76" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">EXTENDER AL TECHO ↑</text>
      `;

    case 'leg-extension-marcy':
      return `
        <circle cx="290" cy="178" r="6" fill="#090D16" stroke="#06B6D4" stroke-width="2" />
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <circle cx="210" cy="95" r="10" />
          <line x1="210" y1="108" x2="225" y2="168" stroke-width="12" />
          <line x1="225" y1="168" x2="285" y2="170" stroke-width="12" />
          <line x1="285" y1="170" x2="285" y2="230" stroke-width="10" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="212" cy="95" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="212" y1="108" x2="226" y2="168" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <line x1="220" y1="125" x2="242" y2="172" stroke="url(#avatarSkin)" stroke-width="6" stroke-linecap="round" />
          <circle cx="242" cy="172" r="4.5" fill="#06B6D4" />
          <line x1="226" y1="168" x2="288" y2="170" stroke="url(#avatarSkin)" stroke-width="15" stroke-linecap="round" />
          <line x1="235" y1="165" x2="280" y2="165" stroke="#F97316" stroke-width="8" stroke-linecap="round" filter="url(#neonGlowOrange)" />
          <circle cx="288" cy="170" r="6" fill="#F97316" />
          <line x1="288" y1="170" x2="355" y2="172" stroke="url(#avatarSkin)" stroke-width="12" stroke-linecap="round" />
          <line x1="355" y1="172" x2="362" y2="160" stroke="#64748B" stroke-width="5" stroke-linecap="round" />
          <rect x="330" y="174" width="22" height="14" rx="6" fill="#1E293B" stroke="#F97316" stroke-width="2.5" filter="url(#neonGlowOrange)" />
        </g>
        <path d="M 300 215 A 45 45 0 0 1 350 185" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <text x="325" y="210" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">PATEAR Y SOSTENER 2S ↗</text>
      `;

    case 'lying-leg-raise-abs':
      return `
        <!-- === LYING LEG RAISE & REVERSE CRUNCH ON MAT === -->
        <rect x="285" y="238" width="185" height="6" rx="3" fill="#06B6D4" opacity="0.6" />
        <!-- GHOSTING: Legs extended near floor (10cm off ground) -->
        <g stroke="#38BDF8" stroke-dasharray="3 3" opacity="0.35" fill="none">
          <line x1="380" y1="228" x2="465" y2="225" stroke-width="11" stroke-linecap="round" />
        </g>
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <!-- Head & Back flat on floor -->
          <circle cx="305" cy="224" r="10" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="318" y1="228" x2="380" y2="226" stroke="url(#avatarSkin)" stroke-width="15" stroke-linecap="round" />
          <!-- Lower Abs Glowing -->
          <line x1="348" y1="220" x2="378" y2="218" stroke="#F97316" stroke-width="7" stroke-linecap="round" filter="url(#neonGlowOrange)" />
          <!-- Legs raised vertically with slight pelvic lift -->
          <circle cx="380" cy="222" r="6" fill="#F97316" />
          <line x1="380" y1="222" x2="372" y2="140" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <line x1="372" y1="140" x2="384" y2="136" stroke="#64748B" stroke-width="5" stroke-linecap="round" />
        </g>
        <path d="M 445 215 A 65 65 0 0 0 388 150" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" />
        <text x="400" y="140" font-family="'JetBrains Mono', monospace" font-size="9" fill="#F97316" font-weight="bold">ELEVAR PIERNAS Y PELVIS ↖</text>
      `;

    default:
      return `
        <g class="animate-[pulse_2.2s_ease-in-out_infinite]">
          <circle cx="250" cy="100" r="11" fill="url(#avatarSkin)" stroke="#38BDF8" stroke-width="1.5" />
          <line x1="250" y1="112" x2="250" y2="175" stroke="url(#avatarSkin)" stroke-width="16" stroke-linecap="round" />
          <line x1="250" y1="175" x2="245" y2="242" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <line x1="250" y1="175" x2="260" y2="242" stroke="url(#avatarSkin)" stroke-width="13" stroke-linecap="round" />
          <line x1="250" y1="125" x2="290" y2="145" stroke="url(#avatarSkin)" stroke-width="8" stroke-linecap="round" />
          <circle cx="290" cy="145" r="5" fill="#F97316" filter="url(#neonGlowOrange)" />
        </g>
        <line x1="270" y1="165" x2="310" y2="165" stroke="#F97316" stroke-width="3" marker-end="url(#arrowHead)" stroke-linecap="round" />
      `;
  }
}

// -------------------------------------------------------------
// PANEL B: ANATOMICAL MUSCLE HEATMAP SVG (FRONT & BACK)
// -------------------------------------------------------------
function renderMuscleHeatmapSVG(primaryMuscles, secondaryMuscles) {
  const pIds = primaryMuscles.map(m => m.id);
  const sIds = secondaryMuscles.map(m => m.id);

  const getMuscleFill = (...ids) => {
    if (ids.some(id => pIds.includes(id))) return '#F97316'; // Primary Orange
    if (ids.some(id => sIds.includes(id))) return '#06B6D4'; // Secondary Cyan
    return '#1E293B'; // Inactive dark steel
  };

  const getMuscleFilter = (...ids) => {
    if (ids.some(id => pIds.includes(id))) return 'filter="url(#heatGlowOrange)"';
    if (ids.some(id => sIds.includes(id))) return 'filter="url(#heatGlowCyan)"';
    return '';
  };

  return `
    <div class="w-full flex items-center justify-center gap-4 py-2 select-none">
      <svg viewBox="0 0 280 200" class="w-full h-[155px] sm:h-[175px]">
        <defs>
          <filter id="heatGlowOrange" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="heatGlowCyan" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- ==================== FRONT VIEW ==================== -->
        <g transform="translate(10, 5)">
          <text x="60" y="16" font-family="'JetBrains Mono', monospace" font-size="9" fill="#94A3B8" text-anchor="middle" font-weight="bold">FRONTAL</text>
          
          <!-- Head / Neck -->
          <circle cx="60" cy="32" r="8" fill="#334155" />
          <rect x="57" y="40" width="6" height="5" fill="#334155" />

          <!-- Front & Side Deltoids -->
          <circle cx="43" cy="50" r="5.5" fill="${getMuscleFill('front-delts', 'side-delts')}" ${getMuscleFilter('front-delts', 'side-delts')} />
          <circle cx="77" cy="50" r="5.5" fill="${getMuscleFill('front-delts', 'side-delts')}" ${getMuscleFilter('front-delts', 'side-delts')} />

          <!-- Chest (Pectoralis Major) -->
          <path d="M 48 48 Q 60 52 72 48 L 70 65 Q 60 68 50 65 Z" fill="${getMuscleFill('chest', 'chest-inner')}" ${getMuscleFilter('chest', 'chest-inner')} />

          <!-- Biceps -->
          <rect x="36" y="58" width="6" height="15" rx="3" fill="${getMuscleFill('biceps')}" ${getMuscleFilter('biceps')} />
          <rect x="78" y="58" width="6" height="15" rx="3" fill="${getMuscleFill('biceps')}" ${getMuscleFilter('biceps')} />

          <!-- Forearms -->
          <rect x="33" y="76" width="5" height="18" rx="2.5" fill="${getMuscleFill('forearms')}" ${getMuscleFilter('forearms')} />
          <rect x="82" y="76" width="5" height="18" rx="2.5" fill="${getMuscleFill('forearms')}" ${getMuscleFilter('forearms')} />

          <!-- Obliques (Waist sides) -->
          <rect x="47" y="68" width="4" height="24" rx="2" fill="${getMuscleFill('obliques')}" ${getMuscleFilter('obliques')} />
          <rect x="69" y="68" width="4" height="24" rx="2" fill="${getMuscleFill('obliques')}" ${getMuscleFilter('obliques')} />

          <!-- Rectus Abdominis (Core / Six-Pack) -->
          <rect x="52" y="68" width="16" height="26" rx="3" fill="${getMuscleFill('abs', 'core')}" ${getMuscleFilter('abs', 'core')} />

          <!-- Quadriceps -->
          <path d="M 46 102 L 58 102 L 56 142 L 48 142 Z" fill="${getMuscleFill('quads')}" ${getMuscleFilter('quads')} />
          <path d="M 62 102 L 74 102 L 72 142 L 64 142 Z" fill="${getMuscleFill('quads')}" ${getMuscleFilter('quads')} />

          <!-- Calves -->
          <rect x="47" y="146" width="7" height="30" rx="3" fill="${getMuscleFill('calves')}" />
          <rect x="66" y="146" width="7" height="30" rx="3" fill="${getMuscleFill('calves')}" />
        </g>

        <!-- ==================== BACK VIEW ==================== -->
        <g transform="translate(150, 5)">
          <text x="60" y="16" font-family="'JetBrains Mono', monospace" font-size="9" fill="#94A3B8" text-anchor="middle" font-weight="bold">POSTERIOR</text>

          <!-- Head -->
          <circle cx="60" cy="32" r="8" fill="#334155" />

          <!-- Traps & Upper/Mid Back -->
          <path d="M 52 42 L 68 42 L 76 56 L 60 66 L 44 56 Z" fill="${getMuscleFill('traps', 'upper-back', 'mid-back')}" ${getMuscleFilter('traps', 'upper-back', 'mid-back')} />

          <!-- Lats (Latissimus Dorsi V-Taper) -->
          <path d="M 46 56 L 57 62 L 56 86 L 47 80 Z" fill="${getMuscleFill('lats', 'lats-lower')}" ${getMuscleFilter('lats', 'lats-lower')} />
          <path d="M 74 56 L 63 62 L 64 86 L 73 80 Z" fill="${getMuscleFill('lats', 'lats-lower')}" ${getMuscleFilter('lats', 'lats-lower')} />

          <!-- Rear & Side Delts -->
          <circle cx="43" cy="50" r="4.5" fill="${getMuscleFill('rear-delts', 'side-delts')}" ${getMuscleFilter('rear-delts', 'side-delts')} />
          <circle cx="77" cy="50" r="4.5" fill="${getMuscleFill('rear-delts', 'side-delts')}" ${getMuscleFilter('rear-delts', 'side-delts')} />

          <!-- Triceps -->
          <rect x="36" y="58" width="6" height="15" rx="3" fill="${getMuscleFill('triceps')}" ${getMuscleFilter('triceps')} />
          <rect x="78" y="58" width="6" height="15" rx="3" fill="${getMuscleFill('triceps')}" ${getMuscleFilter('triceps')} />

          <!-- Glutes -->
          <path d="M 47 92 Q 60 96 73 92 L 71 112 Q 60 116 49 112 Z" fill="${getMuscleFill('glutes')}" ${getMuscleFilter('glutes')} />

          <!-- Hamstrings -->
          <path d="M 46 114 L 58 114 L 56 144 L 48 144 Z" fill="${getMuscleFill('hamstrings')}" ${getMuscleFilter('hamstrings')} />
          <path d="M 62 114 L 74 114 L 72 144 L 64 144 Z" fill="${getMuscleFill('hamstrings')}" ${getMuscleFilter('hamstrings')} />

          <!-- Calves -->
          <rect x="47" y="148" width="7" height="28" rx="3" fill="${getMuscleFill('calves')}" ${getMuscleFilter('calves')} />
          <rect x="66" y="148" width="7" height="28" rx="3" fill="${getMuscleFill('calves')}" ${getMuscleFilter('calves')} />
        </g>
      </svg>
    </div>
  `;
}

// -------------------------------------------------------------
// PANEL D: TECHNIQUE VS COMMON MISTAKES
// -------------------------------------------------------------
function renderTechniqueCard(exercise) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <!-- Correct Form Box -->
      <div class="glass-card rounded-2xl p-4 border border-emerald-500/40 bg-emerald-950/15 relative overflow-hidden">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
            ✓
          </span>
          <h4 class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Cómo Sentirlo (Conexión Mente-Músculo)
          </h4>
        </div>
        <p class="text-xs text-gray-200 leading-relaxed pl-8">
          ${exercise.howToFeel}
        </p>
      </div>

      <!-- Common Mistakes to Avoid Box -->
      <div class="glass-card rounded-2xl p-4 border border-orange-500/40 bg-orange-950/15 relative overflow-hidden">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold border border-orange-500/40">
            ✕
          </span>
          <h4 class="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
            Qué Evitar (Errores Comunes)
          </h4>
        </div>
        <p class="text-xs text-gray-200 leading-relaxed pl-8">
          ${exercise.whatToAvoid}
        </p>
      </div>
    </div>
  `;
}
