# 🧠 Memoria Técnica y Estado del Proyecto
## Simulador de Higiene Industrial y Ruido Ocupacional (Colombia)
**Fecha de Actualización:** 14 de Octubre de 2026  
**Repositorio GitHub:** [https://github.com/pedronoriega-eng/simulador-ruido-higiene.git](https://github.com/pedronoriega-eng/simulador-ruido-higiene.git)  
**Rama:** `main`  
**Autor:** Pedro Noriega  

---

### 1. Resumen Ejecutivo del Proyecto
Aplicación web de simulación acústica y metrológica en tiempo real para Higiene Industrial y Seguridad y Salud en el Trabajo (SST), desarrollada con arquitectura puramente nativa (**HTML5 + Vanilla JavaScript + Web Audio API + Canvas 2D a 60 FPS**), sin dependencias externas ni frameworks pesados. Opera tanto de forma local (doble clic en `index.html`) como desplegada en GitHub Pages.

---

### 2. Marco Normativo Colombiano e Internacional Implementado

| Norma | Ámbito y Aplicación en el Simulador |
| :--- | :--- |
| **Resolución 2844 de 2007 (Ministerio de la Protección Social)** | Adopción obligatoria de la **GATISO-HNIR** (Hipoacusia Neurosensorial Inducida por Ruido). Define el **Nivel de Acción en 80 dBA** (Dosis = 50%), activación del Programa de Conservación Auditiva (PCA), protocolos de vigilancia audiométrica periódica (bianual para 80–84.9 dBA y anual obligatoria para $\ge 85\text{ dBA}$ o jornadas extendidas/ototóxicos) y cálculo del *derating* de EPP auditivo. |
| **Resolución 1792 de 1990 (Ministerios de Trabajo y Salud)** | Valores Límites Permisibles (TLV) para exposición continua e intermitente de 8 horas fijados en **85 dBA**. Aplica la **tasa de intercambio legal colombiana de $q = 5\text{ dB}$** ($T_{\text{perm}} = 8 / 2^{(L_{\text{eq}} - 85)/5}$ h). Límite de impacto máximo absoluto de **140 dBC Peak**. |
| **Resolución 2400 de 1979 (Estatuto de Seguridad e Higiene)** | Artículos 88 a 96: Principio de jerarquía de controles (obligatoriedad del control en la fuente generadora y en el medio de transmisión antes de aplicar EPP). |
| **Decreto 1072 de 2015** | Sistema de Gestión de la Seguridad y Salud en el Trabajo (SG-SST). |
| **IEC 61672-1:2013** | Especificación electroacústica de sonómetros Clase 1 y Clase 2 (filtros de ponderación frecuencial A y C, constantes balísticas FAST de 125 ms, SLOW de 1000 ms y detector PEAK $< 50\ \mu\text{s}$). |
| **IEC 61260:2014** | Filtros de bandas de octava normalizadas (31.5 Hz a 16 kHz). |
| **ISO 9612:2009** | Determinación de la exposición al ruido laboral mediante auditoría metrológica de focos y puestos de trabajo. |

---

### 3. Maquinaria y Equipos Hiperrealistas con Fotografías Reales (Sector B)

En el **Sector B: Manufactura y Metalmecánica**, los equipos se visualizan mediante fotografías de alta fidelidad con capas superpuestas de física (chispas, resplandor térmico, ondas de choque y vapores) y balizas interactivas ISO 9612:

1. **Amoladora Angular Bosch Professional GWS (`pulidora_bosch_gws.jpg`):**
   - Disco de 230 mm en desbaste de soldadura a 8500 RPM.
   - Síntesis: motor universal de escobillas (5200 Hz) + fricción abrasiva cortante.
   - Partículas: ducha balística de chispas con rebote elástico en el suelo industrial.
2. **Prensa Excéntrica EP-500 Precision Metalworks (`prensa_excentrica_ep500.jpg`):**
   - Prensa mecánica de 500 kN con volante de inercia y matriz de estampado progresivo.
   - Síntesis: golpe seco de impacto profundo (85 Hz decreciente) + resonancia de estructura.
3. **Martinete de Forja Pesada con Acero Incandescente (`martinete_forja_industrial.jpg`):**
   - Deformación plástica de lingote a $1100^\circ\text{C}$ con maza percutora y yunque.
   - Síntesis: sobrepresión de impacto extremo ($138.2\text{ dBC Peak}$) + campana de yunque + purga de vapor neumático.
   - Partículas: resplandor térmico radial incandescente y desprendimiento de esquirlas de forja.
4. **Compresor de Tornillo Kaeser CSDX 165 (`compresor_kaeser_csdx165.jpg`):**
   - Rotores helicoidales Sigma Profile acoplados a motor trifásico de 90 kW en skid abierto.
   - Síntesis: zumbido de compresión (1450 Hz) + silenciador y purga continua sibilante.
   - Partículas: disipación térmica y vapores ascendiendo por chimenea.
5. **Ventilador Centrífugo Industrial (`ventilador_centrifugo_industrial.jpg`):**
   - Rodete multipala con eje en chumaceras.
   - Síntesis: ruido tonal por frecuencia de paso de álabes (BPF a 480 Hz) y turbulencia aerodinámica continua.
   - Partículas: vórtices de flujo giratorio en la boca de impulsión.

---

### 4. Tres Gráficas Técnicas en Tiempo Real

1. **Onda de Presión $p(t)$ [Presión en Pascales (Pa)]:**
   - Eje vertical calibrado en unidades físicas de **Pascales (Pa y mPa)** con $p_0 = 20\,\mu\text{Pa}$.
   - Auto-escalado dinámico: $\pm 0.1$, $\pm 0.5$, $\pm 2$, $\pm 10$, $\pm 50$ o $\pm 100\text{ Pa}$.
   - Marcadores numéricos en tiempo real: $p_{\text{rms}}$ y $p_{\text{peak}}$.
2. **Histograma Temporal $L_p$ en el Tiempo ($dB$ vs $t$):**
   - Registrador continuo de 30 segundos (buffer circular de 120 muestras a 4 Hz).
   - Trazo de $L_p$ instantáneo con área bajo la curva y línea discontinua de $L_{\text{Aeq}}$ acumulado.
   - **Líneas de umbral normativo:** Línea roja discontinua en **85 dBA (TLV Res. 1792)** y línea ámbar discontinua en **80 dBA (Nivel de Acción Res. 2844 / GATISO)**.
3. **Analizador RTA en Bandas de Octava (IEC 61260):**
   - 10 bandas normalizadas: 31.5 Hz a 16 kHz.
   - Código cromático de riesgo: Verde ($<80\text{ dB}$), Ámbar ($80–84.9\text{ dB}$), Rojo ($\ge 85\text{ dB}$).
   - Rótulos numéricos en dB sobre cada barra y líneas de 80 y 85 dB.

---

### 5. Estructura de Archivos del Proyecto

```
Simulador_Ruido/
├── index.html                                 # Punto de entrada principal y GitHub Pages
├── simulador_higiene_ruido_multisectorial.html # Archivo maestro de desarrollo
├── metadata.json                              # Configuración y metadatos de capacidades IDE
├── PROYECTO_ESTADO_Y_MEMORIA.md              # Este archivo de persistencia de memoria
├── README.md                                  # Documentación pública del repositorio
└── assets/
    └── machines/                              # Fotografías reales industriales en alta resolución
        ├── pulidora_bosch_gws.jpg
        ├── prensa_excentrica_ep500.jpg
        ├── martinete_forja_industrial.jpg
        ├── compresor_kaeser_csdx165.jpg
        └── ventilador_centrifugo_industrial.jpg
```

---

### 6. Instrucciones para Reanudar Trabajo en una Próxima Sesión

1. **Abrir el Espacio de Trabajo:** `c:\Users\Estudiante 08\Documents\Pedro_Noriega\Aplicaciones IA\Simulador_Ruido`
2. **Consultar este archivo:** `PROYECTO_ESTADO_Y_MEMORIA.md` para verificar qué se implementó y qué fórmulas rigen.
3. **Modificaciones en el Código:** Realizar cambios en `simulador_higiene_ruido_multisectorial.html` y copiar a `index.html` mediante:
   ```powershell
   Copy-Item -Path "simulador_higiene_ruido_multisectorial.html" -Destination "index.html" -Force
   ```
4. **Sincronización Git:**
   ```powershell
   git add .
   git commit -m "feat: <descripción del cambio>"
   git push origin main
   ```
5. **Verificación en Navegador:** Abrir `index.html` en Chrome o Edge.
