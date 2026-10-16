# 🧠 Memoria Técnica y Estado del Proyecto
## Simulador de Higiene Industrial y Ruido Ocupacional
### Laboratorio Virtual - SG-SST (Colombia)
**Fecha de Actualización:** 14 de Octubre de 2026  
**Repositorio GitHub:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)  
**Rama:** `main`  
**Autor:** Pedro Noriega  
**Credencial de Acceso Académico:** `CETO2026` (Protegida)

---

### 1. Resumen Ejecutivo del Proyecto
Aplicación web institucional de simulación acústica y metrológica en tiempo real para Higiene Industrial y Seguridad y Salud en el Trabajo (SST), desarrollada con arquitectura puramente nativa (**HTML5 + Vanilla JavaScript + Web Audio API + Canvas 2D a 60 FPS**), sin dependencias externas pesadas. Diseñada con la identidad visual oficial institucional sobre **base blanca**, acceso académico restringido por contraseña (`CETO2026`), ausencia total de marcas comerciales de fabricantes, exportación autónoma de informes técnicos oficiales en PDF (**jsPDF + autoTable**) con soporte offline local, y despliegue en GitHub Pages.

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
   - Las máquinas se presentan por su denominación técnica de ingeniería (ej. *Cortadora de Disco para Concreto Motor 2T*, *Mezcladora Trompo con Volteo de Áridos*, *Retroexcavadora sobre Orugas*, *Vibrocompactador Pata de Cabra*, *Martillo Neumático Rompepavimentos*).

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

### 4. Maquinaria Realista y Plano General del Sector A (Construcción)

#### A. Máquinas del Sector A (Construcción e Infraestructura)
1. **Cortadora de Disco para Concreto (`cortadora_disco_concreto.jpg`):** Motor 2T a 4200 RPM con disco diamantado. Coordenadas: `(20%, 72%)`.
2. **Mezcladora Trompo con Volteo de Áridos (`mezcladora_trompo.jpg`):** Tambor de 350 L accionado por corona dentada y cascada de grava. Coordenadas: `(38%, 40%)`.
3. **Retroexcavadora sobre Orugas (`retroexcavadora_orugas.jpg`):** Motor turbodiésel 6 cilindros de 120 kW con bomba de pistones. Coordenadas: `(62%, 22%)`.
4. **Vibrocompactador Pata de Cabra (`vibrocompactador_pata_cabra.jpg`):** Rodillo excéntrico a 30 Hz y pisado a 60 Hz. Coordenadas: `(86%, 46%)`.
5. **Martillo Neumático Rompepavimentos (`martillo_neumatico.jpg`):** Percusión de 32 kg a 26 Hz y ráfagas a 6 bar. Coordenadas: `(86%, 74%)`.

#### B. Plano General Dinámico (Sector A Construcción) con Fotografía Panorámica Limpia de Ultra-Alta Definición y Movimiento Aislado en Canvas 2D
- **Fotografía Panorámica Continua de Máxima Nitidez Nativa (2400 × 1350 px, Calidad 98%):**
  - Se utiliza la fotografía de cámara real auténtica (`assets/machines/sector_a_construccion_overview.jpg` y `sector_a_construccion_static.jpg`), eliminando por completo cualquier recorte artificial, parche o ventana rectangular.
  - **Distribución de Máquinas en la Obra Real:**
    1. *Cortadora de Disco:* Operario con cortadora en la losa de concreto (`32.5%, 76.3%`).
    2. *Mezcladora Trompo:* En el terreno central (`42.1%, 40.7%`).
    3. *Retroexcavadora:* Chasis, cabina y pluma en el talud de excavación (`58.3%, 17.0%`).
    4. *Vibrocompactador:* Rodillo pata de cabra en la calzada derecha (`82.5%, 41.5%`).
    5. *Martillo Neumático:* Operario con martillo percutor en la losa de concreto (`63.3%, 78.5%`).
- **Arquitectura de Movimiento 100% Limpio (Sin Divs Clip-Path / Sin Bordes de Parche):**
  - **Eliminación Total de Divs Rectangulares:** Se descartaron por completo las capas CSS con `clip-path` y `<img>` superpuestos porque generaban recortes con bordes visibles inaceptables.
  - **Renderizado Dinámico en Canvas 2D Transparente (`overviewCanvas` a 60 FPS):**
    - Todo el movimiento, partículas y ondas acústicas se dibujan en el canvas transparente superpuesto, manteniendo el fondo fotográfico 100% puro y continuo.
    - **Aislamiento Estricto por Fuente:** Al accionar la bocina (`🔊`) de una máquina, **ÚNICAMENTE** esa máquina genera movimiento físico y ondas acústicas concéntricas:
      1. *Cortadora de Disco:* Chorro cónico de agua y neblina refrigerante a alta velocidad a lo largo de la ranura de corte en el concreto + micro-chispas de fricción del diamante.
      2. *Martillo Neumático:* Ciclos de impacto percusivo a 26 Hz con dispersión radial de polvo y esquirlas de concreto en la punta del cincel + destello de fractura.
      3. *Mezcladora Trompo:* Efecto rotativo continuo en la boca del tambor volteando grava y áridos gruesos + ondas de vibración mecánica.
      4. *Retroexcavadora:* Pluma de escape turbodiésel translúcida ascendente que se disipa verticalmente desde el tubo de escape + pulsaciones hidráulicas.
      5. *Vibrocompactador:* Ondas elípticas de densificación y compresión del terreno bajo el tambor pata de cabra + destello estroboscópico de advertencia ámbar en el techo de la cabina.
    - **Cero Movimiento Espurio:** Las máquinas apagadas permanecen 100% inmóviles y congeladas. Si el audio se silencia (MUTE), todo el movimiento se detiene al instante.
- **Botones de Bocinas Interactivos (`🔊`/`🔇`):**
  - Cortadora de disco: `(32.5%, 76.3%)`
  - Martillo neumático: `(63.3%, 78.5%)`
  - Mezcladora trompo: `(42.1%, 40.7%)`
  - Retroexcavadora: `(58.3%, 17.0%)`
  - Vibrocompactador: `(82.5%, 41.5%)`
- **Mini Mini Sonómetro Móvil Arrastrable:**
  - Réplica en miniatura del sonómetro integrador con display LCD digital en tiempo real a 60 FPS, arrastrable libremente por el plano panorámico.
- **Cotas en Barra Inferior:**
  - `↔ Ancho: 45.0 m · ↕ Largo: 32.0 m · Escala: 1 cm = 5 m`
- **Herramienta Cinta Métrica:** Mide distancias en metros y calcula la atenuación acústica teórica en campo libre ($\Delta L = 20\log_{10}(d)$).

---

### 5. Protocolo de Muestreo Higiénico e Informe Técnico en PDF

- **Temporizador de Muestreo:** Presets de 15s (screening), 1m, 5m y 15m (ISO 9612 / GATISO), barra de avance y señal acústica.
- **Tabla Metrológica:** Cálculo automático de $L_{\text{Aeq}}$, $L_{\text{Cpeak}}$, $L_{\text{max}}$, $L_{\text{min}}$, tiempo permisible ($T_{\text{perm}}$, $q=5$), dosis de 8 horas y diagnóstico.
- **Informe Técnico Oficial en PDF (jsPDF + autoTable):**
  - Encabezado institucional con el Logo Oficial.
  - Soporte legal detallado (Res. 2844 de 2007, Res. 1792 de 1990, Res. 2400 de 1979, NTC-ISO 9612:2009).
  - Trazabilidad metrológica y calibración acústica previa y posterior.
  - Tabla de resultados metrológicos por punto con colores normativos de riesgo.
  - Jerarquía de controles y derating de EPP auditivo.
  - Firmas de responsabilidad técnica.

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
        ├── sector_a_construccion_1.gif        # Escena animada dinámica panorámica 16:9 (640x360 px)
        ├── sector_a_construccion_static.jpg   # Base fija estática del fotograma 0 (640x360 px)
        ├── sector_a_construccion_overview.jpg # Plano estático original
        ├── cortadora_disco_concreto.jpg       # Cortadora de concreto con motor 2T
        ├── martillo_neumatico.jpg             # Martillo rompepavimentos neumático
        ├── mezcladora_trompo.jpg              # Mezcladora de volteo
        ├── retroexcavadora_orugas.jpg         # Retroexcavadora sobre orugas
        └── vibrocompactador_pata_cabra.jpg    # Vibrocompactador pata de cabra
```

---

### 7. Historial de Commits y Estado del Repositorio
- **Rama:** `main`
- **Último Commit:** `2617e03` (*feat: escena animada Sector A Construccion_1 con sincronizacion cinetico-acustica selectiva por maquina (clip-path)*)
- **Commits Clave:**
  - `2617e03`: Escena animada Sector A Construcción_1 con sincronización cinético-acústica selectiva por máquina (`clip-path`).
  - `8556930`: Actualización de memoria técnica con tema blanco, plano despejado, mini sonómetro y logo único.
  - `3eabdd6`: Tema blanco base, plano general despejado con solo bocinas, mini sonómetro interactivo y logo institucional sin texto.
  - `6d6bf33`: Ocultar contraseña en modal, logo institucional en sonómetro y paleta blanco/naranja en plano general.
  - `011cf17`: Identidad institucional Tecnológica del Oriente, acceso por contraseña CETO2026, eliminación marcas fabricantes.
  - `02fdaf0`: Máquinas realistas construcción, plano general multifoco con cinta métrica, temporizador de muestreo e informe técnico PDF.
- **Estado de Trabajo:** Totalmente sincronizado con el repositorio remoto (`origin/main`). Árbol de trabajo limpio.

---

### 8. Registro de Cambios: Aprobados vs. No Aprobados / Descartados

#### A. Cambios Aprobados y Consolidados (100% Funcionales)
1. **Escena Dinámica e Interactiva (Sector A Construcción_1):**
   - Sustitución de la escena fija por `Sector A Construcción_1.gif` (640 × 360 px, 16:9).
   - Base fija sin movimiento `sector_a_construccion_static.jpg` (fotograma 0 exacto) para reposo.
   - 5 capas de recorte poligonal CSS (`clip-path: polygon(...)`) independientes para cada máquina.
   - Sincronización estricta: cada máquina **solo se mueve cuando su sonido está activo**. Al apagar la máquina (o mutear el máster), su animación se oculta de inmediato y vuelve al reposo estático.
2. **Plano General Limpio y Despejado:**
   - Eliminación total de tarjetas grandes de texto, balizas numéricas invasivas y barras de cotas sobre la fotografía.
   - Visualización íntegra al 100% de la maquinaria sin recortes ni distorsión.
   - Cotas físicas situadas en la barra inferior de control (`↔ Ancho: 45.0 m · ↕ Largo: 32.0 m · Escala: 1 cm = 5 m`).
3. **Control Acústico Intuitivo por Bocinas:**
   - Cada máquina cuenta exclusivamente con un botón circular interactivo de bocina (`🔊` naranja activo con ondas acústicas / `🔇` blanco inactivo en silencio).
4. **Mini Mini Sonómetro Móvil Arrastrable:**
   - Réplica en miniatura del sonómetro integrador con pantalla LCD digital funcional.
   - Muestra el nivel sonoro en dBA en tiempo real a 60 FPS coordinado con el sonómetro Extech.
   - Arrastrable libremente por el plano con el mouse para auditar divergencia y campo acústico.
5. **Identidad Visual Institucional Tecnológica del Oriente:**
   - Paleta sobre base blanca suave (`#f8fafc` / `#ffffff`), tipografía oscura (`#0f172a`), naranja institucional (`#e67817`), verde sutil (`#16943f`) y mínimo negro.
   - Exclusividad del Logo Institucional (`assets/logo_tecnologica_oriente.png`) en cabecera y modal de autenticación: **sin ningún texto que repita el nombre de la institución**.
6. **Seguridad y Acceso Académico (`CETO2026`):**
   - Modal de acceso con contraseña protegida (tipo `password`).
   - La contraseña nunca se muestra en pantalla.
   - Persistencia de sesión con `sessionStorage` y botón superior `🔒 Bloquear`.
7. **Cero Marcas Comerciales de Fabricantes:**
   - Rotulación estrictamente metrológica según normativas internacionales (IEC 61672-1 Clase 2 e IEC 60942 Clase 1).
   - Nombres técnicos de ingeniería en maquinaria.
8. **Marco Normativo Colombiano e Informe Técnico Oficial en PDF:**
   - Implementación de Res. 2844 de 2007 (GATISO-HNIR, Nivel de Acción 80 dBA, vigilancia bianual y anual, derating de EPP).
   - Res. 1792 de 1990 (TLV 85 dBA, tasa legal $q=5\text{ dB}$, impacto 140 dBC Peak).
   - Generación y descarga directa offline de informes técnicos en PDF con encabezado oficial y trazabilidad.

#### B. Cambios No Aprobados / Descartados / Revertidos por el Usuario
1. **Mostrar la contraseña `CETO2026` en pantalla:** Descartado por seguridad y directriz explícita del usuario.
2. **Textos con el nombre de la institución junto al logo:** Descartado para mantener una cabecera minimalista e institucional limpia solo con el isotipo/logo.
3. **Cajas de datos y cotas superpuestas sobre la foto del plano general:** Descartado por saturar la visual de las máquinas y obstruir el área de trabajo.
4. **Hologramas o marcadores naranjas grandes en el medio del plano:** Descartado; reemplazado por el mini mini sonómetro arrastrable.
5. **Escena estática original `Sector A Construcción.jpg`:** Descartada a favor de la animación interactiva `Sector A Construcción_1.gif`.
6. **Animación en bucle permanente de todas las máquinas:** Descartada; el usuario estableció la regla obligatoria de que solo se mueve la máquina con sonido activo y al apagarla debe congelarse.

---

### 9. Backlog de Propuestas Futuras (Pendientes de Aprobación en Próximas Sesiones)

1. **Escenas Animadas para Sectores Adicionales:**
   - Incorporar animaciones cinético-acústicas para los sectores B (Manufactura / Calderas) y C (Minería / Molienda) cuando el usuario suministre los GIFs correspondientes.
2. **Mapa de Calor Acústico (Isófonas 2D):**
   - Superposición opcional de curvas de igual presión sonora generadas por interpolación en tiempo real sobre el plano general.
3. **Módulo de Dosimetría Acumulada de Jornada Laboral:**
   - Simulación de ciclo de trabajo de 8 horas con cálculo proyectado de dosis (%) y $L_{\text{TWA}}$.
4. **Simulador de Audiometría Tamiz Ocupacional:**
   - Módulo interactivo para trazar curvas audiométricas (vía aérea de 250 Hz a 8000 Hz) y comparar contra los criterios de cambio de umbral auditivo (STS) de la GATISO-HNIR.
5. **Selector de EPP Comercial Colombiano:**
   - Catálogo de protectores auditivos de inserción y de copa comunes en el mercado colombiano con cálculo de atenuación efectiva por bandas de octava.

---

### 10. Protocolo de Reanudación de Sesión (Guía Rápida al Encender el PC)

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
5. **Archivos Principales para Continuar Desarrollo:**
   - Código maestro: `simulador_higiene_ruido_multisectorial.html`
   - Espejo para GitHub Pages: `index.html` (mantener siempre idéntico al maestro)
   - Memoria técnica: `PROYECTO_ESTADO_Y_MEMORIA.md`
