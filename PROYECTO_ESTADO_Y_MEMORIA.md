# 🧠 Memoria Técnica y Estado del Proyecto
## Simulador de Higiene Industrial y Ruido Ocupacional (Colombia)
**Fecha de Actualización:** 14 de Octubre de 2026  
**Repositorio GitHub:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)  
**Rama:** `main`  
**Autor:** Pedro Noriega  

---

### 1. Resumen Ejecutivo del Proyecto
Aplicación web de simulación acústica y metrológica en tiempo real para Higiene Industrial y Seguridad y Salud en el Trabajo (SST), desarrollada con arquitectura puramente nativa (**HTML5 + Vanilla JavaScript + Web Audio API + Canvas 2D a 60 FPS**), sin dependencias externas pesadas. Incluye exportación autónoma de informes técnicos oficiales en PDF (**jsPDF + autoTable**) con soporte offline local. Opera tanto de forma local (doble clic en `index.html`) como desplegada en GitHub Pages.

---

### 2. Marco Normativo Colombiano e Internacional Implementado

| Norma | Ámbito y Aplicación en el Simulador |
| :--- | :--- |
| **Resolución 2844 de 2007 (Ministerio de la Protección Social)** | Adopción obligatoria de la **GATISO-HNIR** (Hipoacusia Neurosensorial Inducida por Ruido). Define el **Nivel de Acción en 80 dBA** (Dosis = 50%), activación del Programa de Conservación Auditiva (PCA), protocolos de vigilancia audiométrica periódica (bianual para 80–84.9 dBA y anual obligatoria para $\ge 85\text{ dBA}$ o jornadas extendidas/ototóxicos) y cálculo del *derating* de EPP auditivo (reducción de 50% en tapones y 70-75% en copas/orejeras según ANSI/NIOSH/GATISO). |
| **Resolución 1792 de 1990 (Ministerios de Trabajo y Salud)** | Valores Límites Permisibles (TLV) para exposición continua e intermitente de 8 horas fijados en **85 dBA**. Aplica la **tasa de intercambio legal colombiana de $q = 5\text{ dB}$** ($T_{\text{perm}} = 8 / 2^{(L_{\text{eq}} - 85)/5}$ h). Límite de impacto máximo absoluto de **140 dBC Peak**. |
| **Resolución 2400 de 1979 (Estatuto de Seguridad e Higiene)** | Artículos 88 a 96: Principio de jerarquía de controles (obligatoriedad del control en la fuente generadora y en el medio de transmisión antes de aplicar EPP). |
| **Decreto 1072 de 2015** | Sistema de Gestión de la Seguridad y Salud en el Trabajo (SG-SST) y registro documental de higiene. |
| **NTC-ISO 9612:2009** | Acústica: Determinación de la exposición al ruido laboral mediante auditoría metrológica de focos y puestos de trabajo. Estrategia de medición basada en tareas y muestreo en puesto de trabajo. |
| **IEC 61672-1:2013** | Especificación electroacústica de sonómetros Clase 1 y Clase 2 (filtros de ponderación frecuencial A y C, constantes balísticas FAST de 125 ms, SLOW de 1000 ms y detector PEAK $< 50\ \mu\text{s}$). |
| **IEC 61260:2014** | Filtros de bandas de octava normalizadas (31.5 Hz a 16 kHz). |

---

### 3. Maquinaria y Equipos Hiperrealistas con Fotografías Reales

#### A. Sector A: Construcción e Infraestructura
Equipos modelados con fotografías reales de obra y generadores de síntesis acústica Web Audio específicos:
1. **Cortadora de Disco para Concreto STIHL TS (`cortadora_disco_concreto.jpg`):**
   - Disco de corte diamantado de 350 mm a 4200 RPM con motor térmico 2 tiempos de 3.2 kW.
   - Síntesis acústica: silbido tonal agudo de disco (4.2 kHz) + fricción abrasiva cortante + motor 2T.
2. **Martillo Neumático Rompepavimentos (`martillo_neumatico.jpg`):**
   - Maza de percusión de 32 kg alimentada a 6 bar con 1500 golpes/min (26 Hz).
   - Síntesis acústica: impacto percusivo repetitivo a 26 Hz + ráfagas sibilantes de escape de aire comprimido.
3. **Mezcladora Trompo con Volteo de Áridos (`mezcladora_trompo.jpg`):**
   - Tambor rotatorio basculante de 1 BBL (350 L) accionado por corona dentada y motor a gasolina.
   - Síntesis acústica: engranaje continuo a 320 Hz + cascada rítmica de grava y áridos con modulación de 2.2 s.
4. **Retroexcavadora sobre Orugas (`retroexcavadora_orugas.jpg`):**
   - Equipo pesado con motor turbodiésel 6 cilindros de 120 kW y bomba de pistones axiales.
   - Síntesis acústica: rugido diésel grave (48/96 Hz) + silbido del turbocompresor (2.25 kHz) + tintineo metálico de zapatas.
5. **Vibrocompactador Pata de Cabra (`vibrocompactador_pata_cabra.jpg`):**
   - Rodillo compactador tándem con eje excéntrico a 30 Hz y patas prismáticas.
   - Síntesis acústica: pulso infrasónico profundo de 30 Hz + traqueteo armónico a 60 Hz de pisado de terrones.

#### B. Plano General del Sector A (Composición Global y Dimensiones Reales)
- **Imagen de Composición General:** `sector_a_construccion_overview.jpg`
- **Dimensiones Reales del Área:** $45.0\text{ m}$ de ancho $\times 32.0\text{ m}$ de profundidad ($1,440\text{ m}^2$). Escala: $1\text{ cm} = 5\text{ m}$.
- **Herramienta Cinta Métrica Interactiva:** Permite medir distancias reales en metros entre cualquier punto de la obra y calcula la atenuación teórica por divergencia acústica esférica en campo libre ($\Delta L = 20\log_{10}(d)$).
- **Simulador Acústico Multifoco en Tiempo Real:** 
  - Balizas de máquina interactivas con botones ON/OFF independientes.
  - Sonda de sonómetro móvil con lectura en vivo de nivel de presión sonora.
  - Suma energética logarítmica exacta de todas las fuentes activas en la coordenada del sonómetro:
    $$L_{p,\text{total}} = 10 \log_{10} \left( \sum_{i=1}^n 10^{L_{p,i}/10} \right)$$
    donde cada fuente se atenúa con la distancia euclidiana física $r_i$:
    $$L_{p,i}(r_i) = L_{w,i} - 20\log_{10}(r_i) - 11$$

#### C. Sector B: Manufactura y Metalmecánica
1. **Amoladora Angular Bosch Professional GWS (`pulidora_bosch_gws.jpg`)**
2. **Prensa Excéntrica EP-500 (`prensa_excentrica_ep500.jpg`)**
3. **Martinete de Forja Pesada (`martinete_forja_industrial.jpg`)**
4. **Compresor de Tornillo Kaeser CSDX 165 (`compresor_kaeser_csdx165.jpg`)**
5. **Ventilador Centrífugo Industrial (`ventilador_centrifugo_industrial.jpg`)**

---

### 4. Protocolo de Muestreo Higiénico y Reporte Técnico PDF Oficial

#### A. Temporizador de Protocolo de Muestreo
- Opciones de tiempo de medición seleccionables: **15 segundos (tamiz rápido)**, **1 minuto**, **5 minutos** y **15 minutos (estándar ISO 9612 / GATISO)**.
- Reloj digital regresivo animado, barra de progreso con gradiente y alerta sonora al completar el muestreo.
- Registro automático en la **Tabla de Puntos de Muestreo Metrológico**, calculando:
  - $L_{\text{Aeq}}$ (nivel equivalente continuo en dBA)
  - $L_{\text{Cpeak}}$ (pico acústico en dBC)
  - $L_{\text{max}}$ y $L_{\text{min}}$
  - Tiempo Máximo Permisible de Exposición según Res. 1792/90:
    $$T_{\text{perm}} = \frac{8}{2^{(L_{\text{Aeq}} - 85)/5}}\text{ horas}$$
  - Dosis proyectada para jornada de 8 horas:
    $$\text{Dosis } 8\text{h} = \frac{8}{T_{\text{perm}}} \times 100\%$$
  - Diagnóstico normativo categorizado: Aceptable ($<80\text{ dBA}$), Nivel de Acción / PCA ($80–84.9\text{ dBA}$), Supera TLV / Crítico ($\ge 85\text{ dBA}$), Riesgo de Trauma Acústico Agudo ($\ge 140\text{ dBC Peak}$).

#### B. Generador de Informe Técnico Oficial en PDF (jsPDF + autoTable)
- Modal interactivo con previsualización y edición de metadatos de auditoría:
  - Razón Social de la Empresa Evaluada y NIT.
  - Proyecto, Obra o Planta y Ubicación Geográfica.
  - Nombre del Especialista Higienista y Número de Licencia SST.
- Secciones estructuradas del documento PDF:
  1. **Encabezado Institucional:** Título oficial, fecha/hora y número de radicado.
  2. **Objetivo y Alcance:** Evaluación metrológica de ruido ocupacional según ISO 9612 y GATISO-HNIR.
  3. **Marco Normativo Vigente:** Res. 2844 de 2007, Res. 1792 de 1990, Res. 2400 de 1979.
  4. **Cadena de Custodia y Calibración del Instrumental:** Sonómetro Tipo 2 Extech 407780A, calibrador acústico 94.0 dB @ 1000 Hz, verificación pre y post medición con deriva $0.0\text{ dB}$.
  5. **Tabla de Resultados Metrológicos de Campo:** Generada mediante autoTable con código cromático de riesgo.
  6. **Jerarquía de Medidas de Control (Res. 2400/79):**
     - Controles en la fuente (mantenimiento, amortiguación dinámica, silenciadores).
     - Controles en el medio (barreras acústicas móviles, cerramientos perimetrales).
     - Protección Auditiva Personal con cálculo de *Derating* legal (GATISO/NIOSH).
  7. **Vigilancia Epidemiológica y Auditiva:** Cronograma de audiometrías tamiz y clínicas.
  8. **Firmas de Responsabilidad Legal:** Higienista con Licencia SST y Responsable SG-SST.

---

### 5. Estructura de Archivos del Proyecto

```
Simulador_Ruido/
├── index.html                                 # Punto de entrada y despliegue (GitHub Pages)
├── simulador_higiene_ruido_multisectorial.html # Archivo maestro de desarrollo
├── metadata.json                              # Configuración y metadatos IDE
├── PROYECTO_ESTADO_Y_MEMORIA.md              # Este archivo de persistencia de memoria
├── README.md                                  # Documentación pública del repositorio
└── assets/
    ├── js/                                    # Librerías offline para generación de informes PDF
    │   ├── jspdf.umd.min.js
    │   └── jspdf.plugin.autotable.min.js
    └── machines/                              # Fotografías reales industriales en alta resolución
        ├── cortadora_disco_concreto.jpg       # Sector A
        ├── martillo_neumatico.jpg             # Sector A
        ├── mezcladora_trompo.jpg              # Sector A
        ├── retroexcavadora_orugas.jpg         # Sector A
        ├── vibrocompactador_pata_cabra.jpg    # Sector A
        ├── sector_a_construccion_overview.jpg # Plano general del Sector A
        ├── pulidora_bosch_gws.jpg             # Sector B
        ├── prensa_excentrica_ep500.jpg        # Sector B
        ├── martinete_forja_industrial.jpg     # Sector B
        ├── compresor_kaeser_csdx165.jpg       # Sector B
        └── ventilador_centrifugo_industrial.jpg # Sector B
```

---

### 6. Procedimiento de Mantenimiento y Sincronización

1. **Edición:** Realizar cualquier ajuste en `simulador_higiene_ruido_multisectorial.html`.
2. **Sincronización:** Copiar a `index.html`:
   ```powershell
   Copy-Item -Path "simulador_higiene_ruido_multisectorial.html" -Destination "index.html" -Force
   ```
3. **Commit & Push:**
   ```powershell
   git add .
   git commit -m "feat: <descripción del cambio>"
   git push origin main
   ```
4. **Verificación:** Ejecutar servidor local con `python -m http.server 3000` o abrir directamente `index.html`.
