# 🧠 Memoria Técnica y Estado del Proyecto
## Simulador de Higiene Industrial y Ruido Ocupacional
### Corporación Tecnológica del Oriente (Bucaramanga, Colombia)
**Fecha de Actualización:** 14 de Octubre de 2026  
**Repositorio GitHub:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)  
**Rama:** `main`  
**Autor:** Pedro Noriega  
**Institución:** Corporación Tecnológica del Oriente ([https://tecnologicadeloriente.edu.co/](https://tecnologicadeloriente.edu.co/))  
**Credencial de Acceso Académico:** `CETO2026`  

---

### 1. Resumen Ejecutivo del Proyecto
Aplicación web institucional de simulación acústica y metrológica en tiempo real para Higiene Industrial y Seguridad y Salud en el Trabajo (SST), desarrollada con arquitectura puramente nativa (**HTML5 + Vanilla JavaScript + Web Audio API + Canvas 2D a 60 FPS**), sin dependencias externas pesadas. Diseñada con la identidad visual oficial de la **Corporación Tecnológica del Oriente**, acceso académico restringido por contraseña (`CETO2026`), ausencia total de marcas comerciales de fabricantes, exportación autónoma de informes técnicos oficiales en PDF (**jsPDF + autoTable**) con soporte offline local, y despliegue en GitHub Pages.

---

### 2. Identidad Institucional y Seguridad de Acceso

1. **Portal de Autenticación por Contraseña (`CETO2026`):**
   - Pantalla de bienvenida modal institucional con desenfoque de fondo y logo oficial de la Tecnológica del Oriente (`assets/logo_tecnologica_oriente.png`).
   - Requiere la clave de acceso institucional: **`CETO2026`**.
   - Gestión de sesión mediante `sessionStorage` para mantener la autenticación durante la navegación.
   - Botón **"🔒 Bloquear"** en la barra superior para rebloquear la aplicación de manera inmediata.
2. **Paleta de Colores Institucional (tecnologicadeloriente.edu.co):**
   - **Naranja Institucional:** `#e67817` / `#e77810` (Acentos de interacción, botones primarios, balizas activas).
   - **Verde Institucional:** `#16943f` / `#15803d` (Indicadores de zona segura, confirmaciones).
   - **Fondos de Pizarra y Azul Oscuro:** `#070c16`, `#0d1527`, `#131f36`.
   - **Tipografía:** *Plus Jakarta Sans* para encabezados institucionales e *Inter* para datos técnicos y metrología.
3. **Eliminación Total de Marcas Comerciales de Fabricantes:**
   - La instrumentación se rotula estrictamente con estándares metrológicos internacionales (**Sonómetro Digital Integrador Clase 2 / Tipo 2 IEC 61672-1:2013** y **Calibrador Acústico Normalizado IEC 60942 Clase 1**), sin marcas comerciales (EXTECH, Bosch, Kaeser, STIHL).
   - Las máquinas se presentan por su denominación técnica de ingeniería (ej. *Cortadora de Disco para Concreto Motor 2T*, *Amoladora Angular Industrial*, *Compresor Rotativo de Tornillo 90 kW*, *Prensa Excéntrica de Estampado 500 kN*).

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
1. **Cortadora de Disco para Concreto (`cortadora_disco_concreto.jpg`):** Motor 2T a 4200 RPM con disco diamantado.
2. **Martillo Neumático Rompepavimentos (`martillo_neumatico.jpg`):** Percusión de 32 kg a 26 Hz y ráfagas a 6 bar.
3. **Mezcladora Trompo con Volteo de Áridos (`mezcladora_trompo.jpg`):** Tambor de 350 L accionado por corona dentada y cascada de grava.
4. **Retroexcavadora sobre Orugas (`retroexcavadora_orugas.jpg`):** Motor turbodiésel 6 cilindros de 120 kW con bomba de pistones.
5. **Vibrocompactador Pata de Cabra (`vibrocompactador_pata_cabra.jpg`):** Rodillo excéntrico a 30 Hz y pisado a 60 Hz.

#### B. Plano General Limpio y Dimensiones Físicas
- **Composición General:** `sector_a_construccion_overview.jpg`
- **Dimensiones de Ingeniería:**
  - `↔ ANCHO: 45.0 METROS`
  - `↕ LARGO: 32.0 METROS`
  - Escala: `1 cm = 5 m`
  - **Sin cálculo invasivo de área:** Se representan las longitudes de los linderos de forma limpia.
- **Sonda del Sonómetro en el Plano:**
  - Se eliminó el cartel naranja invasivo central.
  - En su lugar, se presenta únicamente un **micrófono compacto interactivo (`🎙️`)** con anillo de pulso acústico.
  - Al hacer clic o arrastrar el micrófono a cualquier punto del área, activa y actualiza la simulación sonora en tiempo real.
  - La lectura de decibeles se visualiza directamente en el **sonómetro grande ubicado en la columna derecha**.
- **Herramienta Cinta Métrica:** Mide distancias en metros y calcula la divergencia acústica teórica en campo libre ($\Delta L = 20\log_{10}(d)$).
- **Proporciones Adaptativas a Pantalla Completa:** El contenedor mantiene una relación de aspecto de 16:9 con altura adaptable mediante `clamp()` y auto-escalado dinámico del canvas.

---

### 5. Protocolo de Muestreo Higiénico e Informe Técnico en PDF

- **Temporizador de Muestreo:** Presets de 15s (screening), 1m, 5m y 15m (ISO 9612 / GATISO), barra de avance y señal acústica.
- **Tabla Metrológica:** Cálculo automático de $L_{\text{Aeq}}$, $L_{\text{Cpeak}}$, $L_{\text{max}}$, $L_{\text{min}}$, tiempo permisible ($T_{\text{perm}}$, $q=5$), dosis de 8 horas y diagnóstico.
- **Informe Técnico Oficial en PDF (jsPDF + autoTable):**
  - Encabezado institucional de la **Corporación Tecnológica del Oriente**.
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
├── PROYECTO_ESTADO_Y_MEMORIA.md              # Este archivo de memoria técnica
├── README.md                                  # Documentación pública del repositorio
└── assets/
    ├── logo_tecnologica_oriente.png           # Logo oficial de la Tecnológica del Oriente
    ├── js/                                    # Librerías offline para informes técnicos PDF
    │   ├── jspdf.umd.min.js
    │   └── jspdf.plugin.autotable.min.js
    └── machines/                              # Fotografías reales industriales de alta fidelidad
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

### 7. Sincronización y Mantenimiento

1. **Modificación:** Editar `simulador_higiene_ruido_multisectorial.html`.
2. **Sincronización:** Copiar a `index.html`:
   ```powershell
   Copy-Item -Path "simulador_higiene_ruido_multisectorial.html" -Destination "index.html" -Force
   ```
3. **Control de Versiones:**
   ```powershell
   git add .
   git commit -m "feat: <descripción>"
   git push origin main
   ```
4. **Acceso Académico:** Contraseña `CETO2026`.
