# 🔊 Laboratorio Virtual de Higiene Industrial y Ruido Ocupacional
## Corporación Tecnológica del Oriente (Bucaramanga, Colombia)

Simulador interactivo institucional de instrumentación acústica y evaluación de exposición ocupacional al ruido en formato web autónomo (**HTML5 + Vanilla JS + Web Audio API + Canvas 2D a 60 FPS**), conforme a la legislación técnica colombiana (**Resolución 2844 de 2007 - GATISO-HNIR**, **Resolución 1792 de 1990**, **Resolución 2400 de 1979**) y estándares internacionales (**IEC 61672-1:2013**, **IEC 61260:2014**, **NTC-ISO 9612:2009**, **ACGIH / NIOSH**).

---

## 🔐 Control de Acceso Académico

- **Portal Institucional de Acceso:** Protegido por contraseña para estudiantes, docentes e investigadores.
- **Contraseña Institucional Autorizada:** **`CETO2026`**
- **Institución:** Corporación Tecnológica del Oriente ([https://tecnologicadeloriente.edu.co/](https://tecnologicadeloriente.edu.co/))

---

## 🚀 Acceso Rápido y Demo en Vivo

- **URL Pública (GitHub Pages):** [https://pedronoriega-eng.github.io/simulador-ruido-higiene/](https://pedronoriega-eng.github.io/simulador-ruido-higiene/)
- **Repositorio Oficial:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)
- **Ejecución Local:** Haz doble clic directamente en `index.html` o `simulador_higiene_ruido_multisectorial.html` en cualquier navegador (Chrome, Edge, Firefox, Safari). **No requiere Node.js, servidores ni descargas externas.**

---

## 🌟 Características Institucionales y Metrológicas

### 1. Identidad Visual de la Corporación Tecnológica del Oriente
- Incorpora el **logotipo oficial** de la institución en el encabezado, en la pantalla de acceso y en el informe técnico descargable en PDF.
- Paleta de colores ajustada a la identidad corporativa de la página web oficial (`#e67817` naranja institucional, `#16943f` verde institucional, fondos en azul oscuro y pizarra).
- Tipografía institucional moderna (*Plus Jakarta Sans* e *Inter*).
- **Proporciones adaptativas a pantalla completa:** El área de trabajo y las figuras se escalan armoniosamente según la resolución del monitor sin deformaciones.

### 2. Ausencia Total de Marcas Comerciales de Fabricantes
- Se eliminaron todas las marcas de fabricantes (EXTECH, Bosch, Kaeser, STIHL, etc.).
- La instrumentación se identifica según su clasificación metrológica normalizada: **Sonómetro Digital Integrador Clase 2 / Tipo 2 (Norma IEC 61672-1:2013)** y **Calibrador Acústico Normalizado IEC 60942 Clase 1**.
- Las máquinas se denominan por su tipología de ingeniería: *Cortadora de Disco para Concreto*, *Martillo Neumático Rompepavimentos*, *Mezcladora Trompo con Volteo de Áridos*, *Retroexcavadora sobre Orugas*, *Vibrocompactador Pata de Cabra*, *Amoladora Angular Industrial*, etc.

### 3. Plano General del Sector (Modo Limpio con Micrófono de Medición)
Al activar **"🗺️ Plano General del Sector"**:
- **Fotografía Maestra del Área:** Composición fotográfica real del sector construcción.
- **Acotación Perimetral Limpia:**
  - `↔ ANCHO: 45.0 METROS`
  - `↕ LARGO: 32.0 METROS`
  - Escala: `1 cm = 5 m`
  - **Sin cálculo invasivo de área:** Muestra únicamente el largo y el ancho de las cotas.
- **Micrófono Interactivo Compacto:**
  - Se eliminó el cartel naranja central para no tapar la escena.
  - Se visualiza únicamente un **micrófono compacto (`🎙️`)** con anillo de pulso acústico.
  - Al hacer clic o arrastrar el micrófono a cualquier punto del área, se activa la medición de sonido en esa posición.
  - La lectura de nivel de presión sonora en decibeles se visualiza en tiempo real en el **sonómetro grande ubicado en la columna derecha**.
- **Herramienta Cinta Métrica:** Mide distancias en metros y calcula la atenuación teórica por divergencia acústica esférica en campo libre ($\Delta L = 20\log_{10}(d)$).

### 4. Protocolo de Muestreo Higiénico con Temporizador
- Selector de duración del muestreo: 15s (screening rápido), 1m, 5m y 15m (estándar formal ISO 9612 / GATISO-HNIR).
- Reloj cronómetro regresivo animado, barra de avance con gradiente y alerta sonora al finalizar.
- **Tabla Metrológica de Puntos de Muestreo:** Registra $L_{\text{Aeq}}$, $L_{\text{Cpeak}}$, $L_{\text{max}}$, $L_{\text{min}}$, tiempo permisible de exposición según Res. 1792/90 ($T_{\text{perm}} = 8 / 2^{(L_{\text{eq}}-85)/5}$), dosis acumulada proyectada para 8 horas y diagnóstico normativo legal.

### 5. Generación y Descarga de Informe Técnico Oficial en PDF
Exporta un informe pericial de Higiene Industrial con plena validez como soporte legal de evaluación ocupacional bajo la normatividad colombiana:
- **Marco Legal Incluido:**
  - **Resolución 2844 de 2007 (GATISO-HNIR):** Nivel de Acción en 80 dBA, inclusión en PCA, periodicidad de audiometrías tamiz (bianual para 80–84.9 dBA, anual obligatoria para $\ge 85\text{ dBA}$) y factores de *derating* en EPP auditivo (50% en tapones, 70-75% en orejeras).
  - **Resolución 1792 de 1990:** TLV de 85 dBA, tasa de intercambio $q = 5\text{ dB}$, límite de impacto de 140 dBC Peak.
  - **Resolución 2400 de 1979:** Jerarquía de controles (fuente, medio y receptor).
  - **NTC-ISO 9612:2009:** Metodología y estrategia de medición higiénica.
- **Contenido del Documento PDF:**
  - Encabezado institucional de la **Corporación Tecnológica del Oriente**.
  - Datos de auditoría: Empresa evaluada, NIT, Obra/Planta, Evaluador y Licencia en SST.
  - Cadena de custodia y verificación de calibración acústica con deriva $0.0\text{ dB}$.
  - Tabla de resultados metrológicos por punto con diagnósticos normativos.
  - Recomendaciones técnicas y jerarquía de controles de ingeniería y EPP.
  - Bloques de firma pericial para el Especialista Higienista y el Responsable del SG-SST.

---

## 📁 Estructura del Repositorio

- [`index.html`](index.html): Aplicación web completa y autónoma (GitHub Pages).
- [`simulador_higiene_ruido_multisectorial.html`](simulador_higiene_ruido_multisectorial.html): Código fuente maestro.
- [`PROYECTO_ESTADO_Y_MEMORIA.md`](PROYECTO_ESTADO_Y_MEMORIA.md): Registro técnico y memoria del proyecto.
- [`assets/logo_tecnologica_oriente.png`](assets/logo_tecnologica_oriente.png): Logo oficial de la Tecnológica del Oriente.
- [`assets/js/`](assets/js/): Librerías locales para generación de informes PDF (`jspdf.umd.min.js`, `jspdf.plugin.autotable.min.js`).
- [`assets/machines/`](assets/machines/): Banco fotográfico industrial de alta resolución.
