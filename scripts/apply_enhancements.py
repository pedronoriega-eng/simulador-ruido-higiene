import re
import sys

def main():
    file_path = 'simulador_higiene_ruido_multisectorial.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS for worker-epp-badge and laser animation
    css_target = "/* Colores de Instrumento y Normativos */"
    css_insert = """        .worker-epp-badge {
            position: absolute;
            bottom: 14px;
            left: 14px;
            background: rgba(15, 23, 42, 0.88);
            color: #ffffff;
            border: 1.5px solid var(--ceto-orange);
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            backdrop-filter: blur(6px);
            z-index: 10;
        }
        @keyframes laserBlink {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.35; transform: scale(0.85); }
        }
"""
    if '.worker-epp-badge' not in content:
        content = content.replace(css_target, css_insert + "\n        " + css_target, 1)

    # 2. Add laser distance tag in sonometer LCD
    lcd_target = '<span class="pill-range" id="lcdRangeTag">AUTO: 30-130 dB</span>'
    lcd_replacement = '<span class="pill-range" id="lcdRangeTag">AUTO: 30-130 dB</span>\n                            <span id="lcdLaserDistTag" style="color:#ef4444; font-weight:800; font-size:0.62rem; display:inline-flex; align-items:center; gap:4px; background:rgba(239,68,68,0.12); padding:2px 6px; border-radius:4px; border:1px solid rgba(239,68,68,0.4);"><span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:#ef4444; box-shadow:0 0 6px #ef4444; animation:laserBlink 1.2s infinite;"></span> LÁSER: 1.0 m</span>'
    if 'id="lcdLaserDistTag"' not in content:
        content = content.replace(lcd_target, lcd_replacement, 1)

    # 3. Add call_center hotspots to MACHINE_HOTSPOTS
    hotspots_target = "const MACHINE_HOTSPOTS = {"
    hotspots_insert = """const MACHINE_HOTSPOTS = {
            'call_center': [
                { name: 'Puesto de Teleoperadora (Voz Humana en Conversación)', spl: 65, band: '300-3400 Hz (Formantes F1/F2)', desc: 'Locución activa con clientes vía diadema profesional.', x: 42, y: 38 },
                { name: 'Diadema Telefónica / Headset con Micrófono', spl: 62, band: 'Binaural ITU-T', desc: 'Emisión acústica de auricular y retorno vocal sidetone.', x: 74, y: 36 },
                { name: 'Digitación Rápida en Teclado y Mouse', spl: 58, band: '2200-4500 Hz', desc: 'Ingreso continuo de datos y CRM en computadora.', x: 44, y: 78 },
                { name: 'Murmullo Colectivo de Operadores de Sala', spl: 63, band: 'Efecto Babble', desc: 'Múltiples agentes atendiendo llamadas simultáneamente.', x: 86, y: 28 }
            ],"""
    if "'call_center': [" not in content:
        content = content.replace(hotspots_target, hotspots_insert, 1)

    # 4. Synthesizers code to insert before createDefaultSynth
    synths_code = """        // =========================================================================
        // SINTETIZADORES PROCEDURALES WEB AUDIO ADICIONALES (SECTORES C, D, E Y OFICINAS)
        // =========================================================================

        // 1. OFICINAS / CALL CENTER: VOCES REALES DE TELEOPERADORES, CENTRALITA PBX Y TECLEO
        function createCallCenterSynth(outNode, t, gainMult = 1.0) {
            // VOZ 1: Teleoperadora femenina en primer plano atendiendo llamada
            const v1Osc = audioCtx.createOscillator();
            v1Osc.type = 'sawtooth';
            v1Osc.frequency.setValueAtTime(215, t);

            // Inflexiones y entonación prosódica del habla
            const v1Lfo = audioCtx.createOscillator();
            v1Lfo.frequency.setValueAtTime(0.85, t);
            const v1LfoGain = audioCtx.createGain();
            v1LfoGain.gain.setValueAtTime(14, t);
            v1Lfo.connect(v1LfoGain);
            v1LfoGain.connect(v1Osc.frequency);
            v1Lfo.start(t);
            activeSynths.push(v1Lfo);

            // Formantes vocales F1 y F2 (tracto vocal humano)
            const v1F1 = audioCtx.createBiquadFilter();
            v1F1.type = 'bandpass';
            v1F1.frequency.setValueAtTime(560, t);
            v1F1.Q.setValueAtTime(4.0, t);

            const v1F2 = audioCtx.createBiquadFilter();
            v1F2.type = 'bandpass';
            v1F2.frequency.setValueAtTime(1950, t);
            v1F2.Q.setValueAtTime(4.5, t);

            const v1Gain = audioCtx.createGain();
            v1Gain.gain.setValueAtTime(0.25 * gainMult, t);

            v1Osc.connect(v1F1);
            v1Osc.connect(v1F2);
            v1F1.connect(v1Gain);
            v1F2.connect(v1Gain);
            v1Gain.connect(outNode);
            v1Osc.start(t);
            activeSynths.push(v1Osc);

            // VOZ 2: Teleoperador masculino en cubículo contiguo
            const v2Osc = audioCtx.createOscillator();
            v2Osc.type = 'triangle';
            v2Osc.frequency.setValueAtTime(130, t);

            const v2Lfo = audioCtx.createOscillator();
            v2Lfo.frequency.setValueAtTime(1.15, t);
            const v2LfoGain = audioCtx.createGain();
            v2LfoGain.gain.setValueAtTime(8, t);
            v2Lfo.connect(v2LfoGain);
            v2LfoGain.connect(v2Osc.frequency);
            v2Lfo.start(t);
            activeSynths.push(v2Lfo);

            const v2F1 = audioCtx.createBiquadFilter();
            v2F1.type = 'bandpass';
            v2F1.frequency.setValueAtTime(440, t);
            v2F1.Q.setValueAtTime(3.5, t);

            const v2F2 = audioCtx.createBiquadFilter();
            v2F2.type = 'bandpass';
            v2F2.frequency.setValueAtTime(1420, t);
            v2F2.Q.setValueAtTime(3.8, t);

            const v2Gain = audioCtx.createGain();
            v2Gain.gain.setValueAtTime(0.20 * gainMult, t);

            v2Osc.connect(v2F1);
            v2Osc.connect(v2F2);
            v2F1.connect(v2Gain);
            v2F2.connect(v2Gain);
            v2Gain.connect(outNode);
            v2Osc.start(t);
            activeSynths.push(v2Osc);

            // MURMULLO MULTILOCUTOR DE SALA (Crowd Babble)
            const babbleSrc = audioCtx.createBufferSource();
            babbleSrc.buffer = pinkBuffer;
            babbleSrc.loop = true;
            const phoneFilter = audioCtx.createBiquadFilter();
            phoneFilter.type = 'bandpass';
            phoneFilter.frequency.setValueAtTime(1250, t);
            phoneFilter.Q.setValueAtTime(0.85, t);
            const babbleGain = audioCtx.createGain();
            babbleGain.gain.setValueAtTime(0.22 * gainMult, t);
            babbleSrc.connect(phoneFilter);
            phoneFilter.connect(babbleGain);
            babbleGain.connect(outNode);
            babbleSrc.start(t);
            activeSynths.push(babbleSrc);

            // ARTICULACIÓN SILÁBICA DINÁMICA (Genera palabras, pausas y fonemas continuos)
            const speechTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const v1Speaking = Math.random() > 0.16;
                v1Gain.gain.setTargetAtTime(v1Speaking ? (0.22 + Math.random() * 0.18) * gainMult : 0.02 * gainMult, now, 0.06);
                v1F1.frequency.setTargetAtTime(420 + Math.random() * 380, now, 0.07);

                const v2Speaking = Math.random() > 0.22;
                v2Gain.gain.setTargetAtTime(v2Speaking ? (0.16 + Math.random() * 0.16) * gainMult : 0.01 * gainMult, now + 0.03, 0.08);

                babbleGain.gain.setTargetAtTime((0.18 + Math.random() * 0.12) * gainMult, now, 0.12);
            }, 175);
            synthIntervals.push(speechTimer);

            // TECLEO CONTINUO DE COMPUTADORA CRM
            const typingTimer = setInterval(() => {
                if (!audioCtx) return;
                if (Math.random() > 0.28) {
                    const now = audioCtx.currentTime;
                    const keyOsc = audioCtx.createOscillator();
                    keyOsc.type = 'triangle';
                    keyOsc.frequency.setValueAtTime(2800 + Math.random() * 700, now);
                    const keyGain = audioCtx.createGain();
                    keyGain.gain.setValueAtTime(0.001, now);
                    keyGain.gain.linearRampToValueAtTime(0.08 * gainMult, now + 0.002);
                    keyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);
                    keyOsc.connect(keyGain);
                    keyGain.connect(outNode);
                    keyOsc.start(now);
                    keyOsc.stop(now + 0.028);
                }
            }, 90);
            synthIntervals.push(typingTimer);

            // TIMBRE TELEFÓNICO DE CENTRALITA PBX (Dual tone 440+480 Hz periódico)
            const pbxTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const t1 = audioCtx.createOscillator();
                t1.type = 'sine'; t1.frequency.setValueAtTime(440, now);
                const t2 = audioCtx.createOscillator();
                t2.type = 'sine'; t2.frequency.setValueAtTime(480, now);
                const g = audioCtx.createGain();
                g.gain.setValueAtTime(0.001, now);
                g.gain.linearRampToValueAtTime(0.05 * gainMult, now + 0.04);
                g.gain.setValueAtTime(0.05 * gainMult, now + 1.0);
                g.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
                t1.connect(g); t2.connect(g); g.connect(outNode);
                t1.start(now); t1.stop(now + 1.2);
                t2.start(now); t2.stop(now + 1.2);
            }, 7200);
            synthIntervals.push(pbxTimer);
        }

        // 2. KARTING INDOOR: MOTOR 4T 270cc MONOCILÍNDRICO + DERRAPES
        function createKartSynth(outNode, t, gainMult = 1.0) {
            const engineOsc = audioCtx.createOscillator();
            engineOsc.type = 'sawtooth';
            engineOsc.frequency.setValueAtTime(95, t);
            const engineFilter = audioCtx.createBiquadFilter();
            engineFilter.type = 'lowpass';
            engineFilter.frequency.setValueAtTime(900, t);
            const engineGain = audioCtx.createGain();
            engineGain.gain.setValueAtTime(0.35 * gainMult, t);
            engineOsc.connect(engineFilter);
            engineFilter.connect(engineGain);
            engineGain.connect(outNode);
            engineOsc.start(t);
            activeSynths.push(engineOsc);

            const kartTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const rpmFreq = 80 + Math.random() * 110;
                engineOsc.frequency.setTargetAtTime(rpmFreq, now, 0.15);
                engineGain.gain.setTargetAtTime((0.28 + (rpmFreq / 190) * 0.22) * gainMult, now, 0.12);

                if (Math.random() > 0.65) {
                    const sSrc = audioCtx.createBufferSource();
                    sSrc.buffer = whiteBuffer;
                    const sFilter = audioCtx.createBiquadFilter();
                    sFilter.type = 'bandpass';
                    sFilter.frequency.setValueAtTime(2900, now);
                    sFilter.Q.setValueAtTime(3.5, now);
                    const sGain = audioCtx.createGain();
                    sGain.gain.setValueAtTime(0.001, now);
                    sGain.gain.linearRampToValueAtTime(0.25 * gainMult, now + 0.05);
                    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    sSrc.connect(sFilter); sFilter.connect(sGain); sGain.connect(outNode);
                    sSrc.start(now); sSrc.stop(now + 0.4);
                }
            }, 1200);
            synthIntervals.push(kartTimer);
        }

        // 3. DISCOTECA / SUBWOOFERS: KICK 128 BPM + SUBGRAVES + HI-HATS
        function createClubSynth(outNode, t, gainMult = 1.0) {
            const beatTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const kick = audioCtx.createOscillator();
                kick.type = 'sine';
                kick.frequency.setValueAtTime(135, now);
                kick.frequency.exponentialRampToValueAtTime(42, now + 0.09);
                const kickGain = audioCtx.createGain();
                kickGain.gain.setValueAtTime(1.1 * gainMult, now);
                kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
                kick.connect(kickGain); kickGain.connect(outNode);
                kick.start(now); kick.stop(now + 0.42);

                const hhSrc = audioCtx.createBufferSource();
                hhSrc.buffer = whiteBuffer;
                const hhFilt = audioCtx.createBiquadFilter();
                hhFilt.type = 'highpass'; hhFilt.frequency.setValueAtTime(8000, now + 0.23);
                const hhGain = audioCtx.createGain();
                hhGain.gain.setValueAtTime(0.001, now + 0.23);
                hhGain.gain.linearRampToValueAtTime(0.18 * gainMult, now + 0.235);
                hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                hhSrc.connect(hhFilt); hhFilt.connect(hhGain); hhGain.connect(outNode);
                hhSrc.start(now + 0.23); hhSrc.stop(now + 0.35);
            }, 468);
            synthIntervals.push(beatTimer);

            const sub = audioCtx.createOscillator();
            sub.type = 'sine'; sub.frequency.setValueAtTime(55, t);
            const subGain = audioCtx.createGain(); subGain.gain.setValueAtTime(0.35 * gainMult, t);
            sub.connect(subGain); subGain.connect(outNode);
            sub.start(t);
            activeSynths.push(sub);
        }

        // 4. RESTAURANTE / EFECTO LOMBARD: MURMULLO COMENSALES + CUBIERTOS
        function createLombardSynth(outNode, t, gainMult = 1.0) {
            const pSrc = audioCtx.createBufferSource();
            pSrc.buffer = pinkBuffer; pSrc.loop = true;
            const lp = audioCtx.createBiquadFilter();
            lp.type = 'bandpass'; lp.frequency.setValueAtTime(650, t); lp.Q.setValueAtTime(1.4, t);
            const lg = audioCtx.createGain(); lg.gain.setValueAtTime(0.38 * gainMult, t);
            pSrc.connect(lp); lp.connect(lg); lg.connect(outNode);
            pSrc.start(t);
            activeSynths.push(pSrc);

            const clinkTimer = setInterval(() => {
                if (!audioCtx) return;
                if (Math.random() > 0.4) {
                    const now = audioCtx.currentTime;
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(3200 + Math.random() * 2200, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.001, now);
                    g.gain.linearRampToValueAtTime(0.12 * gainMult, now + 0.003);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.connect(g); g.connect(outNode);
                    osc.start(now); osc.stop(now + 0.09);
                }
            }, 320);
            synthIntervals.push(clinkTimer);
        }

        // 5. CAMPANA EXTRACTORA Y LAVAVAJILLAS COMERCIAL
        function createHoodSynth(outNode, t, gainMult = 1.0) {
            const pSrc = audioCtx.createBufferSource();
            pSrc.buffer = pinkBuffer; pSrc.loop = true;
            const bp = audioCtx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.setValueAtTime(480, t); bp.Q.setValueAtTime(1.2, t);
            const pg = audioCtx.createGain(); pg.gain.setValueAtTime(0.42 * gainMult, t);
            pSrc.connect(bp); bp.connect(pg); pg.connect(outNode);
            pSrc.start(t);
            activeSynths.push(pSrc);

            const wSrc = audioCtx.createBufferSource();
            wSrc.buffer = whiteBuffer; wSrc.loop = true;
            const hp = audioCtx.createBiquadFilter();
            hp.type = 'highpass'; hp.frequency.setValueAtTime(2600, t);
            const wg = audioCtx.createGain(); wg.gain.setValueAtTime(0.22 * gainMult, t);
            wSrc.connect(hp); hp.connect(wg); wg.connect(outNode);
            wSrc.start(t);
            activeSynths.push(wSrc);
        }

        // 6. BOLERA / BOWLING: RODAMIENTO DE BOLA + IMPACTO DE BOLOS
        function createBowlingSynth(outNode, t, gainMult = 1.0) {
            const rollOsc = audioCtx.createOscillator();
            rollOsc.type = 'triangle'; rollOsc.frequency.setValueAtTime(140, t);
            const rollFilter = audioCtx.createBiquadFilter();
            rollFilter.type = 'lowpass'; rollFilter.frequency.setValueAtTime(240, t);
            const rollGain = audioCtx.createGain(); rollGain.gain.setValueAtTime(0.25 * gainMult, t);
            rollOsc.connect(rollFilter); rollFilter.connect(rollGain); rollGain.connect(outNode);
            rollOsc.start(t);
            activeSynths.push(rollOsc);

            const strikeTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const strikeOsc = audioCtx.createOscillator();
                strikeOsc.type = 'triangle'; strikeOsc.frequency.setValueAtTime(520, now);
                strikeOsc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
                const strikeGain = audioCtx.createGain();
                strikeGain.gain.setValueAtTime(0.001, now);
                strikeGain.gain.linearRampToValueAtTime(1.3 * gainMult, now + 0.005);
                strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                strikeOsc.connect(strikeGain); strikeGain.connect(outNode);
                strikeOsc.start(now); strikeOsc.stop(now + 0.3);

                const pSrc = audioCtx.createBufferSource();
                pSrc.buffer = whiteBuffer;
                const bp = audioCtx.createBiquadFilter();
                bp.type = 'bandpass'; bp.frequency.setValueAtTime(1600, now);
                const pg = audioCtx.createGain();
                pg.gain.setValueAtTime(0.6 * gainMult, now);
                pg.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                pSrc.connect(bp); bp.connect(pg); pg.connect(outNode);
                pSrc.start(now); pSrc.stop(now + 0.28);
            }, 3200);
            synthIntervals.push(strikeTimer);
        }

        // 7. VOLADURA EN BANCO CON ANFO (MINERÍA DETONACIÓN EXPANSIVA)
        function createBlastSynth(outNode, t, gainMult = 1.0) {
            const triggerBlast = () => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const subOsc = audioCtx.createOscillator();
                subOsc.type = 'sine'; subOsc.frequency.setValueAtTime(45, now);
                subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.45);
                const subGain = audioCtx.createGain();
                subGain.gain.setValueAtTime(0.001, now);
                subGain.gain.linearRampToValueAtTime(2.6 * gainMult, now + 0.008);
                subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
                subOsc.connect(subGain); subGain.connect(outNode);
                subOsc.start(now); subOsc.stop(now + 0.75);

                const bSrc = audioCtx.createBufferSource();
                bSrc.buffer = pinkBuffer;
                const lp = audioCtx.createBiquadFilter();
                lp.type = 'lowpass'; lp.frequency.setValueAtTime(350, now);
                const bg = audioCtx.createGain();
                bg.gain.setValueAtTime(2.2 * gainMult, now);
                bg.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
                bSrc.connect(lp); lp.connect(bg); bg.connect(outNode);
                bSrc.start(now); bSrc.stop(now + 0.9);
            };
            triggerBlast();
            const blastTimer = setInterval(triggerBlast, 3800);
            synthIntervals.push(blastTimer);
        }

        // 8. JUMBO ELECTROHIDRÁULICO DE PERFORACIÓN DE ROCA (50 Hz + BOMBA HIDRÁULICA)
        function createJumboSynth(outNode, t, gainMult = 1.0) {
            const pumpOsc = audioCtx.createOscillator();
            pumpOsc.type = 'sine'; pumpOsc.frequency.setValueAtTime(2800, t);
            const pumpGain = audioCtx.createGain(); pumpGain.gain.setValueAtTime(0.18 * gainMult, t);
            pumpOsc.connect(pumpGain); pumpGain.connect(outNode);
            pumpOsc.start(t);
            activeSynths.push(pumpOsc);

            const drillTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                osc.type = 'triangle'; osc.frequency.setValueAtTime(1450, now);
                osc.frequency.exponentialRampToValueAtTime(320, now + 0.014);
                const g = audioCtx.createGain();
                g.gain.setValueAtTime(0.001, now);
                g.gain.linearRampToValueAtTime(1.8 * gainMult, now + 0.002);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
                osc.connect(g); g.connect(outNode);
                osc.start(now); osc.stop(now + 0.02);
            }, 20);
            synthIntervals.push(drillTimer);
        }

        // 9. TRITURADORA PRIMARIA DE MANDÍBULAS (CHANCADORA)
        function createCrusherSynth(outNode, t, gainMult = 1.0) {
            const pSrc = audioCtx.createBufferSource();
            pSrc.buffer = pinkBuffer; pSrc.loop = true;
            const bp = audioCtx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.setValueAtTime(380, t); bp.Q.setValueAtTime(1.2, t);
            const pg = audioCtx.createGain(); pg.gain.setValueAtTime(0.35 * gainMult, t);
            pSrc.connect(bp); bp.connect(pg); pg.connect(outNode);
            pSrc.start(t);
            activeSynths.push(pSrc);

            const crushTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const rockOsc = audioCtx.createOscillator();
                rockOsc.type = 'sawtooth'; rockOsc.frequency.setValueAtTime(95, now);
                const rockGain = audioCtx.createGain();
                rockGain.gain.setValueAtTime(0.001, now);
                rockGain.gain.linearRampToValueAtTime(1.4 * gainMult, now + 0.02);
                rockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                rockOsc.connect(rockGain); rockGain.connect(outNode);
                rockOsc.start(now); rockOsc.stop(now + 0.25);
            }, 260);
            synthIntervals.push(crushTimer);
        }

        // 10. ZARANDA / CRIBA VIBRATORIA MULTIMALLA (16 Hz)
        function createScreenSynth(outNode, t, gainMult = 1.0) {
            const vOsc = audioCtx.createOscillator();
            vOsc.type = 'triangle'; vOsc.frequency.setValueAtTime(16, t);
            const vGain = audioCtx.createGain(); vGain.gain.setValueAtTime(0.28 * gainMult, t);
            vOsc.connect(vGain); vGain.connect(outNode);
            vOsc.start(t);
            activeSynths.push(vOsc);

            const pSrc = audioCtx.createBufferSource();
            pSrc.buffer = whiteBuffer; pSrc.loop = true;
            const bp = audioCtx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.setValueAtTime(2400, t); bp.Q.setValueAtTime(1.8, t);
            const pg = audioCtx.createGain(); pg.gain.setValueAtTime(0.38 * gainMult, t);
            pSrc.connect(bp); bp.connect(pg); pg.connect(outNode);
            pSrc.start(t);
            activeSynths.push(pSrc);
        }

        // 11. DUMPER MINERO 300 TONELADAS (MOTOR V16 DIÉSEL + TURBO)
        function createTruckSynth(outNode, t, gainMult = 1.0) {
            const d1 = audioCtx.createOscillator();
            d1.type = 'sawtooth'; d1.frequency.setValueAtTime(65, t);
            const f1 = audioCtx.createBiquadFilter();
            f1.type = 'lowpass'; f1.frequency.setValueAtTime(450, t);
            const g1 = audioCtx.createGain(); g1.gain.setValueAtTime(0.45 * gainMult, t);
            d1.connect(f1); f1.connect(g1); g1.connect(outNode);
            d1.start(t);
            activeSynths.push(d1);

            const turbo = audioCtx.createOscillator();
            turbo.type = 'sine'; turbo.frequency.setValueAtTime(2200, t);
            const tg = audioCtx.createGain(); tg.gain.setValueAtTime(0.18 * gainMult, t);
            turbo.connect(tg); tg.connect(outNode);
            turbo.start(t);
            activeSynths.push(turbo);
        }

        // 12. DATA CENTER: SERVIDORES BLADE (14,000 RPM) Y CRAC
        function createDataCenterSynth(outNode, t, gainMult = 1.0) {
            const pSrc = audioCtx.createBufferSource();
            pSrc.buffer = whiteBuffer; pSrc.loop = true;
            const bp = audioCtx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.setValueAtTime(2200, t); bp.Q.setValueAtTime(1.8, t);
            const pg = audioCtx.createGain(); pg.gain.setValueAtTime(0.42 * gainMult, t);
            pSrc.connect(bp); bp.connect(pg); pg.connect(outNode);
            pSrc.start(t);
            activeSynths.push(pSrc);

            const hum = audioCtx.createOscillator();
            hum.type = 'sine'; hum.frequency.setValueAtTime(120, t);
            const hg = audioCtx.createGain(); hg.gain.setValueAtTime(0.15 * gainMult, t);
            hum.connect(hg); hg.connect(outNode);
            hum.start(t);
            activeSynths.push(hum);
        }

        // 13. PLOTTER INDUSTRIAL DE PLANOS
        function createPlotterSynth(outNode, t, gainMult = 1.0) {
            const stepper = audioCtx.createOscillator();
            stepper.type = 'triangle'; stepper.frequency.setValueAtTime(520, t);
            const sg = audioCtx.createGain(); sg.gain.setValueAtTime(0.25 * gainMult, t);
            stepper.connect(sg); sg.connect(outNode);
            stepper.start(t);
            activeSynths.push(stepper);

            const stepTimer = setInterval(() => {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const freq = 420 + Math.random() * 380;
                stepper.frequency.setTargetAtTime(freq, now, 0.08);
            }, 650);
            synthIntervals.push(stepTimer);
        }

        // 14. CAFETERÍA CORPORATIVA: MOLINILLO + VAPOR DE ESPRESSO
        function createCoffeeSynth(outNode, t, gainMult = 1.0) {
            const pump = audioCtx.createOscillator();
            pump.type = 'sawtooth'; pump.frequency.setValueAtTime(50, t);
            const pg = audioCtx.createGain(); pg.gain.setValueAtTime(0.16 * gainMult, t);
            pump.connect(pg); pg.connect(outNode);
            pump.start(t);
            activeSynths.push(pump);

            const steamSrc = audioCtx.createBufferSource();
            steamSrc.buffer = whiteBuffer; steamSrc.loop = true;
            const sFilt = audioCtx.createBiquadFilter();
            sFilt.type = 'bandpass'; sFilt.frequency.setValueAtTime(3200, t);
            const sg = audioCtx.createGain(); sg.gain.setValueAtTime(0.28 * gainMult, t);
            steamSrc.connect(sFilt); sFilt.connect(sg); sg.connect(outNode);
            steamSrc.start(t);
            activeSynths.push(steamSrc);
        }

        // 15. DESPACHO: TRÁFICO PESADO DE AVENIDA
        function createTrafficSynth(outNode, t, gainMult = 1.0) {
            const pSrc = audioCtx.createBufferSource();
            pSrc.buffer = pinkBuffer; pSrc.loop = true;
            const lp = audioCtx.createBiquadFilter();
            lp.type = 'lowpass'; lp.frequency.setValueAtTime(320, t);
            const lg = audioCtx.createGain(); lg.gain.setValueAtTime(0.48 * gainMult, t);
            pSrc.connect(lp); lp.connect(lg); lg.connect(outNode);
            pSrc.start(t);
            activeSynths.push(pSrc);
        }
"""
    if 'function createCallCenterSynth' not in content:
        content = content.replace("function createDefaultSynth(outNode, t, gainMult = 1.0) {", synths_code + "\n        function createDefaultSynth(outNode, t, gainMult = 1.0) {", 1)

    # 5. Expand createMachineSynth to handle all synths
    old_machine_synth = """        function createMachineSynth(synthType, destGain, gainMult = 1.0) {
            const t = audioCtx.currentTime;
            if (synthType === 'saw') createSawSynth(destGain, t, gainMult);
            else if (synthType === 'hammer') createHammerSynth(destGain, t, gainMult);
            else if (synthType === 'mixer') createMixerSynth(destGain, t, gainMult);
            else if (synthType === 'diesel') createDieselSynth(destGain, t, gainMult);
            else if (synthType === 'roller') createRollerSynth(destGain, t, gainMult);
            else if (synthType === 'compressor') createCompressorSynth(destGain, t, gainMult);
            else if (synthType === 'grinder') createGrinderSynth(destGain, t, gainMult);
            else if (synthType === 'punch') createPunchSynth(destGain, t, gainMult);
            else if (synthType === 'forging') createForgingSynth(destGain, t, gainMult);
            else if (synthType === 'blower') createBlowerSynth(destGain, t, gainMult);
            else createDefaultSynth(destGain, t, gainMult);
        }"""

    new_machine_synth = """        function createMachineSynth(synthType, destGain, gainMult = 1.0) {
            const t = audioCtx.currentTime;
            if (synthType === 'saw') createSawSynth(destGain, t, gainMult);
            else if (synthType === 'hammer') createHammerSynth(destGain, t, gainMult);
            else if (synthType === 'mixer') createMixerSynth(destGain, t, gainMult);
            else if (synthType === 'diesel') createDieselSynth(destGain, t, gainMult);
            else if (synthType === 'roller') createRollerSynth(destGain, t, gainMult);
            else if (synthType === 'compressor') createCompressorSynth(destGain, t, gainMult);
            else if (synthType === 'grinder') createGrinderSynth(destGain, t, gainMult);
            else if (synthType === 'punch') createPunchSynth(destGain, t, gainMult);
            else if (synthType === 'forging') createForgingSynth(destGain, t, gainMult);
            else if (synthType === 'blower') createBlowerSynth(destGain, t, gainMult);
            else if (synthType === 'callcenter') createCallCenterSynth(destGain, t, gainMult);
            else if (synthType === 'kart') createKartSynth(destGain, t, gainMult);
            else if (synthType === 'club') createClubSynth(destGain, t, gainMult);
            else if (synthType === 'lombard') createLombardSynth(destGain, t, gainMult);
            else if (synthType === 'hood') createHoodSynth(destGain, t, gainMult);
            else if (synthType === 'bowling') createBowlingSynth(destGain, t, gainMult);
            else if (synthType === 'blast') createBlastSynth(destGain, t, gainMult);
            else if (synthType === 'jumbo') createJumboSynth(destGain, t, gainMult);
            else if (synthType === 'crusher') createCrusherSynth(destGain, t, gainMult);
            else if (synthType === 'screen') createScreenSynth(destGain, t, gainMult);
            else if (synthType === 'truck') createTruckSynth(destGain, t, gainMult);
            else if (synthType === 'datacenter') createDataCenterSynth(destGain, t, gainMult);
            else if (synthType === 'plotter') createPlotterSynth(destGain, t, gainMult);
            else if (synthType === 'coffee') createCoffeeSynth(destGain, t, gainMult);
            else if (synthType === 'traffic') createTrafficSynth(destGain, t, gainMult);
            else createDefaultSynth(destGain, t, gainMult);
        }"""
    content = content.replace(old_machine_synth, new_machine_synth, 1)

    # 6. Update renderMachineIllustration with worker presence and EPP tags
    old_render_photo = """            if (currentMachine.photo) {
                container.innerHTML = `
                    <div class="machine-photo-wrapper">
                        <img src="${currentMachine.photo}" alt="${currentMachine.name}" class="machine-real-photo" onerror="this.style.display='none';">
                        <div class="photo-ambient-vignette"></div>
                        <div class="photo-badge-overlay">📷 REGISTRO INDUSTRIAL REAL · ${currentMachine.photoTag || 'ALTA DEFINICIÓN'}</div>
                    </div>
                `;
                renderHotspotBeacons();
                return;
            }"""

    new_render_photo = """            if (currentMachine.photo) {
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
    content = content.replace(old_render_photo, new_render_photo, 1)

    # 7. Add laser beam function and call in updateAndDrawParticles
    laser_func_code = """        // =========================================================================
        // GUÍA LÁSER TELEMÉTRICA DEL SONÓMETRO HACIA LA FUENTE (ISO 9612)
        // =========================================================================
        function drawSonometerLaserBeam(ctx, w, h, time) {
            if (!isPowered || !currentMachine) return;
            const spots = MACHINE_HOTSPOTS[currentMachine.id];
            let targetX = w * 0.52;
            let targetY = h * 0.56;
            if (spots && spots.length > 0) {
                targetX = (spots[0].x / 100) * w;
                targetY = (spots[0].y / 100) * h;
            }
            const sonoX = w * 0.92;
            const sonoY = h * 0.88;

            ctx.save();
            // Resplandor difuso del láser
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(sonoX, sonoY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();

            // Haz colimado interior de alta precisión con impulsos
            ctx.strokeStyle = 'rgba(255, 120, 120, 0.9)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([7, 3]);
            ctx.lineDashOffset = -(time * 22) % 10;
            ctx.beginPath();
            ctx.moveTo(sonoX, sonoY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Punto láser en el foco receptor (Laser Dot)
            ctx.beginPath();
            ctx.arc(targetX, targetY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12;
            ctx.fill();

            const pulseR = 5 + Math.sin(time * 10) * 2;
            ctx.beginPath();
            ctx.arc(targetX, targetY, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Emisor en el sonómetro
            ctx.beginPath();
            ctx.arc(sonoX, sonoY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
            ctx.fill();

            // Etiqueta flotante telemétrica sutil
            const lblX = sonoX * 0.62 + targetX * 0.38;
            const lblY = sonoY * 0.62 + targetY * 0.38 - 14;
            const lblText = `🔴 TELEMETRÍA LÁSER SONÓMETRO · d = ${distanceMeters.toFixed(1)} m`;
            ctx.font = 'bold 9.5px monospace';
            const tW = ctx.measureText(lblText).width;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
            ctx.lineWidth = 1;
            ctx.roundRect(lblX - tW/2 - 8, lblY - 8, tW + 16, 17, 5);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillText(lblText, lblX - tW/2, lblY + 4);
            ctx.restore();
        }
"""
    if 'function drawSonometerLaserBeam' not in content:
        # Insert before updateAndDrawParticles
        content = content.replace("function updateAndDrawParticles(dt) {", laser_func_code + "\n        function updateAndDrawParticles(dt) {", 1)

    # In updateAndDrawParticles, call drawSonometerLaserBeam
    particles_call_target = "fxCtx.stroke();\n                }\n            }\n        }\n\n        // ==========================================\n        // 9. BUCLE ACÚSTICO"
    particles_call_replace = "fxCtx.stroke();\n                }\n            }\n\n            // Guía láser telemétrica sutil del sonómetro hacia la fuente activa\n            drawSonometerLaserBeam(fxCtx, w, h, fxTime);\n        }\n\n        // ==========================================\n        // 9. BUCLE ACÚSTICO"
    if 'drawSonometerLaserBeam(fxCtx' not in content:
        content = content.replace(particles_call_target, particles_call_replace, 1)

    # 8. In drawOverviewScene, add laser beams from mini sonometer to active machines
    overview_laser_target = "if (showAcousticWaves && !isMuted) {"
    overview_laser_insert = """if (showAcousticWaves && !isMuted) {
                // Guía láser telemétrica sutil del mini sonómetro hacia cada fuente de ruido activa
                sec.machines.forEach(m => {
                    if (activeOverviewSources.has(m.id)) {
                        const mx = (m.coords.x / 100) * w;
                        const my = (m.coords.y / 100) * h;
                        const sonoX = (sonometerPos.xPct / 100) * w;
                        const sonoY = (sonometerPos.yPct / 100) * h;

                        const dim = sec.dimensions || { width: 45.0, depth: 32.0 };
                        const dxM = Math.abs(sonometerPos.xPct - m.coords.x) / 100 * dim.width;
                        const dyM = Math.abs(sonometerPos.yPct - m.coords.y) / 100 * dim.depth;
                        const distM = Math.max(0.5, Math.hypot(dxM, dyM));

                        overviewCtx.save();
                        // Resplandor difuso del haz láser
                        overviewCtx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
                        overviewCtx.lineWidth = 3;
                        overviewCtx.shadowColor = '#ef4444';
                        overviewCtx.shadowBlur = 8;
                        overviewCtx.beginPath();
                        overviewCtx.moveTo(sonoX, sonoY);
                        overviewCtx.lineTo(mx, my);
                        overviewCtx.stroke();

                        // Haz central colimado pulsante
                        overviewCtx.strokeStyle = 'rgba(255, 120, 120, 0.85)';
                        overviewCtx.lineWidth = 1.2;
                        overviewCtx.setLineDash([6, 3]);
                        overviewCtx.lineDashOffset = -(waveTime * 20) % 9;
                        overviewCtx.beginPath();
                        overviewCtx.moveTo(sonoX, sonoY);
                        overviewCtx.lineTo(mx, my);
                        overviewCtx.stroke();
                        overviewCtx.setLineDash([]);

                        // Punto láser receptor brillante en la máquina
                        overviewCtx.beginPath();
                        overviewCtx.arc(mx, my, 3.5, 0, Math.PI * 2);
                        overviewCtx.fillStyle = '#ffffff';
                        overviewCtx.shadowColor = '#ef4444';
                        overviewCtx.shadowBlur = 10;
                        overviewCtx.fill();

                        // Etiqueta sutil de distancia sobre el haz láser
                        const midX = (sonoX + mx) / 2;
                        const midY = (sonoY + my) / 2 - 8;
                        const distText = `🔴 ${distM.toFixed(1)} m`;
                        overviewCtx.font = 'bold 9px monospace';
                        const txtW = overviewCtx.measureText(distText).width;
                        overviewCtx.fillStyle = 'rgba(15, 23, 42, 0.82)';
                        overviewCtx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
                        overviewCtx.lineWidth = 0.8;
                        overviewCtx.roundRect(midX - txtW/2 - 5, midY - 7, txtW + 10, 14, 4);
                        overviewCtx.fill();
                        overviewCtx.stroke();
                        overviewCtx.fillStyle = '#ffffff';
                        overviewCtx.fillText(distText, midX - txtW/2, midY + 4);
                        overviewCtx.restore();
                    }
                });
"""
    if '// Guía láser telemétrica sutil del mini sonómetro hacia cada fuente de ruido activa' not in content:
        content = content.replace(overview_laser_target, overview_laser_insert, 1)

    # 9. Update distSlider listener to update lcdLaserDistTag
    dist_listener_target = "document.getElementById('attLabel').textContent = `(-${att.toFixed(1)} dB)`;"
    dist_listener_insert = """document.getElementById('attLabel').textContent = `(-${att.toFixed(1)} dB)`;
            const laserTag = document.getElementById('lcdLaserDistTag');
            if (laserTag) {
                laserTag.innerHTML = `<span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:#ef4444; box-shadow:0 0 6px #ef4444; animation:laserBlink 1.2s infinite;"></span> LÁSER: ${distanceMeters.toFixed(1)} m`;
            }"""
    if 'laserTag.innerHTML =' not in content:
        content = content.replace(dist_listener_target, dist_listener_insert, 1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print('Successfully applied enhancements to', file_path)
    print('New file size:', len(content), 'bytes')

if __name__ == '__main__':
    main()
