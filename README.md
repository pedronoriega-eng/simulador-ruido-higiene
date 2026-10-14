# 🔊 Laboratorio Virtual de Higiene Industrial y Sonometría v3 (Multisectorial)

Simulador interactivo de instrumentación acústica y evaluación de exposición ocupacional al ruido en formato web autónomo (**HTML5 + Vanilla JS + Web Audio API + Canvas 2D a 60 FPS**), conforme a la legislación técnica colombiana (**Resolución 2844 de 2007 - GATISO-HNIR**, **Resolución 1792 de 1990**, **Resolución 2400 de 1979**) y estándares internacionales (**IEC 61672-1:2013**, **IEC 61260:2014**, **ISO 9612:2009**, **ACGIH / NIOSH**).

---

## 🚀 Acceso Rápido y Demo en Vivo

- **URL Pública (GitHub Pages):** [https://pedronoriega-eng.github.io/simulador-ruido-higiene/](https://pedronoriega-eng.github.io/simulador-ruido-higiene/)
- **Repositorio Oficial:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)
- **Ejecución Local:** Haz doble clic directamente en `index.html` o `simulador_higiene_ruido_multisectorial.html` en cualquier navegador (Chrome, Edge, Firefox, Safari). **No requiere Node.js, servidores ni descargas externas.**

---

## 🌟 Características Principales

### 1. Maquinaria Industrial con Fotografías Reales de Alta Resolución
En el **Sector B: Manufactura y Metalmecánica**, los equipos se presentan mediante fotografías reales de taller industrial con efectos de física interactiva superpuesta (chispas balísticas, resplandor térmico incandescente, onda de choque en matrices de corte y vapores):
1. **Amoladora Angular Bosch Professional GWS:** Disco de 230 mm en desbaste abrasivo de soldadura a 8500 RPM.
2. **Prensa Excéntrica EP-500 (Precision Metalworks):** Estampado progresivo de 500 kN con volante de inercia y barrera de seguridad.
3. **Martinete de Forja Pesada con Acero Incandescente:** Deformación plástica a $1100^\circ\text{C}$ con maza neumática y yunque ($138.2\text{ dBC Peak}$).
4. **Compresor de Tornillo Kaeser CSDX 165:** Compresor rotativo Sigma Profile con motor trifásico de 90 kW en skid abierto.
5. **Ventilador Centrífugo Industrial de Tiro Forzado:** Rodete multipala con frecuencia de paso de álabes (BPF a 480 Hz) y turbulencia aerodinámica.

Además, incluye **20 máquinas adicionales** en otros 4 sectores económicos (Construcción, Comercio y Ocio, Minería, Servicios y Oficinas).

### 2. Tres Gráficas Técnicas en Tiempo Real Simultáneas
1. **📈 Onda de Presión $p(t)$ [Presión en Pascales (Pa)]:**
   - Presión acústica instantánea en unidades físicas calibradas con $p_0 = 20\,\mu\text{Pa}$.
   - Auto-escalado dinámico ($\pm 0.1$, $\pm 0.5$, $\pm 2$, $\pm 10$, $\pm 50$ o $\pm 100\text{ Pa}$) y lecturas numéricas RMS y Peak.
2. **📉 Registro Temporal $L_p$ en el Tiempo ($dB$ vs $t$):**
   - Histograma continuo de los últimos **30 segundos** (buffer a 4 Hz).
   - **Línea roja punteada:** Umbral Límite Permisible de **85 dBA** (Res. 1792/90).
   - **Línea ámbar continua:** Nivel de Acción Legal de **80 dBA** (Res. 2844/07 / GATISO-HNIR).
   - Curva de $L_p$ instantáneo y línea de tendencia de $L_{\text{Aeq}}$ continuo acumulado.
3. **📊 Analizador de Espectro RTA en Bandas de Octava (IEC 61260):**
   - 10 bandas normalizadas: 31.5 Hz a 16 kHz.
   - Código cromático de riesgo (verde, ámbar, rojo), valores numéricos en dB y líneas de referencia en 80 y 85 dB.

### 3. Sonómetro Digital Integrador (Réplica EXTECH 407780A)
- Chasis ergonómico platino con empuñaduras de caucho estriadas.
- Display LCD verde esmeralda con dígitos de gran formato 7-segmentos y vúmetro bargraph discreto de 50 segmentos.
- **Ponderaciones Frecuenciales:** Filtros normalizados IEC 61672 para Curva **A** y Curva **C**.
- **Balística Temporal:** **FAST** ($\tau = 125\text{ ms}$), **SLOW** ($\tau = 1000\text{ ms}$) y detector **PEAK** ($\tau < 50\ \mu\text{s}$).
- Sonda de micrófono con capuchón antiviento desmontable y cápsula de titanio de 1/2".
- Generador patrón de **Calibración a 94.0 dB @ 1000 Hz**.

### 4. Consola Diagnóstica Bajo Normativa Colombiana
- **Resolución 2844 de 2007 (GATISO-HNIR):**
  - **Nivel de Acción Legal en 80 dBA** ($\text{Dosis} = 50\%$).
  - Activación automática del **Programa de Conservación Auditiva (PCA)**.
  - **Vigilancia Audiométrica Tamiz:** Periodicidad **Bianual** (80 a 84.9 dBA) y **Anual Obligatoria** ($\ge 85\text{ dBA}$ o jornadas extendidas/ototóxicos).
  - **Calculadora de Atenuación Real de EPP en Oído (*Derating*):** Evalúa el nivel residual en tímpano $L_{\text{oído}} = L_{\text{Aeq}} - \text{Atenuación}$ según el criterio de protección óptima (70–80 dBA), insuficiente ($>80\text{ dBA}$) o sobreprotección ($<70\text{ dBA}$).
- **Resolución 1792 de 1990:**
  - TLV de 8 horas en **85 dBA**.
  - **Tasa de intercambio legal colombiana de $q = 5\text{ dB}$** ($T_{\text{perm}} = 8 / 2^{(L_{\text{eq}} - 85)/5}$ h).
  - Límite absoluto para ruido de impacto de **140 dBC Peak**.
- **Resolución 2400 de 1979:**
  - Prioridad de control de ingeniería en la fuente y el medio antes de recurrir al EPP.

---

## 🧪 Prácticas Pedagógicas de Laboratorio Incluidas

1. **Práctica 1:** Balística FAST vs. SLOW en Ruido Intermitente y Fluctuante.
2. **Práctica 2:** Discrepancia Curva A vs. C y Detección de Cresta PEAK en Ruido de Impacto.
3. **Práctica 3:** Ley del Inverso al Cuadrado y Reducción de Dosis por Ingeniería de Distancia.
4. **Práctica 4:** Divergencia Normativa de Dosis Acumulada: Colombia ($q = 5\text{ dB}$) vs. ACGIH ($q = 3\text{ dB}$).

---

## 📁 Estructura del Repositorio

- [`index.html`](index.html): Aplicación web completa y autónoma.
- [`simulador_higiene_ruido_multisectorial.html`](simulador_higiene_ruido_multisectorial.html): Código fuente maestro.
- [`PROYECTO_ESTADO_Y_MEMORIA.md`](PROYECTO_ESTADO_Y_MEMORIA.md): Registro técnico y memoria del proyecto para continuidad.
- [`assets/machines/`](assets/machines/): Banco de fotografías industriales reales.

---

## 📄 Marco Legal y Referencias Técnicas
- **Colombia:** Resolución 2844 de 2007 (GATISO-HNIR), Resolución 1792 de 1990, Resolución 2400 de 1979, Decreto 1072 de 2015.
- **Internacional:** IEC 61672-1:2013, IEC 61260:2014, ISO 9612:2009, ANSI S3.19.
