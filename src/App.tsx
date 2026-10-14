/**
 * Simulador de Higiene Industrial - Sonometría y Análisis de Ruido Acústico
 * Conforme a IEC 61672-1:2013, ISO 9612:2009, Res. 1792 de 1990 (Colombia) y ACGIH
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  SoundSource,
  FrequencyWeighting,
  TimeWeighting,
  AcousticMeasurement
} from './types';
import { acousticEngine } from './audioEngine';
import { SonometerInstrument } from './components/SonometerInstrument';
import { MachineSelector } from './components/MachineSelector';
import { AcousticCanvas } from './components/AcousticCanvas';
import { HygieneAssessment } from './components/HygieneAssessment';
import { LabPracticesModal } from './components/LabPracticesModal';
import { MachineAnimator } from './components/MachineAnimator';
import {
  Volume2,
  VolumeX,
  BookOpen,
  Download,
  Info,
  ShieldCheck,
  Activity,
  Layers,
  FileCode
} from 'lucide-react';

const INITIAL_SOURCES: SoundSource[] = [
  {
    id: 'compresor',
    name: 'Compresor de Tornillo',
    category: 'continuo',
    baseSPL: 89,
    description: 'Generación neumática constante. Zumbido motor 120 Hz, acople 1480 Hz y siseo continuo.',
    spectralPeak: '1150 Hz / 1480 Hz',
    active: false,
    noiseGenerators: [
      {
        id: 'comp-f1',
        name: 'Bloque Compresor Helicoidal (Air-End)',
        type: 'Fricción y Cizallamiento Neumático',
        relativeX: 40,
        relativeY: 60,
        splContribution: 88,
        freqRange: '1150 - 1500 Hz',
        mechanism: 'Choque dinámico y compresión de aire a alta presión entre los lóbulos de los tornillos helicoidales macho y hembra.'
      },
      {
        id: 'comp-f2',
        name: 'Chimenea Silenciadora de Admisión',
        type: 'Aerodinámico / Flujo Turbulento',
        relativeX: 37,
        relativeY: 26,
        splContribution: 85,
        freqRange: '800 - 2500 Hz',
        mechanism: 'Ruido aerodinámico de succión de aire a alta velocidad a través de la torre con silenciador de chapa microperforada.'
      },
      {
        id: 'comp-f3',
        name: 'Motor Eléctrico Trifásico Aletado',
        type: 'Electromecánico y Ventilador',
        relativeX: 68,
        relativeY: 57,
        splContribution: 82,
        freqRange: '120 - 450 Hz',
        mechanism: 'Fuerzas electromagnéticas en el estator del motor a 60 Hz y vórtices del álabe del ventilador de enfriamiento posterior.'
      },
      {
        id: 'comp-f4',
        name: 'Campana y Acoplamiento Elástico',
        type: 'Resonancia Mecánica Torsional',
        relativeX: 52,
        relativeY: 61,
        splContribution: 80,
        freqRange: '60 - 300 Hz',
        mechanism: 'Resonancia mecánica de rotación a 3000-3600 RPM y transmisión de torque a través del elastómero de acople.'
      },
      {
        id: 'comp-f5',
        name: 'Tanque Separador Aire/Aceite',
        type: 'Fluido Dinámico Bifásico',
        relativeX: 21,
        relativeY: 58,
        splContribution: 79,
        freqRange: '400 - 1200 Hz',
        mechanism: 'Turbulencia por choque del flujo bifásico aire-aceite a 8-11 bar y descompresión en la válvula de presión mínima.'
      }
    ]
  },
  {
    id: 'turbina',
    name: 'Turbina Centrífuga Industrial',
    category: 'continuo',
    baseSPL: 93,
    description: 'Ventilador industrial de tiro inducido. Gran voluta gris con boca de descarga rectangular y rodete con álabes curvos.',
    spectralPeak: '2850 Hz (Blade Pass)',
    active: false,
    noiseGenerators: [
      {
        id: 'turb-f1',
        name: 'Rodete Centrífugo y Paso de Álabes (BPF)',
        type: 'Interacción aerodinámica periódica',
        relativeX: 43,
        relativeY: 53,
        splContribution: 92,
        freqRange: '2800 - 3200 Hz',
        mechanism: 'Paso continuo de los álabes centrífugos girando a alta velocidad cortando la lengüeta de la carcasa (Blade Pass Frequency).'
      },
      {
        id: 'turb-f2',
        name: 'Boca de Descarga Rectangular y Difusor',
        type: 'Turbulencia de gas y choque de vórtices',
        relativeX: 68,
        relativeY: 28,
        splContribution: 87,
        freqRange: '800 - 2000 Hz',
        mechanism: 'Desprendimiento de capa límite y turbulencia de alta velocidad en la tobera de descarga rectangular abierta.'
      },
      {
        id: 'turb-f3',
        name: 'Eje Macizo de Acero y Chumacera de Cojinetes',
        type: 'Vibración estructural y fricción mecánica',
        relativeX: 23,
        relativeY: 62,
        splContribution: 79,
        freqRange: '60 - 250 Hz',
        mechanism: 'Fuerzas desbalanceadas dinámicas soportadas por la chumacera de cojinete de apoyo frontal y soporte diagonal.'
      },
      {
        id: 'turb-f4',
        name: 'Brida de Aspiración Frontal y Carcasa',
        type: 'Resonancia de chapa y succión',
        relativeX: 40,
        relativeY: 38,
        splContribution: 84,
        freqRange: '400 - 1500 Hz',
        mechanism: 'Vórtices de succión en la brida circular frontal y radiación acústica de las paredes de chapa de acero gris.'
      }
    ]
  },
  {
    id: 'sierra',
    name: 'Sierra Circular de Madera',
    category: 'intermitente',
    baseSPL: 97,
    description: 'Ciclos alternados: reposo en vacío (~82 dBA) y avance de corte abrasivo (~97 dBA).',
    spectralPeak: '2350 Hz / 3400 Hz',
    active: false,
    noiseGenerators: [
      {
        id: 'saw-f1',
        name: 'Fricción Diente-Madera en Corte',
        type: 'Impacto y desgarro abrasivo',
        relativeX: 52,
        relativeY: 52,
        splContribution: 96,
        freqRange: '3000 - 4500 Hz',
        mechanism: 'Micro-impactos repetitivos a 4000 impactos/segundo de las puntas de carburo de tungsteno arrancando virutas de madera.'
      },
      {
        id: 'saw-f2',
        name: 'Resonancia y Flexión del Disco',
        type: 'Vibración aeroacústica de placa',
        relativeX: 55,
        relativeY: 38,
        splContribution: 88,
        freqRange: '2200 - 2600 Hz',
        mechanism: 'Modos propios de vibración flexional de la chapa de acero del disco excitados por el flujo de aire y esfuerzos laterales.'
      },
      {
        id: 'saw-f3',
        name: 'Motor Eléctrico y Transmisión',
        type: 'Mecánico rotativo continuo',
        relativeX: 52,
        relativeY: 76,
        splContribution: 80,
        freqRange: '120 - 1800 Hz',
        mechanism: 'Zumbido del motor de inducción y fricción de correas trapezoidales de transmisión de potencia.'
      }
    ]
  },
  {
    id: 'pulidora',
    name: 'Pulidora Metalmecánica (Bosch Professional)',
    category: 'intermitente',
    baseSPL: 99,
    description: 'Esmeril angular Bosch Professional amarillo y negro a 11,000 RPM, cabezal de aluminio y disco de corte de metal.',
    spectralPeak: '3800 Hz / 5600 Hz',
    active: false,
    noiseGenerators: [
      {
        id: 'grind-f1',
        name: 'Desbaste Abrasivo y Contacto con Acero',
        type: 'Fricción abrasiva y choque de virutas',
        relativeX: 25,
        relativeY: 78,
        splContribution: 98,
        freqRange: '3200 - 4500 Hz',
        mechanism: 'Granos de óxido de aluminio del disco Bosch cortando acero a 80 m/s con torrente de chispas balísticas incandescentes.'
      },
      {
        id: 'grind-f2',
        name: 'Cabezal de Engranajes Cónicos Plateado',
        type: 'Contacto mecánico de dientes cónicos',
        relativeX: 38,
        relativeY: 52,
        splContribution: 88,
        freqRange: '1800 - 2500 Hz',
        mechanism: 'Contacto y choque de piñón y corona reductora helicoidal dentro de la carcasa de fundición de aluminio plateado.'
      },
      {
        id: 'grind-f3',
        name: 'Motor Universal Bosch 11,000 RPM',
        type: 'Conmutador de escobillas y ventilador',
        relativeX: 62,
        relativeY: 38,
        splContribution: 91,
        freqRange: '5000 - 7000 Hz',
        mechanism: 'Conmutación de escobillas de carbón en el inducido y turbina centrífuga de refrigeración en el cuerpo amarillo ergonómico.'
      },
      {
        id: 'grind-f4',
        name: 'Mango Antivibratorio con Anillo Rojo',
        type: 'Transmisión de vibración mecánica',
        relativeX: 52,
        relativeY: 68,
        splContribution: 80,
        freqRange: '100 - 1000 Hz',
        mechanism: 'Vibraciones transmitidas a través de la empuñadura auxiliar Vibration Control con collarín rojo.'
      }
    ]
  },
  {
    id: 'troqueladora',
    name: 'Prensa Troqueladora Excéntrica (EP-500)',
    category: 'impacto',
    baseSPL: 134,
    description: 'Prensa excéntrica Precision Metalworks EP-500 con gran volante amarillo, reja de seguridad y golpe de troquelado >132 dBC Peak.',
    spectralPeak: 'Sub-bass 50 Hz + 1850 Hz',
    active: false,
    noiseGenerators: [
      {
        id: 'press-f1',
        name: 'Zona de Impacto, Matriz y Corte de Chapa',
        type: 'Colisión mecánica no estacionaria (Peak)',
        relativeX: 45,
        relativeY: 62,
        splContribution: 133,
        freqRange: '40 Hz - 8000 Hz (Transitorio)',
        mechanism: 'Liberación violenta de energía elástica al cizallar la chapa metálica en menos de 4 milisegundos (Peak > 132 dBC).'
      },
      {
        id: 'press-f2',
        name: 'Enorme Volante de Inercia Amarillo y Embrague',
        type: 'Mecánico rotativo / Inercial',
        relativeX: 58,
        relativeY: 26,
        splContribution: 85,
        freqRange: '60 - 500 Hz',
        mechanism: 'Desacople brusco del embrague neumático y masa giratoria del gran volante amarillo con ranuras de aligeramiento.'
      },
      {
        id: 'press-f3',
        name: 'Biela Excéntrica y Guías de Corredera',
        type: 'Choque cinemático excéntrico',
        relativeX: 47,
        relativeY: 24,
        splContribution: 88,
        freqRange: '200 - 1000 Hz',
        mechanism: 'Fuerzas de inversión de movimiento en el punto muerto inferior de la corredera vertical guiada.'
      },
      {
        id: 'press-f4',
        name: 'Reja de Seguridad Amarilla y Bastidor C',
        type: 'Resonancia estructural y ondas de choque',
        relativeX: 34,
        relativeY: 56,
        splContribution: 87,
        freqRange: '250 - 1200 Hz',
        mechanism: 'Vibración transversal de las toneladas de fundición del bastidor estructural gris y malla de la reja protectora.'
      },
      {
        id: 'press-f5',
        name: 'Mesa de Alimentación de Chapa y Rodillos',
        type: 'Fricción de deslizamiento y avance',
        relativeX: 74,
        relativeY: 68,
        splContribution: 82,
        freqRange: '500 - 2500 Hz',
        mechanism: 'Avance de la bobina o tira de chapa metálica deslizándose sobre los rodillos de alimentación a la matriz.'
      }
    ]
  },
  {
    id: 'martinete',
    name: 'Martinete de Forja Neumático',
    category: 'impacto',
    baseSPL: 104,
    description: 'Martinete de forja industrial pesado golpeando barra de acero al rojo vivo a 1100°C con maza de acero y escape neumático.',
    spectralPeak: '320 Hz + Banda Ancha',
    active: false,
    noiseGenerators: [
      {
        id: 'jack-f1',
        name: 'Impacto de Maza sobre Barra Incandescente (1100°C)',
        type: 'Impacto percusivo de alta energía',
        relativeX: 52,
        relativeY: 72,
        splContribution: 104,
        freqRange: '200 - 6000 Hz',
        mechanism: 'Impacto seco y violento de la maza de forja de acero macizo contra la barra de acero al rojo vivo sobre el yunque.'
      },
      {
        id: 'jack-f2',
        name: 'Válvula de Distribución y Tuberías Neumáticas',
        type: 'Escape neumático transitorio expansivo',
        relativeX: 36,
        relativeY: 28,
        splContribution: 99,
        freqRange: '1500 - 4000 Hz',
        mechanism: 'Descarga a alta presión de aire comprimido a través de válvulas, manómetros de latón y mangueras azul/naranja.'
      },
      {
        id: 'jack-f3',
        name: 'Cilindro de Forja y Maza Maciza de Acero',
        type: 'Resonador cilíndrico metálico',
        relativeX: 52,
        relativeY: 46,
        splContribution: 92,
        freqRange: '300 - 1200 Hz',
        mechanism: 'Oscilación de compresión en el cilindro superior y fricción de las guías de la maza de acero templado.'
      },
      {
        id: 'jack-f4',
        name: 'Yunque de Forja Masivo y Tenazas',
        type: 'Onda de choque estructural en cimentación',
        relativeX: 52,
        relativeY: 84,
        splContribution: 95,
        freqRange: '40 - 500 Hz',
        mechanism: 'Ondas mecánicas propagadas a través del bloque macizo del yunque de forja hacia la losa de taller.'
      }
    ]
  }
];

export default function App() {
  const [isPowered, setIsPowered] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [freqWeighting, setFreqWeighting] = useState<FrequencyWeighting>('A');
  const [timeWeighting, setTimeWeighting] = useState<TimeWeighting>('FAST');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isLeqRunning, setIsLeqRunning] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(1.0);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('compresor');
  const [displayMode, setDisplayMode] = useState<'ambas' | 'maquina' | 'graficas'>('ambas');
  const [isLabModalOpen, setIsLabModalOpen] = useState<boolean>(false);

  // Estado de medición acústica en vivo
  const [measurement, setMeasurement] = useState<AcousticMeasurement>({
    instantSPL: 42.1,
    splA: 42.1,
    splC: 45.3,
    leq: 42.1,
    lmax: 42.1,
    lmin: 42.1,
    lpeak: 46.2,
    runTimeSeconds: 0,
    isCalibrating: false
  });

  const measurementIntervalRef = useRef<number | null>(null);

  // Inicializar o activar motor de audio
  const ensureAudioRunning = async () => {
    await acousticEngine.initAudio();
  };

  // Manejo de Encendido / Apagado del Sonómetro
  const handleTogglePower = async () => {
    if (!isPowered) {
      await ensureAudioRunning();
      setIsPowered(true);
    } else {
      setIsPowered(false);
      handleStopAll();
    }
  };

  // Alternar Ponderación Frecuencial A / C
  const handleToggleFreqWeighting = () => {
    setFreqWeighting(prev => (prev === 'A' ? 'C' : 'A'));
  };

  const handleSetFreqWeighting = (w: FrequencyWeighting) => {
    setFreqWeighting(w);
  };

  // Alternar Ponderación Temporal FAST / SLOW
  const handleToggleTimeWeighting = () => {
    setTimeWeighting(prev => (prev === 'FAST' ? 'SLOW' : 'FAST'));
  };

  const handleSetTimeWeighting = (t: TimeWeighting) => {
    setTimeWeighting(t);
  };

  // Modo PEAK
  const handleTogglePeak = () => {
    setTimeWeighting(prev => (prev === 'PEAK' ? 'FAST' : 'PEAK'));
  };

  // Calibrador Acústico a 94.0 dB / 1000 Hz
  const handleToggleCalibrator = async () => {
    await ensureAudioRunning();
    if (isCalibrating) {
      acousticEngine.stopCalibrator();
      setIsCalibrating(false);
    } else {
      setActiveSourceId(null);
      acousticEngine.startCalibrator();
      setIsCalibrating(true);
    }
  };

  // Iniciar / Pausar Leq acumulado
  const handleToggleLeq = () => {
    const nextState = !isLeqRunning;
    setIsLeqRunning(nextState);
    acousticEngine.setLeqRunning(nextState);
  };

  // Reiniciar Mediciones
  const handleReset = () => {
    acousticEngine.resetMeasurement();
    setMeasurement(prev => ({
      ...prev,
      leq: prev.instantSPL,
      lmax: prev.instantSPL,
      lmin: prev.instantSPL,
      lpeak: prev.instantSPL,
      runTimeSeconds: 0
    }));
  };

  // Cambio de Distancia (1.0m a 4.0m)
  const handleChangeDistance = (d: number) => {
    setDistance(d);
    acousticEngine.setDistance(d);
  };

  // Selección de Maquinaria
  const handleSelectSource = async (sourceId: string) => {
    setSelectedMachineId(sourceId);
    await ensureAudioRunning();
    if (isCalibrating) {
      acousticEngine.stopCalibrator();
      setIsCalibrating(false);
    }

    if (activeSourceId === sourceId) {
      // Apagar la fuente activa
      acousticEngine.stopSource(sourceId);
      setActiveSourceId(null);
      return;
    }

    // Encender la fuente seleccionada
    setActiveSourceId(sourceId);
    switch (sourceId) {
      case 'compresor':
        acousticEngine.startCompressor();
        break;
      case 'turbina':
        acousticEngine.startTurbine();
        break;
      case 'sierra':
        acousticEngine.startCircularSaw();
        break;
      case 'pulidora':
        acousticEngine.startGrinder();
        break;
      case 'troqueladora':
        acousticEngine.startStampingPress();
        break;
      case 'martinete':
        acousticEngine.startPneumaticHammer();
        break;
      default:
        break;
    }
  };

  // Detener todo
  const handleStopAll = () => {
    acousticEngine.stopAllSources();
    setActiveSourceId(null);
    setIsCalibrating(false);
  };

  // Silenciar Audio para comodidad del usuario
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    acousticEngine.setMasterMute(nextMute);
  };

  // Configurar práctica de laboratorio automáticamente
  const handleAutoConfigurePractice = (sourceId: string) => {
    if (!isPowered) setIsPowered(true);
    handleSelectSource(sourceId);
    if (!isLeqRunning) {
      setIsLeqRunning(true);
      acousticEngine.setLeqRunning(true);
    }
  };

  // Bucle de muestreo acústico periódico (25 veces por segundo para estabilidad del display)
  useEffect(() => {
    measurementIntervalRef.current = window.setInterval(() => {
      if (isPowered) {
        const m = acousticEngine.getAcousticMeasurement(freqWeighting, timeWeighting);
        setMeasurement(m);
      }
    }, 40);

    return () => {
      if (measurementIntervalRef.current) {
        clearInterval(measurementIntervalRef.current);
      }
    };
  }, [isPowered, freqWeighting, timeWeighting]);

  // Descarga directa del archivo monolítico simulador_sonometro_higiene.html
  const handleDownloadStandalone = () => {
    // Descarga desde la URL estática generada en el servidor o creación de blob
    const link = document.createElement('a');
    link.href = '/simulador_sonometro_higiene.html';
    link.download = 'simulador_sonometro_higiene.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0e1217] text-slate-100 flex flex-col font-sans selection:bg-[#ea580c] selection:text-white">
      {/* Barra de Navegación Industrial - Chasis de Metrología SolidWorks */}
      <header className="border-b border-slate-700/80 cad-industrial-steel backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3 cad-bevel-panel-subtle">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zona 1: Título / Identidad */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl cad-orange-btn flex items-center justify-center font-black shadow-md text-slate-950">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-100 leading-none font-mono">
                SIMULADOR DE HIGIENE ACÚSTICA & SONOMETRÍA
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                <span>IEC 61672-1 CLASE 1</span>
                <span>·</span>
                <span>ISO 9612:2009</span>
                <span>·</span>
                <span className="text-[#f97316] font-semibold">RES. 1792 DE 1990</span>
              </div>
            </div>
          </div>

          {/* Zona 2: Acciones Rápidas con Botones Biselados Mecanizados */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Silenciar / Desilenciar */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl cad-bevel-btn text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isMuted
                  ? 'bg-gradient-to-b from-rose-950 to-rose-900 border-rose-800 text-rose-300'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Activar Sonido' : 'Silenciar Audio (Medición continúa activa)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#f97316]" />}
              <span className="hidden sm:inline font-mono">{isMuted ? 'Silenciado' : 'Audio ON'}</span>
            </button>

            {/* Guía de Laboratorio */}
            <button
              onClick={() => setIsLabModalOpen(true)}
              className="px-3 py-2 rounded-xl cad-bevel-btn text-[#f97316] hover:text-[#fb923c] text-xs font-semibold flex items-center gap-1.5 transition-all font-mono"
            >
              <BookOpen className="w-4 h-4 text-[#f97316]" />
              <span>3 Prácticas Lab</span>
            </button>

            {/* Descargar Archivo Monolítico Autónomo */}
            <button
              onClick={handleDownloadStandalone}
              className="px-3.5 py-2 rounded-xl cad-orange-btn text-xs font-bold flex items-center gap-1.5 shadow-md transition-all font-mono"
              title="Descargar archivo HTML 100% autónomo para usar sin internet"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Descargar</span> .HTML Monolítico
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal en Cuadrícula Responsiva */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1 space-y-5">
        {/* Banner de Inicio de Audio con Estilo de Advertencia Industrial */}
        {!acousticEngine.isInitialized() && (
          <div className="cad-gunmetal cad-bevel-panel border-l-4 border-l-[#ea580c] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-200">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-[#f97316] shrink-0" />
              <p className="text-xs sm:text-sm">
                Haga clic en cualquier botón o en <strong>Iniciar Audio</strong> para inicializar el motor de síntesis acústica DSP conforme a la directiva de reproducción Web Audio.
              </p>
            </div>
            <button
              onClick={ensureAudioRunning}
              className="px-4 py-2 cad-orange-btn font-bold text-xs rounded-xl transition-all shadow shrink-0 font-mono"
            >
              Iniciar Audio Web
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Columna Izquierda (8 de 12): Planta Industrial, Visualizadores Canvas e Higiene */}
          <div className="lg:col-span-8 space-y-4">
            {/* Panel de Maquinarias Industriales (Selector Compacto y Deslizador de Distancia) */}
            <MachineSelector
              sources={INITIAL_SOURCES}
              activeSourceId={activeSourceId}
              selectedMachineId={activeSourceId || selectedMachineId}
              onSelectSource={handleSelectSource}
              onStopAll={handleStopAll}
              distance={distance}
              onChangeDistance={handleChangeDistance}
              isEngineActive={acousticEngine.isInitialized()}
              onStartEngine={ensureAudioRunning}
            />

            {/* Barra de Control de Visualización: Máquina + Gráficas con Acabado Milled Steel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cad-industrial-steel cad-bevel-panel rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                <span className="text-xs font-bold text-slate-100 font-mono">
                  BANCO DE ENSAYOS ACÚSTICOS:
                </span>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  (Máquina SolidWorks 3D + Gráficas de Señal p(t) y RTA)
                </span>
              </div>

              <div className="flex items-center cad-gunmetal p-1 rounded-lg border border-slate-700/70 text-xs">
                <button
                  onClick={() => setDisplayMode('ambas')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    displayMode === 'ambas'
                      ? 'cad-orange-btn font-bold text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ver simultáneamente la máquina animada y las gráficas en tiempo real"
                >
                  <Layers className="w-3 h-3" />
                  <span>Ambas (Máquina + Gráficas)</span>
                </button>
                <button
                  onClick={() => setDisplayMode('maquina')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    displayMode === 'maquina'
                      ? 'cad-orange-btn font-bold text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ampliar visualizador de la máquina"
                >
                  <Activity className="w-3 h-3" />
                  <span>Solo Máquina</span>
                </button>
                <button
                  onClick={() => setDisplayMode('graficas')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    displayMode === 'graficas'
                      ? 'cad-orange-btn font-bold text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ampliar osciloscopio y analizador de espectro"
                >
                  <FileCode className="w-3 h-3" />
                  <span>Solo Gráficas</span>
                </button>
              </div>
            </div>

            {/* Visor Cinemático de Maquinaria en Movimiento y Focos Generadores de Ruido */}
            {(displayMode === 'ambas' || displayMode === 'maquina') && (
              <MachineAnimator
                source={INITIAL_SOURCES.find(s => s.id === (activeSourceId || selectedMachineId)) || INITIAL_SOURCES[0]}
                isActive={isPowered && activeSourceId !== null}
                distance={distance}
              />
            )}

            {/* Pantalla de Gráficas Acústicas: Onda de Ruido p(t), Nivel dB vs Tiempo y RTA */}
            {(displayMode === 'ambas' || displayMode === 'graficas') && (
              <AcousticCanvas
                freqWeighting={freqWeighting}
                isActive={isPowered && (activeSourceId !== null || isCalibrating)}
                isCalibrating={isCalibrating}
                instantSPL={measurement.instantSPL}
                lpeak={measurement.lpeak}
              />
            )}

            {/* Consola de Higiene Ocupacional y Dosimetría */}
            <HygieneAssessment
              leq={measurement.leq}
              lpeak={measurement.lpeak}
              instantSPL={measurement.instantSPL}
            />
          </div>

          {/* Columna Derecha (4 de 12): Frontal Físico del Sonómetro Digital Clase 1 */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="space-y-4">
              <SonometerInstrument
                measurement={measurement}
                isPowered={isPowered}
                onTogglePower={handleTogglePower}
                freqWeighting={freqWeighting}
                onToggleFreqWeighting={handleToggleFreqWeighting}
                onSetFreqWeighting={handleSetFreqWeighting}
                timeWeighting={timeWeighting}
                onToggleTimeWeighting={handleToggleTimeWeighting}
                onSetTimeWeighting={handleSetTimeWeighting}
                onTogglePeak={handleTogglePeak}
                isCalibrating={isCalibrating}
                onToggleCalibrator={handleToggleCalibrator}
                isLeqRunning={isLeqRunning}
                onToggleLeq={handleToggleLeq}
                onReset={handleReset}
              />

              {/* Tarjeta de Resumen Técnico de Instrumentación con Bisel y Tornillos */}
              <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-4 text-xs text-slate-300 space-y-2 relative overflow-hidden">
                <div className="absolute top-2.5 right-2.5 cad-allen-bolt" />
                <div className="flex items-center gap-2 text-slate-100 font-bold font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#f97316]" />
                  <span>ESPECIFICACIONES DE CALIBRACIÓN</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] pt-1">
                  <div className="flex justify-between border-b border-slate-700/60 pb-1">
                    <span className="text-slate-400">Norma:</span>
                    <span className="text-slate-200 font-bold">IEC 61672-1:2013</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/60 pb-1">
                    <span className="text-slate-400">Pistófono Cal:</span>
                    <span className="text-cyan-400 font-bold">94.0 dB @ 1 kHz</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/60 pb-1">
                    <span className="text-slate-400">Balística FAST:</span>
                    <span className="text-slate-200">τ = 125 ms</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/60 pb-1">
                    <span className="text-slate-400">Balística SLOW:</span>
                    <span className="text-slate-200">τ = 1000 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Límite Pico Res 1792:</span>
                    <span className="text-[#f97316] font-bold">140 dBC Peak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de Página de Ingeniería */}
      <footer className="border-t border-slate-800 cad-industrial-steel py-4 px-4 text-center text-xs text-slate-400 font-mono">
        <p>
          Simulador Acústico para Docencia en Seguridad y Salud en el Trabajo (SST) · Normas IEC 61672-1, ISO 9612 y Res. 1792 de 1990.
        </p>
      </footer>

      {/* Modal de Prácticas de Laboratorio */}
      <LabPracticesModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        onAutoConfigurePractice={handleAutoConfigurePractice}
      />
    </div>
  );
}
