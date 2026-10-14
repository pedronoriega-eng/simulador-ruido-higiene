/**
 * Motor Acústico Procedural - Web Audio API
 * Cumplimiento con IEC 61672-1:2013 (Curvas A, C, Balística FAST/SLOW)
 * Síntesis 100% matemática procedural de alta fidelidad audible
 */

import { FrequencyWeighting, TimeWeighting, AcousticMeasurement } from './types';

// Curva de Ponderación A según IEC 61672-1
export function getAWeighting(freq: number): number {
  if (freq < 10) return -70;
  const f2 = freq * freq;
  const c1 = 12194 * 12194;
  const c2 = 20.6 * 20.6;
  const c3 = 107.7 * 107.7;
  const c4 = 737.9 * 737.9;

  const num = c1 * f2 * f2;
  const den = (f2 + c2) * Math.sqrt((f2 + c3) * (f2 + c4)) * (f2 + c1);
  const ra = num / den;
  return 20 * Math.log10(ra) + 2.0; // +2.00 dB de normalización a 1000 Hz
}

// Curva de Ponderación C según IEC 61672-1
export function getCWeighting(freq: number): number {
  if (freq < 10) return -50;
  const f2 = freq * freq;
  const c1 = 12194 * 12194;
  const c2 = 20.6 * 20.6;

  const num = c1 * f2;
  const den = (f2 + c2) * (f2 + c1);
  const rc = num / den;
  return 20 * Math.log10(rc) + 0.06; // +0.06 dB de normalización a 1000 Hz
}

export class AcousticEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private distanceGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private calOsc: OscillatorNode | null = null;
  private calGain: GainNode | null = null;

  // Buffers compartidos
  private pinkBuffer: AudioBuffer | null = null;
  private whiteBuffer: AudioBuffer | null = null;

  // Nodos activos por máquina
  private activeNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();
  private timers: number[] = [];

  // Parámetros de calibración y medición
  private isCalibrating: boolean = false;
  private distance: number = 1.0; // metros (1.0 a 4.0)
  private userVolume: number = 0.85; // Volumen de audición (0.0 a 1.0)
  private isMuted: boolean = false;

  // Integración temporal
  private pFastPower: number = 1e-6;
  private pSlowPower: number = 1e-6;
  private lastUpdateTime: number = 0;
  private peakHoldValue: number = 40.0;
  private peakDecayRate: number = 2.5;

  // Leq acumulado
  private leqEnergySum: number = 0;
  private leqSampleCount: number = 0;
  private leqStartTime: number = 0;
  private isLeqRunning: boolean = false;

  private lmax: number = 40.0;
  private lmin: number = 140.0;
  private lpeak: number = 40.0;

  constructor() {}

  public async initAudio(): Promise<boolean> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return true;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Nodo Analizador
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.08;

    // Atenuación por distancia (Ley de inverso al cuadrado: -6 dB al duplicar distancia)
    this.distanceGain = this.ctx.createGain();
    this.distanceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Ganancia Master con volumen audible generoso
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.userVolume, this.ctx.currentTime);

    this.distanceGain.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Generar buffers de ruido procedural con amplitud rica
    this.generateNoiseBuffers();
    this.lastUpdateTime = performance.now();

    return true;
  }

  public isInitialized(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  public async resumeIfSuspended() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setDistance(dist: number) {
    this.distance = Math.max(1.0, Math.min(4.0, dist));
    if (this.distanceGain && this.ctx) {
      const factor = 1.0 / this.distance;
      this.distanceGain.gain.setTargetAtTime(factor, this.ctx.currentTime, 0.05);
    }
  }

  public getDistance(): number {
    return this.distance;
  }

  public setMasterVolume(vol: number) {
    this.userVolume = Math.max(0, Math.min(1.0, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.userVolume, this.ctx.currentTime, 0.03);
    }
  }

  public getMasterVolume(): number {
    return this.userVolume;
  }

  public setMasterMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.userVolume, this.ctx.currentTime, 0.03);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Generador matemático de Ruido Rosa (Filtro Paul Kellet) y Ruido Blanco
  private generateNoiseBuffers() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4;

    // Ruido Blanco audible
    this.whiteBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const whiteData = this.whiteBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      whiteData[i] = (Math.random() * 2 - 1) * 0.7;
    }

    // Ruido Rosa con algoritmo IIR de Paul Kellet (-3 dB/octava constante)
    this.pinkBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const pinkData = this.pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = (Math.random() * 2 - 1) * 0.7;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.35;
      b6 = white * 0.115926;
    }
  }

  // 1. Compresor de Tornillo Industrial (Ruido Continuo: 88-91 dBA)
  public startCompressor(id: string = 'compresor') {
    if (!this.ctx || !this.distanceGain || !this.pinkBuffer) return;
    this.resumeIfSuspended();
    this.stopSource(id);

    const sourceNode = this.ctx.createBufferSource();
    sourceNode.buffer = this.pinkBuffer;
    sourceNode.loop = true;

    // Filtro paso banda para compresión neumática y siseo
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Zumbido del motor eléctrico (120 Hz)
    const motorOsc = this.ctx.createOscillator();
    motorOsc.type = 'triangle';
    motorOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
    const motorGain = this.ctx.createGain();
    motorGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

    // Silbido de engranaje de tornillos rotativos (1480 Hz)
    const screwOsc = this.ctx.createOscillator();
    screwOsc.type = 'sine';
    screwOsc.frequency.setValueAtTime(1480, this.ctx.currentTime);
    const screwGain = this.ctx.createGain();
    screwGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(1.2, this.ctx.currentTime);

    sourceNode.connect(filter);
    filter.connect(gainNode);

    motorOsc.connect(motorGain);
    motorGain.connect(gainNode);

    screwOsc.connect(screwGain);
    screwGain.connect(gainNode);

    gainNode.connect(this.distanceGain);

    sourceNode.start();
    motorOsc.start();
    screwOsc.start();

    this.activeNodes.set(id, {
      gain: gainNode,
      stop: () => {
        try {
          sourceNode.stop();
          motorOsc.stop();
          screwOsc.stop();
          sourceNode.disconnect();
          motorOsc.disconnect();
          screwOsc.disconnect();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      }
    });
  }

  // 2. Turbina Centrífuga Industrial (Ruido Continuo: 92-95 dBA con fuerte zumbido aerodinámico)
  public startTurbine(id: string = 'turbina') {
    if (!this.ctx || !this.distanceGain || !this.pinkBuffer || !this.whiteBuffer) return;
    this.resumeIfSuspended();
    this.stopSource(id);

    // Flujo turbulento bajo y rugido
    const pinkSource = this.ctx.createBufferSource();
    pinkSource.buffer = this.pinkBuffer;
    pinkSource.loop = true;

    const lowPass = this.ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(500, this.ctx.currentTime);

    // Silbido aerodinámico de álabes (Blade Pass Frequency ~ 2850 Hz)
    const bladeOsc = this.ctx.createOscillator();
    bladeOsc.type = 'sine';
    bladeOsc.frequency.setValueAtTime(2850, this.ctx.currentTime);

    const bladeGain = this.ctx.createGain();
    bladeGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Aire a presión de alta frecuencia
    const whiteSource = this.ctx.createBufferSource();
    whiteSource.buffer = this.whiteBuffer;
    whiteSource.loop = true;

    const airFilter = this.ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.setValueAtTime(3200, this.ctx.currentTime);
    airFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(1.35, this.ctx.currentTime);

    pinkSource.connect(lowPass);
    lowPass.connect(gainNode);

    whiteSource.connect(airFilter);
    airFilter.connect(gainNode);

    bladeOsc.connect(bladeGain);
    bladeGain.connect(gainNode);

    gainNode.connect(this.distanceGain);

    pinkSource.start();
    whiteSource.start();
    bladeOsc.start();

    this.activeNodes.set(id, {
      gain: gainNode,
      stop: () => {
        try {
          pinkSource.stop();
          whiteSource.stop();
          bladeOsc.stop();
          pinkSource.disconnect();
          whiteSource.disconnect();
          bladeOsc.disconnect();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      }
    });
  }

  // 3. Sierra Circular de Madera (Ruido Intermitente: Vacío ~82 dBA, Corte ~97 dBA)
  public startCircularSaw(id: string = 'sierra') {
    if (!this.ctx || !this.distanceGain || !this.whiteBuffer) return;
    this.resumeIfSuspended();
    this.stopSource(id);

    // Motor de alta velocidad
    const motorOsc = this.ctx.createOscillator();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(2350, this.ctx.currentTime);

    const motorFilter = this.ctx.createBiquadFilter();
    motorFilter.type = 'bandpass';
    motorFilter.frequency.setValueAtTime(2350, this.ctx.currentTime);
    motorFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Fricción de corte en madera (ruido abrasivo áspero)
    const whiteSource = this.ctx.createBufferSource();
    whiteSource.buffer = this.whiteBuffer;
    whiteSource.loop = true;

    const woodFilter = this.ctx.createBiquadFilter();
    woodFilter.type = 'bandpass';
    woodFilter.frequency.setValueAtTime(3400, this.ctx.currentTime);
    woodFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const woodGain = this.ctx.createGain();
    woodGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.7, this.ctx.currentTime);

    motorOsc.connect(motorFilter);
    motorFilter.connect(gainNode);

    whiteSource.connect(woodFilter);
    woodFilter.connect(woodGain);
    woodGain.connect(gainNode);

    gainNode.connect(this.distanceGain);

    motorOsc.start();
    whiteSource.start();

    // Ciclo intermitente: 2.2 seg corte intenso, 1.8 seg vacío
    let cutting = false;
    const intervalId = window.setInterval(() => {
      if (!this.ctx) return;
      cutting = !cutting;
      const t = this.ctx.currentTime;
      if (cutting) {
        gainNode.gain.setTargetAtTime(1.65, t, 0.08); // corte ~97 dBA
        woodGain.gain.setTargetAtTime(1.2, t, 0.05);
        motorOsc.frequency.setTargetAtTime(2100, t, 0.1);
      } else {
        gainNode.gain.setTargetAtTime(0.65, t, 0.15); // vacío ~82 dBA
        woodGain.gain.setTargetAtTime(0.15, t, 0.1);
        motorOsc.frequency.setTargetAtTime(2350, t, 0.15);
      }
    }, 2200);

    this.timers.push(intervalId);

    this.activeNodes.set(id, {
      gain: gainNode,
      stop: () => {
        clearInterval(intervalId);
        try {
          motorOsc.stop();
          whiteSource.stop();
          motorOsc.disconnect();
          whiteSource.disconnect();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      }
    });
  }

  // 4. Pulidora Metalmecánica / Amoladora (Ruido Intermitente: 85 dBA vacío / 98-101 dBA esmerilado)
  public startGrinder(id: string = 'pulidora') {
    if (!this.ctx || !this.distanceGain || !this.whiteBuffer) return;
    this.resumeIfSuspended();
    this.stopSource(id);

    // Motor universal a 11,000 RPM (silbido penetrante a 5500 Hz)
    const motorOsc = this.ctx.createOscillator();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(5500, this.ctx.currentTime);

    const motorGain = this.ctx.createGain();
    motorGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    // Chisporroteo y desbaste metálico
    const whiteSource = this.ctx.createBufferSource();
    whiteSource.buffer = this.whiteBuffer;
    whiteSource.loop = true;

    const metalFilter = this.ctx.createBiquadFilter();
    metalFilter.type = 'highpass';
    metalFilter.frequency.setValueAtTime(3200, this.ctx.currentTime);

    const metalGain = this.ctx.createGain();
    metalGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.75, this.ctx.currentTime);

    motorOsc.connect(motorGain);
    motorGain.connect(gainNode);

    whiteSource.connect(metalFilter);
    metalFilter.connect(metalGain);
    metalGain.connect(gainNode);

    gainNode.connect(this.distanceGain);

    motorOsc.start();
    whiteSource.start();

    // Ciclo de desbaste metal: 3 seg amolando, 2 seg reposo
    let grinding = false;
    const intervalId = window.setInterval(() => {
      if (!this.ctx) return;
      grinding = !grinding;
      const t = this.ctx.currentTime;
      if (grinding) {
        gainNode.gain.setTargetAtTime(1.7, t, 0.05); // ~99 dBA
        metalGain.gain.setTargetAtTime(1.3, t, 0.03);
        motorOsc.frequency.setTargetAtTime(4900, t, 0.08);
      } else {
        gainNode.gain.setTargetAtTime(0.65, t, 0.1); // ~85 dBA
        metalGain.gain.setTargetAtTime(0.18, t, 0.1);
        motorOsc.frequency.setTargetAtTime(5500, t, 0.1);
      }
    }, 2600);

    this.timers.push(intervalId);

    this.activeNodes.set(id, {
      gain: gainNode,
      stop: () => {
        clearInterval(intervalId);
        try {
          motorOsc.stop();
          whiteSource.stop();
          motorOsc.disconnect();
          whiteSource.disconnect();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      }
    });
  }

  // 5. Prensa Troqueladora Excéntrica (Ruido de Impacto: Picos > 132 dBC Peak en < 1 seg)
  public startStampingPress(id: string = 'troqueladora') {
    if (!this.ctx || !this.distanceGain || !this.pinkBuffer) return;
    this.resumeIfSuspended();
    this.stopSource(id);

    // Volante de inercia continuo de fondo (graves continuos ~78 dBA)
    const flywheelSource = this.ctx.createBufferSource();
    flywheelSource.buffer = this.pinkBuffer;
    flywheelSource.loop = true;

    const flywheelFilter = this.ctx.createBiquadFilter();
    flywheelFilter.type = 'lowpass';
    flywheelFilter.frequency.setValueAtTime(180, this.ctx.currentTime);

    const flywheelGain = this.ctx.createGain();
    flywheelGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    flywheelSource.connect(flywheelFilter);
    flywheelFilter.connect(flywheelGain);
    flywheelGain.connect(this.distanceGain);
    flywheelSource.start();

    // Disparador de impacto repetitivo (cada 1.6 segundos un golpe seco)
    const strikeMasterGain = this.ctx.createGain();
    strikeMasterGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
    strikeMasterGain.connect(this.distanceGain);

    const triggerImpact = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Sub-bass slam mecánico (45 Hz a 90 Hz decaimiento rápido)
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(90, t);
      subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.14);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.001, t);
      subGain.gain.linearRampToValueAtTime(4.5, t + 0.004); // Ataque ultrarrápido 4 ms
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      subOsc.connect(subGain);
      subGain.connect(strikeMasterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.25);

      // 2. Clang metálico de choque de matrices
      const clangOsc = this.ctx.createOscillator();
      clangOsc.type = 'square';
      clangOsc.frequency.setValueAtTime(950, t);
      clangOsc.frequency.exponentialRampToValueAtTime(480, t + 0.12);

      const clangFilter = this.ctx.createBiquadFilter();
      clangFilter.type = 'bandpass';
      clangFilter.frequency.setValueAtTime(1900, t);
      clangFilter.Q.setValueAtTime(5.0, t);

      const clangGain = this.ctx.createGain();
      clangGain.gain.setValueAtTime(0.001, t);
      clangGain.gain.linearRampToValueAtTime(3.2, t + 0.003);
      clangGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      clangOsc.connect(clangFilter);
      clangFilter.connect(clangGain);
      clangGain.connect(strikeMasterGain);
      clangOsc.start(t);
      clangOsc.stop(t + 0.32);
    };

    triggerImpact();
    const intervalId = window.setInterval(triggerImpact, 1600);
    this.timers.push(intervalId);

    this.activeNodes.set(id, {
      gain: strikeMasterGain,
      stop: () => {
        clearInterval(intervalId);
        try {
          flywheelSource.stop();
          flywheelSource.disconnect();
          strikeMasterGain.disconnect();
        } catch {
          // ignore
        }
      }
    });
  }

  // 6. Martinete Neumático / Rompedor de Pavimento (Impacto Rápido / Impulsivo)
  public startPneumaticHammer(id: string = 'martinete') {
    if (!this.ctx || !this.distanceGain || !this.whiteBuffer) return;
    this.resumeIfSuspended();
    this.stopSource(id);

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(1.4, this.ctx.currentTime);
    masterGain.connect(this.distanceGain);

    // Disparador de impactos neumáticos a alta cadencia (5.5 Hz)
    const triggerBlow = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Pincelazo de aire a escape
      if (this.whiteBuffer) {
        const airSource = this.ctx.createBufferSource();
        airSource.buffer = this.whiteBuffer;
        const airFilter = this.ctx.createBiquadFilter();
        airFilter.type = 'bandpass';
        airFilter.frequency.setValueAtTime(1800, t);
        airFilter.Q.setValueAtTime(1.2, t);

        const airGain = this.ctx.createGain();
        airGain.gain.setValueAtTime(0.001, t);
        airGain.gain.linearRampToValueAtTime(1.8, t + 0.003);
        airGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        airSource.connect(airFilter);
        airFilter.connect(airGain);
        airGain.connect(masterGain);
        airSource.start(t);
        airSource.stop(t + 0.09);
      }

      // Golpe de cincel contra roca/concreto
      const strikeOsc = this.ctx.createOscillator();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(340, t);
      strikeOsc.frequency.exponentialRampToValueAtTime(90, t + 0.05);

      const strikeGain = this.ctx.createGain();
      strikeGain.gain.setValueAtTime(0.001, t);
      strikeGain.gain.linearRampToValueAtTime(3.4, t + 0.002);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(masterGain);
      strikeOsc.start(t);
      strikeOsc.stop(t + 0.1);
    };

    triggerBlow();
    const intervalId = window.setInterval(triggerBlow, 180);
    this.timers.push(intervalId);

    this.activeNodes.set(id, {
      gain: masterGain,
      stop: () => {
        clearInterval(intervalId);
        try {
          masterGain.disconnect();
        } catch {
          // ignore
        }
      }
    });
  }

  // 7. Calibrador Acústico Pistófono (Tono puro 1000 Hz a exactamente 94.0 dB SPL)
  public startCalibrator() {
    if (!this.ctx || !this.distanceGain) return;
    this.resumeIfSuspended();
    this.stopAllSources();
    this.isCalibrating = true;

    this.calOsc = this.ctx.createOscillator();
    this.calOsc.type = 'sine';
    this.calOsc.frequency.setValueAtTime(1000, this.ctx.currentTime);

    this.calGain = this.ctx.createGain();
    this.calGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

    this.calOsc.connect(this.calGain);
    this.calGain.connect(this.distanceGain);
    this.calOsc.start();
  }

  public stopCalibrator() {
    this.isCalibrating = false;
    if (this.calOsc) {
      try {
        this.calOsc.stop();
        this.calOsc.disconnect();
      } catch {
        // ignore
      }
      this.calOsc = null;
    }
    if (this.calGain) {
      this.calGain.disconnect();
      this.calGain = null;
    }
  }

  public stopSource(id: string) {
    const node = this.activeNodes.get(id);
    if (node) {
      node.stop();
      this.activeNodes.delete(id);
    }
  }

  public stopAllSources() {
    this.activeNodes.forEach(node => node.stop());
    this.activeNodes.clear();
    this.timers.forEach(t => clearInterval(t));
    this.timers = [];
    if (this.isCalibrating) {
      this.stopCalibrator();
    }
  }

  public resetMeasurement() {
    this.leqEnergySum = 0;
    this.leqSampleCount = 0;
    this.leqStartTime = performance.now();
    this.lmax = 40.0;
    this.lmin = 140.0;
    this.lpeak = 40.0;
    this.pFastPower = 1e-6;
    this.pSlowPower = 1e-6;
  }

  public setLeqRunning(running: boolean) {
    this.isLeqRunning = running;
    if (running && this.leqSampleCount === 0) {
      this.leqStartTime = performance.now();
    }
  }

  public getIsLeqRunning(): boolean {
    return this.isLeqRunning;
  }

  public getAcousticMeasurement(
    freqWeighting: FrequencyWeighting,
    timeWeighting: TimeWeighting
  ): AcousticMeasurement {
    const defaultMeasure: AcousticMeasurement = {
      instantSPL: 40.0,
      splA: 40.0,
      splC: 40.0,
      leq: 40.0,
      lmax: this.lmax,
      lmin: this.lmin,
      lpeak: this.lpeak,
      runTimeSeconds: 0,
      isCalibrating: this.isCalibrating
    };

    if (!this.analyser || !this.ctx) return defaultMeasure;

    const now = performance.now();
    const dt = Math.max(0.005, (now - this.lastUpdateTime) / 1000);
    this.lastUpdateTime = now;

    if (this.isCalibrating) {
      const calSPL = 94.0;
      this.lmax = Math.max(this.lmax, calSPL);
      this.lmin = Math.min(this.lmin, calSPL);
      this.lpeak = Math.max(this.lpeak, calSPL + 3.01);
      return {
        instantSPL: calSPL,
        splA: calSPL,
        splC: calSPL,
        leq: calSPL,
        lmax: this.lmax,
        lmin: this.lmin,
        lpeak: this.lpeak,
        runTimeSeconds: this.isLeqRunning ? (now - this.leqStartTime) / 1000 : 0,
        isCalibrating: true
      };
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const freqData = new Float32Array(bufferLength);
    this.analyser.getFloatFrequencyData(freqData);

    const timeData = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(timeData);

    const sampleRate = this.ctx.sampleRate;
    const binSize = sampleRate / this.analyser.fftSize;

    let maxAbsTime = 0;
    for (let i = 0; i < timeData.length; i++) {
      const val = Math.abs(timeData[i]);
      if (val > maxAbsTime) maxAbsTime = val;
    }

    let powerSumA = 0;
    let powerSumC = 0;
    let powerSumZ = 0;

    const minBin = Math.max(1, Math.floor(20 / binSize));
    const maxBin = Math.min(bufferLength, Math.floor(20000 / binSize));

    for (let i = minBin; i < maxBin; i++) {
      const db = freqData[i];
      if (db > -120) {
        const linearPower = Math.pow(10, db / 10);
        const freq = i * binSize;

        const weightA = getAWeighting(freq);
        const weightC = getCWeighting(freq);

        powerSumA += linearPower * Math.pow(10, weightA / 10);
        powerSumC += linearPower * Math.pow(10, weightC / 10);
        powerSumZ += linearPower;
      }
    }

    const noiseFloor = 38.5;
    const rawDbA = powerSumA > 1e-12 ? 10 * Math.log10(powerSumA) + 118 : noiseFloor;
    const rawDbC = powerSumC > 1e-12 ? 10 * Math.log10(powerSumC) + 118 : noiseFloor;
    const rawDbZ = powerSumZ > 1e-12 ? 10 * Math.log10(powerSumZ) + 118 : noiseFloor;

    const currentRawSPL = freqWeighting === 'A' ? rawDbA : freqWeighting === 'C' ? rawDbC : rawDbZ;

    const rawPeakDb = maxAbsTime > 1e-5 ? 20 * Math.log10(maxAbsTime) + 128 : noiseFloor;
    this.peakHoldValue = Math.max(rawPeakDb, this.peakHoldValue - this.peakDecayRate * dt);
    this.lpeak = Math.max(this.lpeak, rawPeakDb);

    const tauFast = 0.125;
    const tauSlow = 1.000;

    const alphaFast = 1 - Math.exp(-dt / tauFast);
    const alphaSlow = 1 - Math.exp(-dt / tauSlow);

    const instPower = Math.pow(10, currentRawSPL / 10);
    this.pFastPower = (1 - alphaFast) * this.pFastPower + alphaFast * instPower;
    this.pSlowPower = (1 - alphaSlow) * this.pSlowPower + alphaSlow * instPower;

    const splFast = 10 * Math.log10(Math.max(1e-4, this.pFastPower));
    const splSlow = 10 * Math.log10(Math.max(1e-4, this.pSlowPower));

    let displaySPL = splFast;
    if (timeWeighting === 'SLOW') {
      displaySPL = splSlow;
    } else if (timeWeighting === 'PEAK') {
      displaySPL = this.peakHoldValue;
    }

    displaySPL = Math.max(35.0, Math.min(145.0, displaySPL));

    if (this.isLeqRunning) {
      this.leqEnergySum += Math.pow(10, displaySPL / 10);
      this.leqSampleCount++;
      this.lmax = Math.max(this.lmax, displaySPL);
      this.lmin = Math.min(this.lmin, displaySPL);
    }

    const currentLeq = this.leqSampleCount > 0
      ? 10 * Math.log10(this.leqEnergySum / this.leqSampleCount)
      : displaySPL;

    const elapsedSeconds = this.isLeqRunning && this.leqStartTime > 0
      ? (now - this.leqStartTime) / 1000
      : 0;

    return {
      instantSPL: displaySPL,
      splA: rawDbA,
      splC: rawDbC,
      leq: currentLeq,
      lmax: this.lmax,
      lmin: this.lmin === 140.0 ? displaySPL : this.lmin,
      lpeak: this.lpeak,
      runTimeSeconds: elapsedSeconds,
      isCalibrating: false
    };
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const acousticEngine = new AcousticEngine();
