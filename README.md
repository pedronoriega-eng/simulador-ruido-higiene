# 🔊 Laboratorio Virtual de Higiene Industrial y Sonometría v3 (Multisectorial)

Simulador interactivo de instrumentación acústica y evaluación de exposición ocupacional al ruido en formato web autónomo (**HTML5 + Vanilla JS + Web Audio API + Canvas 2D a 60 FPS**), conforme a la legislación técnica colombiana (**Resolución 2844 de 2007 - GATISO-HNIR**, **Resolución 1792 de 1990**, **Resolución 2400 de 1979**) y estándares internacionales (**IEC 61672-1:2013**, **IEC 61260:2014**, **NTC-ISO 9612:2009**, **ACGIH / NIOSH**).

---

## 🚀 Acceso Rápido y Demo en Vivo

- **URL Pública (GitHub Pages):** [https://pedronoriega-eng.github.io/simulador-ruido-higiene/](https://pedronoriega-eng.github.io/simulador-ruido-higiene/)
- **Repositorio Oficial:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)
- **Ejecución Local:** Haz doble clic directamente en `index.html` o `simulador_higiene_ruido_multisectorial.html` en cualquier navegador (Chrome, Edge, Firefox, Safari). **No requiere Node.js, servidores ni descargas externas.**

---

## 🌟 Características Principales

### 1. Maquinaria Industrial con Fotografías Reales de Alta Resolución
Fotografías reales de equipos en operación con síntesis acústica procedimental dedicada y efectos de física interactiva:

- **Sector A: Construcción e Infraestructura:**
  1. **Cortadora de Disco para Concreto STIHL TS:** Motor 2 tiempos y disco diamantado a 4200 RPM con corte de pavimento de alta fricción.
  2. **Martillo Neumático Rompepavimentos:** Maza percutora de 32 kg a 26 Hz y ráfagas de escape neumático a 6 bar.
  3. **Mezcladora Trompo con Volteo de Áridos:** Tambor de 350 L accionado por corona dentada y cascada de grava.
  4. **Retroexcavadora sobre Orugas:** Motor turbodiésel 6 cilindros de 120 kW con silbido de turbina y traqueteo de orugas.
  5. **Vibrocompactador Pata de Cabra:** Rodillo tándem excéntrico a 30 Hz y pisado de terrones de suelo a 60 Hz.
- **Sector B: Manufactura y Metalmecánica:**
  1. **Amoladora Angular Bosch Professional GWS (230 mm, 8500 RPM)** con lluvia de chispas balísticas.
  2. **Prensa Excéntrica EP-500 Precision Metalworks (500 kN)** con onda de choque en matriz de corte.
  3. **Martinete de Forja Pesada con Acero Incandescente ($1100^\circ\text{C}$)** con resplandor térmico y $138.2\text{ dBC Peak}$.
  4. **Compresor de Tornillo Kaeser CSDX 165 (90 kW)** con chimenea térmica activa.
  5. **Ventilador Centrífugo Industrial de Tiro Forzado (480 Hz BPF)** con vórtices aerodinámicos.
- **Otros Sectores:** Comercio y Ocio, Minería a Cielo Abierto y Subterránea, Servicios y Oficinas.

---

### 2. Plano General del Sector con Medición de Longitudes y Simulación Multifoco
En el **Sector A: Construcción e Infraestructura**, activa el botón **"🗺️ Plano General del Sector"**:
- **Composición Fotográfica del Sector Completo:** Fotografía del área real de obra con dimensiones de ingeniería acotadas: **$45.0\text{ m}$ de ancho $\times 32.0\text{ m}$ de profundidad ($1,440\text{ m}^2$)**, a escala $1\text{ cm} = 5\text{ m}$.
- **Herramienta Cinta Métrica Interactiva:** Haz clic y arrastra sobre cualquier zona del plano para medir distancias físicas en metros y calcular en tiempo real la atenuación teórica por divergencia acústica en campo libre ($\Delta L = 20\log_{10}(d)$).
- **Simulador Acústico Multifoco en Vivo:**
  - Activa y desactiva máquinas individuales simultáneamente mediante balizas interactivas con interruptor luminoso ON/OFF.
  - Arrastra la **sonda del sonómetro** a cualquier coordenada del mapa.
  - Cálculo de suma energética logarítmica exacta de todas las fuentes activas según su distancia euclidiana física:
    $$L_{p,\text{total}} = 10 \log_{10} \left( \sum_{i=1}^n 10^{L_{p,i}/10} \right)$$

---

### 3. Protocolo de Muestreo Higiénico con Temporizador
- **Tiempos de Medición Seleccionables:** 15 segundos (tamiz rápido de orientación), 1 minuto, 5 minutos y 15 minutos (estándar ISO 9612 / GATISO-HNIR).
- Reloj cronómetro regresivo animado, barra de avance con gradiente y señal acústica al finalizar.
- **Tabla Metrológica de Puntos de Muestreo:** Registra $L_{\text{Aeq}}$, $L_{\text{Cpeak}}$, $L_{\text{max}}$, $L_{\text{min}}$, tiempo permisible de exposición según Res. 1792/90 ($T_{\text{perm}} = 8 / 2^{(L_{\text{eq}}-85)/5}$), dosis acumulada proyectada para 8 horas y diagnóstico normativo legal.

---

### 4. Generación y Descarga de Informe Técnico Oficial en PDF
Exporta un informe técnico pericial de Higiene Industrial con plena validez como soporte legal de evaluación ocupacional bajo la normatividad colombiana:
- **Marco Legal Incluido:**
  - **Resolución 2844 de 2007 (GATISO-HNIR):** Nivel de Acción en 80 dBA, inclusión en PCA, periodicidad de audiometrías tamiz (bianual para 80–84.9 dBA, anual obligatoria para $\ge 85\text{ dBA}$) y factores de *derating* en EPP auditivo (50% en tapones premoldeados/espuma, 70-75% en orejeras).
  - **Resolución 1792 de 1990:** TLV de 85 dBA, tasa de intercambio $q = 5\text{ dB}$, límite de impacto de 140 dBC Peak.
  - **Resolución 2400 de 1979:** Jerarquía de controles (fuente, medio y receptor).
  - **NTC-ISO 9612:2009:** Metodología y estrategia de medición higiénica.
- **Contenido del Documento PDF:**
  - Encabezado institucional, radicado y fecha de muestreo.
  - Metadatos editables: Empresa, NIT, Obra/Planta, Evaluador y Licencia en SST.
  - Cadena de custodia y verificación de calibración acústica (Extech 407780A Tipo 2, calibrador 94.0 dB @ 1000 Hz, deriva $0.0\text{ dB}$).
  - Tabla de resultados metrológicos por punto con diagnósticos normativos.
  - Recomendaciones técnicas y jerarquía de controles de ingeniería y EPP.
  - Bloques de firma pericial para el Especialista Higienista y el Responsable del SG-SST.

---

### 5. Tres Gráficas Técnicas en Tiempo Real Simultáneas
1. **📈 Onda de Presión $p(t)$ [Presión en Pascales (Pa)]:** Presión acústica instantánea calibrada con $p_0 = 20\,\mu\text{Pa}$, auto-escalado dinámico y lecturas numéricas RMS y Peak.
2. **📉 Registro Temporal $L_p$ en el Tiempo ($dB$ vs $t$):** Histograma continuo de 30 segundos con línea roja TLV (85 dBA, Res. 1792) y línea ámbar de Acción (80 dBA, Res. 2844).
3. **📊 Analizador de Espectro RTA en Bandas de Octava (IEC 61260):** 10 bandas normalizadas (31.5 Hz a 16 kHz) con código cromático de riesgo en tiempo real.

---

### 6. Sonómetro Digital Integrador (Réplica EXTECH 407780A)
- Display LCD verde esmeralda con dígitos 7-segmentos y vúmetro bargraph discreto de 50 segmentos.
- Ponderaciones Frecuenciales **A** y **C** (IEC 61672).
- Balística Temporal **FAST** (125 ms), **SLOW** (1000 ms) y **PEAK** ($< 50\ \mu\text{s}$).
- Generador patrón de **Calibración a 94.0 dB @ 1000 Hz**.

---

## 📁 Estructura del Repositorio

- [`index.html`](index.html): Aplicación web completa y autónoma (GitHub Pages).
- [`simulador_higiene_ruido_multisectorial.html`](simulador_higiene_ruido_multisectorial.html): Código fuente maestro.
- [`PROYECTO_ESTADO_Y_MEMORIA.md`](PROYECTO_ESTADO_Y_MEMORIA.md): Registro técnico y memoria del proyecto.
- [`assets/js/`](assets/js/): Librerías locales para generación de informes PDF (`jspdf.umd.min.js`, `jspdf.plugin.autotable.min.js`).
- [`assets/machines/`](assets/machines/): Banco fotográfico industrial de alta fidelidad.

---

## 📄 Marco Legal y Referencias Técnicas
- **Colombia:** Resolución 2844 de 2007 (GATISO-HNIR), Resolución 1792 de 1990, Resolución 2400 de 1979, Decreto 1072 de 2015.
- **Internacional:** NTC-ISO 9612:2009, IEC 61672-1:2013, IEC 61260:2014, ANSI S3.19.
