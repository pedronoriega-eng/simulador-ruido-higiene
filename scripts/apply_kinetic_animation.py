import sys

def main():
    file_path = 'simulador_higiene_ruido_multisectorial.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS for kinetic layers, mouth speech animation, spinning blades, and live banners
    kinetic_css = """
        /* =========================================================================
           ANIMACIONES CINÉTICAS REALISTAS DE MÁQUINAS Y PERSONAS HABLANDO
           ========================================================================= */

        /* 1. Vibración mecánica y respiración de la imagen en funcionamiento */
        .machine-photo-wrapper.is-operating .machine-real-photo {
            animation: machineOperatingJitter 0.07s infinite alternate ease-in-out;
        }
        @keyframes machineOperatingJitter {
            0% { transform: translate(0, 0) scale(1.0); }
            33% { transform: translate(-0.8px, 0.6px) scale(1.002); }
            66% { transform: translate(0.6px, -0.7px) scale(0.999); }
            100% { transform: translate(-0.5px, -0.4px) scale(1.001); }
        }

        .machine-photo-wrapper.is-hammering .machine-real-photo {
            animation: heavyHammerJitter 0.038s infinite ease-in-out !important;
        }
        @keyframes heavyHammerJitter {
            0% { transform: translateY(0); }
            40% { transform: translateY(3.0px); }
            80% { transform: translateY(-1.0px); }
            100% { transform: translateY(0); }
        }

        .machine-photo-wrapper.is-talking .machine-real-photo {
            animation: teleoperatorBreathing 2.4s infinite ease-in-out !important;
        }
        @keyframes teleoperatorBreathing {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(0.5px, -0.8px) scale(1.005); }
        }

        /* Indicador de estado punto */
        .status-indicator-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 5px;
            vertical-align: middle;
        }
        .status-indicator-dot.dot-active {
            background: #22c55e;
            box-shadow: 0 0 10px #22c55e;
            animation: laserBlink 1.2s infinite;
        }
        .status-indicator-dot.dot-idle {
            background: #94a3b8;
        }

        /* Banner de acción en vivo sobre la imagen */
        .live-action-banner {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 0.74rem;
            font-weight: 800;
            letter-spacing: 0.3px;
            color: #ffffff;
            box-shadow: 0 6px 20px rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            animation: bannerPulse 2s infinite ease-in-out;
            pointer-events: none;
        }
        @keyframes bannerPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        .speech-banner {
            background: rgba(22, 148, 63, 0.92);
            border: 1.5px solid #34d399;
        }
        .cutter-banner {
            background: rgba(230, 120, 23, 0.92);
            border: 1.5px solid #fbbf24;
        }
        .hammer-banner {
            background: rgba(220, 38, 38, 0.92);
            border: 1.5px solid #f87171;
        }
        .grinder-banner {
            background: rgba(2, 132, 199, 0.92);
            border: 1.5px solid #38bdf8;
        }
        .mixer-banner {
            background: rgba(202, 138, 4, 0.92);
            border: 1.5px solid #facc15;
        }
        .roller-banner {
            background: rgba(234, 88, 12, 0.92);
            border: 1.5px solid #fb923c;
        }
        .generic-banner {
            background: rgba(15, 23, 42, 0.92);
            border: 1.5px solid var(--ceto-orange);
        }

        /* 2. Boca animada hablando (Call Center Teleoperadora) */
        .animated-mouth-box {
            transform-origin: center;
            animation: mouthGesticulate 1.8s infinite ease-in-out;
        }
        @keyframes mouthGesticulate {
            0%, 100% { transform: rotate(0deg); }
            30% { transform: rotate(1.5deg); }
            70% { transform: rotate(-1deg); }
        }
        .talking-mouth-svg .mouth-cavity {
            animation: mouthOpening 0.22s infinite alternate ease-in-out;
            transform-origin: center;
        }
        @keyframes mouthOpening {
            0% { transform: scaleY(0.35) scaleX(0.85); fill: #300505; }
            50% { transform: scaleY(1.4) scaleX(1.1); fill: #4a0404; }
            100% { transform: scaleY(0.7) scaleX(0.95); fill: #380707; }
        }
        .talking-mouth-svg .lower-lip {
            animation: lowerLipMove 0.22s infinite alternate ease-in-out;
            transform-origin: center;
        }
        @keyframes lowerLipMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(2.5px); }
        }

        /* Ondas de voz emanando de la teleoperadora */
        .speech-emission-halo {
            position: absolute;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            pointer-events: none;
        }
        .speech-emission-halo .speech-wave {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            border: 2.2px solid #34d399;
            border-radius: 50%;
            opacity: 0;
            animation: speechWaveExpand 1.1s infinite ease-out;
        }
        .speech-emission-halo .wave-1 { animation-delay: 0s; }
        .speech-emission-halo .wave-2 { animation-delay: 0.36s; }
        .speech-emission-halo .wave-3 { animation-delay: 0.72s; }
        @keyframes speechWaveExpand {
            0% { width: 8px; height: 8px; opacity: 0.9; transform: translate(-50%, -50%) scale(0.5); }
            100% { width: 85px; height: 85px; opacity: 0; transform: translate(-100%, -50%) scale(1.6); border-color: #10b981; }
        }

        /* LED de llamada en auricular */
        .call-pulse-led {
            display: block;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 10px #22c55e, 0 0 20px #16a34a;
            animation: callLedFlash 0.9s infinite alternate;
        }
        @keyframes callLedFlash {
            0% { opacity: 0.4; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1.3); }
        }

        /* Tecleo en teclado */
        .keyboard-sparkle {
            position: absolute;
            width: 7px;
            height: 7px;
            background: #38bdf8;
            border-radius: 50%;
            opacity: 0;
            animation: keyTap 0.4s infinite;
        }
        .ks-1 { left: -18px; top: 0; animation-delay: 0.1s; }
        .ks-2 { left: 0px; top: 5px; animation-delay: 0.25s; }
        .ks-3 { left: 18px; top: -3px; animation-delay: 0.35s; }
        @keyframes keyTap {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 0.85; transform: scale(1.5); }
            100% { opacity: 0; transform: scale(0.8); }
        }

        /* Monitor CRM activo */
        .screen-scanline {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.05) 50%, rgba(56, 189, 248, 0.22) 100%);
            animation: scanlineScroll 1.8s infinite linear;
        }
        @keyframes scanlineScroll {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }

        /* 3. Disco diamantado girando a 4200 RPM */
        .rotating-blade-disc {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            border: 3px solid rgba(226, 232, 240, 0.9);
            background: conic-gradient(from 0deg, #94a3b8, #f8fafc, #64748b, #cbd5e1, #94a3b8, #f8fafc, #475569, #cbd5e1);
            box-shadow: 0 0 25px rgba(254, 215, 170, 0.6), inset 0 0 20px rgba(0,0,0,0.5);
            animation: spinUltraFast 0.04s infinite linear;
            position: relative;
        }
        @keyframes spinUltraFast {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .blade-arbor-nut {
            position: absolute;
            inset: 42px;
            border-radius: 50%;
            background: #0f172a;
            border: 3px solid #f97316;
        }
        .blade-friction-glow {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 65px;
            height: 65px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(255, 237, 213, 0.95) 0%, rgba(249, 115, 22, 0.65) 40%, transparent 70%);
            animation: frictionFlicker 0.08s infinite alternate;
        }
        @keyframes frictionFlicker {
            0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.9); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.18); }
        }

        /* 4. Percusión de martillo neumático a 26 Hz */
        .chisel-impact-shockwave {
            width: 55px;
            height: 26px;
            border-radius: 50%;
            border: 2px solid rgba(248, 113, 113, 0.9);
            animation: shockwavePulse 0.038s infinite ease-out;
        }
        @keyframes shockwavePulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
        }
        .concrete-dust-burst {
            width: 65px;
            height: 38px;
            background: radial-gradient(ellipse at center, rgba(241, 245, 249, 0.8) 0%, rgba(148, 163, 184, 0.45) 50%, transparent 80%);
            border-radius: 50%;
            animation: dustPuff 0.076s infinite alternate;
        }
        @keyframes dustPuff {
            0% { transform: scale(0.8) translateY(0); opacity: 0.5; }
            100% { transform: scale(1.3) translateY(-6px); opacity: 0.85; }
        }

        /* 5. Pulidora con desbaste y chispas a 8500 RPM */
        .grinder-disc-spin {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            border: 3px solid rgba(251, 191, 36, 0.9);
            background: conic-gradient(from 0deg, #18181b, #71717a, #27272a, #a1a1aa, #18181b);
            animation: spinUltraFast 0.035s infinite linear;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
        }
        .hot-weld-glow {
            position: absolute;
            width: 48px;
            height: 48px;
            background: radial-gradient(circle, #fef08a 0%, #f97316 60%, transparent 100%);
            border-radius: 50%;
            animation: frictionFlicker 0.05s infinite alternate;
        }
"""
    if 'ANIMACIONES CINÉTICAS REALISTAS DE MÁQUINAS' not in content:
        content = content.replace("/* Colores de Instrumento y Normativos */", kinetic_css + "\n        /* Colores de Instrumento y Normativos */", 1)

    # 2. Add getMachineKineticHTML helper function and update renderMachineIllustration
    kinetic_helper_func = """        // =========================================================================
        // GENERADOR DE CAPA CINÉTICA REALISTA (MÁQUINAS Y PERSONAS HABLANDO)
        // =========================================================================
        function getMachineKineticHTML(machId) {
            if (machId === 'call_center') {
                return `
                    <!-- ANIMACIÓN DE TELEOPERADORA HABLANDO EN TIEMPO REAL -->
                    <div class="talking-head-anchor" style="position:absolute; left:63.5%; top:42%; transform:translate(-50%, -50%); z-index:15;">
                        <!-- Labios animados articulando palabras -->
                        <div class="animated-mouth-box">
                            <svg class="talking-mouth-svg" viewBox="0 0 50 32" style="width:32px; height:20px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
                                <ellipse cx="25" cy="16" rx="16" ry="8" fill="#450a0a" class="mouth-cavity"/>
                                <rect x="15" y="11" width="20" height="3" rx="1.5" fill="#ffffff" class="upper-teeth"/>
                                <path d="M 6 16 Q 25 8 44 16 Q 25 12 6 16 Z" fill="#b91c1c" class="upper-lip"/>
                                <path d="M 6 16 Q 25 24 44 16 Q 25 19 6 16 Z" fill="#991b1b" class="lower-lip"/>
                            </svg>
                        </div>
                        <!-- Ondas vocales humanas radiando del micrófono -->
                        <div class="speech-emission-halo">
                            <div class="speech-wave wave-1"></div>
                            <div class="speech-wave wave-2"></div>
                            <div class="speech-wave wave-3"></div>
                        </div>
                    </div>

                    <!-- Diadema telefónica con LED de llamada activo -->
                    <div class="headset-indicator-led" style="position:absolute; left:75.5%; top:37%; z-index:16;" title="Diadema Telefónica: Transmisión de Audio Activa">
                        <span class="call-pulse-led"></span>
                    </div>

                    <!-- Manos digitando en teclado -->
                    <div class="typing-hands-glow" style="position:absolute; left:41%; top:82%; transform:translate(-50%, -50%); z-index:14;">
                        <div class="keyboard-sparkle ks-1"></div>
                        <div class="keyboard-sparkle ks-2"></div>
                        <div class="keyboard-sparkle ks-3"></div>
                    </div>

                    <!-- Monitor con CRM activo en pantalla -->
                    <div class="monitor-crm-glow" style="position:absolute; left:23%; top:54%; width:16%; height:28%; transform:translate(-50%, -50%); z-index:11;">
                        <div class="screen-scanline"></div>
                    </div>

                    <!-- Banner flotante de locución activa -->
                    <div class="live-action-banner speech-banner" style="position:absolute; top:18px; left:18px; z-index:20;">
                        <span>🎙️</span>
                        <span>TELEOPERADORA HABLANDO CON CLIENTE · CONVERSACIÓN Y TECLEO EN VIVO (65 dBA)</span>
                    </div>
                `;
            } else if (machId === 'cortadora_disco') {
                return `
                    <!-- DISCO DIAMANTADO GIRANDO A 4200 RPM CON AGUA Y CHISPAS -->
                    <div class="spinning-blade-anchor" style="position:absolute; left:64%; top:76%; transform:translate(-50%, -50%); z-index:15;">
                        <div class="rotating-blade-disc">
                            <div class="blade-arbor-nut"></div>
                        </div>
                        <div class="blade-friction-glow"></div>
                    </div>
                    <div class="live-action-banner cutter-banner" style="position:absolute; top:18px; left:18px; z-index:20;">
                        <span>⚡</span>
                        <span>CORTE DE CONCRETO ACTIVO · DISCO DIAMANTADO A 4200 RPM · REFRIGERACIÓN POR AGUA (105 dBA)</span>
                    </div>
                `;
            } else if (machId === 'martillo_neumatico') {
                return `
                    <!-- CINCEL PERCUTIENDO A 26 Hz Y FRACTURA DE CONCRETO -->
                    <div class="hammer-chisel-anchor" style="position:absolute; left:56%; top:82%; transform:translate(-50%, -50%); z-index:15;">
                        <div class="chisel-impact-shockwave"></div>
                        <div class="concrete-dust-burst"></div>
                    </div>
                    <div class="live-action-banner hammer-banner" style="position:absolute; top:18px; left:18px; z-index:20;">
                        <span>🔨</span>
                        <span>PERCUSIÓN NEUMÁTICA A 26 Hz · FRACTURA CONTINUA DE CONCRETO (106 dBA · PICO 125 dBC)</span>
                    </div>
                `;
            } else if (machId === 'pulidora_bosch_gws') {
                return `
                    <!-- DISCO ABRASIVO 230mm A 8500 RPM Y CHISPAS -->
                    <div class="grinder-spark-anchor" style="position:absolute; left:49%; top:56%; transform:translate(-50%, -50%); z-index:15;">
                        <div class="grinder-disc-spin"></div>
                        <div class="hot-weld-glow"></div>
                    </div>
                    <div class="live-action-banner grinder-banner" style="position:absolute; top:18px; left:18px; z-index:20;">
                        <span>✨</span>
                        <span>DESBASTE ABRASIVO EN ACERO · DISCO A 8500 RPM · CHISPAS INCANDESCENTES (100 dBA)</span>
                    </div>
                `;
            } else if (machId === 'mezcladora_trompo') {
                return `
                    <div class="live-action-banner mixer-banner" style="position:absolute; top:18px; left:18px; z-index:20;">
                        <span>🔄</span>
                        <span>TAMBOR ROTATIVO EN FUNCIONAMIENTO · VOLTEO DE CANTOS RODADOS (88 dBA)</span>
                    </div>
                `;
            } else if (machId === 'vibrocompactador') {
                return `
                    <div class="live-action-banner roller-banner" style="position:absolute; top:18px; left:18px; z-index:20;">
                        <span>📳</span>
                        <span>COMPACTACIÓN SÍSMICA A 30 Hz · DENSIFICACIÓN DE SUELO (93 dBA)</span>
                    </div>
                `;
            } else {
                return `
                    <div class="live-action-banner generic-banner" style="position:absolute; top:18px; left:18px; z-index:20;">
                        <span>⚙️</span>
                        <span>EQUIPO INDUSTRIAL EN FUNCIONAMIENTO ACTIVO</span>
                    </div>
                `;
            }
        }
"""
    if 'function getMachineKineticHTML' not in content:
        content = content.replace("function renderMachineIllustration() {", kinetic_helper_func + "\n        function renderMachineIllustration() {", 1)

    # 3. Update renderMachineIllustration implementation to inject the kinetic layer and wrapper classes
    old_render = """            if (currentMachine.photo) {
                const eppText = currentMachine.baseSpl >= 85 
                    ? 'Protección Auditiva de Copa (NRR 30 dB) · Casco de Seguridad · Gafas' 
                    : currentMachine.id === 'call_center' 
                        ? 'Diadema Telefónica Ergonómica · Filtro Acústico Antiruido · Puesto Ergonómico' 
                        : 'Protección Auditiva de Inserción (NRR 25 dB) · EPP Técnico';
                container.innerHTML = `
                    <div class="machine-photo-wrapper">
                        <img src="${currentMachine.photo}" alt="${currentMachine.name}" class="machine-real-photo" onerror="this.style.display='none';">
                        <div class="photo-ambient-vignette"></div>
                        <div class="photo-badge-overlay">👷 OPERACIÓN EN PRIMER PLANO · ${currentMachine.photoTag || 'ALTA DEFINICIÓN'}</div>
                        <div class="worker-epp-badge">🛡️ EPP En Uso: ${eppText}</div>
                    </div>
                `;
                renderHotspotBeacons();
                return;
            }"""

    new_render = """            if (currentMachine.photo) {
                const eppText = currentMachine.baseSpl >= 85 
                    ? 'Protección Auditiva de Copa (NRR 30 dB) · Casco de Seguridad · Gafas' 
                    : currentMachine.id === 'call_center' 
                        ? 'Diadema Telefónica Ergonómica · Filtro Acústico Antiruido · Puesto Ergonómico' 
                        : 'Protección Auditiva de Inserción (NRR 25 dB) · EPP Técnico';

                const isOperating = isPowered && !isAudioMuted;
                const kineticHtml = getMachineKineticHTML(currentMachine.id);

                container.innerHTML = `
                    <div class="machine-photo-wrapper ${isOperating ? 'is-operating' : 'is-idle'} ${currentMachine.id === 'martillo_neumatico' ? 'is-hammering' : ''} ${currentMachine.id === 'call_center' ? 'is-talking' : ''}" id="currentPhotoWrapper">
                        <img src="${currentMachine.photo}" alt="${currentMachine.name}" class="machine-real-photo" id="mainMachinePhoto" onerror="this.style.display='none';">
                        
                        <!-- CAPA CINÉTICA REALISTA DE MOVIMIENTO Y PERSONAS HABLANDO (CUANDO EL AUDIO ESTÁ ACTIVO) -->
                        <div class="machine-kinetic-layer" id="machineKineticLayer" style="display: ${isOperating ? 'block' : 'none'};">
                            ${kineticHtml}
                        </div>

                        <div class="photo-ambient-vignette"></div>
                        <div class="photo-badge-overlay">
                            <span class="status-indicator-dot ${isOperating ? 'dot-active' : 'dot-idle'}" id="machineStatusDot"></span>
                            <span id="machineStateLabel">${isOperating ? 'EN FUNCIONAMIENTO · MOVIMIENTO ACTIVO' : 'EN ESPERA · MOTOR DETENIDO'}</span> · ${currentMachine.photoTag || 'ALTA DEFINICIÓN'}
                        </div>
                        <div class="worker-epp-badge">🛡️ EPP En Uso: ${eppText}</div>
                    </div>
                `;
                renderHotspotBeacons();
                updateMachineAnimationLayers();
                return;
            }"""
    content = content.replace(old_render, new_render, 1)

    # 4. Implement updateMachineAnimationLayers
    old_update_layers = """        function updateMachineAnimationLayers() {
            // Mantenido para compatibilidad
        }"""

    new_update_layers = """        function updateMachineAnimationLayers() {
            const isOperating = isPowered && !isAudioMuted;
            const photoWrapper = document.getElementById('currentPhotoWrapper');
            const kineticLayer = document.getElementById('machineKineticLayer');
            const stateLabel = document.getElementById('machineStateLabel');
            const statusDot = document.getElementById('machineStatusDot');

            if (photoWrapper) {
                if (isOperating) {
                    photoWrapper.classList.remove('is-idle');
                    photoWrapper.classList.add('is-operating');
                    if (currentMachine.id === 'martillo_neumatico') photoWrapper.classList.add('is-hammering');
                    else photoWrapper.classList.remove('is-hammering');

                    if (currentMachine.id === 'call_center') photoWrapper.classList.add('is-talking');
                    else photoWrapper.classList.remove('is-talking');

                    if (kineticLayer) kineticLayer.style.display = 'block';
                    if (stateLabel) stateLabel.textContent = 'EN FUNCIONAMIENTO · MOVIMIENTO ACTIVO';
                    if (statusDot) {
                        statusDot.classList.remove('dot-idle');
                        statusDot.classList.add('dot-active');
                    }
                } else {
                    photoWrapper.classList.remove('is-operating', 'is-hammering', 'is-talking');
                    photoWrapper.classList.add('is-idle');
                    if (kineticLayer) kineticLayer.style.display = 'none';
                    if (stateLabel) stateLabel.textContent = 'EN ESPERA · MOTOR DETENIDO';
                    if (statusDot) {
                        statusDot.classList.remove('dot-active');
                        statusDot.classList.add('dot-idle');
                    }
                }
            }
        }"""
    content = content.replace(old_update_layers, new_update_layers, 1)

    # 5. In drawOverviewScene, expand call_center with talking teleoperators and vocal waves
    old_ov_callcenter = """                        } else if (m.id === 'call_center') {
                            for (let p = 0; p < 3; p++) {
                                const prog = ((waveTime * 1.8 + p / 3) % 1);
                                overviewCtx.strokeStyle = `rgba(22, 148, 63, ${(1 - prog) * 0.4})`;
                                overviewCtx.lineWidth = 1.2;
                                overviewCtx.strokeRect(mx - 18 * prog, my - 12 * prog, 36 * prog, 24 * prog);
                            }
                        }"""

    new_ov_callcenter = """                        } else if (m.id === 'call_center') {
                            // ANIMACIÓN DE PERSONAS HABLANDO Y TRABAJANDO EN CALL CENTER
                            overviewCtx.save();
                            for (let op = 0; op < 3; op++) {
                                const opX = mx - 20 + op * 20;
                                const opY = my + 6;
                                const headBob = Math.sin(waveTime * 5 + op * 2) * 2.2;

                                // Cabeza del teleoperador
                                overviewCtx.beginPath();
                                overviewCtx.arc(opX, opY - 14 + headBob, 5, 0, Math.PI * 2);
                                overviewCtx.fillStyle = '#0f172a';
                                overviewCtx.fill();
                                overviewCtx.strokeStyle = '#38bdf8';
                                overviewCtx.lineWidth = 1;
                                overviewCtx.stroke();

                                // Diadema telefónica con micrófono
                                overviewCtx.beginPath();
                                overviewCtx.arc(opX, opY - 15 + headBob, 6, Math.PI * 0.8, Math.PI * 2.2);
                                overviewCtx.strokeStyle = '#22c55e';
                                overviewCtx.lineWidth = 1.5;
                                overviewCtx.stroke();

                                // LED de llamada en vivo
                                overviewCtx.beginPath();
                                overviewCtx.arc(opX - 4, opY - 12 + headBob, 1.8, 0, Math.PI * 2);
                                overviewCtx.fillStyle = '#22c55e';
                                overviewCtx.shadowColor = '#22c55e';
                                overviewCtx.shadowBlur = 6;
                                overviewCtx.fill();

                                // Ondas vocales de conversación humana
                                for (let wIdx = 0; wIdx < 3; wIdx++) {
                                    const wProg = ((waveTime * 3.2 + wIdx / 3 + op * 0.3) % 1);
                                    const wRadius = 6 + wProg * 18;
                                    const wAlpha = (1 - wProg) * 0.8;
                                    overviewCtx.beginPath();
                                    overviewCtx.arc(opX - 4, opY - 12 + headBob, wRadius, Math.PI * 0.8, Math.PI * 1.6);
                                    overviewCtx.strokeStyle = `rgba(34, 197, 94, ${wAlpha})`;
                                    overviewCtx.lineWidth = 1.8;
                                    overviewCtx.stroke();
                                }
                            }

                            // Bocadillo de diálogo parlante flotante
                            const bubbleY = my - 28 + Math.sin(waveTime * 4) * 2;
                            overviewCtx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                            overviewCtx.strokeStyle = '#22c55e';
                            overviewCtx.lineWidth = 1.2;
                            overviewCtx.roundRect(mx - 40, bubbleY - 8, 80, 16, 5);
                            overviewCtx.fill();
                            overviewCtx.stroke();

                            overviewCtx.fillStyle = '#34d399';
                            overviewCtx.font = 'bold 8.5px sans-serif';
                            overviewCtx.fillText('🗣️ Hablando...', mx - 28, bubbleY + 3);
                            overviewCtx.restore();
                        }"""
    content = content.replace(old_ov_callcenter, new_ov_callcenter, 1)

    # 6. Ensure playCurrentMachine and stopSynths trigger updateMachineAnimationLayers
    if "updateMachineAnimationLayers();\n        }\n\n        function playOverviewMultiSource" not in content:
        content = content.replace("createMachineSynth(currentMachine.synth, out, 1.0);\n        }", "createMachineSynth(currentMachine.synth, out, 1.0);\n            updateMachineAnimationLayers();\n        }", 1)

    if "updateMachineAnimationLayers();\n            if (isCalibrating) stopCal();" not in content:
        content = content.replace("if (isCalibrating) stopCal();", "updateMachineAnimationLayers();\n            if (isCalibrating) stopCal();", 1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print('Successfully applied kinetic animation upgrades to', file_path)
    print('New size:', len(content), 'bytes')

if __name__ == '__main__':
    main()
