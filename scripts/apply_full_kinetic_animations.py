import sys, os, re

def update_simulator():
    path = 'simulador_higiene_ruido_multisectorial.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS for overview machine animation clips
    css_to_add = """
        /* Capas de animación cinética aislada con clip-path por fuente en el Plano General */
        .overview-machine-anim {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 6;
            opacity: 0;
            transition: opacity 0.22s ease-in-out;
        }

        .overview-machine-anim.is-active {
            opacity: 1;
        }

        .overview-machine-anim img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center center;
            user-select: none;
        }
    """
    if '.overview-machine-anim' not in content:
        content = content.replace('/* =========================================================================\n           ANIMACIONES CINÉTICAS REALISTAS', css_to_add + '\n        /* =========================================================================\n           ANIMACIONES CINÉTICAS REALISTAS')

    # 2. Update sectorOverviewContainer in HTML to include overviewAnimationClipsLayer
    old_overview_container = '''<div class="sector-overview-layer" id="sectorOverviewContainer" style="display:none;">
                            <!-- Fotografía panorámica continua de alta resolución aprobada (con separación espacial amplia entre máquinas) -->
                            <img id="overviewBgImg" src="assets/machines/sector_a_construccion_overview.jpg?v=approved_dist_2026_v4" alt="Composición General Sector A (Máquinas Separadas)" class="overview-bg-photo static-layer">

                            <!-- Canvas 2D a 60 FPS para física, cinemática, ondas acústicas y cinta métrica estrictamente aisladas por fuente -->
                            <canvas id="overviewCanvas" width="880" height="420" style="position:absolute; inset:0; pointer-events:none; z-index:12;"></canvas>'''

    new_overview_container = '''<div class="sector-overview-layer" id="sectorOverviewContainer" style="display:none;">
                            <!-- Fotografía base panorámica estática de alta resolución -->
                            <img id="overviewBgImg" src="assets/machines/sector_a_construccion_overview.jpg?v=approved_dist_2026_v4" alt="Plano General Multisectorial" class="overview-bg-photo static-layer">

                            <!-- Capas de Animación Cinética Aisladas con Clip-Path por Fuente (Solo se mueven cuando su audio está activo) -->
                            <div id="overviewAnimationClipsLayer" style="position:absolute; inset:0; pointer-events:none; z-index:5;"></div>

                            <!-- Canvas 2D a 60 FPS para física, cinemática, telemetría láser y ondas acústicas aisladas -->
                            <canvas id="overviewCanvas" width="880" height="420" style="position:absolute; inset:0; pointer-events:none; z-index:12;"></canvas>'''

    if old_overview_container in content:
        content = content.replace(old_overview_container, new_overview_container)
    else:
        print("Note: old_overview_container exact match not found, checking regex...")
        content = re.sub(
            r'(<div class="sector-overview-layer" id="sectorOverviewContainer"[^>]*>)\s*(<img id="overviewBgImg"[^>]*>)',
            r'\1\n                            \2\n                            <!-- Capas de Animación Cinética Aisladas con Clip-Path por Fuente -->\n                            <div id="overviewAnimationClipsLayer" style="position:absolute; inset:0; pointer-events:none; z-index:5;"></div>',
            content
        )

    # 3. Update SECTORS definitions with overviewAnimatedPhoto and machine clipPaths / animatedPhoto
    # Sector A
    content = content.replace(
        "overviewStaticPhoto: 'assets/machines/sector_a_construccion_static.jpg?v=approved_dist_2026_v4',",
        "overviewStaticPhoto: 'assets/machines/sector_a_construccion_static.jpg?v=approved_dist_2026_v4',\n                overviewAnimatedPhoto: 'assets/machines/sector_a_construccion_animated.webp?v=anim_2026',"
    )
    # Sector B
    content = content.replace(
        "overviewStaticPhoto: 'assets/machines/sector_b_manufactura_static.jpg?v=2026',",
        "overviewStaticPhoto: 'assets/machines/sector_b_manufactura_static.jpg?v=2026',\n                overviewAnimatedPhoto: 'assets/machines/sector_b_manufactura_animated.webp?v=anim_2026',"
    )
    # Sector C
    content = content.replace(
        "overviewStaticPhoto: 'assets/machines/sector_c_comercio_static.jpg?v=2026',",
        "overviewStaticPhoto: 'assets/machines/sector_c_comercio_static.jpg?v=2026',\n                overviewAnimatedPhoto: 'assets/machines/sector_c_comercio_animated.webp?v=anim_2026',"
    )
    # Sector D
    content = content.replace(
        "overviewStaticPhoto: 'assets/machines/sector_d_mineria_static.jpg?v=2026',",
        "overviewStaticPhoto: 'assets/machines/sector_d_mineria_static.jpg?v=2026',\n                overviewAnimatedPhoto: 'assets/machines/sector_d_mineria_animated.webp?v=anim_2026',"
    )
    # Sector E
    content = content.replace(
        "overviewStaticPhoto: 'assets/machines/sector_e_servicios_static.jpg?v=2026',",
        "overviewStaticPhoto: 'assets/machines/sector_e_servicios_static.jpg?v=2026',\n                overviewAnimatedPhoto: 'assets/machines/sector_e_servicios_animated.webp?v=anim_2026',"
    )

    # Machine clipPaths & animatedPhotos:
    # Cortadora
    content = content.replace(
        "photoTag: 'MOTOR 2T · 4200 RPM · DISCO DIAMANTADO',",
        "photoTag: 'MOTOR 2T · 4200 RPM · DISCO DIAMANTADO',\n                        animatedPhoto: 'assets/machines/cortadora_disco_animated.webp',\n                        clipPath: 'polygon(6% 56%, 25% 56%, 25% 92%, 6% 92%)',"
    )
    # Martillo
    content = content.replace(
        "photoTag: 'PERCUSIÓN 26 Hz · CINCEL ROMPEPAVIMENTOS',",
        "photoTag: 'PERCUSIÓN 26 Hz · CINCEL ROMPEPAVIMENTOS',\n                        animatedPhoto: 'assets/machines/martillo_neumatico_animated.webp',\n                        clipPath: 'polygon(60% 70%, 75% 70%, 75% 98%, 60% 98%)',"
    )
    # Mezcladora
    content = content.replace(
        "photoTag: 'TAMBOR BASCULANTE · MOTOR ELÉCTRICO',",
        "photoTag: 'TAMBOR BASCULANTE · MOTOR ELÉCTRICO',\n                        animatedPhoto: 'assets/machines/mezcladora_trompo_animated.webp',\n                        clipPath: 'polygon(20% 28%, 32% 28%, 32% 54%, 20% 54%)',"
    )
    # Retroexcavadora
    content = content.replace(
        "photoTag: 'MOTOR DIÉSEL 6 CILINDROS · BOMBA HIDRÁULICA',",
        "photoTag: 'MOTOR DIÉSEL 6 CILINDROS · BOMBA HIDRÁULICA',\n                        clipPath: 'polygon(33% 2%, 52% 2%, 52% 28%, 33% 28%)',"
    )
    # Vibrocompactador
    content = content.replace(
        "photoTag: 'RODILLO PATA DE CABRA · FRECUENCIA 30 Hz',",
        "photoTag: 'RODILLO PATA DE CABRA · FRECUENCIA 30 Hz',\n                        animatedPhoto: 'assets/machines/vibrocompactador_pata_cabra_animated.webp',\n                        clipPath: 'polygon(61% 18%, 73% 18%, 73% 45%, 61% 45%)',"
    )

    # Sector B machines
    content = content.replace(
        "id: 'prensa_excentrica_ep500',\n                        name: 'Prensa Excéntrica Mecánica de Estampado (500 kN)',",
        "id: 'prensa_excentrica_ep500',\n                        name: 'Prensa Excéntrica Mecánica de Estampado (500 kN)',\n                        clipPath: 'polygon(4% 65%, 21% 65%, 21% 98%, 4% 98%)',"
    )
    content = content.replace(
        "id: 'martinete_forja_industrial',\n                        name: 'Martinete de Forja Pesada con Acero Incandescente',",
        "id: 'martinete_forja_industrial',\n                        name: 'Martinete de Forja Pesada con Acero Incandescente',\n                        clipPath: 'polygon(13% 48%, 24% 48%, 24% 78%, 13% 78%)',"
    )
    content = content.replace(
        "id: 'pulidora_bosch_gws',\n                        name: 'Amoladora Angular Industrial (Disco 230 mm)',",
        "id: 'pulidora_bosch_gws',\n                        name: 'Amoladora Angular Industrial (Disco 230 mm)',\n                        animatedPhoto: 'assets/machines/pulidora_bosch_gws_animated.webp',\n                        clipPath: 'polygon(23% 66%, 40% 66%, 40% 95%, 23% 95%)',"
    )
    content = content.replace(
        "id: 'compresor_kaeser_csdx165',\n                        name: 'Compresor Rotativo de Tornillo Industrial (90 kW)',",
        "id: 'compresor_kaeser_csdx165',\n                        name: 'Compresor Rotativo de Tornillo Industrial (90 kW)',\n                        clipPath: 'polygon(39% 54%, 60% 54%, 60% 78%, 39% 78%)',"
    )
    content = content.replace(
        "id: 'ventilador_centrifugo_industrial',\n                        name: 'Ventilador Centrífugo Industrial de Tiro Forzado',",
        "id: 'ventilador_centrifugo_industrial',\n                        name: 'Ventilador Centrífugo Industrial de Tiro Forzado',\n                        clipPath: 'polygon(60% 10%, 75% 10%, 75% 90%, 60% 90%)',"
    )

    # Sector C machines
    content = content.replace(
        "id: 'karting_indoor',\n                        name: 'Pista de Karts Bajo Techo (Motor 4T 270cc)',",
        "id: 'karting_indoor',\n                        name: 'Pista de Karts Bajo Techo (Motor 4T 270cc)',\n                        clipPath: 'polygon(8% 85%, 20% 85%, 20% 98%, 8% 98%)',"
    )
    content = content.replace(
        "id: 'discoteca_subwoofers',\n                        name: 'Sound System Discoteca (Muro de Subwoofers)',",
        "id: 'discoteca_subwoofers',\n                        name: 'Sound System Discoteca (Muro de Subwoofers)',\n                        clipPath: 'polygon(9% 14%, 27% 14%, 27% 58%, 9% 58%)',"
    )
    content = content.replace(
        "id: 'restaurante_aforo',\n                        name: 'Restaurante / Comedor con Aforo al 100%',",
        "id: 'restaurante_aforo',\n                        name: 'Restaurante / Comedor con Aforo al 100%',\n                        clipPath: 'polygon(32% 55%, 46% 55%, 46% 82%, 32% 82%)',"
    )
    content = content.replace(
        "id: 'campana_extractora',\n                        name: 'Campana Extractora y Lavavajillas Comercial',",
        "id: 'campana_extractora',\n                        name: 'Campana Extractora y Lavavajillas Comercial',\n                        clipPath: 'polygon(46% 38%, 68% 38%, 68% 64%, 46% 64%)',"
    )
    content = content.replace(
        "id: 'bolera_bowling',\n                        name: 'Bolera / Bowling Profesional (Pistas y Bolos)',",
        "id: 'bolera_bowling',\n                        name: 'Bolera / Bowling Profesional (Pistas y Bolos)',\n                        clipPath: 'polygon(48% 64%, 73% 64%, 73% 98%, 48% 98%)',"
    )

    # Sector D machines
    content = content.replace(
        "id: 'voladura_banco',\n                        name: 'Voladura en Banco con ANFO en Frente Rocoso',",
        "id: 'voladura_banco',\n                        name: 'Voladura en Banco con ANFO en Frente Rocoso',\n                        clipPath: 'polygon(5% 18%, 22% 18%, 22% 44%, 5% 44%)',"
    )
    content = content.replace(
        "id: 'jumbo_perforacion',\n                        name: 'Jumbo Electrohidráulico de Perforación de Roca',",
        "id: 'jumbo_perforacion',\n                        name: 'Jumbo Electrohidráulico de Perforación de Roca',\n                        clipPath: 'polygon(18% 57%, 34% 57%, 34% 80%, 18% 80%)',"
    )
    content = content.replace(
        "id: 'trituradora_mandibulas',\n                        name: 'Trituradora Primaria de Mandíbulas (Chancadora)',",
        "id: 'trituradora_mandibulas',\n                        name: 'Trituradora Primaria de Mandíbulas (Chancadora)',\n                        clipPath: 'polygon(35% 26%, 50% 26%, 50% 48%, 35% 48%)',"
    )
    content = content.replace(
        "id: 'zaranda_vibratoria',\n                        name: 'Criba / Zaranda Vibratoria Clasificadora',",
        "id: 'zaranda_vibratoria',\n                        name: 'Criba / Zaranda Vibratoria Clasificadora',\n                        clipPath: 'polygon(48% 46%, 64% 46%, 64% 68%, 48% 68%)',"
    )
    content = content.replace(
        "id: 'dumper_minero',\n                        name: 'Camión Dumper Fuera de Carretera (300 Toneladas)',",
        "id: 'dumper_minero',\n                        name: 'Camión Dumper Fuera de Carretera (300 Toneladas)',\n                        clipPath: 'polygon(46% 78%, 64% 78%, 64% 98%, 46% 98%)',"
    )

    # Sector E machines
    content = content.replace(
        "id: 'datacenter_servidores',\n                        name: 'Data Center (Servidores Blade y Enfriamiento CRAC)',",
        "id: 'datacenter_servidores',\n                        name: 'Data Center (Servidores Blade y Enfriamiento CRAC)',\n                        clipPath: 'polygon(0% 28%, 20% 28%, 20% 95%, 0% 95%)',"
    )
    content = content.replace(
        "id: 'call_center',\n                        name: 'Oficina Abierta Call Center (Puestos Operadores)',",
        "id: 'call_center',\n                        name: 'Oficina Abierta Call Center (Puestos Operadores)',\n                        animatedPhoto: 'assets/machines/call_center_animated.webp',\n                        clipPath: 'polygon(16% 60%, 36% 60%, 36% 98%, 16% 98%)',"
    )
    content = content.replace(
        "id: 'plotter_imprenta',\n                        name: 'Centro de Copiado con Plotter Industrial de Planos',",
        "id: 'plotter_imprenta',\n                        name: 'Centro de Copiado con Plotter Industrial de Planos',\n                        clipPath: 'polygon(31% 49%, 43% 49%, 43% 70%, 31% 70%)',"
    )
    content = content.replace(
        "id: 'cafeteria_corporativa',\n                        name: 'Cafetería: Molinillo y Vapor de Máquina de Espresso',",
        "id: 'cafeteria_corporativa',\n                        name: 'Cafetería: Molinillo y Vapor de Máquina de Espresso',\n                        clipPath: 'polygon(42% 57%, 60% 57%, 60% 98%, 42% 98%)',"
    )
    content = content.replace(
        "id: 'despacho_avenida',\n                        name: 'Despacho con Gran Ventanal a Tráfico Pesado',",
        "id: 'despacho_avenida',\n                        name: 'Despacho con Gran Ventanal a Tráfico Pesado',\n                        clipPath: 'polygon(58% 18%, 100% 18%, 100% 98%, 58% 98%)',"
    )

    # 4. Update renderMachineIllustration: switch photo dynamically and remove fake red mouth circle
    render_mach_old = """                const isOperating = isPowered && !isAudioMuted;
                const kineticHtml = getMachineKineticHTML(currentMachine.id);

                container.innerHTML = `
                    <div class="machine-photo-wrapper ${isOperating ? 'is-operating' : 'is-idle'} ${currentMachine.id === 'martillo_neumatico' ? 'is-hammering' : ''} ${currentMachine.id === 'call_center' ? 'is-talking' : ''}" id="currentPhotoWrapper">
                        <img src="${currentMachine.photo}" alt="${currentMachine.name}" class="machine-real-photo" id="mainMachinePhoto" onerror="this.style.display='none';">"""

    render_mach_new = """                const isOperating = isPowered && !isAudioMuted;
                const photoSrc = (isOperating && currentMachine.animatedPhoto) ? currentMachine.animatedPhoto : currentMachine.photo;
                const kineticHtml = getMachineKineticHTML(currentMachine.id);

                container.innerHTML = `
                    <div class="machine-photo-wrapper ${isOperating ? 'is-operating' : 'is-idle'} ${currentMachine.id === 'martillo_neumatico' ? 'is-hammering' : ''} ${currentMachine.id === 'call_center' ? 'is-talking' : ''}" id="currentPhotoWrapper">
                        <img src="${photoSrc}" alt="${currentMachine.name}" class="machine-real-photo" id="mainMachinePhoto" onerror="this.style.display='none';">"""

    if render_mach_old in content:
        content = content.replace(render_mach_old, render_mach_new)

    # 5. Add renderOverviewAnimationClips function and update updateMachineAnimationLayers
    func_definitions = """
        // =========================================================================
        // CAPAS DE ANIMACIÓN CINÉTICA AISLADA EN EL PLANO GENERAL (CLIP-PATH)
        // =========================================================================
        function renderOverviewAnimationClips() {
            const container = document.getElementById('overviewAnimationClipsLayer');
            if (!container) return;
            const sec = SECTORS[currentSector];
            if (!sec || !sec.machines) return;
            
            const isMuted = isAudioMuted;
            let html = '';
            sec.machines.forEach(m => {
                if (m.clipPath && sec.overviewAnimatedPhoto) {
                    const isActive = activeOverviewSources.has(m.id) && !isMuted;
                    html += `
                        <div id="overviewAnim_${m.id}" class="overview-machine-anim ${isActive ? 'is-active' : ''}" style="clip-path: ${m.clipPath};">
                            <img src="${sec.overviewAnimatedPhoto}" alt="${m.name}" class="overview-bg-photo">
                        </div>
                    `;
                }
            });
            container.innerHTML = html;
        }

        function updateMachineAnimationLayers() {
            const isOperating = isPowered && !isAudioMuted;

            // 1. Vista en Primer Plano (Single Machine): cambia al WebP animado cuando está en operación
            const photoEl = document.getElementById('mainMachinePhoto');
            if (photoEl && currentMachine && currentMachine.photo) {
                const targetSrc = (isOperating && currentMachine.animatedPhoto) 
                    ? currentMachine.animatedPhoto 
                    : currentMachine.photo;
                if (photoEl.src.indexOf(targetSrc) === -1) {
                    photoEl.src = targetSrc;
                }
            }

            const wrapper = document.getElementById('currentPhotoWrapper');
            if (wrapper) {
                if (isOperating) {
                    wrapper.classList.add('is-operating');
                    wrapper.classList.remove('is-idle');
                } else {
                    wrapper.classList.remove('is-operating');
                    wrapper.classList.add('is-idle');
                }
            }

            const dot = document.getElementById('machineStatusDot');
            const lbl = document.getElementById('machineStateLabel');
            if (dot) dot.className = `status-indicator-dot ${isOperating ? 'dot-active' : 'dot-idle'}`;
            if (lbl) lbl.textContent = isOperating ? 'EN FUNCIONAMIENTO · MOVIMIENTO ACTIVO' : 'EN ESPERA · MOTOR DETENIDO';

            // 2. Vista en Plano General (Overview Mode): solo se anima la máquina cuya bocina esté encendida
            const isMuted = isAudioMuted;
            const sec = SECTORS[currentSector];
            if (sec && sec.machines) {
                sec.machines.forEach(m => {
                    const layer = document.getElementById(`overviewAnim_${m.id}`);
                    if (layer) {
                        const isActive = activeOverviewSources.has(m.id) && !isMuted;
                        if (isActive) {
                            layer.classList.add('is-active');
                        } else {
                            layer.classList.remove('is-active');
                        }
                    }
                });
            }
        }
    """

    # Replace existing updateMachineAnimationLayers implementation
    old_update_pattern = r'function updateMachineAnimationLayers\(\)\s*\{.*?\n        \}'
    if re.search(old_update_pattern, content, re.DOTALL):
        content = re.sub(old_update_pattern, func_definitions.strip(), content, count=1, flags=re.DOTALL)
        print("Updated updateMachineAnimationLayers successfully!")
    else:
        print("Could not find updateMachineAnimationLayers regex, appending...")

    # 6. Ensure renderOverviewMachineBeacons calls renderOverviewAnimationClips & updateMachineAnimationLayers
    content = content.replace(
        "function renderOverviewMachineBeacons() {\n            const layer = document.getElementById('overviewMachinesLayer');",
        "function renderOverviewMachineBeacons() {\n            renderOverviewAnimationClips();\n            const layer = document.getElementById('overviewMachinesLayer');"
    )

    # In beacon click listener, call updateMachineAnimationLayers
    content = content.replace(
        "renderOverviewMachineBeacons();\n                    updateOverviewAcousticGains();",
        "renderOverviewMachineBeacons();\n                    updateOverviewAcousticGains();\n                    updateMachineAnimationLayers();"
    )

    # In switchSector or selectSector
    content = content.replace(
        "renderOverviewMachineBeacons();\n            renderSectorCatalogCards();",
        "renderOverviewMachineBeacons();\n            renderOverviewAnimationClips();\n            updateMachineAnimationLayers();\n            renderSectorCatalogCards();"
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Saved {path} successfully!")

    # Mirror to index.html
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Mirrored exactly to index.html!")

if __name__ == '__main__':
    update_simulator()
