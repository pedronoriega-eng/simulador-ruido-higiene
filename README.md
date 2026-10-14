# 🔊 Laboratorio Virtual de Higiene Industrial y Sonometría v3 (Multisectorial)

Simulador interactivo de instrumentación acústica y evaluación de exposición ocupacional al ruido en formato web autónomo (**HTML5 + Vanilla JS + Web Audio API + Canvas 2D a 60 FPS**), conforme a la legislación colombiana (**Resolución 1792 de 1990**, **Resolución 2400 de 1979**, **GATISO-HNIR**) y estándares internacionales (**IEC 61672-1:2013**, **ISO 9612:2009**, **ACGIH / NIOSH**).

---

## 🚀 Acceso Rápido y Demo en Vivo

- **URL Pública (GitHub Pages):** `https://pedronoriega-eng.github.io/simulador-ruido-higiene/`
- **Ejecución Local:** Haz doble clic directamente en `index.html` o `simulador_higiene_ruido_multisectorial.html` en cualquier navegador (Chrome, Edge, Firefox, Safari). **No requiere Node.js, servidores ni descargas externas.**

---

## 🌟 Características Principales

1. **Catálogo Multisectorial de 25 Fuentes Acústicas (5 Sectores x 5 Máquinas):**
   - **Actividad 1: Construcción e Infraestructura:** Martillo neumático, retroexcavadora sobre orugas, mezcladora trompo de concreto, cortadora de disco diamantado y vibrocompactador.
   - **Actividad 2: Industria Manufacturera y Metalmecánica:** Prensa troqueladora excéntrica, centro de mecanizado CNC, esmeriladora angular en desbaste, cizalla guillotina neumática y compresor de tornillo con fuga.
   - **Actividad 3: Comercio al por Menor y Entretenimiento (Ocio):** Sistema sound system con subwoofers en discoteca, pista de bowling profesional, campana extractora con lavavajillas a presión, bar/restaurante con murmullo babélico (Efecto Lombard) y karting indoor 4T.
   - **Actividad 4: Explotación de Minas y Canteras:** Voladura en banco con ANFO (> 140 dBC Peak), trituradora de mandíbulas (chancadora), jumbo electrohidráulico de perforación, criba vibratoria y camión dumper minero (300t).
   - **Actividad 5: Áreas Administrativas y de Servicios:** Data Center con servidores blade y climatización CRAC, Call Center en hora pico, centro de copiado con plotter industrial, cafetería corporativa (molinillo + vapor espresso) y despacho con ventana a tráfico pesado.

2. **Motor Acústico Procedural Autónomo (Web Audio API):**
   - Síntesis matemática en tiempo real sin archivos de audio externos (`.mp3`/`.wav`).
   - Generación de ruido blanco y rosa (algoritmo Paul Kellet de 3 polos).
   - Modelado de envolventes de cresta exponencial para impactos y detonaciones.
   - Resonadores pasabanda, generadores de subgraves e intermitencias programadas.

3. **Sonómetro Digital Clase 1 (IEC 61672):**
   - Display LCD retroiluminado verde esmeralda con dígitos de gran formato y bargraph dinámico (40 a 140 dB).
   - **Ponderación Frecuencial A y C** calculadas en tiempo real para cada bin espectral de la FFT.
   - **Balística Temporal:** FAST ($\tau = 125\text{ ms}$), SLOW ($\tau = 1000\text{ ms}$) y detector PEAK ($\tau < 50\ \mu\text{s}$).
   - Generador patrón de **Calibración a 94.0 dB @ 1000 Hz**.
   - Integración acumulativa de $L_{\text{eq}}$, $L_{\text{max}}$, $L_{\text{min}}$ y $L_{\text{peak}}$.

4. **Visualización Gráfica en Canvas 2D Nativo a 60 FPS:**
   - **Osciloscopio Temporal $p(t)$:** Trazado de onda milimetrado con efecto de persistencia de fósforo verde.
   - **Analizador de Espectro RTA en Bandas de Octava:** 10 bandas normalizadas (31.5 Hz a 16 kHz) con código cromático de riesgo y retención de crestas (*Peak Hold*).

5. **Consola Diagnóstica de Higiene Ocupacional:**
   - **Semáforo Legal de Exposición:** Clasificación de riesgo según Resolución 1792 de 1990 y alerta prioritaria de picos $> 140\text{ dBC Peak}$.
   - **Comparador de Dosis:** Resolución 1792 de 1990 ($q = 5\text{ dB}$) vs. Criterio Internacional ACGIH/NIOSH ($q = 3\text{ dB}$).
   - Cálculo automático del Tiempo Máximo Permisible de permanencia en la jornada de 8 horas.
   - Prescripción técnica de Elementos de Protección Personal (EPP) y atenuación NRR/SNR sugerida.
   - Control interactivo de distancia a la fuente aplicando la **Ley del Inverso al Cuadrado** (-6 dB por duplicación de distancia).

6. **Módulo de Prácticas Pedagógicas:**
   - Modal interactivo con 4 prácticas de laboratorio guiadas paso a paso con autocarga de parámetros.

---

## 🧪 Prácticas de Laboratorio Incluidas

- **Práctica 1:** Balística FAST vs. SLOW en Ruido Intermitente y Fluctuante.
- **Práctica 2:** Discrepancia Curva A vs. C y Detección de Cresta PEAK en Ruido de Impacto.
- **Práctica 3:** Ley del Inverso al Cuadrado y Reducción de Dosis por Ingeniería de Distancia.
- **Práctica 4:** Divergencia Normativa de Dosis Acumulada: Colombia ($q = 5\text{ dB}$) vs. ACGIH ($q = 3\text{ dB}$).

---

## 📄 Licencia y Marco Legal
Desarrollado con fines educativos y de investigación en Higiene Industrial, Seguridad y Salud en el Trabajo (SST) e Ingeniería Acústica.
- **Normativa Colombia:** Res. 1792/1990, Res. 2400/1979, Dec. 1072/2015, Guía Técnica GATISO-HNIR.
- **Normativa Internacional:** IEC 61672-1:2013, ISO 9612:2009, ACGIH TLVs.
