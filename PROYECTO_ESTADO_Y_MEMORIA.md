# 🧠 Memoria Técnica y Estado del Proyecto
## Simulador de Higiene Industrial y Ruido Ocupacional
### Laboratorio Virtual - SG-SST (Colombia)
**Fecha de Actualización:** 26 de Octubre de 2026  
**Repositorio GitHub:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)  
**Rama:** `main`  
**Autor:** Pedro Noriega  
**Credencial de Acceso Académico:** `CETO2026` (Protegida)

---

### 1. Resumen Ejecutivo del Proyecto
Aplicación web institucional de simulación acústica y metrológica en tiempo real para Higiene Industrial y Seguridad y Salud en el Trabajo (SST), desarrollada con arquitectura puramente nativa (**HTML5 + Vanilla JavaScript + Web Audio API + Canvas 2D a 60 FPS**), sin dependencias externas pesadas. Diseñada con la identidad visual oficial institucional sobre **base blanca**, acceso académico restringido por contraseña (`CETO2026`), ausencia total de marcas comerciales de fabricantes, exportación autónoma de informes técnicos oficiales en PDF (**jsPDF + autoTable**) con soporte offline local, y despliegue en GitHub Pages.

La versión actual consolida el **Plano General Panorámico (Overview Mode)** como la **vista única y exclusiva del laboratorio** para todas las actividades económicas (Sectores A, B, C, D y E), eliminando la sección de vista detallada individual y optimizando la ergonomía visual. En este espacio los estudiantes seleccionan e interactúan directamente con cada una de las 5 fuentes acústicas por sector mediante balizas con botones de bocina (`🔊`/`🔇`), barras de chips multi-fuente con cotas dimensionales métricas, animación cinético-acústica selectiva con recorte poligonal `clip-path`, mini sonómetro móvil arrastrable con telemetría láser en tiempo real (NTC-ISO 9612:2009), y registro persistente de puntos en la memoria técnica del laboratorio para la emisión oficial de informes periciales en PDF.

---

### 2. Identidad Institucional y Diseño Visual
1. **Tema Institucional sobre Base Blanca:**
   - Fondo general suave (`#f8fafc`) con paneles, tarjetas y contenedores en blanco puro (`#ffffff`).
   - Textos de alta legibilidad en tono pizarra oscuro (`#0f172a`), con poco uso de negro puro (únicamente en el chasis del instrumento y monitores de señal).
   - Acentos primarios en **naranja institucional** (`#e67817` / `#cf670c`) para estados activos, botones y bordes interactivos.
   - Toques sutiles de **verde institucional** (`#16943f`) para niveles seguros por debajo de 80 dBA.
2. **Exclusividad del Logo Institucional (Sin Texto de Denominación):**
   - **Cabecera Principal:** Contiene únicamente el **Logo Oficial Institucional** (`assets/logo_tecnologica_oriente.png`), sin textos adjuntos con el nombre de la institución.
   - **Ventana de Autenticación (`#cetoAuthModal`):** Tarjeta blanca con borde naranja, logo institucional centrado y formulario de clave de acceso.
   - **Sonómetro Extech:** Placa de cabecera con el logo oficial y rotulación técnica IEC 61672-1:2013 Clase 2.
3. **Acceso Académico Restringido por Contraseña (`CETO2026`):**
   - Requiere la clave institucional `CETO2026`.
   - La contraseña no se muestra en pantalla.
   - Persistencia de sesión mediante `sessionStorage` para no volver a solicitar la clave tras recargar en la misma sesión.
   - Botón **"🔒 Bloquear"** en la barra superior para rebloquear la aplicación de manera inmediata.
4. **Sin Marcas Comerciales de Fabricantes:**
   - La instrumentación se rotula estrictamente con estándares metrológicos internacionales (**Sonómetro Digital Integrador Clase 2 / Tipo 2 IEC 61672-1:2013** y **Calibrador Acústico Normalizado IEC 60942 Clase 1**), sin marcas comerciales comerciales.
   - Las máquinas se presentan por su denominación técnica de ingeniería.

---

### 3. Marco Normativo Colombiano e Internacional Implementado

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

### 4. Catálogo de los 5 Sectores y Planos Generales Multisectoriales

Cada sector cuenta con su propio **Plano General Panorámico 16:9 de Ultra-Alta Definición**, balizas con bocinas interactivas (`🔊`/`🔇`), animación cinético-acústica aislada en Canvas 2D a 60 FPS, mini sonómetro móvil arrastrable con display en tiempo real y cinta métrica calibrada con dimensiones de ingeniería:

#### Sector A: Construcción de Infraestructura y Obras Civiles
- **Dimensiones:** Ancho 45.0 m × Largo 32.0 m (1.440 m²) · Escala 1 cm = 5 m.
- **Imagen Panorámica:** `assets/machines/sector_a_construccion_overview.jpg`
- **Fuentes Acústicas y Coordenadas:**
  1. *Cortadora de Disco para Concreto (Motor 2T):* `(17.4%, 75.0%)`
  2. *Martillo Neumático Rompepavimentos:* `(85.8%, 74.9%)`
  3. *Mezcladora Trompo con Volteo de Áridos:* `(35.6%, 33.2%)`
  4. *Retroexcavadora sobre Orugas:* `(56.0%, 12.4%)`
  5. *Vibrocompactador Pata de Cabra:* `(91.2%, 25.4%)`
- **Física Aislada en Canvas:** Chorro de agua a presión y microchispas en cortadora; fractura y polvo en martillo; volteo rotativo en trompo; escape diésel en retroexcavadora; ondas elípticas de compactación y destello estroboscópico en vibrocompactador.

#### Sector B: Industria Manufacturera y Metalmecánica
- **Dimensiones:** Ancho 50.0 m × Largo 30.0 m (1.500 m²) · Escala 1 cm = 5 m.
- **Imagen Panorámica:** `assets/machines/sector_b_manufactura_overview.jpg`
- **Fuentes Acústicas y Coordenadas:**
  1. *Prensa Troqueladora Excéntrica (120 Tn):* `(16.5%, 72.0%)`
  2. *Martinete de Forja Neumático:* `(24.5%, 52.0%)`
  3. *Pulidora Angular Industrial 9 pulgadas:* `(41.5%, 68.0%)`
  4. *Compresor de Tornillo Rotativo (75 kW):* `(66.0%, 53.0%)`
  5. *Ventilador Centrífugo de Extracción:* `(90.0%, 57.0%)`
- **Física Aislada en Canvas:** Impacto vertical de estampado y cortina óptica en prensa; golpe de maza y vibración en martinete; haz de chispas tangenciales incandescentes en pulidora; ondas de flujo neumático en compresor; rotación de aspas y turbulencia en ventilador.

#### Sector C: Comercio al por Menor y Entretenimiento (Ocio)
- **Dimensiones:** Ancho 40.0 m × Largo 25.0 m (1.000 m²) · Escala 1 cm = 5 m.
- **Imagen Panorámica:** `assets/machines/sector_c_comercio_overview.jpg`
- **Fuentes Acústicas y Coordenadas:**
  1. *Pista de Karts Indoor (Motor 4T):* `(17.5%, 77.0%)`
  2. *Discoteca / Sistema Line Array PA:* `(20.0%, 36.0%)`
  3. *Restaurante y Cocina Comercial (Campana):* `(51.0%, 56.0%)`
  4. *Campana Extractora de Alta Potencia:* `(75.0%, 34.0%)`
  5. *Pistas de Bowling / Bolera:* `(82.0%, 75.0%)`
- **Física Aislada en Canvas:** Escape y tracción de karts; pulsos rítmicos de sub-graves y luces en discoteca; vapores culinarios en cocina; vórtice centrífugo de extracción; derribo e impacto cinético de bolos.

#### Sector D: Explotación de Minas y Canteras
- **Dimensiones:** Ancho 120.0 m × Largo 80.0 m (9.600 m²) · Escala 1 cm = 10 m.
- **Imagen Panorámica:** `assets/machines/sector_d_mineria_overview.jpg`
- **Fuentes Acústicas y Coordenadas:**
  1. *Frente de Voladura Controlada con Detonación:* `(18.0%, 30.0%)`
  2. *Jumbo de Perforación Hidráulica:* `(36.0%, 57.0%)`
  3. *Trituradora Primaria de Mandíbula:* `(54.0%, 31.0%)`
  4. *Criba / Zaranda Vibratoria Multimalla:* `(74.0%, 46.0%)`
  5. *Camión Volqueta / Dumper Fuera de Carretera (70 Tn):* `(74.0%, 80.0%)`
- **Física Aislada en Canvas:** Onda de choque de detonación y nube de polvo; avance de broca y neblina de refrigeración en jumbo; trituración de bloques de roca y polvo pétreo; oscilación vertical elíptica en zaranda; descarga de mineral y nube de acarreo en dumper.

#### Sector E: Áreas Administrativas y de Servicios
- **Dimensiones:** Ancho 35.0 m × Largo 22.0 m (770 m²) · Escala 1 cm = 4 m.
- **Imagen Panorámica:** `assets/machines/sector_e_servicios_overview.jpg`
- **Fuentes Acústicas y Coordenadas:**
  1. *Data Center (Servidores en Rack y Clima Inrow):* `(11.5%, 52.0%)`
  2. *Call Center / Puestos de Operadores Telefónicos:* `(34.5%, 68.0%)`
  3. *Área de Impresión Gran Formato / Plotter Industrial:* `(51.0%, 46.0%)`
  4. *Cafetería y Zona de Pausa Activa:* `(66.5%, 58.0%)`
  5. *Oficinas de Despacho y Logística:* `(89.0%, 55.0%)`
- **Física Aislada en Canvas:** Flujo laminar de aire frío y LEDs de rack; ondas vocales de conversación en call center; vaivén horizontal de carro de impresión en plotter; vapor de espresso en cafetería; llamadas y tecleo en despacho.

---

---

### 5. Arquitectura de Animación Cinética Reactiva al Audio (Primer Plano y Plano General)

Para responder a la directriz técnica de que **las máquinas y las personas deben verse en movimiento y animarse de manera real al activar el audio**, y detenerse inmediatamente al apagar o silenciar el sonido, se implementó una arquitectura híbrida de alta fidelidad:

1. **Animación en Primer Plano (Vista Detallada de Máquina / Trabajador):**
   - **Oficina Abierta Call Center (`call_center_animated.webp`):**
     - **Articulación Fono-Articular Realista:** Modelado dinámico de visemas donde los labios, la mandíbula inferior y la cavidad bucal se mueven a cadencia de habla humana real (3 sílabas por ciclo, apertura de labios y visualización de dientes).
     - **Gesticulación Natural:** Balanceo y cabeceo suave de la teleoperadora mientras conversa por la diadema telefónica.
     - **Diadema Telefónica con LED de Transmisión Activa:** Indicador luminoso verde (`#10b981`) pulsante en la cápsula del micrófono al transmitir audio.
     - **Digitación en Teclado:** Movimiento biomecánico de las manos digitando rápidamente en el teclado ergonómico.
     - **Operadores en Segundo Plano:** Teleoperadores en cubículos adyacentes gesticulando y hablando con sus clientes.
     - **Pantalla CRM:** Cursor parpadeante y refresco dinámico de datos.
   - **Cortadora de Disco para Concreto (`cortadora_disco_animated.webp`):**
     - Giro a ultra-alta velocidad (4.200 RPM) del disco diamantado con desenfoque radial de movimiento.
     - Fricción abrasiva con chispas incandescentes saliendo de la hendidura de corte.
     - Pulverización continua de agua de refrigeración y suspensión de lodo (*slurry*).
     - Vibración mecánica intensa del motor a 50 Hz en manos y brazos del operario (HAV).
   - **Martillo Neumático Rompepavimentos (`martillo_neumatico_animated.webp`):**
     - Percusión vertical severa a 26 Hz con carrera de 14 px.
     - Fractura de losa de concreto con esquirlas, fragmentos y nube de polvo expandiéndose.
     - Vibración de cuerpo entero y extremidades superiores en el trabajador con EPP.
   - **Amoladora / Pulidora Angular Industrial (`pulidora_bosch_gws_animated.webp`):**
     - Giro del disco abrasivo de 230 mm a 8.500 RPM.
     - Cascada espectacular de chispas incandescentes blancas y anaranjadas sobre la viga de acero.
     - Punto de contacto al rojo vivo.
   - **Mezcladora Trompo con Volteo de Áridos (`mezcladora_trompo_animated.webp`):**
     - Rotación continua del tambor basculante con volteo de cantos rodados, arena y cemento.
   - **Vibrocompactador Pata de Cabra (`vibrocompactador_pata_cabra_animated.webp`):**
     - Densificación sísmica del terreno a 30 Hz con vibración de suelo y cabina del operador.
   - **Regla Estricta:** Al encender el sonómetro o audio (`isOperating = isPowered && !isAudioMuted`), la imagen conmuta automáticamente al WebP animado. Al apagar o mutear, vuelve inmediatamente a la fotografía estática de alta resolución con el estado `⚪ EN ESPERA · MOTOR DETENIDO`.

2. **Animación en Plano General (Overview Multisectorial con `clip-path` Disjunto):**
   - Para los 5 sectores se generaron composiciones panorámicas animadas continuas (`sector_a_construccion_animated.webp`, `sector_b_manufactura_animated.webp`, `sector_c_comercio_animated.webp`, `sector_d_mineria_animated.webp`, `sector_e_servicios_animated.webp`).
   - Cada máquina en el plano cuenta con su propia capa superpuesta recortada mediante polígonos CSS `clip-path` estrictamente disjuntos.
   - **Aislamiento Acústico-Cinético 100% Estricto:** La máquina en el plano general **únicamente se anima si su botón de bocina (`🔊`) está activado y el audio no está silenciado** (`.overview-machine-anim.is-active`).
   - Si una máquina está apagada, su capa permanece con `opacity: 0`, mostrando la fotografía estática en reposo. Cero movimiento espurio o solapado.

3. **Telemetría Láser Sutil Normalizada (ISO 9612):**
   - En primer plano: haz colimado de 1.5 px con halo difuso tenue y punto láser pulsante sobre el foco acústico auditado, indicando la distancia al micrófono (`🔴 TELEMETRÍA LÁSER SONÓMETRO · d = 1.0 m`) en sincronía con el deslizador `#distSlider`.
   - En el LCD del sonómetro Extech: tag de telemetría en tiempo real `🔴 LÁSER: X.X m`.
   - En el plano general: haz láser dinámico proyectado desde la cápsula del mini sonómetro móvil hacia cada máquina activa con cálculo euclidiano métrico en tiempo real.

### 6. Memoria Interna de Mediciones y Reporte Académico Oficial

1. **Memoria Interna Acumulativa (`evaluatedPoints`):**
   - Almacena de forma persistente durante la sesión todas las mediciones realizadas por el estudiante.
   - Permite registrar mediciones de:
     - **Fuentes individuales:** evaluando el aporte puntual de una máquina.
     - **Fuentes combinadas:** evaluando 2, 3 o todas las fuentes encendidas simultáneamente.
     - **Ruido de fondo residual:** con todas las máquinas apagadas.
   - Cada punto almacena: código (`P1, P2...`), sector, modalidad de fuentes activas, duración, $L_{\text{Aeq}}$, $L_{\text{Cpeak}}$, $L_{\text{max}}$, $L_{\text{min}}$, tiempo permisible ($T_{\text{perm}}$, $q=5$), dosis proyectada, diagnóstico normativo, coordenadas cartesianas y hora.
   - **Badge Dinámico de Memoria (`#memoryCounterBadge`):** Muestra el número exacto de mediciones acumuladas y cambia a estado activo con animación pulsante.
2. **Identificación Obligatoria del Estudiante Evaluador:**
   - Previo a la emisión del informe, el estudiante debe digitar:
     - **Nombre Completo del Estudiante** (campo obligatorio con validación activa).
     - **Documento de Identidad / Código Estudiantil**.
     - **Asignatura / Programa Académico**.
     - **Docente a Cargo**.
     - **Conclusiones y Observaciones Técnicas** redactadas por el estudiante.
3. **Informe Técnico Oficial en PDF (jsPDF + autoTable):**
   - Encabezado institucional de la Corporación Tecnológica del Oriente.
   - Cuadro formal de identificación con los datos del estudiante evaluador.
   - Marco normativo legal colombiano (Res. 1792/90, Res. 2844/07 GATISO-HNIR, Res. 2400/79).
   - Trazabilidad metrológica e instrumentación IEC 61672 Clase 2.
   - **Tabla Metrológica Completa** que integra todas las mediciones acumuladas en la memoria interna (individuales y combinadas).
   - Conclusiones y análisis redactados por el estudiante.
   - Plan jerárquico de control y vigilancia epidemiológica (PVE-HNIR).
   - **Cuadro de Firmas:** Firma del Estudiante Evaluador y Firma del Docente Evaluador.
   - Nombre de archivo personalizado: `Informe_Laboratorio_Ruido_[NombreEstudiante].pdf`.
4. **Ciclo de Reinicio Post-Laboratorio:**
   - Tras descargar el informe oficial, el sistema consulta al estudiante si desea reiniciar la memoria interna.
   - El botón **"🔄 Nueva Simulación / Borrar Memoria"** permite vaciar la memoria previa confirmación para dar paso a un nuevo estudiante o práctica.

---

### 6. Estructura de Archivos del Proyecto

```
Simulador_Ruido/
├── index.html                                 # Despliegue en GitHub Pages y ejecución directa
├── simulador_higiene_ruido_multisectorial.html # Código fuente maestro institucional
├── metadata.json                              # Configuración y metadatos IDE
├── PROYECTO_ESTADO_Y_MEMORIA.md              # Memoria técnica completa del proyecto
├── README.md                                  # Documentación pública del repositorio
└── assets/
    ├── logo_tecnologica_oriente.png           # Logo oficial institucional
    ├── js/                                    # Librerías offline para PDF (jsPDF, autoTable)
    └── machines/                              # Fotografías y animaciones de maquinaria
        ├── sector_a_construccion_overview.jpg # Plano panorámico 16:9 Sector A
        ├── sector_a_construccion_static.jpg   # Copia estática Sector A
        ├── sector_b_manufactura_overview.jpg  # Plano panorámico 16:9 Sector B
        ├── sector_b_manufactura_static.jpg    # Copia estática Sector B
        ├── sector_c_comercio_overview.jpg     # Plano panorámico 16:9 Sector C
        ├── sector_c_comercio_static.jpg       # Copia estática Sector C
        ├── sector_d_mineria_overview.jpg      # Plano panorámico 16:9 Sector D
        ├── sector_d_mineria_static.jpg        # Copia estática Sector D
        ├── sector_e_servicios_overview.jpg    # Plano panorámico 16:9 Sector E
        ├── sector_e_servicios_static.jpg      # Copia estática Sector E
        └── [25 fotografías individuales de cada máquina...]
```

---

### 7. Historial de Commits y Estado del Repositorio
- **Rama:** `main`
- **Commits Clave:**
  - `feat`: Unificación y exclusividad del Plano General del Sector para los 5 sectores económicos, eliminando la sección de vista detallada individual.
  - `2c6d202`: Animación cinética fidedigna reactiva al audio en primer plano y plano general para los 5 sectores.
  - `912f493`: Planos generales multisectoriales (B, C, D, E), memoria interna acumulativa y reporte de estudiante en PDF.
  - `9ee94e7`: Restaurar imagen aprobada con máquinas separadas espacialmente, calibración exacta y cache buster v4.
  - `011cf17`: Identidad institucional Tecnológica del Oriente, acceso por contraseña CETO2026, eliminación marcas fabricantes.
- **Estado de Trabajo:** Totalmente sincronizado con el repositorio remoto (`origin/main`). Árbol de trabajo limpio.

---

### 8. Protocolo de Reanudación de Sesión (Guía Rápida al Encender el PC)

1. **Iniciar Servidor Local:**
   ```powershell
   cd "c:\Users\Estudiante 08\Documents\Pedro_Noriega\Aplicaciones IA\Simulador_Ruido"
   python -m http.server 3000
   ```
2. **Abrir en Navegador:**
   - Navegar a `http://localhost:3000` o `http://localhost:3000/simulador_higiene_ruido_multisectorial.html`
3. **Iniciar Sesión:**
   - Introducir la clave académica `CETO2026`.
4. **Verificar Estado del Repositorio:**
   ```powershell
   git status
   git pull origin main
   ```
5. **Archivos Principales:**
   - Código maestro: `simulador_higiene_ruido_multisectorial.html`
   - Espejo para GitHub Pages: `index.html` (mantener siempre idéntico al maestro)
   - Memoria técnica: `PROYECTO_ESTADO_Y_MEMORIA.md`

