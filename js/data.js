// js/data.js - Complete Data Model for GARAY FIT OS // Marcy Pro & Circadian Edition

export const MARCY_MACHINE_INFO = {
  model: 'Marcy MWM-4965SC + 2 Mancuernas',
  totalWeight: '150 lb (15 Placas)',
  plateCount: 15,
  plateWeightLb: 10,
  topPlateWeightLb: 10,
  stations: [
    {
      id: 'chest-press-arms',
      name: 'Brazos Duales (Chest Press & Butterfly)',
      badge: 'Pecho y Hombro Frontal',
      description: 'Estación frontal de doble función. Con los pasadores metálicos COLOCADOS funciona como Prensa de Pecho rígida; con los pasadores RETIRADOS los brazos quedan libres para hacer Aperturas en Mariposa (Pec Deck).',
      setupSteps: [
        'Modo Press: Inserta los 2 pasadores plateados en los orificios superiores del brazo para bloquear el giro.',
        'Modo Mariposa (Pec Deck): Retira los 2 pasadores plateados para que las almohadillas cierren hacia el centro.',
        'Selecciona el peso insertando el pin en la columna de placas (1 placa = 10 lb).'
      ],
      pins: ['🔒 Pasador COLOCADO: Modo Press de Pecho', '🔓 Pasador RETIRADO: Modo Mariposa (Pec Deck)'],
      pulleys: 'Sistema de polea intermedia acoplado a los brazos de palanca'
    },
    {
      id: 'high-pulley',
      name: 'Polea Alta (High Pulley Station)',
      badge: 'Espalda, Tríceps y Abdomen',
      description: 'Polea superior ubicada sobre tu cabeza. Ideal para ensanchar la espalda (Jalones al pecho), esculpir los tríceps (Pushdowns) y trabajar el abdomen con peso real (Crunch arrodillado).',
      setupSteps: [
        'Conecta la Barra Larga Curva al mosquetón superior para espalda, o la Barra Corta para tríceps y abdomen.',
        'Para Jalón de Espalda, siéntate mirando hacia la máquina y encaja tus muslos bajo los rodillos de espuma.',
        'Para Tríceps o Abdomen, colócate frente a la máquina (de pie o arrodillado en el piso).'
      ],
      attachments: ['Barra Larga Curva (Lat Bar)', 'Barra Corta Recta'],
      pulleys: 'Polea superior directa sin cadena adicional'
    },
    {
      id: 'low-pulley',
      name: 'Polea Baja con Reposapiés (Low Pulley)',
      badge: 'Espalda Media y Bíceps',
      description: 'Ubicada en la base frontal junto al piso. Permite realizar Remos Sentados para dar grosor a la espalda y Curls de Bíceps de pie con tensión continua en todo el recorrido.',
      setupSteps: [
        'Desengancha el cable inferior del desarrollador de piernas si estaba conectado a los rodillos.',
        'Conecta la cadena extensora (si necesitas más recorrido) y acopla la Barra Corta Recta al mosquetón.',
        'En Remo Sentado: siéntate en el suelo o banco bajo y apoya las plantas de los pies en la base metálica.'
      ],
      attachments: ['Barra Corta Recta', 'Cadena Extensora + Mosquetón', 'Correa / Tobillera'],
      pulleys: 'Polea inferior frontal al ras del suelo'
    },
    {
      id: 'leg-developer',
      name: 'Desarrollador de Piernas (Leg Developer)',
      badge: 'Cuádriceps y Piernas',
      description: 'Brazo inferior acolchado con 4 rodillos de espuma. Aísla los cuádriceps de forma segura sin cargar peso sobre tu columna vertebral.',
      setupSteps: [
        'Asegúrate de que el cable de la polea baja esté enganchado al anclaje trasero del brazo de rodillos.',
        'Siéntate con la espalda pegada al respaldo y alinea tus rodillas exactamente con el eje de giro del brazo.',
        'Coloca tus empeines por debajo de los rodillos inferiores y sujétate de los costados del asiento.'
      ],
      attachments: ['Rodillos de espuma integrados'],
      pulleys: 'Conectado directamente al cable inferior'
    },
    {
      id: 'dumbbells-station',
      name: 'Tus 2 Mancuernas + Peso Corporal',
      badge: 'Hombros 3D, Brazos y Core',
      description: 'Tus dos pesas de mano complementan a la perfección la máquina Marcy porque permiten ángulos libres naturales para hombros laterales, curls martillo, copa de tríceps y remo unilateral.',
      setupSteps: [
        'Úsalas de pie o sentado en el asiento de tu Marcy (aprovechando el respaldo acolchado a 90°).',
        'En ejercicios con mancuernas, prioriza el control del movimiento (2 segundos al bajar) por encima del impulso.',
        'En la tabla de series, registra el peso o nivel de esfuerzo y enfócate en llegar a 1-2 repeticiones del fallo.'
      ],
      attachments: ['2 Mancuernas (Pesas de una mano)', 'Asiento de la Marcy como banco de apoyo'],
      pulleys: 'Peso libre (Gravedad directa)'
    }
  ],
  plateToLb: (plates) => {
    if (plates <= 0) return 0;
    return plates * 10;
  }
};

export const WORKOUT_ROUTINES = [
  {
    id: 'day1',
    dayNumber: 1,
    dayName: 'Lunes',
    title: 'DÍA 1: TORSO EN V & ABDOMEN',
    subtitle: 'Pecho, Espalda Ancha, Hombros 3D y Abdomen con Peso (Marcy + Mancuernas)',
    badge: 'Torso & Abs (Lunes)',
    color: '#F97316',
    estimatedMinutes: 50,
    exercises: [
      {
        id: 'chest-press-marcy',
        image: './assets/chest_press.jpg',
        name: 'Press de Pecho Sentado en Marcy (Agarre Horizontal)',
        station: 'Brazos de Press Dual (Marcy)',
        equipmentType: 'marcy',
        pinConfig: '🔒 Pasador de bloqueo COLOCADO (Modo Press Rígido)',
        attachment: 'Manubrios horizontales integrados',
        pulley: 'Sistema central de brazos de empuje',
        warmupTip: 'Haz 1 serie previa de calentamiento con 2 placas (20 lb) x 15 repeticiones suaves para lubricar hombros y codos.',
        progressionRule: 'Cuando logres completar las 4 series de 12 repeticiones con técnica limpia, sube 1 placa (+10 lb) el próximo lunes.',
        seriesCount: 4,
        repsRange: '10 - 12 reps',
        defaultPlates: 5,
        restSeconds: 90,
        tempo: '1-1-3',
        tempoExpl: '1s empujar fuerte, 1s apretar pecho al frente, 3s regresar lento sin que choquen las placas',
        primaryMuscles: [
          { id: 'chest', name: 'Pectoral Mayor (Medio e Inferior)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'front-delts', name: 'Deltoides Anterior (Hombro Frontal)', view: 'front' },
          { id: 'triceps', name: 'Tríceps Braquial', view: 'back' }
        ],
        machineSetup: {
          station: 'Brazos Frontales de Empuje (Marcy)',
          accessory: 'Manubrios horizontales acolchados',
          pinLock: '🔒 COLOCADOS (Bloquea el giro de mariposa)',
          bodyPosition: 'Sentado, espalda y glúteos pegados al respaldo, pies firmes en el suelo'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: Verifica que los 2 seguros metálicos estén COLOCADOS en los brazos superiores para que se muevan hacia adelante como prensa. Pon el pin en tu placa de trabajo.',
          '2. POSTURA: Siéntate, junta tus omóplatos atrás contra el respaldo ("saca el pecho") y toma los agarres horizontales. Tus codos deben quedar ligeramente abajo de la línea de los hombros (a unos 45°-60° del torso).',
          '3. EMPUJE (1 seg): Empuja hacia el frente exhalando por la boca. Al extender los brazos (sin trabar los codos de golpe), aprieta el pecho durante 1 segundo como si quisieras juntar tus bíceps.',
          '4. REGRESO (3 seg): Inhala por la nariz mientras regresas el peso lentamente en 3 segundos hasta sentir que el pecho se estira, deteniéndote a 1 cm antes de que las placas toquen abajo.'
        ],
        howToFeel: 'Debes sentir tensión directa en el centro y costados del pecho. Al juntar los omóplatos atrás, el pecho queda más adelantado que los hombros y recibe el 100% del trabajo.',
        whatToAvoid: 'No levantes los hombros hacia las orejas ni abras los codos a 90° (eso sobrecarga el hombro). Jamás despegues la espalda del respaldo ni dejes caer las placas de golpe.',
        callouts: [
          { num: '1', text: 'Omóplatos juntos y espalda pegada al respaldo', x: '34%', y: '44%' },
          { num: '2', text: 'Codos a 45° abajo de los hombros', x: '48%', y: '52%' },
          { num: '3', text: 'Empuja al frente y aprieta 1s sin chocar placas', x: '68%', y: '38%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Ajuste de Máquina y Postura',
            action: 'Coloca los pasadores de bloqueo en los brazos de prensa. Siéntate con los pies firmes en el piso, retrae tus escápulas contra el respaldo y sujeta los manubrios horizontales a la altura media del pecho.',
            breathing: 'Inhala profundo llenando el pecho antes de iniciar.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Empuje Concéntrico (1s + 1s Pausa)',
            action: 'Empuja los brazos hacia adelante en 1 segundo. Cerca de la extensión completa (codos ligeramente flexionados), haz una pausa de 1 segundo apretando fuertemente los pectorales.',
            breathing: 'Exhala el aire con fuerza por la boca al empujar.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Bajada Excéntrica (3 segundos)',
            action: 'Regresa los brazos hacia atrás contando 3 segundos completos. Siente cómo se abren las fibras del pecho y frena el movimiento justo antes de que las placas toquen la pila.',
            breathing: 'Inhala de forma lenta y controlada por la nariz.',
            icon: 'clock'
          }
        ],
        videoQuery: 'seated chest press machine proper form tutorial',
        youtubeId: 'xUm0BiZCWlQ',
        videoUrl: 'https://www.youtube.com/watch?v=xUm0BiZCWlQ'
      },
      {
        id: 'lat-pulldown-wide',
        image: './assets/lat_pulldown.jpg',
        name: 'Jalón al Pecho Agarre Ancho (Polea Alta Marcy)',
        station: 'Polea Alta (High Pulley)',
        equipmentType: 'marcy',
        pinConfig: 'Barra Larga Curva conectada al mosquetón superior',
        attachment: 'Barra Larga Curva (Lat Bar)',
        pulley: 'Polea Alta Superior',
        warmupTip: 'Haz 12 repeticiones ligeras con 2-3 placas enfocándote primero en bajar los hombros (deprimir escápulas) antes de doblar los codos.',
        progressionRule: 'Sube 1 placa (+10 lb) cuando completes 4x12 tocando la parte alta del pecho sin balancear el torso hacia atrás.',
        seriesCount: 4,
        repsRange: '10 - 12 reps',
        defaultPlates: 5,
        restSeconds: 90,
        tempo: '1-1-3',
        tempoExpl: '1s jalar a la clavícula, 1s apretar dorsales abajo, 3s subir estirando',
        primaryMuscles: [
          { id: 'lats', name: 'Dorsal Ancho (Amplitud de Espalda en V)', view: 'back' }
        ],
        secondaryMuscles: [
          { id: 'mid-back', name: 'Redondo Mayor y Romboides', view: 'back' },
          { id: 'biceps', name: 'Bíceps Braquial', view: 'front' }
        ],
        machineSetup: {
          station: 'Polea Alta Superior (Marcy)',
          accessory: 'Barra Larga Curva (Agarre abierto en los extremos)',
          pinLock: 'No aplica (Usa el mosquetón superior)',
          bodyPosition: 'Sentado mirando hacia la máquina, muslos encajados bajo los rodillos'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: Conecta la Barra Larga al mosquetón de la polea alta. Siéntate de frente a la máquina (mirando hacia las placas) o con los muslos bien asegurados para que el peso no te levante.',
          '2. AGARRE Y PECHO: Toma la barra en la parte curva externa (palmas mirando al frente). Saca el pecho e inclina tu torso apenas 10°-15° hacia atrás manteniendo la espalda recta.',
          '3. JALÓN CON LOS CODOS (1 seg): Inicia bajando los hombros lejos de las orejas y jala la barra hacia tu clavícula/pecho superior pensando en "clavar tus codos en tus bolsillos traseros". Aprieta la espalda 1 segundo abajo.',
          '4. ESTIRAMIENTO (3 seg): Deja que la barra suba lentamente en 3 segundos hasta estirar los brazos casi por completo, sintiendo cómo se abren tus dorsales debajo de las axilas.'
        ],
        howToFeel: 'Imagina que tus manos son solo ganchos y que jalas con los codos hacia abajo y hacia tus costillas. Debes sentir el trabajo debajo de las axilas (dorsales), no solo en los brazos.',
        whatToAvoid: 'NUNCA jales la barra por detrás de la nuca (es lesivo para el cuello y hombros). Tampoco te columpies hacia atrás usando el impulso de la espalda baja.',
        callouts: [
          { num: '1', text: 'Agarre ancho en la curva de la barra', x: '45%', y: '18%' },
          { num: '2', text: 'Pecho alto y lleva la barra a la clavícula', x: '48%', y: '44%' },
          { num: '3', text: 'Codos apuntando directo hacia el suelo', x: '62%', y: '54%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Agarre y Fijación Corporal',
            action: 'Toma la barra larga por sus extremos curvos con las palmas hacia adelante. Siéntate erguido, encaja tus piernas y saca el pecho hacia el techo.',
            breathing: 'Inhala profundo antes de iniciar el tirón.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Tirón Dorsal (1s + 1s Contracción)',
            action: 'Baja los hombros y lleva la barra hacia la parte superior de tu pecho en 1 segundo. Mantén la barra pegada a tu clavícula durante 1 segundo juntando los codos hacia tus costados.',
            breathing: 'Exhala con fuerza al bajar la barra hacia el pecho.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Subida Controlada (3 segundos)',
            action: 'Permite que los brazos suban lentamente en 3 segundos resistiendo el peso. Estira los dorsales arriba sin soltar la tensión de los hombros.',
            breathing: 'Inhala profundamente mientras la barra sube.',
            icon: 'clock'
          }
        ],
        videoQuery: 'wide grip lat pulldown form tutorial',
        youtubeId: 'CAwf7n6Luuc',
        videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc'
      },
      {
        id: 'pec-deck-butterfly',
        image: './assets/pec_deck.jpg',
        name: 'Aperturas en Mariposa / Pec Deck (Pecho Interno)',
        station: 'Brazos Duales en Modo Butterfly',
        equipmentType: 'marcy',
        pinConfig: '🔓 Pasador de bloqueo RETIRADO (Brazos Libres)',
        attachment: 'Almohadillas verticales para antebrazos',
        pulley: 'Cable superior de mariposa',
        warmupTip: 'Ya tienes el pecho caliente por el Press; ajusta tu postura para que tus codos queden al nivel del pecho.',
        progressionRule: 'Este es un ejercicio de aislamiento y bombeo: prioriza sostener 2 segundos cerrando al centro antes de subir de placa.',
        seriesCount: 3,
        repsRange: '12 - 15 reps',
        defaultPlates: 3,
        restSeconds: 75,
        tempo: '1-2-3',
        tempoExpl: '1s cerrar al centro, 2s apretar pecho interno al máximo, 3s abrir lento',
        primaryMuscles: [
          { id: 'chest', name: 'Pectoral Mayor (Fibras Internas y Esternales)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'front-delts', name: 'Deltoides Anterior', view: 'front' }
        ],
        machineSetup: {
          station: 'Brazos de Mariposa (Marcy)',
          accessory: 'Almohadillas verticales acolchadas',
          pinLock: '🔓 RETIRADOS (Quita los 2 seguros plateados de arriba)',
          bodyPosition: 'Espalda pegada al respaldo, codos y antebrazos apoyados en las almohadillas'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: RETIRA los 2 pasadores metálicos de bloqueo de los brazos de la Marcy para que puedan cerrarse como alas de mariposa.',
          '2. APOYO DE CODOS: Siéntate con la espalda bien pegada al respaldo. Abre los brazos a 90° y apoya toda la cara interna de tus antebrazos y codos contra las almohadillas verticales.',
          '3. CIERRE Y APRETÓN (1 seg + 2 seg pausa): Empuja con los codos (no solo con las manos) para juntar las almohadillas frente a tu cara/pecho. Sostén cerradas 2 segundos completos apretando el centro del pecho.',
          '4. APERTURA CONTROLADA (3 seg): Abre los brazos lentamente en 3 segundos hasta que tus codos queden alineados con tu torso (no vayas más atrás de tu espalda para cuidar el hombro).'
        ],
        howToFeel: 'Piensa en "juntar los codos entre sí", no las manos. Al mantener 2 segundos cerrado al centro sentirás una congestión intensa en la línea media del pectoral.',
        whatToAvoid: 'No empujes haciendo fuerza solo con las muñecas ni separes los codos de las almohadillas. No dejes que los brazos te jalen bruscamente hacia atrás.',
        callouts: [
          { num: '1', text: 'Quita los seguros superiores (Modo Libre)', x: '42%', y: '24%' },
          { num: '2', text: 'Antebrazos y codos pegados al cojín', x: '36%', y: '50%' },
          { num: '3', text: 'Junta al centro y aprieta 2 segundos', x: '66%', y: '46%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Retirar Seguros y Colocar Antebrazos',
            action: 'Retira los pasadores de los brazos de prensa. Siéntate erguido y apoya tus codos y antebrazos a 90° sobre las almohadillas verticales acolchadas.',
            breathing: 'Inhala abriendo la caja torácica.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Cierre e Isometría (1s + 2s Pausa)',
            action: 'Junta ambos brazos hacia el centro en 1 segundo empujando desde los codos. Al tocarse al centro, mantén la contracción 2 segundos exprimiendo el pectoral.',
            breathing: 'Exhala lentamente mientras aprietas el pecho.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Apertura Lenta (3 segundos)',
            action: 'Abre los brazos en 3 segundos controlando el cable hasta llegar a la línea de tus hombros, sintiendo el estiramiento pectoral.',
            breathing: 'Inhala profundo durante la apertura.',
            icon: 'clock'
          }
        ],
        videoQuery: 'pec deck butterfly machine proper form',
        youtubeId: 'Z57CtFmRMxA',
        videoUrl: 'https://www.youtube.com/watch?v=Z57CtFmRMxA'
      },
      {
        id: 'dumbbell-single-arm-row',
        image: './assets/seated_row.jpg',
        name: 'Remo Unilateral con Mancuerna (Espalda Densa)',
        station: 'Mancuerna Libre + Apoyo en Marcy',
        equipmentType: 'dumbbell',
        pinConfig: 'Usa 1 de tus Mancuernas (mano libre apoyada en el asiento Marcy)',
        attachment: '1 Mancuerna de mano (alternando brazo derecho e izquierdo)',
        pulley: 'Peso Libre (Mancuerna)',
        warmupTip: 'Apoya tu mano libre en el asiento de la Marcy para que tu espalda baja quede 100% protegida y estable.',
        progressionRule: 'Haz las repeticiones indicadas con el brazo derecho y enseguida con el izquierdo. Sube 1-2 repeticiones por semana con control total.',
        seriesCount: 4,
        repsRange: '10 - 12 reps por brazo',
        defaultPlates: 3,
        restSeconds: 75,
        tempo: '1-1-3',
        tempoExpl: '1s jalar hacia la cadera, 1s apretar dorsal arriba, 3s bajar estirando el hombro',
        primaryMuscles: [
          { id: 'lats', name: 'Dorsal Ancho Completo (Grosor y Amplitud)', view: 'back' },
          { id: 'mid-back', name: 'Espalda Media y Romboides', view: 'back' }
        ],
        secondaryMuscles: [
          { id: 'rear-delts', name: 'Deltoides Posterior', view: 'back' },
          { id: 'biceps', name: 'Bíceps y Braquial', view: 'front' }
        ],
        machineSetup: {
          station: 'Tus Mancuernas + Asiento de la Marcy como apoyo',
          accessory: '1 Mancuerna en la mano de trabajo',
          pinLock: 'Peso Libre (1 Serie = Brazo Derecho + Brazo Izquierdo)',
          bodyPosition: 'Torso inclinado a 45°, mano libre firme sobre el asiento de la Marcy, espalda plana'
        },
        executionSteps: [
          '1. APOYO ESTABLE: Toma una de tus mancuernas con la mano derecha. Apoya tu palma izquierda sobre el asiento de la Marcy, da un paso atrás con el pie derecho y mantén la espalda totalmente recta.',
          '2. POSICIÓN INICIAL: Deja colgar el brazo con la mancuerna totalmente estirado hacia el suelo, sintiendo cómo se estira el dorsal.',
          '3. JALÓN EN ARCO A LA CADERA (1 seg): Jala la mancuerna hacia tu cadera/bolsillo (NO hacia tu hombro) dibujando una curva tipo "sierra". Aprieta la espalda 1 segundo arriba.',
          '4. BAJADA (3 seg) Y CAMBIO: Baja en 3 segundos controlados. Al terminar las 10-12 repeticiones con el brazo derecho, repite de inmediato con el brazo izquierdo para completar 1 serie.'
        ],
        howToFeel: 'El secreto está en llevar la mancuerna hacia tu cadera o bolsillo del pantalón manteniendo el codo pegado al cuerpo. Si jalas hacia el pecho trabajarás solo el bíceps; hacia la cadera activas todo el dorsal.',
        whatToAvoid: 'No encorves la espalda como gato ni gires el torso bruscamente para subir la pesa.',
        callouts: [
          { num: '1', text: 'Mano libre apoyada firme en el asiento Marcy', x: '32%', y: '48%' },
          { num: '2', text: 'Espalda plana a 45° sin encorvar lumbar', x: '48%', y: '38%' },
          { num: '3', text: 'Jala la mancuerna hacia tu bolsillo/cadera', x: '64%', y: '52%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Trípode de Apoyo en el Asiento',
            action: 'Apoya tu mano libre en el cojín del asiento de la Marcy, separa los pies para tener base sólida e inclina el torso a 45° con la espalda totalmente recta.',
            breathing: 'Inhala profundo manteniendo el abdomen firme.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Tirón hacia la Cadera (1s + 1s Pausa)',
            action: 'Lleva el codo hacia atrás y arriba dirigiendo la mancuerna hacia tu cadera en 1 segundo. Pausa 1 segundo arriba contrayendo el dorsal.',
            breathing: 'Exhala al subir la mancuerna.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Descenso Controlado (3 segundos)',
            action: 'Baja la mancuerna en 3 segundos estirando por completo el dorsal abajo antes de la siguiente repetición. Repite con el otro brazo.',
            breathing: 'Inhala lentamente mientras bajas la pesa.',
            icon: 'clock'
          }
        ],
        videoQuery: 'one arm dumbbell row proper form tutorial',
        youtubeId: 'pYcpY20QaE8',
        videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8'
      },
      {
        id: 'dumbbell-lateral-raise',
        image: './assets/lateral_raise.jpg',
        name: 'Elevaciones Laterales con tus 2 Mancuernas (Hombros 3D)',
        station: 'Par de Mancuernas (De pie o Sentado)',
        equipmentType: 'dumbbell',
        pinConfig: 'Usa tus 2 Mancuernas al mismo tiempo (o Polea Baja opcional)',
        attachment: '2 Mancuernas (una en cada mano)',
        pulley: 'Peso Libre (2 Mancuernas)',
        warmupTip: 'Inicia con los codos apenas semiflexionados y piensa en lanzar las mancuernas "lejos a los lados", no hacia arriba con el cuello.',
        progressionRule: 'Para hombros laterales el control vale más que el peso: haz una pausa de 1 segundo arriba con los brazos en T.',
        seriesCount: 4,
        repsRange: '12 - 15 reps',
        defaultPlates: 2,
        restSeconds: 60,
        tempo: '1-1-3',
        tempoExpl: '1s elevar a los lados hasta el hombro, 1s sostener en T, 3s bajar resistiendo',
        primaryMuscles: [
          { id: 'side-delts', name: 'Deltoides Lateral (Anchura de Hombros 3D)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'front-delts', name: 'Deltoides Anterior', view: 'front' },
          { id: 'traps', name: 'Trapecio Superior (Estabilizador)', view: 'back' }
        ],
        machineSetup: {
          station: 'De pie frente a tu Marcy (Espacio Libre)',
          accessory: 'Tus 2 Mancuernas (1 en cada mano)',
          pinLock: 'Peso Libre (Ambos brazos simultáneos)',
          bodyPosition: 'De pie, pies al ancho de hombros, torso inclinado 5° al frente, codos semiflexionados'
        },
        executionSteps: [
          '1. POSTURA INICIAL: Toma tus 2 mancuernas y párate derecho con las rodillas ligeramente destrabadas. Inclina el pecho apenas 5° hacia adelante y coloca las mancuernas a los costados de tus muslos (sin que choquen al frente).',
          '2. EL PLANO ESCAPULAR: En lugar de subir los brazos totalmente rectos a los lados (90°), llévalos unos 15°-20° ligeramente hacia adelante para que el hombro trabaje libre y cómodo.',
          '3. ELEVACIÓN (1 seg): Sube ambos brazos al mismo tiempo liderando con los codos hasta que tus manos lleguen a la altura de tus hombros (formando una "T"). Sostén 1 segundo arriba.',
          '4. BAJADA LENTA (3 seg): Baja las mancuernas en 3 segundos resistiendo la gravedad y vuelve a subir un instante antes de que tus brazos descansen pegados al cuerpo.'
        ],
        howToFeel: 'Este es EL ejercicio rey para que tus hombros se vean anchos y tu cintura más estrecha. Debes sentir un ardor limpio en la cara externa (lateral) de ambos hombros.',
        whatToAvoid: 'No encojas los hombros hacia las orejas (mantén el cuello largo) ni te columpies con las rodillas/cadera para subir las pesas.',
        callouts: [
          { num: '1', text: 'Hombros bajos (no encojas el cuello)', x: '48%', y: '26%' },
          { num: '2', text: 'Sube liderando con los codos hasta formar una T', x: '26%', y: '38%' },
          { num: '3', text: 'Baja en 3s sin descansar abajo del todo', x: '72%', y: '56%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Postura y Plano Escapular',
            action: 'Sujeta una mancuerna en cada mano a los lados de tus muslos. Destraba ligeramente los codos y mantén los hombros bajos lejos de las orejas.',
            breathing: 'Inhala antes de elevar los brazos.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Vuelo Lateral en T (1s + 1s Pausa)',
            action: 'Eleva ambos brazos hacia los costados (ligeramente adelantados 15°) hasta la altura de los hombros. Haz una breve pausa de 1 segundo arriba.',
            breathing: 'Exhala al llegar a la altura de los hombros.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Descenso Controlado (3 segundos)',
            action: 'Baja las mancuernas durante 3 segundos aguantando el peso con los hombros. Detén el descenso a pocos centímetros de tus muslos.',
            breathing: 'Inhala mientras bajas los brazos.',
            icon: 'clock'
          }
        ],
        videoQuery: 'dumbbell lateral raise proper form tutorial',
        youtubeId: '3VcKaXpzqRo',
        videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo'
      },
      {
        id: 'kneeling-cable-crunch',
        image: './assets/cable_crunch.jpg',
        name: 'Crunch Abdominal Arrodillado en Polea Alta (Six-Pack con Peso)',
        station: 'Polea Alta (High Pulley)',
        equipmentType: 'marcy',
        pinConfig: 'Barra Corta conectada a la Polea Alta',
        attachment: 'Barra Corta Recta (o toalla gruesa pasada por el mosquetón)',
        pulley: 'Polea Alta Superior',
        warmupTip: 'Coloca una tapete, cojín o toalla doblada en el piso frente a la Marcy para apoyar tus rodillas cómodamente.',
        progressionRule: 'El abdomen es un músculo como cualquier otro: para que los cuadros resalten necesita sobrecarga progresiva. Sube 1 placa cuando hagas 4x20.',
        seriesCount: 4,
        repsRange: '15 - 20 reps',
        defaultPlates: 4,
        restSeconds: 60,
        tempo: '1-2-2',
        tempoExpl: '1s enrollar torso hacia abajo, 2s exprimir abdomen al máximo, 2s subir estirando',
        primaryMuscles: [
          { id: 'abs', name: 'Recto Abdominal (Cuadros Superiores y Medios)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'obliques', name: 'Oblicuos Externos', view: 'front' }
        ],
        machineSetup: {
          station: 'Polea Alta Superior (Marcy)',
          accessory: 'Barra Corta Recta conectada arriba',
          pinLock: 'Fija tus manos junto a tu frente/sienes (no muevas los brazos)',
          bodyPosition: 'Arrodillado en el piso a 40 cm frente a la máquina, cadera fija arriba'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: Conecta la Barra Corta en la polea alta y selecciona 3 a 5 placas. Toma la barra con ambas manos y arrodíllate en el piso frente a la máquina (o de espaldas a ella).',
          '2. BLOQUEO DE MANOS: Pega tus manos/puños a los lados de tu frente o cabeza. Tus brazos deben quedar "congelados" ahí durante toda la serie (nunca empujes con los tríceps).',
          '3. ENROLLAR LA COLUMNA (1 seg + 2 seg pausa): Sin sentarte sobre tus talones, dobla tu columna hacia abajo llevando tus codos hacia tus rodillas y metiendo las costillas hacia la pelvis. Sopla TODO el aire y aprieta el abdomen 2 segundos.',
          '4. ESTIRAMIENTO (2 seg): Regresa despacio vértebra por vértebra hasta estirar el abdomen arriba sin perder la tensión de las placas.'
        ],
        howToFeel: 'La clave está en "enrollar el pecho hacia el ombligo" como una persiana, dejando la cadera quieta arriba. Si te sientas hacia atrás sobre tus pies, estarás usando el peso de tu cuerpo y no tu abdomen.',
        whatToAvoid: 'No bajes con la espalda recta como haciendo una reverencia desde la cadera, ni empujes la barra con los brazos.',
        callouts: [
          { num: '1', text: 'Manos fijas pegadas junto a tu frente', x: '46%', y: '28%' },
          { num: '2', text: 'Enrolla las costillas hacia la pelvis (exhala todo)', x: '52%', y: '48%' },
          { num: '3', text: 'Cadera fija arriba (no te sientes en los talones)', x: '34%', y: '68%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Posición de Rodillas y Manos en la Frente',
            action: 'Arrodíllate frente a la polea alta, sujeta la barra corta y pega tus puños junto a tu frente. Mantén los muslos verticales.',
            breathing: 'Inhala por la nariz arriba.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Flexión Espinal (1s + 2s Contracción)',
            action: 'Curva tu espalda superior llevando el esternón hacia el ombligo y los codos hacia los muslos. Exhala todo el aire y aprieta el abdomen 2 segundos.',
            breathing: 'Sopla el 100% del aire abajo para contraer más profundo.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Extensión Controlada (2 segundos)',
            action: 'Desenrolla el torso lentamente en 2 segundos sintiendo cómo se estira la pared abdominal bajo carga.',
            breathing: 'Inhala mientras subes el torso.',
            icon: 'clock'
          }
        ],
        videoQuery: 'kneeling cable crunch proper form abs tutorial',
        youtubeId: '2fbujeH3F0E',
        videoUrl: 'https://www.youtube.com/watch?v=2fbujeH3F0E'
      }
    ]
  },
  {
    id: 'day2',
    dayNumber: 2,
    dayName: 'Martes',
    title: 'DÍA 2: BRAZOS DE ACERO, ABDOMEN INFERIOR & PIERNA',
    subtitle: 'Bíceps, Tríceps, Antebrazos, Abdomen Bajo y Cuádriceps (Marcy + Mancuernas)',
    badge: 'Brazos & Abs (Martes)',
    color: '#06B6D4',
    estimatedMinutes: 50,
    exercises: [
      {
        id: 'standing-bicep-curl-low-pulley',
        image: './assets/bicep_curl.jpg',
        name: 'Curl de Bíceps de Pie en Polea Baja Marcy',
        station: 'Polea Baja (Low Pulley)',
        equipmentType: 'marcy',
        pinConfig: 'Barra Corta conectada a la Polea Baja (con cadena si prefieres)',
        attachment: 'Barra Corta Recta',
        pulley: 'Polea Baja Frontal',
        warmupTip: 'Desengancha primero el cable inferior del brazo de piernas si estaba conectado y pon la Barra Corta. Haz 1 serie ligera de 15 reps.',
        progressionRule: 'Sube 1 placa cuando logres hacer las 4 series de 12 reps sin mover los codos hacia adelante ni columpiar la espalda.',
        seriesCount: 4,
        repsRange: '10 - 12 reps',
        defaultPlates: 3,
        restSeconds: 75,
        tempo: '1-1-3',
        tempoExpl: '1s subir barra al pecho, 1s apretar bíceps arriba, 3s bajar resistiendo el cable',
        primaryMuscles: [
          { id: 'biceps', name: 'Bíceps Braquial (Cabeza Corta y Larga)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'forearms', name: 'Braquiorradial y Antebrazo', view: 'front' }
        ],
        machineSetup: {
          station: 'Polea Baja Frontal (Marcy)',
          accessory: 'Barra Corta Recta (+ Cadena Extensora)',
          pinLock: 'Desconecta el rodillo de piernas y conecta la barra corta al cable inferior',
          bodyPosition: 'De pie mirando a la máquina, codos pegados a tus costillas, rodillas semidobladas'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: Conecta la Barra Corta al mosquetón de la polea baja. Toma la barra con las palmas mirando hacia el techo (agarre supino) al ancho de tus hombros.',
          '2. BLOQUEO DE CODOS: Párate erguido a un paso de la máquina, saca el pecho y pega tus codos contra tus costillas. Imagina que tus codos están "atornillados" a tu cintura.',
          '3. SUBIDA Y PICO (1 seg + 1 seg pausa): Dobla únicamente los codos subiendo la barra en arco hacia tus hombros. Arriba, aprieta los bíceps con fuerza durante 1 segundo.',
          '4. BAJADA CON TENSIÓN (3 seg): Baja la barra en 3 segundos completos resistiendo el jalón del cable hasta que tus brazos queden casi rectos abajo.'
        ],
        howToFeel: 'A diferencia de las pesas libres, el cable de la Marcy mantiene tensión constante incluso arriba y abajo. Sentirás un bombeo inmediato en todo el vientre del bíceps.',
        whatToAvoid: 'No adelantes los codos al subir la barra (eso mete el hombro) ni te inclines hacia atrás con la espalda baja.',
        callouts: [
          { num: '1', text: 'Codos pegados e inmóviles en tus costillas', x: '44%', y: '48%' },
          { num: '2', text: 'Sube la barra y aprieta el bíceps 1s arriba', x: '56%', y: '34%' },
          { num: '3', text: 'Baja en 3 segundos aguantando el cable', x: '52%', y: '68%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Conexión en Polea Baja y Postura',
            action: 'Conecta la barra corta en la polea inferior. Párate derecho frente a la máquina con las palmas hacia arriba y los codos pegados al torso.',
            breathing: 'Inhala antes de flexionar los brazos.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Flexión y Contracción (1s + 1s Pausa)',
            action: 'Sube la barra hacia el pecho en 1 segundo sin mover los codos de lugar. Sostén 1 segundo arriba apretando los bíceps al máximo.',
            breathing: 'Exhala con fuerza al subir la barra.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Extensión Lenta (3 segundos)',
            action: 'Baja la barra en 3 segundos controlando el cable hasta estirar los bíceps abajo sin que las placas choquen.',
            breathing: 'Inhala lentamente en la bajada.',
            icon: 'clock'
          }
        ],
        videoQuery: 'cable bicep curl low pulley proper form',
        youtubeId: 'NFzTWp2qpiE',
        videoUrl: 'https://www.youtube.com/watch?v=NFzTWp2qpiE'
      },
      {
        id: 'tricep-pushdown-high-pulley',
        image: './assets/tricep_pushdown.jpg',
        name: 'Extensión de Tríceps en Polea Alta (Pushdown)',
        station: 'Polea Alta (High Pulley)',
        equipmentType: 'marcy',
        pinConfig: 'Barra Corta conectada en la Polea Alta',
        attachment: 'Barra Corta Recta',
        pulley: 'Polea Alta Superior',
        warmupTip: 'El tríceps representa el 60% del tamaño de tu brazo. Mantén tus codos fijos a los costados como bisagras.',
        progressionRule: 'Cuando completes 4 series de 15 repeticiones con bloqueo limpio abajo, sube 1 placa (+10 lb).',
        seriesCount: 4,
        repsRange: '12 - 15 reps',
        defaultPlates: 4,
        restSeconds: 75,
        tempo: '1-1-3',
        tempoExpl: '1s empujar hasta estirar brazos abajo, 1s bloquear tríceps, 3s subir a 90°',
        primaryMuscles: [
          { id: 'triceps', name: 'Tríceps Braquial (Cabeza Lateral y Media - Herradura)', view: 'back' }
        ],
        secondaryMuscles: [
          { id: 'forearms', name: 'Estabilizadores de Muñeca y Antebrazo', view: 'front' }
        ],
        machineSetup: {
          station: 'Polea Alta Superior (Marcy)',
          accessory: 'Barra Corta Recta',
          pinLock: 'Conecta la barra corta al mosquetón superior',
          bodyPosition: 'De pie frente a la máquina, torso inclinado 10° al frente, codos pegados al cuerpo'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: Pasa la Barra Corta a la polea alta superior. Sujétala con las palmas mirando hacia el suelo (agarre prono) al ancho de tus hombros.',
          '2. POSICIÓN DE BISAGRA: Da medio paso atrás, inclina tu torso apenas 10° hacia adelante y pega tus codos a los costados de tus costillas. Baja la barra hasta que tus codos formen un ángulo de 90° (esa es tu posición inicial).',
          '3. EXTENSIÓN COMPLETA (1 seg + 1 seg pausa): Empuja la barra hacia tus muslos moviendo SOLO los antebrazos hasta que tus brazos queden totalmente rectos abajo. Aprieta los tríceps 1 segundo.',
          '4. SUBIDA CONTROLADA (3 seg): Deja subir la barra en 3 segundos solo hasta la altura del pecho (unos 90° en el codo), sin que tus codos se despeguen hacia adelante.'
        ],
        howToFeel: 'Al estirar los brazos por completo abajo y sostener 1 segundo, debes sentir cómo se marca la "herradura" en la parte trasera y lateral del brazo.',
        whatToAvoid: 'No dejes que la barra suba hasta tu cuello ni separes los codos del cuerpo para empujar con el pecho/hombros.',
        callouts: [
          { num: '1', text: 'Codos fijos pegados a las costillas', x: '44%', y: '44%' },
          { num: '2', text: 'Extiende por completo y aprieta 1s abajo', x: '54%', y: '62%' },
          { num: '3', text: 'Sube en 3s solo hasta 90° (altura del pecho)', x: '50%', y: '34%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Agarre Prono y Codos Pegados',
            action: 'Toma la barra corta en la polea alta con palmas hacia abajo. Pega tus codos a las costillas e inclina el torso ligeramente al frente.',
            breathing: 'Inhala con la barra a la altura del pecho.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Empuje y Bloqueo (1s + 1s Pausa)',
            action: 'Extiende los antebrazos hacia abajo en 1 segundo hasta poner los brazos totalmente rectos junto a tus muslos. Aprieta el tríceps 1 segundo.',
            breathing: 'Exhala con fuerza al estirar los brazos.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Retorno a 90° (3 segundos)',
            action: 'Permite que los antebrazos suban lentamente en 3 segundos hasta formar un ángulo de 90° sin mover la parte superior del brazo.',
            breathing: 'Inhala mientras la barra sube.',
            icon: 'clock'
          }
        ],
        videoQuery: 'tricep pushdown straight bar form tutorial',
        youtubeId: '2-LAMcpzODU',
        videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU'
      },
      {
        id: 'dumbbell-hammer-curl',
        image: './assets/bicep_curl.jpg',
        name: 'Curl Martillo con tus 2 Mancuernas (Grosor de Brazo y Antebrazo)',
        station: 'Par de Mancuernas (De pie o Sentado)',
        equipmentType: 'dumbbell',
        pinConfig: 'Usa tus 2 Mancuernas con agarre neutro (palmas enfrentadas)',
        attachment: '2 Mancuernas (una en cada mano)',
        pulley: 'Peso Libre (2 Mancuernas)',
        warmupTip: 'Las palmas de tus manos deben mirarse entre sí durante todo el movimiento (como si estuvieras clavando un martillo).',
        progressionRule: 'Puedes hacerlo con ambos brazos al mismo tiempo o alternando (1 derecha, 1 izquierda). Completa 10-12 reps por brazo.',
        seriesCount: 3,
        repsRange: '10 - 12 reps',
        defaultPlates: 3,
        restSeconds: 60,
        tempo: '1-1-3',
        tempoExpl: '1s subir con pulgares hacia arriba, 1s apretar arriba, 3s bajar lento',
        primaryMuscles: [
          { id: 'biceps', name: 'Braquial Anterior (Empuja el bíceps hacia afuera)', view: 'front' },
          { id: 'forearms', name: 'Braquiorradial (Músculo principal del Antebrazo)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'biceps', name: 'Bíceps Braquial (Cabeza Larga)', view: 'front' }
        ],
        machineSetup: {
          station: 'De pie o sentado en el banco de la Marcy',
          accessory: 'Tus 2 Mancuernas',
          pinLock: 'Agarre Neutro (Pulgares apuntando hacia arriba)',
          bodyPosition: 'Espalda derecha, hombros atrás, codos pegados al torso'
        },
        executionSteps: [
          '1. AGARRE MARTILLO: Toma una mancuerna en cada mano con las palmas mirándose frente a frente (agarre neutro, con los pulgares apuntando hacia adelante/arriba).',
          '2. POSTURA: Párate derecho o siéntate en el asiento de la Marcy con la espalda pegada al respaldo para eliminar cualquier trampa o balanceo.',
          '3. SUBIDA (1 seg): Sin girar las muñecas, sube las mancuernas hacia tus hombros manteniendo los pulgares hacia arriba. Aprieta fuerte 1 segundo en la parte alta.',
          '4. BAJADA (3 seg): Baja las mancuernas en 3 segundos controlados hasta estirar el brazo por completo abajo.'
        ],
        howToFeel: 'El Curl Martillo trabaja el músculo braquial (que está debajo del bíceps y hace que el brazo se vea ancho visto de frente) y engrosa los antebrazos rápidamente.',
        whatToAvoid: 'No gires la muñeca al subir ni separes los codos hacia afuera.',
        callouts: [
          { num: '1', text: 'Agarre neutro: palmas mirándose entre sí', x: '48%', y: '56%' },
          { num: '2', text: 'Pulgares apuntan hacia el hombro al subir', x: '56%', y: '34%' },
          { num: '3', text: 'Trabaja antebrazo y anchura del bíceps', x: '40%', y: '44%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Agarre Neutro (Tipo Martillo)',
            action: 'Sujeta tus 2 mancuernas a los costados con las palmas mirándose entre sí y los codos pegados a tus costillas.',
            breathing: 'Inhala antes de subir.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Subida Vertical (1s + 1s Pausa)',
            action: 'Flexiona los codos llevando los pulgares hacia los hombros en 1 segundo. Mantén la contracción 1 segundo arriba.',
            breathing: 'Exhala al subir las mancuernas.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Descenso Controlado (3 segundos)',
            action: 'Baja las mancuernas en 3 segundos completos estirando el brazo sin balancear el torso.',
            breathing: 'Inhala lentamente al bajar.',
            icon: 'clock'
          }
        ],
        videoQuery: 'dumbbell hammer curl proper form tutorial',
        youtubeId: 'zC3nLlEvin4',
        videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4'
      },
      {
        id: 'dumbbell-overhead-tricep',
        image: './assets/tricep_pushdown.jpg',
        name: 'Copa de Tríceps a 2 Manos con Mancuerna (Volumen de Brazo)',
        station: '1 Mancuerna Sentado en Marcy',
        equipmentType: 'dumbbell',
        pinConfig: 'Sujeta 1 Mancuerna con ambas manos por detrás de la cabeza',
        attachment: '1 Mancuerna (o 2 mancuernas ligeras)',
        pulley: 'Peso Libre (Sobre la cabeza)',
        warmupTip: 'Al llevar los brazos por encima de la cabeza se estira al máximo la "cabeza larga" del tríceps (la parte más grande del brazo).',
        progressionRule: 'Mantén los codos apuntando al frente/arriba sin abrirlos demasiado a los lados.',
        seriesCount: 3,
        repsRange: '10 - 12 reps',
        defaultPlates: 3,
        restSeconds: 60,
        tempo: '1-1-3',
        tempoExpl: '3s bajar mancuerna detrás de la nuca, 1s extender al techo, 1s apretar',
        primaryMuscles: [
          { id: 'triceps', name: 'Tríceps Braquial (Cabeza Larga - Volumen Posterior)', view: 'back' }
        ],
        secondaryMuscles: [
          { id: 'front-delts', name: 'Estabilizadores del Hombro y Core', view: 'front' }
        ],
        machineSetup: {
          station: 'Sentado en el asiento de tu Marcy',
          accessory: '1 Mancuerna sujeta en forma de "copa" o diamante con ambas manos',
          pinLock: 'Peso Libre (Ambos brazos juntos)',
          bodyPosition: 'Sentado erguido, abdomen apretado, brazos elevados sobre la cabeza'
        },
        executionSteps: [
          '1. AGARRE EN COPA: Siéntate en el banco de la Marcy. Toma 1 mancuerna de forma vertical sujetando el disco superior con la palma de ambas manos (formando un diamante con tus pulgares e índices) y elévala sobre tu cabeza.',
          '2. POSICIÓN DE CODOS: Cierra tus codos para que apunten hacia adelante y hacia arriba, cerca de tus orejas.',
          '3. BAJADA PROFUNDA (3 seg): Dobla únicamente los codos dejando bajar la mancuerna por detrás de tu cabeza en 3 segundos hasta sentir un estiramiento profundo en los tríceps.',
          '4. EXTENSIÓN AL TECHO (1 seg): Empuja la mancuerna hacia el techo extendiendo los brazos y apretando los tríceps 1 segundo arriba.'
        ],
        howToFeel: 'Mientras el Pushdown en polea trabaja la parte lateral del tríceps, esta Copa sobre la cabeza estira y hace crecer la masa interna/trasera del brazo.',
        whatToAvoid: 'No arquees en exceso la espalda baja (aprieta el abdomen mientras estás sentado) ni dejes que los codos se abran del todo hacia los lados.',
        callouts: [
          { num: '1', text: 'Sujeta el disco superior con ambas palmas (en copa)', x: '48%', y: '18%' },
          { num: '2', text: 'Codos cerrados apuntando al techo', x: '42%', y: '28%' },
          { num: '3', text: 'Baja detrás de la nuca estirando el tríceps', x: '56%', y: '34%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Agarre en Diamante sobre la Cabeza',
            action: 'Siéntate firme, sujeta el extremo de una mancuerna con ambas palmas y elévala por encima de tu cabeza con los codos cerrados.',
            breathing: 'Inhala al iniciar el descenso.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Descenso Detrás de la Nuca (3 segundos)',
            action: 'Flexiona los codos bajando la mancuerna por detrás de la cabeza en 3 segundos hasta estirar la cabeza larga del tríceps.',
            breathing: 'Inhala profundo durante toda la bajada.',
            icon: 'clock'
          },
          {
            phase: 'Fase 3: Extensión al Techo (1s + 1s Pausa)',
            action: 'Extiende los brazos hacia arriba en 1 segundo sin mover los hombros y aprieta los tríceps 1 segundo arriba.',
            breathing: 'Exhala con fuerza al subir la mancuerna.',
            icon: 'zap'
          }
        ],
        videoQuery: 'seated overhead dumbbell tricep extension form',
        youtubeId: '_gsUck-7M74',
        videoUrl: 'https://www.youtube.com/watch?v=_gsUck-7M74'
      },
      {
        id: 'leg-extension-marcy',
        image: './assets/leg_extension.jpg',
        name: 'Extensión de Cuádriceps en Marcy (Pierna Atlética)',
        station: 'Desarrollador de Piernas (Leg Developer)',
        equipmentType: 'marcy',
        pinConfig: 'Cable inferior enganchado al brazo de rodillos de espuma',
        attachment: 'Rodillos acolchados inferiores',
        pulley: 'Polea Baja conectada a Leg Developer',
        warmupTip: 'Vuelve a enganchar el cable de la polea baja al brazo acolchado de piernas. Haz 1 serie suave de 15 reps para calentar rodillas.',
        progressionRule: 'Sostén 2 segundos con las piernas totalmente estiradas arriba en cada repetición para máxima definición y fuerza en muslos.',
        seriesCount: 4,
        repsRange: '12 - 15 reps',
        defaultPlates: 5,
        restSeconds: 75,
        tempo: '1-2-3',
        tempoExpl: '1s patear arriba, 2s sostener apretando muslos arriba, 3s bajar lento',
        primaryMuscles: [
          { id: 'quads', name: 'Cuádriceps Completo (Recto Femoral y Vasto Medial)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'abs', name: 'Core Estabilizador', view: 'front' }
        ],
        machineSetup: {
          station: 'Desarrollador de Piernas (Marcy)',
          accessory: 'Rodillos de espuma inferiores acoplados al cable bajo',
          pinLock: 'Conecta el mosquetón inferior al ojal trasero del brazo de rodillos',
          bodyPosition: 'Sentado hasta el fondo, espalda pegada, manos sujetando los bordes del asiento'
        },
        executionSteps: [
          '1. CONEXIÓN DEL CABLE: Engancha el mosquetón de la polea baja al brazo de rodillos acolchados de la Marcy.',
          '2. ALINEACIÓN DE RODILLAS: Siéntate hasta el fondo del asiento. Tus rodillas deben quedar justo en el borde del cojín (alineadas con el tornillo de giro) y tus empeines/tobillos detrás de los rodillos inferiores.',
          '3. EXTENSIÓN E ISOMETRÍA (1 seg + 2 seg pausa): Sujétate fuerte de los lados del asiento, apunta las puntas de tus pies hacia ti y extiende las piernas hasta que queden horizontales. Sostén 2 segundos arriba apretando fuerte los muslos.',
          '4. BAJADA (3 seg): Baja en 3 segundos controlados hasta 90° sin dejar que las placas choquen.'
        ],
        howToFeel: 'Al sostener 2 segundos arriba con las puntas de los pies apuntando hacia el techo sentirás cómo trabajan las 4 cabezas del cuádriceps de forma intensa y segura.',
        whatToAvoid: 'No patees con impulso violento ni levantes las caderas del asiento al subir.',
        callouts: [
          { num: '1', text: 'Rodillas alineadas con el eje y cadera fija', x: '44%', y: '56%' },
          { num: '2', text: 'Empeines bajo rodillos con puntas hacia arriba', x: '58%', y: '78%' },
          { num: '3', text: 'Estira al 100% y sostén 2 segundos arriba', x: '72%', y: '58%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Conexión del Brazo de Piernas',
            action: 'Conecta el cable inferior al brazo de rodillos. Siéntate con la espalda pegada, coloca los empeines bajo los rodillos inferiores y sujeta los bordes del asiento.',
            breathing: 'Inhala antes de extender las piernas.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Extensión y Pausa (1s + 2s Contracción)',
            action: 'Extiende ambas piernas hasta la horizontal en 1 segundo. Mantén las piernas rectas arriba durante 2 segundos apretando los cuádriceps.',
            breathing: 'Exhala mientras aprietas arriba.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Descenso Lento (3 segundos)',
            action: 'Dobla las rodillas regresando el peso en 3 segundos sin que las placas toquen abajo.',
            breathing: 'Inhala durante el descenso.',
            icon: 'clock'
          }
        ],
        videoQuery: 'leg extension machine proper form tutorial',
        youtubeId: 'YyvSfVjQeL0',
        videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0'
      },
      {
        id: 'lying-leg-raise-abs',
        image: './assets/cable_crunch.jpg',
        name: 'Elevación de Piernas y Crunch Inverso (Abdomen Inferior / V-Cut)',
        station: 'Tapete en Suelo o Banco (Peso Corporal)',
        equipmentType: 'bodyweight',
        pinConfig: 'Peso Corporal (Manos debajo de glúteos o sujetando la base de la Marcy)',
        attachment: 'Tapete o toalla en el piso',
        pulley: 'Peso Corporal (Enfoque Abdomen Bajo)',
        warmupTip: 'El lunes trabajamos el abdomen superior en polea; hoy martes atacamos el abdomen inferior (debajo del ombligo) elevando las piernas y la pelvis.',
        progressionRule: 'Clave técnica: al llegar arriba, despega ligeramente la cadera/glúteos del suelo enrollando la pelvis hacia tus costillas.',
        seriesCount: 4,
        repsRange: '15 - 20 reps',
        defaultPlates: 1,
        restSeconds: 60,
        tempo: '1-1-3',
        tempoExpl: '1s subir piernas y despegar pelvis, 1s apretar abdomen bajo, 3s bajar sin tocar el piso',
        primaryMuscles: [
          { id: 'abs', name: 'Recto Abdominal Inferior (Zona Baja y V-Cut)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'obliques', name: 'Oblicuos y Transverso Abdominal', view: 'front' }
        ],
        machineSetup: {
          station: 'En el piso junto a tu Marcy (sobre tapete o toalla)',
          accessory: 'Peso Corporal (Opcional: sujetarse de la base metálica de la Marcy detrás de tu cabeza)',
          pinLock: 'Espalda baja presionada contra el suelo en todo momento',
          bodyPosition: 'Acostado boca arriba, piernas juntas y rodillas apenas semiflexionadas'
        },
        executionSteps: [
          '1. POSICIÓN EN EL PISO: Acuéstate boca arriba en un tapete. Puedes poner tus manos con las palmas hacia abajo debajo de tus glúteos, o sujetarte de la base metálica de la Marcy por detrás de tu cabeza para mayor firmeza.',
          '2. ESPALDA PEGADA: Presiona tu espalda baja contra el piso metiendo el ombligo y levanta los talones a 10 cm del suelo.',
          '3. SUBIDA + ELEVACIÓN DE PELVIS (1 seg): Sube ambas piernas juntas hasta la vertical y, en el último tramo, despega unos centímetros la cadera del suelo llevando las rodillas hacia el pecho. Aprieta 1 segundo.',
          '4. BAJADA LENTA (3 seg): Baja las piernas en 3 segundos aguantando con el abdomen inferior sin que los talones toquen el suelo y sin que se arquee tu espalda baja.'
        ],
        howToFeel: 'Al despegar ligeramente el coxis/cadera del suelo en la parte alta del movimiento, activas al 100% la parte inferior del abdomen (los 2 cuadros de abajo y la V abdominal).',
        whatToAvoid: 'No dejes que se forme un hueco grande debajo de tu espalda baja al bajar las piernas (si sientes la espalda baja, dobla un poco más las rodillas).',
        callouts: [
          { num: '1', text: 'Espalda baja pegada al piso (o manos bajo glúteos)', x: '42%', y: '68%' },
          { num: '2', text: 'Sube piernas y despega ligeramente la pelvis arriba', x: '54%', y: '42%' },
          { num: '3', text: 'Baja en 3s sin que los talones toquen el suelo', x: '70%', y: '64%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Posición Supina y Bloqueo Lumbar',
            action: 'Acuéstate boca arriba, coloca las manos bajo los glúteos (o sujeta la base de la Marcy) y pega tu zona lumbar contra el piso.',
            breathing: 'Inhala con las piernas extendidas a 10 cm del suelo.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Elevación y Giro Pélvico (1s + 1s Pausa)',
            action: 'Eleva las piernas juntas y enrolla la pelvis despegando los glúteos 3-5 cm del suelo. Aprieta el abdomen bajo 1 segundo.',
            breathing: 'Exhala todo el aire al subir la cadera.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Descenso Excéntrico (3 segundos)',
            action: 'Baja las piernas lentamente en 3 segundos manteniendo el abdomen tenso hasta quedar a unos centímetros del piso.',
            breathing: 'Inhala mientras bajas las piernas.',
            icon: 'clock'
          }
        ],
        videoQuery: 'lying leg raise reverse crunch proper form abs',
        youtubeId: 'JB2oyawG9KI',
        videoUrl: 'https://www.youtube.com/watch?v=JB2oyawG9KI'
      }
    ]
  },
  {
    id: 'day3',
    dayNumber: 3,
    dayName: 'Miércoles',
    title: 'DÍA 3: TORSO COMPLETO 2.0, BRAZOS & CORE 360°',
    subtitle: 'Espalda Baja/Media, Pecho Superior, Hombros, Superserie de Brazos y Core Total',
    badge: 'Remate Total (Miércoles)',
    color: '#10B981',
    estimatedMinutes: 55,
    exercises: [
      {
        id: 'underhand-lat-pulldown',
        image: './assets/lat_pulldown.jpg',
        name: 'Jalón Supino Agarre Cerrado en Polea Alta (Dorsal Bajo + Bíceps)',
        station: 'Polea Alta (High Pulley)',
        equipmentType: 'marcy',
        pinConfig: 'Barra Larga o Barra Corta en Polea Alta (Palmas hacia tu cara)',
        attachment: 'Barra Larga o Barra Corta',
        pulley: 'Polea Alta Superior',
        warmupTip: 'Este agarre con palmas hacia ti te permite mover más peso y ataca tanto la parte baja del dorsal como los bíceps al mismo tiempo.',
        progressionRule: 'Es el primer ejercicio del miércoles: aprovecha tu energía al 100%. Sube 1 placa cuando completes 4x12.',
        seriesCount: 4,
        repsRange: '10 - 12 reps',
        defaultPlates: 6,
        restSeconds: 90,
        tempo: '1-1-3',
        tempoExpl: '1s jalar al esternón pegando codos al cuerpo, 1s apretar espalda y bíceps, 3s subir',
        primaryMuscles: [
          { id: 'lats', name: 'Dorsal Ancho Inferior (Inserción Baja en V)', view: 'back' },
          { id: 'biceps', name: 'Bíceps Braquial (Fuerza Pesada)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'mid-back', name: 'Romboides y Trapecio Medio', view: 'back' }
        ],
        machineSetup: {
          station: 'Polea Alta Superior (Marcy)',
          accessory: 'Barra Larga o Corta (Agarre Supino: palmas mirando hacia ti)',
          pinLock: 'Manos separadas exactamente al ancho de tus hombros',
          bodyPosition: 'Sentado mirando a la máquina, pecho elevado hacia el techo'
        },
        executionSteps: [
          '1. AGARRE SUPINO: En la polea alta, toma la barra con las palmas de las manos mirando hacia tu cara (como en una dominada para bíceps), con las manos separadas al ancho de tus hombros.',
          '2. PECHO ALTO: Siéntate firme, saca el pecho e inclina el torso apenas 10° hacia atrás.',
          '3. JALÓN CON CODOS CERRADOS (1 seg): Jala la barra hacia la parte media/baja de tu pecho pasando tus codos bien pegados a tus costillas hacia atrás. Aprieta dorsales y bíceps 1 segundo abajo.',
          '4. ESTIRAMIENTO COMPLETO (3 seg): Deja subir la barra en 3 segundos hasta estirar por completo los brazos y sentir cómo se alargan tus dorsales desde la cintura.'
        ],
        howToFeel: 'Al llevar los codos cerrados rozando tus costillas hacia atrás, el dorsal trabaja en su máximo recorrido desde la cintura hasta la axila, dando aspecto de espalda gruesa y fuerte.',
        whatToAvoid: 'No encorves los hombros hacia adelante cuando la barra toca tu pecho; mantén siempre el pecho orgulloso.',
        callouts: [
          { num: '1', text: 'Palmas mirando hacia ti al ancho de hombros', x: '46%', y: '20%' },
          { num: '2', text: 'Codos bajan pegados a las costillas', x: '44%', y: '48%' },
          { num: '3', text: 'Toca el pecho y estira en 3s al subir', x: '58%', y: '38%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Agarre Supino al Ancho de Hombros',
            action: 'Sujeta la barra superior con las palmas mirando hacia ti al ancho de tus hombros. Siéntate erguido y saca el pecho.',
            breathing: 'Inhala arriba estirando los dorsales.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Tirón al Esternón (1s + 1s Pausa)',
            action: 'Baja la barra hasta tu pecho en 1 segundo llevando los codos hacia atrás pegados al torso. Aprieta espalda y bíceps 1 segundo.',
            breathing: 'Exhala con fuerza al tocar el pecho.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Subida Excéntrica (3 segundos)',
            action: 'Regresa la barra hacia arriba en 3 segundos controlados hasta estirar los brazos por completo.',
            breathing: 'Inhala profundamente mientras subes.',
            icon: 'clock'
          }
        ],
        videoQuery: 'underhand close grip lat pulldown form tutorial',
        youtubeId: 'ecRF8ERf2q4',
        videoUrl: 'https://www.youtube.com/watch?v=ecRF8ERf2q4'
      },
      {
        id: 'vertical-grip-chest-press',
        image: './assets/chest_press.jpg',
        name: 'Press de Pecho Agarre Vertical Neutro en Marcy',
        station: 'Brazos de Press Dual (Agarre Vertical)',
        equipmentType: 'marcy',
        pinConfig: '🔒 Pasador de bloqueo COLOCADO (Modo Press)',
        attachment: 'Manubrios verticales internos (palmas mirándose)',
        pulley: 'Sistema central de brazos de empuje',
        warmupTip: 'El lunes usaste el agarre horizontal; hoy miércoles usa los tubos verticales internos para atacar el pecho interno/superior y proteger los hombros.',
        progressionRule: 'Baja ligeramente tus hombros y junta los codos hacia el centro al empujar para exprimir el pectoral interno.',
        seriesCount: 4,
        repsRange: '10 - 12 reps',
        defaultPlates: 5,
        restSeconds: 90,
        tempo: '1-1-3',
        tempoExpl: '1s empujar con codos cerrados, 1s apretar centro del pecho, 3s regresar lento',
        primaryMuscles: [
          { id: 'chest', name: 'Pectoral Mayor (Fibras Internas y Superiores)', view: 'front' },
          { id: 'triceps', name: 'Tríceps Braquial', view: 'back' }
        ],
        secondaryMuscles: [
          { id: 'front-delts', name: 'Deltoides Anterior', view: 'front' }
        ],
        machineSetup: {
          station: 'Brazos Frontales de Empuje (Marcy)',
          accessory: 'Agarre Vertical Interno (palmas enfrentadas)',
          pinLock: '🔒 COLOCADOS (Bloquea el modo mariposa)',
          bodyPosition: 'Espalda pegada al respaldo, codos más pegados a las costillas'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: Asegúrate de que los 2 pasadores metálicos superiores estén COLOCADOS (en modo Press).',
          '2. AGARRE VERTICAL: Siéntate con los omóplatos juntos atrás y sujeta los manubrios verticales (las barras que apuntan hacia arriba, de modo que tus palmas se miren entre sí).',
          '3. EMPUJE CERRADO (1 seg): Manteniendo los codos cerca del cuerpo, empuja hacia adelante en 1 segundo. Al llegar al frente, imagina que quieres juntar ambos puños entre sí para contraer el centro del pecho durante 1 segundo.',
          '4. REGRESO (3 seg): Vuelve hacia atrás en 3 segundos controlados sintiendo cómo los codos pasan junto a tu torso sin que las placas choquen.'
        ],
        howToFeel: 'Este agarre neutro es súper cómodo para las muñecas y hombros, y genera una contracción brutal en la parte media-alta del pecho y los tríceps.',
        whatToAvoid: 'No abras los codos hacia afuera ni separes la cabeza o espalda del respaldo.',
        callouts: [
          { num: '1', text: 'Toma los tubos verticales (palmas enfrentadas)', x: '52%', y: '44%' },
          { num: '2', text: 'Codos viajan pegados junto a las costillas', x: '44%', y: '54%' },
          { num: '3', text: 'Aprieta el centro del pecho 1s al frente', x: '68%', y: '42%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Agarre Neutro y Escápulas Fijas',
            action: 'Con los seguros colocados, siéntate erguido, junta tus omóplatos y toma los manubrios verticales con las palmas mirándose entre sí.',
            breathing: 'Inhala antes de empujar.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Empuje Interno (1s + 1s Contracción)',
            action: 'Empuja hacia adelante en 1 segundo manteniendo los codos cerca del torso. Aprieta el centro del pecho y los tríceps 1 segundo al frente.',
            breathing: 'Exhala con fuerza al extender.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Retorno en 3 Segundos',
            action: 'Regresa el peso en 3 segundos sintiendo el estiramiento profundo sin dejar caer las placas.',
            breathing: 'Inhala lentamente en el regreso.',
            icon: 'clock'
          }
        ],
        videoQuery: 'neutral grip chest press machine form',
        youtubeId: 'xUm0BiZCWlQ',
        videoUrl: 'https://www.youtube.com/watch?v=xUm0BiZCWlQ'
      },
      {
        id: 'seated-cable-row',
        image: './assets/seated_row.jpg',
        name: 'Remo Sentado en Polea Baja Marcy (Espalda Media y Postura)',
        station: 'Polea Baja con Reposapiés',
        equipmentType: 'marcy',
        pinConfig: 'Barra Corta conectada a la Polea Baja (desengancha rodillo de pierna)',
        attachment: 'Barra Corta Recta (+ Cadena Extensora)',
        pulley: 'Polea Baja Frontal',
        warmupTip: 'Este ejercicio corrige la postura de estar sentado programando en la computadora al fortalecer los músculos que tiran los hombros hacia atrás.',
        progressionRule: 'En cada repetición, junta tus omóplatos atrás durante 1 segundo como si quisieras atrapar un lápiz en el centro de tu espalda.',
        seriesCount: 4,
        repsRange: '10 - 12 reps',
        defaultPlates: 5,
        restSeconds: 90,
        tempo: '1-1-3',
        tempoExpl: '1s jalar barra al abdomen, 1s juntar omóplatos atrás, 3s estirar brazos al frente',
        primaryMuscles: [
          { id: 'mid-back', name: 'Romboides, Trapecio Medio y Espalda Media', view: 'back' },
          { id: 'lats', name: 'Dorsal Ancho', view: 'back' }
        ],
        secondaryMuscles: [
          { id: 'rear-delts', name: 'Deltoides Posterior (Hombro Trasero)', view: 'back' },
          { id: 'biceps', name: 'Bíceps y Antebrazo', view: 'front' }
        ],
        machineSetup: {
          station: 'Polea Baja Frontal (Marcy)',
          accessory: 'Barra Corta Recta conectada al cable inferior',
          pinLock: 'Desengancha el brazo de rodillos para liberar el cable bajo',
          bodyPosition: 'Sentado en el piso frente a la máquina, pies apoyados en la base metálica, rodillas semiflexionadas'
        },
        executionSteps: [
          '1. CONFIGURACIÓN: Conecta la Barra Corta en la polea baja. Siéntate en un cojín o tapete en el suelo frente a la Marcy y apoya las plantas de tus pies en la base metálica inferior.',
          '2. POSTURA RECTA: Toma la barra, deslízate un poco hacia atrás para que las placas se despeguen, deja tus rodillas ligeramente flexionadas y pon tu espalda 100% derecha sacando el pecho.',
          '3. TIRÓN AL OMBLIGO (1 seg): Sin columpiar el torso, jala la barra hacia tu ombligo/abdomen llevando los codos hacia atrás y juntando tus omóplatos con fuerza durante 1 segundo.',
          '4. REGRESO (3 seg): Extiende los brazos hacia adelante en 3 segundos manteniendo la espalda recta.'
        ],
        howToFeel: 'Debes sentir cómo se contrae toda la parte central de tu espalda cuando juntas los omóplatos y la barra toca tu abdomen.',
        whatToAvoid: 'No redondees la espalda baja hacia adelante ni uses el impulso de tu cintura columpiándote hacia atrás.',
        callouts: [
          { num: '1', text: 'Pies apoyados en la base y rodillas semiflexionadas', x: '66%', y: '78%' },
          { num: '2', text: 'Torso a 90° con pecho afuera y espalda recta', x: '34%', y: '44%' },
          { num: '3', text: 'Jala al abdomen juntando los omóplatos 1s', x: '48%', y: '56%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Posición Sentada y Pies en la Base',
            action: 'Siéntate frente a la polea baja, apoya los pies en el soporte inferior con las rodillas ligeramente flexionadas y pon la espalda recta.',
            breathing: 'Inhala con los brazos extendidos al frente.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Remo al Abdomen (1s + 1s Contracción)',
            action: 'Jala la barra hacia tu abdomen bajo en 1 segundo llevando los codos hacia atrás. Junta tus escápulas durante 1 segundo completo.',
            breathing: 'Exhala con fuerza al tocar el abdomen.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Extensión Controlada (3 segundos)',
            action: 'Extiende los brazos lentamente en 3 segundos sin encorvar la zona lumbar.',
            breathing: 'Inhala mientras regresas la barra.',
            icon: 'clock'
          }
        ],
        videoQuery: 'seated cable row proper form tutorial',
        youtubeId: 'GZbfZ033f74',
        videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74'
      },
      {
        id: 'dumbbell-shoulder-press',
        image: './assets/lateral_raise.jpg',
        name: 'Press Militar Sentado con tus 2 Mancuernas (Hombros Completos)',
        station: 'Sentado en Marcy + 2 Mancuernas',
        equipmentType: 'dumbbell',
        pinConfig: 'Usa tus 2 Mancuernas apoyando tu espalda en el respaldo de la Marcy',
        attachment: '2 Mancuernas (una en cada mano)',
        pulley: 'Peso Libre (Empuje Vertical)',
        warmupTip: 'Aprovecha el respaldo acolchado de tu máquina Marcy como asiento para mantener tu espalda 100% apoyada y estable.',
        progressionRule: 'No choques las mancuernas arriba; sube en línea recta sobre tus hombros y baja en 3 segundos hasta la altura de tus orejas.',
        seriesCount: 3,
        repsRange: '10 - 12 reps',
        defaultPlates: 3,
        restSeconds: 75,
        tempo: '1-1-3',
        tempoExpl: '1s empujar mancuernas al techo, 1s sostener arriba, 3s bajar hasta las orejas',
        primaryMuscles: [
          { id: 'front-delts', name: 'Deltoides Anterior y Lateral (Hombros Completos)', view: 'front' },
          { id: 'side-delts', name: 'Deltoides Medio', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'triceps', name: 'Tríceps Braquial', view: 'back' }
        ],
        machineSetup: {
          station: 'Sentado en el asiento de tu Marcy',
          accessory: 'Tus 2 Mancuernas',
          pinLock: 'Espalda apoyada en el respaldo, pies firmes en el piso',
          bodyPosition: 'Mancuernas a la altura de las orejas, codos ligeramente adelantados (plano escapular)'
        },
        executionSteps: [
          '1. POSICIÓN SENTADA: Siéntate en la Marcy con la espalda bien apoyada en el respaldo. Sube tus 2 mancuernas a la altura de tus orejas/mejillas con las palmas mirando hacia adelante.',
          '2. ÁNGULO DE CODOS: No abras los codos totalmente hacia atrás; adelántalos unos 15°-20° para que tus hombros empujen con total comodidad y fuerza.',
          '3. EMPUJE VERTICAL (1 seg): Empuja ambas mancuernas hacia el techo hasta extender casi por completo los brazos (sin que las pesas choquen entre sí). Sostén 1 segundo arriba.',
          '4. BAJADA CONTROLADA (3 seg): Baja las mancuernas en 3 segundos hasta que vuelvan a quedar al nivel de tus orejas/mentón.'
        ],
        howToFeel: 'El Press con mancuernas sentado construye masa sólida en toda la corona del hombro y la parte alta del torso.',
        whatToAvoid: 'No arquees la espalda baja para subir el peso ni rebotes abajo.',
        callouts: [
          { num: '1', text: 'Espalda firme contra el respaldo de la Marcy', x: '42%', y: '52%' },
          { num: '2', text: 'Baja en 3s hasta el nivel de tus orejas', x: '36%', y: '32%' },
          { num: '3', text: 'Empuja al techo sin chocar las mancuernas', x: '52%', y: '16%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Asiento Firme y Mancuernas en Orejas',
            action: 'Siéntate con la espalda apoyada en el respaldo de la Marcy y coloca las 2 mancuernas a la altura de tus orejas con los codos ligeramente adelantados.',
            breathing: 'Inhala antes de empujar.',
            icon: 'settings'
          },
          {
            phase: 'Fase 2: Press Vertical (1s + 1s Pausa)',
            action: 'Empuja ambas mancuernas hacia el techo en 1 segundo hasta casi extender los codos. Sostén 1 segundo arriba.',
            breathing: 'Exhala con fuerza al subir las pesas.',
            icon: 'zap'
          },
          {
            phase: 'Fase 3: Descenso a 90° (3 segundos)',
            action: 'Baja las mancuernas en 3 segundos controlados hasta que tus codos formen 90° y las pesas queden junto a tus orejas.',
            breathing: 'Inhala lentamente en la bajada.',
            icon: 'clock'
          }
        ],
        videoQuery: 'seated dumbbell shoulder press proper form',
        youtubeId: 'qEwKCR5JCog',
        videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog'
      },
      {
        id: 'superset-arms-biceps-triceps',
        image: './assets/bicep_curl.jpg',
        name: 'Superserie Finisher de Brazos: Curl Mancuernas + Pushdown Tríceps',
        station: '2 Mancuernas + Polea Alta Marcy',
        equipmentType: 'marcy',
        pinConfig: 'Ten tus 2 Mancuernas a la mano y la Barra Corta puesta en la Polea Alta',
        attachment: '2 Mancuernas + Barra Corta en Polea Alta',
        pulley: 'Superserie (Sin descanso entre Bíceps y Tríceps)',
        warmupTip: '¡Es tu cierre de brazos de la semana! Al usar tus mancuernas para bíceps y la polea alta para tríceps no pierdes ni 1 segundo cambiando cables.',
        progressionRule: 'Haz 12 Curls con tus mancuernas e inmediatamente (0s de descanso) haz 12-15 Pushdowns en la polea alta. Eso cuenta como 1 serie.',
        seriesCount: 3,
        repsRange: '12 Bíceps + 15 Tríceps',
        defaultPlates: 3,
        restSeconds: 75,
        tempo: '1-1-2',
        tempoExpl: 'Fluido e intenso: 12 reps de Bíceps con mancuernas + 15 reps de Tríceps en polea sin pausa',
        primaryMuscles: [
          { id: 'biceps', name: 'Bíceps Braquial Completo', view: 'front' },
          { id: 'triceps', name: 'Tríceps Braquial Completo', view: 'back' }
        ],
        secondaryMuscles: [
          { id: 'forearms', name: 'Antebrazos (Congestión Total)', view: 'front' }
        ],
        machineSetup: {
          station: 'Superserie Rápida: Mancuernas + Polea Alta Marcy',
          accessory: 'Parte A: Tus 2 Mancuernas | Parte B: Barra Corta en Polea Alta',
          pinLock: 'Deja la barra corta lista arriba antes de empezar para pasar de A a B al instante',
          bodyPosition: 'De pie frente a la máquina, codos siempre pegados a las costillas'
        },
        executionSteps: [
          '1. PREPARACIÓN INTELIGENTE: Conecta la Barra Corta en la polea alta de la Marcy y deja tus 2 mancuernas en el suelo a tu lado. Así no tienes que cambiar ningún mosquetón a mitad de la superserie.',
          '2. PARTE A — BÍCEPS CON MANCUERNAS (12 reps): Toma tus 2 mancuernas con las palmas hacia adelante y haz 12 Curls de Bíceps estrictos apretando 1 segundo arriba.',
          '3. PARTE B — TRÍCEPS EN POLEA ALTA (15 reps SIN DESCANSO): Suelta las mancuernas, toma de inmediato la Barra Corta de la polea alta y haz 15 extensiones de tríceps hacia abajo.',
          '4. DESCANSO: Ahora sí, marca la serie como completada y descansa 75 segundos antes de la siguiente ronda.'
        ],
        howToFeel: 'Al combinar tus mancuernas con la polea alta sin pausa, llenas de sangre y nutrientes tanto la parte frontal como trasera del brazo antes de tus 4 días de descanso (Jueves a Domingo).',
        whatToAvoid: 'No sacrifiques la postura por ir rápido: mantén siempre los codos pegados a tus costillas en ambos ejercicios.',
        callouts: [
          { num: '1', text: 'Parte A: 12 Curls de Bíceps con tus 2 mancuernas', x: '34%', y: '44%' },
          { num: '2', text: '0s de pausa: suelta mancuernas y pasa a la polea', x: '50%', y: '28%' },
          { num: '3', text: 'Parte B: 15 Extensiones de Tríceps en Polea Alta', x: '66%', y: '56%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Parte A — 12 Curls con Mancuernas (Bíceps)',
            action: 'Toma tus 2 mancuernas de pie, pega los codos a tus costillas y realiza 12 repeticiones de Curl de Bíceps apretando arriba.',
            breathing: 'Exhala al subir las mancuernas, inhala al bajar.',
            icon: 'zap'
          },
          {
            phase: 'Fase 2: Transición Instantánea (0 segundos)',
            action: 'Deja las mancuernas en el piso de forma segura y toma inmediatamente la Barra Corta que ya dejaste lista en la Polea Alta.',
            breathing: 'Respira profundo y continuo.',
            icon: 'settings'
          },
          {
            phase: 'Fase 3: Parte B — 15 Pushdowns en Polea Alta (Tríceps)',
            action: 'Pega los codos al torso y realiza 15 extensiones de tríceps completas hasta bloquear abajo. Descansa 75s al terminar ambos.',
            breathing: 'Exhala al empujar la barra hacia abajo.',
            icon: 'clock'
          }
        ],
        videoQuery: 'biceps and triceps superset workout form',
        youtubeId: 'NFzTWp2qpiE',
        videoUrl: 'https://www.youtube.com/watch?v=NFzTWp2qpiE'
      },
      {
        id: 'core-360-plank-crunch',
        image: './assets/cable_crunch.jpg',
        name: 'Circuito Core 360°: Crunch en Polea Alta + Plancha Abdominal',
        station: 'Polea Alta + Tapete en Suelo',
        equipmentType: 'marcy',
        pinConfig: 'Barra Corta en Polea Alta + Plancha sobre antebrazos en el suelo',
        attachment: 'Barra Corta Recta + Tapete',
        pulley: 'Polea Alta + Isometría Corporal',
        warmupTip: 'Último ejercicio de la semana: combina hipertrofia de cuadros abdominales con la Plancha Isométrica para reducir cintura y blindar el core.',
        progressionRule: 'Haz 15 Cunches arrodillado en la polea alta e inmediatamente quédate 45 segundos en Plancha sobre tus antebrazos.',
        seriesCount: 3,
        repsRange: '15 Crunch + 45s Plancha',
        defaultPlates: 4,
        restSeconds: 60,
        tempo: '1-2-2',
        tempoExpl: '15 repeticiones de Crunch con peso + 45 segundos de Plancha apretando abdomen y glúteos',
        primaryMuscles: [
          { id: 'abs', name: 'Recto Abdominal Completo y Transverso (Faja Abdominal)', view: 'front' }
        ],
        secondaryMuscles: [
          { id: 'obliques', name: 'Oblicuos y Estabilizadores Lumbares', view: 'front' }
        ],
        machineSetup: {
          station: 'Polea Alta Marcy + Piso',
          accessory: 'Barra Corta en Polea Alta y tapete en el suelo',
          pinLock: '1 Serie = 15 Crunches en Polea + 45 seg de Plancha',
          bodyPosition: 'Arrodillado para el Crunch -> Boca abajo apoyado en antebrazos para la Plancha'
        },
        executionSteps: [
          '1. PARTE A — 15 CRUNCHES EN POLEA ALTA: Arrodíllate frente a la polea alta, pega las manos con la barra corta a tu frente y haz 15 crunches enrollando las costillas hacia la pelvis y expulsando todo el aire.',
          '2. PARTE B — 45 SEGUNDOS DE PLANCHA (PLANK): Sin descansar, suelta la barra y ponte boca abajo en el piso apoyado sobre tus antebrazos y las puntas de los pies.',
          '3. ACTIVACIÓN TOTAL EN PLANCHA: Forma una línea recta de cabeza a talones. Mete el ombligo hacia adentro, aprieta fuerte los glúteos y empuja el piso con tus codos durante 45 segundos.',
          '4. ¡SEMANA COMPLETADA!: Al terminar las 3 series habrás completado tu entrenamiento de Lunes a Miércoles; ahora de Jueves a Domingo tu cuerpo crecerá con descanso y nutrición.'
        ],
        howToFeel: 'El Crunch en polea engrosa los cuadros del abdomen para que se noten más, mientras que la Plancha activa el músculo transverso (la faja natural que aplana el abdomen y estrecha la cintura).',
        whatToAvoid: 'En la plancha, no dejes que la cadera se hunda hacia el suelo; mantén glúteos y abdomen duros como roca.',
        callouts: [
          { num: '1', text: 'Parte A: 15 Crunches en Polea Alta con peso', x: '46%', y: '34%' },
          { num: '2', text: 'Parte B: 45s de Plancha sobre antebrazos', x: '52%', y: '68%' },
          { num: '3', text: 'Aprieta abdomen y glúteos en línea recta', x: '68%', y: '62%' }
        ],
        stepByStep: [
          {
            phase: 'Fase 1: Parte A — 15 Crunches en Polea Alta',
            action: 'Arrodíllate frente a la Marcy, fija tus manos junto a la frente y realiza 15 repeticiones de Crunch Abdominal en polea soplando todo el aire abajo.',
            breathing: 'Exhala todo el aire al bajar, inhala al subir.',
            icon: 'zap'
          },
          {
            phase: 'Fase 2: Transición al Suelo (Plancha)',
            action: 'Suelta la barra y colócate boca abajo apoyando los antebrazos en el tapete (codos justo debajo de tus hombros) y las puntas de los pies.',
            breathing: 'Respira corto y controlado manteniendo el abdomen duro.',
            icon: 'settings'
          },
          {
            phase: 'Fase 3: Parte B — 45 Segundos de Plancha Isométrica',
            action: 'Sostén tu cuerpo en línea recta durante 45 segundos apretando el abdomen hacia adentro y los glúteos.',
            breathing: 'No aguantes la respiración; respira de forma constante.',
            icon: 'clock'
          }
        ],
        videoQuery: 'plank exercise proper form core tutorial',
        youtubeId: 'pSHjTRCQxIw',
        videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw'
      }
    ]
  }
];

// Helper to map current weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday) to Routine
// Training is strictly Monday (1), Tuesday (2), and Wednesday (3)
export function getRoutineForDay(dayOfWeek) {
  if (dayOfWeek === 1) return { type: 'workout', routine: WORKOUT_ROUTINES[0] }; // Lunes: Torso en V & Abdomen
  if (dayOfWeek === 2) return { type: 'workout', routine: WORKOUT_ROUTINES[1] }; // Martes: Brazos de Acero, Abdomen Inferior & Pierna
  if (dayOfWeek === 3) return { type: 'workout', routine: WORKOUT_ROUTINES[2] }; // Miércoles: Torso Completo 2.0, Brazos & Core 360°
  if (dayOfWeek === 4) {
    return {
      type: 'rest',
      title: 'Jueves de Supercompensación Muscular (Día sin Pesas)',
      subtitle: 'Tus músculos entrenados de Lunes a Miércoles están reparándose. Mañana libre; mantén tus 5 comidas, 5g de creatina y 3L de agua.'
    };
  }
  if (dayOfWeek === 5) {
    return {
      type: 'rest',
      title: 'Viernes de Síntesis Proteica & Descanso Libre',
      subtitle: 'Tu cuerpo sigue construyendo tejido muscular en segundo plano. Cumple tus comidas, hidratación y sueño reparador.'
    };
  }
  if (dayOfWeek === 6) {
    return {
      type: 'rest',
      title: 'Sábado de Recarga de Glucógeno & Descanso',
      subtitle: 'Fin de semana libre de entrenamiento. Mantén tu batido hipercalórico, creatina diaria y buena alimentación.'
    };
  }
  return {
    type: 'rest',
    title: 'Domingo de Preparación (Mañana Lunes: Torso en V)',
    subtitle: 'Descanso total y recarga de energía para arrancar mañana lunes al 100% con Pecho, Espalda, Hombros y Abdomen.'
  };
}

// Shared 5 Daily Meals (Synced between Tab 1 "Mi Día" and Tab 4 "Nutrición & Masa")
// Calibrated for César: 21 years old, 1.78m, 66 kg -> Lean Bulk Target ~2,850 kcal & 145g Protein
export const DAILY_MEALS_DATA = [
  {
    id: 'meal_1',
    time: '08:00 AM',
    name: 'Comida 1: Desayuno Rico en Proteína',
    cals: 520,
    protein: 30,
    caloriesText: '~520 kcal',
    proteinText: '30g proteína',
    desc: '3 huevos revueltos o estrellados + 2 rebanadas de pan tostado o 3 tortillas de maíz + 1 vaso de leche o fruta fresca.'
  },
  {
    id: 'meal_2',
    time: '10:30 AM',
    name: 'Comida 2: Batido Hipercalórico + 5g Creatina',
    cals: 755,
    protein: 48,
    caloriesText: '~755 kcal',
    proteinText: '48g proteína',
    desc: '350ml leche entera + 1 scoop Whey + 1 plátano + 45g avena + 1 cda crema de cacahuate + 5g Creatina Monohidrato.'
  },
  {
    id: 'meal_3',
    time: '02:30 PM',
    name: 'Comida 3: Almuerzo Fuerte Pre-Universidad',
    cals: 720,
    protein: 42,
    caloriesText: '~720 kcal',
    proteinText: '42g proteína',
    desc: '1.5 tazas de arroz o pasta + 150g-180g de pechuga de pollo, carne de res o pescado + 1/2 aguacate y verduras.'
  },
  {
    id: 'meal_4',
    time: '06:00 PM',
    name: 'Comida 4: Snack Universitario Rápido',
    cals: 380,
    protein: 18,
    caloriesText: '~380 kcal',
    proteinText: '18g proteína',
    desc: 'Sándwich de pechuga de pavo con queso o crema de cacahuate + puñado de almendras/nueces o yogur proteico en tu receso de clases.'
  },
  {
    id: 'meal_5',
    time: '09:00 PM',
    name: 'Comida 5: Cena de Crecimiento Nocturno',
    cals: 475,
    protein: 32,
    caloriesText: '~475 kcal',
    proteinText: '32g proteína',
    desc: '2-3 quesadillas con carne/pollo deshebrado, atún preparado o huevos con frijoles + 1 vaso de leche antes de dormir.'
  }
];

// Schedule for Training Days: MONDAY, TUESDAY, WEDNESDAY
export const CIRCADIAN_SCHEDULE_TRAINING = [
  {
    id: 'wake_up',
    time: '07:30 AM',
    hour: 7,
    minute: 30,
    title: '☀️ Despertar & Hidratación Matutina (500 ml)',
    category: 'circadian',
    color: '#F59E0B',
    icon: 'sun',
    desc: 'Beber 500 ml de agua al despertar + 5 minutos de luz solar natural para activar tu reloj biológico y energía.',
    actionRequired: 'Beber 500ml de Agua + Luz Solar'
  },
  {
    id: 'meal_1',
    time: '08:00 AM',
    hour: 8,
    minute: 0,
    title: '🍳 Comida 1: Desayuno Pre-Entreno de Carga',
    category: 'nutrition',
    color: '#10B981',
    icon: 'coffee',
    desc: 'Combustible para rendir al máximo a las 9:30 AM: 3 huevos + pan tostado o tortillas + vaso de leche o fruta. ¡No entrenes vacío!',
    actionRequired: 'Consumir Desayuno (~520 kcal)',
    calories: '~520 kcal',
    protein: '30g proteína'
  },
  {
    id: 'focus_block_1',
    time: '08:30 AM',
    hour: 8,
    minute: 30,
    endTime: '09:30 AM',
    title: '🧠 Bloque de Enfoque & Digestión Pre-Entreno',
    category: 'study',
    color: '#06B6D4',
    icon: 'code',
    desc: '1 hora libre para programar, avanzar proyectos de Ingeniería en Software o preparar tu playlist mientras haces digestión.',
    actionRequired: 'Digestión y Enfoque'
  },
  {
    id: 'workout_session',
    time: '09:30 AM',
    hour: 9,
    minute: 30,
    endTime: '10:25 AM',
    title: '🔥 ENTRENAMIENTO EN VIVO (Marcy + Mancuernas)',
    category: 'workout',
    color: '#F97316',
    icon: 'dumbbell',
    desc: 'Sesión de 50 minutos enfocada en Torso, Espalda, Brazos y Abdomen en tu pico máximo de fuerza y testosterona del día.',
    actionRequired: 'Iniciar Rutina del Día',
    energyLevel: '100% (Pico de Fuerza)'
  },
  {
    id: 'meal_2',
    time: '10:30 AM',
    hour: 10,
    minute: 30,
    title: '🥤 Comida 2: Batido Ganador de Masa + 5g Creatina',
    category: 'nutrition',
    color: '#10B981',
    icon: 'zap',
    desc: 'Recuperación post-entreno: Licuado de ~755 kcal y 48g de proteína (leche entera, Whey, plátano, avena, crema de cacahuate) + 5g de Creatina.',
    actionRequired: 'Tomar Batido + 5g Creatina',
    calories: '~755 kcal',
    protein: '48g proteína'
  },
  {
    id: 'study_block_2',
    time: '11:00 AM',
    hour: 11,
    minute: 0,
    endTime: '02:15 PM',
    title: '💻 Desarrollo de Software / Tareas / Tiempo Personal',
    category: 'study',
    color: '#06B6D4',
    icon: 'terminal',
    desc: 'Bloque productivo de mañana/mediodía para código, tareas universitarias o descanso activo.',
    actionRequired: 'Estudio y Proyectos'
  },
  {
    id: 'meal_3',
    time: '02:30 PM',
    hour: 14,
    minute: 30,
    title: '🍗 Comida 3: Almuerzo Fuerte Pre-Universidad',
    category: 'nutrition',
    color: '#10B981',
    icon: 'utensils',
    desc: 'Comida principal antes de ir a clases: Arroz o pasta abundante + pollo, res o pescado + aguacate y verduras.',
    actionRequired: 'Consumir Almuerzo (~720 kcal)',
    calories: '~720 kcal',
    protein: '42g proteína'
  },
  {
    id: 'university_classes',
    time: '04:00 PM',
    hour: 16,
    minute: 0,
    endTime: '08:00 PM',
    title: '🎓 Clases de Ingeniería en Desarrollo de Software',
    category: 'university',
    color: '#8B5CF6',
    icon: 'book-open',
    desc: 'Horario universitario (16:00 a 20:00 hrs). Lleva tu termo de agua y tu snack de las 6:00 PM.',
    actionRequired: 'Asistir a Clases (16:00 - 20:00)'
  },
  {
    id: 'meal_4',
    time: '06:00 PM',
    hour: 18,
    minute: 0,
    title: '🥪 Comida 4: Snack Universitario (Mitad de Clases)',
    category: 'nutrition',
    color: '#10B981',
    icon: 'package',
    desc: 'Evita el catabolismo en la universidad: Sándwich de pavo o crema de cacahuate + frutos secos o yogur.',
    actionRequired: 'Comer Snack (~380 kcal)',
    calories: '~380 kcal',
    protein: '18g proteína'
  },
  {
    id: 'meal_5',
    time: '09:00 PM',
    hour: 21,
    minute: 0,
    title: '🥩 Comida 5: Cena de Recuperación Muscular',
    category: 'nutrition',
    color: '#10B981',
    icon: 'moon',
    desc: 'Cena rica en proteína para reparar fibras mientras duermes: Quesadillas con carne/pollo, huevos o atún + vaso de leche.',
    actionRequired: 'Consumir Cena (~475 kcal)',
    calories: '~475 kcal',
    protein: '32g proteína'
  },
  {
    id: 'sleep_time',
    time: '11:30 PM',
    hour: 23,
    minute: 30,
    title: '💤 Dormir 8 Horas (Crecimiento Muscular Profundo)',
    category: 'circadian',
    color: '#6366F1',
    icon: 'bed',
    desc: 'Habitación oscura y fresca. Tus músculos crecen mientras duermes gracias al pico nocturno de hormona de crecimiento.',
    actionRequired: 'Dormir 8 horas reparadoras'
  }
];

// Schedule for Rest Days: THURSDAY, FRIDAY, SATURDAY, SUNDAY
// Free mornings without workout blocks — strictly focused on meals, water, creatine & sleep reminders
export const CIRCADIAN_SCHEDULE_REST = [
  {
    id: 'wake_up',
    time: '07:30 AM',
    hour: 7,
    minute: 30,
    title: '☀️ Despertar & 500 ml de Agua (Mañana Libre de Pesas)',
    category: 'circadian',
    color: '#F59E0B',
    icon: 'sun',
    desc: 'Hoy es día de descanso muscular (Jueves a Domingo). Toma 500 ml de agua al despertar para hidratar tus músculos en recuperación.',
    actionRequired: 'Hidratación al Despertar (500 ml)'
  },
  {
    id: 'meal_1',
    time: '08:30 AM',
    hour: 8,
    minute: 30,
    title: '🍳 Comida 1: Desayuno Rico en Proteína',
    category: 'nutrition',
    color: '#10B981',
    icon: 'coffee',
    desc: 'Tus músculos entrenados de Lunes a Miércoles siguen creciendo hoy: desayuna 3 huevos + pan/tortillas + leche o fruta.',
    actionRequired: 'Consumir Desayuno (~520 kcal)',
    calories: '~520 kcal',
    protein: '30g proteína'
  },
  {
    id: 'meal_2',
    time: '11:00 AM',
    hour: 11,
    minute: 0,
    title: '🥤 Comida 2: Batido Ganador de Masa + 5g Creatina',
    category: 'nutrition',
    color: '#10B981',
    icon: 'zap',
    desc: 'La creatina y el superávit calórico se toman todos los días para subir de 66 kg a 72+ kg con masa muscular limpia.',
    actionRequired: 'Tomar Batido + 5g Creatina',
    calories: '~755 kcal',
    protein: '48g proteína'
  },
  {
    id: 'meal_3',
    time: '02:30 PM',
    hour: 14,
    minute: 30,
    title: '🍗 Comida 3: Almuerzo Fuerte del Día',
    category: 'nutrition',
    color: '#10B981',
    icon: 'utensils',
    desc: 'Arroz o pasta abundante + pechuga de pollo, carne de res o pescado + aguacate y ensalada.',
    actionRequired: 'Consumir Almuerzo (~720 kcal)',
    calories: '~720 kcal',
    protein: '42g proteína'
  },
  {
    id: 'meal_4',
    time: '06:00 PM',
    hour: 18,
    minute: 0,
    title: '🥪 Comida 4: Snack de Tarde + Revisión de Agua (3L)',
    category: 'nutrition',
    color: '#10B981',
    icon: 'package',
    desc: 'Sándwich proteico + frutos secos o yogur, y asegúrate de llevar al menos 2 litros de agua tomados a esta hora.',
    actionRequired: 'Comer Snack + Hidratarse',
    calories: '~380 kcal',
    protein: '18g proteína'
  },
  {
    id: 'meal_5',
    time: '09:00 PM',
    hour: 21,
    minute: 0,
    title: '🥩 Comida 5: Cena de Síntesis Muscular Nocturna',
    category: 'nutrition',
    color: '#10B981',
    icon: 'moon',
    desc: 'Cena rica en proteína (quesadillas con carne/pollo, huevos o atún + leche) para sostener la ganancia muscular.',
    actionRequired: 'Consumir Cena (~475 kcal)',
    calories: '~475 kcal',
    protein: '32g proteína'
  },
  {
    id: 'sleep_time',
    time: '11:30 PM',
    hour: 23,
    minute: 30,
    title: '💤 Dormir 8 Horas (Recuperación Total)',
    category: 'circadian',
    color: '#6366F1',
    icon: 'bed',
    desc: 'Descanso profundo para mantener tu metabolismo, energía y recuperación al 100%.',
    actionRequired: 'Dormir 8 horas'
  }
];

// Default export alias for backwards compatibility, plus dynamic getter by day of week
export const CIRCADIAN_SCHEDULE = CIRCADIAN_SCHEDULE_TRAINING;

export function getCircadianScheduleForDay(dayOfWeek, overrideMode = null) {
  if (overrideMode === 'training') return CIRCADIAN_SCHEDULE_TRAINING;
  if (overrideMode === 'rest') return CIRCADIAN_SCHEDULE_REST;
  const isTrainingDay = dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3;
  return isTrainingDay ? CIRCADIAN_SCHEDULE_TRAINING : CIRCADIAN_SCHEDULE_REST;
}

export const HYPERCALORIC_SHAKE_RECIPE = {
  name: 'Batido Anabólico César Garay (~755 kcal)',
  ingredients: [
    { id: 'milk', name: 'Leche entera de vaca (o deslactosada entera)', amount: '350 ml', cals: 210, protein: 11, carbs: 17, fat: 11 },
    { id: 'whey', name: 'Proteína Whey (1 scoop sabor chocolate/vainilla)', amount: '30 g', cals: 120, protein: 24, carbs: 2, fat: 1.5 },
    { id: 'banana', name: 'Plátano maduro mediano', amount: '1 pieza', cals: 105, protein: 1.3, carbs: 27, fat: 0.3 },
    { id: 'oats', name: 'Avena entera en hojuelas', amount: '45 g (4-5 cdas)', cals: 170, protein: 6, carbs: 30, fat: 3 },
    { id: 'peanut_butter', name: 'Crema de cacahuate 100% natural', amount: '25 g (1 cda copeteada)', cals: 150, protein: 6, carbs: 5, fat: 12 },
    { id: 'creatine', name: 'Creatina Monohidrato micronizada', amount: '5 g (1 scoop plano)', cals: 0, protein: 0, carbs: 0, fat: 0 }
  ],
  totals: {
    calories: 755,
    protein: 48.3,
    carbs: 81,
    fat: 27.8
  },
  preparationSteps: [
    '1. Vierte primero los 350 ml de leche en la licuadora para que los polvos no se peguen al fondo.',
    '2. Añade los 45g de avena en hojuelas y el plátano en trozos.',
    '3. Agrega 1 scoop de Proteína Whey y 1 cucharada copeteada de crema de cacahuate.',
    '4. Añade tu dosis diaria de 5g de Creatina Monohidrato.',
    '5. Licúa a velocidad alta durante 45-60 segundos hasta que la avena quede totalmente pulverizada.',
    '6. Tómalo a las 10:30 AM (justo después de entrenar de Lunes a Miércoles, o a media mañana de Jueves a Domingo).'
  ]
};
