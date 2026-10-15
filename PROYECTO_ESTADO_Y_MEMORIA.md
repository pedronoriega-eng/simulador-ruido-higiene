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

#### B. Plano General Despejado y Cotas
- **Composición General:** `sector_a_construccion_overview.jpg` (2400 × 1792 px), mostrada al 100% sin recortes.
- **Sin Elementos Obstructivos:** Se eliminaron las cajas de texto y las barras superpuestas de cotas sobre la imagen.
- **Solo Botones de Bocinas:**
  - Cada máquina tiene únicamente un botón circular interactivo de bocina (`🔊` activo naranja con onda acústica / `🔇` inactivo blanco).
  - Al hacer clic se activa o desactiva la máquina al instante.
- **Mini Mini Sonómetro Móvil Arrastrable:**
  - Réplica en miniatura del sonómetro integrador con cápsula de micrófono, capuchón antiviento y cuerpo instrumental.
  - Pantalla LCD digital mini que muestra el nivel en dBA en tiempo real sincronizado a 60 FPS con el sonómetro principal.
  - Arrastrable libremente por todo el plano para acercarlo o alejarlo de las fuentes sonoras y verificar la divergencia acústica.
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
    └── machines/                              # Fotografías fotorrealistas de maquinaria
        ├── sector_a_construccion_overview.jpg # Plano general del sector construcción
        ├── cortadora_disco_concreto.jpg       # Cortadora de concreto con motor 2T
        ├── martillo_neumatico.jpg             # Martillo rompepavimentos neumático
        ├── mezcladora_trompo.jpg              # Mezcladora de volteo
        ├── retroexcavadora_orugas.jpg         # Retroexcavadora sobre orugas
        └── vibrocompactador_pata_cabra.jpg    # Vibrocompactador pata de cabra
```

---

### 7. Historial de Commits y Estado del Repositorio
- **Rama:** `main`
- **Último Commit:** `3eabdd6` (*feat: tema blanco base, plano general despejado con solo bocinas, mini sonometro interactivo y logo institucional sin texto*)
- **Estado de Trabajo:** Limpio y sincronizado con el repositorio remoto. Listo para cerrar la sesión y apagar el equipo con seguridad total.
