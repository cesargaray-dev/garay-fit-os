# GARAY FIT OS // Marcy Pro & Circadian Edition 🚀
> **Progressive Web App (PWA) de Alto Rendimiento para César Enrique Garay García**  
> *Estudiante de Ingeniería en Desarrollo de Software*  
> *Programa de Hipertrofia Muscular en Gimnasio Multifuncional Marcy MWM-4965SC (150 lb) + Protocolo Circadiano 07:30 AM*

---

## ⚡ 1. Resumen de Características de la PWA

- **📱 Experiencia Nativa (PWA Standalone):** Instalable en Android e iOS, pantalla completa sin barras del navegador, íconos adaptativos y soporte 100% offline mediante `Service Worker`.
- **🔊 Sintetizador de Sonido Procedural (Web Audio API):** Sin archivos MP3 externos. Metrónomo para tempo 1-1-3, cuenta regresiva de descanso (3, 2, 1, 0), campana armónica de serie completada y alarmas de reloj circadiano.
- **📳 Respuesta Háptica (Vibration API):** Sensación táctil al marcar series, comidas, vasos de agua e hitos del día.
- **🔆 Screen Wake Lock API:** Mantiene la pantalla de tu smartphone siempre encendida durante el entrenamiento en vivo.
- **🔔 Web Notifications API:** Alertas biológicas programadas para tu despertar a las 07:30 AM, ventana anabólica, almuerzo, snack universitario a las 06:00 PM y desconexión nocturna.
- **🏋️ Motor de Sobrecarga Progresiva:** Alerta inteligente si alcanzaste el tope de repeticiones (12 reps) en tus series para recomendar bajar el pin selector a 1 placa más (+10 lb) en la siguiente sesión.
- **💾 Persistencia Reactiva y Respaldo Local:** Almacenamiento instantáneo en `localStorage` con botón para **exportar e importar copias de seguridad en formato `.json`**.

---

## 🧭 2. Arquitectura de las 5 Pestañas

| Pestaña | Nombre | Funcionalidad Principal |
|---|---|---|
| 🌅 **1** | **Mi Día** | Línea de tiempo interactiva hora por hora (07:30 a 23:30), medidor biológico en tiempo real, contador de racha (Streak) y checkboxes con feedback inmediato. |
| 🏋️ **2** | **Entrenar** | Selector de 4 días de entrenamiento + recuperación activa, visualizador esquemático SVG animado de la máquina Marcy MWM-4965SC, registro de placas/lb por serie, temporizador automático de descanso y marcapasos de tempo (1-1-3). |
| 📖 **3** | **Guía Marcy** | Manual interactivo con diagramas vectoriales de cada estación (Polea Alta, Polea Baja, Brazos Dual Press/Butterfly, Desarrollador de Piernas), configuración de pasadores y enlaces a demostraciones en video. |
| 🥤 **4** | **Nutrición & Masa** | Calculadora del Batido Hipercalórico (~755 kcal), checklist de las 5 comidas diarias, tracker de Creatina (5g) y control de hidratación (3 Litros con vasos interactivos). |
| 📈 **5** | **Progreso & Récords** | Gráfico interactivo con curva de ganancia de peso corporal, récords personales de placas/libras en cada ejercicio de la Marcy y herramienta de respaldo `.json`. |

---

## 🚀 3. Cómo Ejecutar la App en tu Computadora

El proyecto incluye un servidor ligero sin dependencias externas:

```bash
# 1. Abre la terminal en la carpeta del proyecto:
cd c:\Users\cesar\Downloads\mi-exercise-app

# 2. Inicia el servidor local:
npm start
# (o también: node server.js)
```

La consola mostrará:
```text
======================================================
🚀 GARAY FIT OS // Marcy Pro & Circadian Edition
📡 Servidor PWA corriendo en: http://localhost:3000
======================================================
```

Abre en tu navegador de escritorio: **`http://localhost:3000`**

---

## 📲 4. Cómo Instalar la PWA en tu Smartphone (Paso a Paso)

Para tenerla instalada como una **aplicación nativa en tu teléfono**:

### Paso 1: Conectar tu teléfono a la misma red Wi-Fi de tu PC
1. En tu computadora con Windows, abre PowerShell o CMD y escribe:
   ```powershell
   ipconfig
   ```
2. Busca tu **Dirección IPv4** (por ejemplo: `192.168.1.45`).
3. En el navegador de tu teléfono (Chrome o Safari), entra a:
   ```text
   http://TU_IP_LOCAL:3000   (ejemplo: http://192.168.1.45:3000)
   ```

### Paso 2: Instalación según tu sistema operativo

#### 🤖 En Android (Google Chrome / Brave)
1. Al abrir la app, verás el banner flotante: **"Instalar GARAY FIT OS en tu Smartphone"** o el botón **"INSTALAR"** en la barra superior.
2. Toca **"Instalar"**.
3. Si no aparece el banner, toca los tres puntos verticales (`⋮`) en la esquina superior derecha del navegador y presiona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
4. ¡Listo! Se creará el ícono oficial en tu cajón de aplicaciones y abrirá a pantalla completa sin la barra de direcciones de Chrome.

#### 🍏 En iPhone / iPad (Safari)
1. Abre el enlace en **Safari** (obligatorio en iOS para instalar PWAs).
2. Toca el botón **Compartir** (el ícono del cuadrado con flecha hacia arriba `⎋` en la barra inferior).
3. Desplázate hacia abajo en el menú y selecciona **"Agregar a pantalla de inicio"** (`⊞`).
4. Confirma tocando **"Agregar"** en la esquina superior derecha.
5. ¡Listo! Aparecerá el ícono en tu pantalla de inicio y se comportará como una app de iOS nativa.

---

## ⏰ 5. El Cronograma Maestro de César (Protocolo 07:30 AM)

- **`07:30 AM` — ☀️ Despertar & Activación Biológica:** Beber 500 ml de agua natural + 5 minutos de luz solar directa para activar el reloj circadiano y apagar la melatonina.
- **`08:00 AM` — 🍳 Comida 1 (Desayuno Pre-Entreno):** Huevos + pan tostado/tortillas + leche/fruta (~550 kcal, 32g proteína).
- **`08:30 AM - 09:30 AM` — 🧠 Bloque de Enfoque Matutino:** 1 hora para avanzar proyectos de Ingeniería de Software o programar mientras baja la comida.
- **`09:30 AM - 10:20 AM` — 🔥 ENTRENAMIENTO EN VIVO (Marcy MWM-4965SC):** 45 a 50 minutos de hipertrofia en el pico hormonal de fuerza.
- **`10:30 AM` — 🥤 Comida 2 (Batido Anabólico + 5g Creatina):** ~755 kcal y 48g de proteína (leche entera, Whey, avena, plátano, crema de cacahuate y creatina).
- **`11:00 AM - 02:15 PM` — 💻 Bloque de Estudio / Desarrollo de Software / Personal.**
- **`02:30 PM` — 🍗 Comida 3 (Almuerzo Fuerte Pre-Universidad):** Arroz/pasta + pechuga de pollo, res o pescado + aguacate (~800 kcal, 50g proteína).
- **`04:00 PM - 08:00 PM` — 🎓 Clases de Ingeniería en Desarrollo de Software:**
  - *`06:00 PM` (Alerta silenciosa):* **Comida 4 (Snack Universitario):** Sándwich de pavo o crema de cacahuate + frutos secos + yogur bebible (~450 kcal).
- **`09:00 PM` — 🥩 Comida 5 (Cena de Recuperación Muscular):** Quesadillas con carne, atún o huevos + leche entera (~650 kcal, 40g proteína).
- **`11:00 PM` — 🌙 Modo Desconexión:** Apagar pantallas de luz azul y preparar ropa/termo.
- **`11:30 PM` — 💤 Dormir:** 8 horas de sueño profundo reparador para máxima liberación de hormona de crecimiento (GH).

---

## 🏋️ 6. La Rutina de 4 Días en la Marcy MWM-4965SC

### DÍA 1 (Lunes): EMPUJE (Pecho, Hombros y Tríceps)
1. **Press de Pecho Sentado en Máquina Marcy:** 4 series × 8-12 reps | Descanso 90s | Tempo 1-1-3 | *Pasador colocado (Modo Press).*
2. **Aperturas en Mariposa / Pec Deck:** 3 series × 10-12 reps | Descanso 90s | Tempo 1-2-3 | *Pasador retirado (Modo Butterfly).*
3. **Elevaciones Laterales en Polea Baja:** 3 series × 12-15 reps/brazo | Descanso 60s | Tempo 1-1-2 | *Maneral individual.*
4. **Extensión de Tríceps en Polea Alta:** 4 series × 10-12 reps | Descanso 75s | Tempo 1-1-3 | *Barra corta recta.*
5. **Finalizador: Lagartijas Inclinadas al Fallo:** 2 series al fallo | Descanso 60s | *Apoyado en el asiento de la Marcy.*

### DÍA 2 (Martes): TIRÓN (Espalda Ancha en V y Bíceps)
1. **Jalón al Pecho Abierto en Polea Alta:** 4 series × 8-12 reps | Descanso 90s | Tempo 1-1-3 | *Barra larga curva (Lat Bar).*
2. **Remo Sentado en Polea Baja:** 4 series × 10-12 reps | Descanso 90s | Tempo 1-1-3 | *Pies en soportes antideslizantes.*
3. **Jalón con Agarre Cerrado Supino:** 3 series × 10-12 reps | Descanso 90s | Tempo 1-1-3 | *Palmas hacia la cara.*
4. **Curl de Bíceps de Pie en Polea Baja:** 4 series × 10-12 reps | Descanso 75s | Tempo 1-1-3 | *Barra corta recta.*

### MIÉRCOLES: DESCANSO Y RECUPERACIÓN ACTIVA
- Rutina guiada de movilidad articular de 10 min (colgado pasivo, apertura torácica, cat-cow, estiramiento de flexores de cadera y pectorales).
- Cumplimiento estricto de las 5 comidas, batido de 750 kcal, 5g creatina y 3L de agua.

### DÍA 3 (Jueves): PIERNAS COMPLETAS Y CORE
1. **Sentadilla Búlgara:** 3 series × 10-12 reps/pierna | Descanso 90s | *Pie apoyado en el banco de la Marcy.*
2. **Extensión de Cuádriceps Sentado:** 4 series × 12-15 reps | Descanso 90s | Tempo 1-2-3 | *Rodillos acolchados inferiores.*
3. **Curl Femoral de Pie con Grillete:** 4 series × 12 reps/pierna | Descanso 60s | Tempo 1-1-3 | *Grillete en polea baja.*
4. **Patada de Glúteo con Grillete en Polea Baja:** 3 series × 12 reps/pierna | Descanso 60s | Tempo 1-1-3.
5. **Crunch Abdominal Arrodillado en Polea Alta:** 3 series × 15 reps | Descanso 60s | Tempo 1-1-2.

### DÍA 4 (Viernes): TORSO COMPLETO + SUPERSERIE DE BRAZOS
1. **Press de Pecho con Agarre Vertical:** 3 series × 10-12 reps | Descanso 90s.
2. **Jalón al Pecho en Polea Alta (Bajada lenta en 4s):** 3 series × 10-12 reps | Descanso 90s | Tempo 1-1-4.
3. **Remo al Mentón en Polea Baja:** 3 series × 12 reps | Descanso 75s | Tempo 1-1-2.
4. **Superserie de Brazos (Bíceps Polea Baja + Tríceps Polea Alta):** 3 superseries × 12 + 12 reps | Descanso 90s.

---

## 🥤 7. Fórmula del Batido Hipercalórico (~755 kcal)

| Ingrediente | Cantidad | Calorías | Proteína |
|---|---|---|---|
| Leche entera de vaca | 350 ml | 210 kcal | 11.0 g |
| Proteína Whey | 1 scoop (30 g) | 120 kcal | 24.0 g |
| Plátano maduro | 1 pieza mediana | 105 kcal | 1.3 g |
| Avena en hojuelas | 45 g (4-5 cdas) | 170 kcal | 6.0 g |
| Crema de cacahuate natural | 25 g (1 cda copeteada) | 150 kcal | 6.0 g |
| Creatina Monohidrato | 5 g (1 scoop plano) | 0 kcal | 0.0 g |
| **TOTALES:** | **Batido Completo** | **~755 kcal** | **48.3 g Proteína** |

---

## 🛠️ Estructura del Código Fuente

```text
mi-exercise-app/
├── index.html            # Layout HTML5 semántico PWA con Tailwind & Lucide
├── manifest.json         # Manifiesto PWA standalone para Android/iOS
├── sw.js                 # Service Worker para caché offline completo
├── server.js             # Servidor HTTP local cero-dependencias
├── package.json          # Metadatos del proyecto y scripts de ejecución
├── css/
│   └── styles.css        # Tokens Cyber-Athlete, glassmorphism y microanimaciones
├── js/
│   ├── app.js            # Controlador reactivo y motor de las 5 pestañas
│   ├── data.js           # Rutinas, cronograma 07:30, recetas y catálogo Marcy
│   ├── audio.js          # Sintetizador procedural Web Audio API (beeps/chimes)
│   ├── storage.js        # Estado reactivo, sobrecarga progresiva y exportación .json
│   ├── wakelock.js       # Gestor de Screen Wake Lock API
│   ├── notifications.js  # Alertas y vibración háptica con Vibration API
│   └── marcy-svg.js      # Motor de diagramas vectoriales animados SVG
└── icons/
    ├── icon.svg          # Logotipo vectorial Garay Fit OS
    ├── icon-192.png      # Ícono PWA para Android/iOS
    ├── icon-512.png      # Ícono de alta resolución PWA
    └── apple-touch-icon.png
```

¡A romper marcas y construir la mejor versión física y mental, César! 💪🔥
