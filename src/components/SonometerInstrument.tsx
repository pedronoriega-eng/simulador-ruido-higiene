import React, { useState } from 'react';
import { FrequencyWeighting, TimeWeighting, AcousticMeasurement } from '../types';
import {
  Power,
  Volume2,
  Gauge,
  Timer,
  RotateCcw,
  Play,
  Pause,
  Sun,
  Shield,
  Zap,
  Info,
  Radio,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface SonometerInstrumentProps {
  measurement: AcousticMeasurement;
  isPowered: boolean;
  onTogglePower: () => void;
  freqWeighting: FrequencyWeighting;
  onToggleFreqWeighting: () => void;
  onSetFreqWeighting?: (w: FrequencyWeighting) => void;
  timeWeighting: TimeWeighting;
  onToggleTimeWeighting: () => void;
  onSetTimeWeighting?: (t: TimeWeighting) => void;
  onTogglePeak: () => void;
  isCalibrating: boolean;
  onToggleCalibrator: () => void;
  isLeqRunning: boolean;
  onToggleLeq: () => void;
  onReset: () => void;
}

// Representación de segmentos para dígitos 7-segmentos LCD clásicos
// Orden: a (top), b (top-right), c (bottom-right), d (bottom), e (bottom-left), f (top-left), g (center)
const DIGIT_SEGMENTS: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
  '-': [false, false, false, false, false, false, true],
  ' ': [false, false, false, false, false, false, false]
};

interface SevenSegmentProps {
  char: string;
  isLit: boolean;
  backlit: boolean;
}

const SevenSegmentDigit: React.FC<SevenSegmentProps> = ({ char, isLit, backlit }) => {
  const segs = DIGIT_SEGMENTS[char] || DIGIT_SEGMENTS[' '];

  // Colores para LCD reflectivo diurno vs LCD retroiluminado verde esmeralda
  const activeColor = backlit ? '#34d399' : '#142014';
  const inactiveColor = backlit ? 'rgba(52, 211, 153, 0.08)' : 'rgba(20, 32, 20, 0.08)';

  return (
    <svg viewBox="0 0 54 82" className="w-8 sm:w-9 h-14 sm:h-16 inline-block" style={{ filter: backlit && isLit ? 'drop-shadow(0 0 3px rgba(52,211,153,0.6))' : 'none' }}>
      {/* a - superior */}
      <polygon
        points="10,6 44,6 38,13 16,13"
        fill={isLit && segs[0] ? activeColor : inactiveColor}
      />
      {/* b - superior derecho */}
      <polygon
        points="45,8 51,14 47,40 40,37 43,15"
        fill={isLit && segs[1] ? activeColor : inactiveColor}
      />
      {/* c - inferior derecho */}
      <polygon
        points="46,43 50,47 45,74 38,67 40,46"
        fill={isLit && segs[2] ? activeColor : inactiveColor}
      />
      {/* d - inferior */}
      <polygon
        points="14,69 37,69 43,76 8,76"
        fill={isLit && segs[3] ? activeColor : inactiveColor}
      />
      {/* e - inferior izquierdo */}
      <polygon
        points="7,46 13,49 11,67 5,73 2,49"
        fill={isLit && segs[4] ? activeColor : inactiveColor}
      />
      {/* f - superior izquierdo */}
      <polygon
        points="9,14 15,16 13,38 7,41 3,17"
        fill={isLit && segs[5] ? activeColor : inactiveColor}
      />
      {/* g - central */}
      <polygon
        points="14,40 39,40 43,42 39,44 14,44 9,42"
        fill={isLit && segs[6] ? activeColor : inactiveColor}
      />
    </svg>
  );
};

export const SonometerInstrument: React.FC<SonometerInstrumentProps> = ({
  measurement,
  isPowered,
  onTogglePower,
  freqWeighting,
  onToggleFreqWeighting,
  onSetFreqWeighting,
  timeWeighting,
  onToggleTimeWeighting,
  onSetTimeWeighting,
  onTogglePeak,
  isCalibrating,
  onToggleCalibrator,
  isLeqRunning,
  onToggleLeq,
  onReset
}) => {
  // Estado local para opciones de pantalla y sonda física
  const [backlit, setBacklit] = useState<boolean>(true); // Retroiluminación LCD (Verde Esmeralda vs Reflectivo)
  const [hasWindscreen, setHasWindscreen] = useState<boolean>(true); // Protector antiviento de espuma acústica
  const [rangeMode, setRangeMode] = useState<'auto' | '30-80' | '50-100' | '80-130'>('auto');
  const [displayHold, setDisplayHold] = useState<boolean>(false);
  const [showTechInfo, setShowTechInfo] = useState<boolean>(false);

  // Formateador de tiempo cronometrado para Leq
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Nivel de presión sonora a visualizar (escala 30 a 130 dB)
  const currentDb = isPowered ? measurement.instantSPL : 0;
  const clampedDb = Math.max(30, Math.min(130, currentDb));
  
  // Porcentaje del vúmetro bargraph (30 dB a 130 dB = 100 dB de rango analógico)
  const bargraphPercent = isPowered
    ? Math.max(0, Math.min(100, ((clampedDb - 30) / (130 - 30)) * 100))
    : 0;

  // Segmentación del bargraph LCD analógico (50 segmentos de 2 dB cada uno)
  const totalBargraphSegments = 50;
  const activeSegments = isPowered ? Math.round((bargraphPercent / 100) * totalBargraphSegments) : 0;
  const peakSegment = isPowered ? Math.min(totalBargraphSegments, Math.max(0, Math.round(((measurement.lpeak - 30) / 100) * totalBargraphSegments))) : 0;

  // Descomposición del número digital para la pantalla de 7 segmentos (ej: " 84.2" o "104.5")
  const formattedVal = isPowered ? currentDb.toFixed(1) : ' 0.0';
  const parts = formattedVal.split('.');
  const intPart = parts[0];
  const decPart = parts[1] || '0';
  const paddedInt = intPart.padStart(3, ' ');
  const char1 = paddedInt[0];
  const char2 = paddedInt[1];
  const char3 = paddedInt[2];
  const charDec = decPart[0];

  // Color de segmentos de acuerdo a la retroiluminación
  const lcdTextPrimary = backlit ? 'text-emerald-300' : 'text-[#162014]';
  const lcdTextDim = backlit ? 'text-emerald-700/60' : 'text-[#162014]/30';
  const lcdBg = backlit
    ? 'bg-gradient-to-b from-[#061e15] to-[#04140e] border-[#103829] shadow-[inset_0_0_24px_rgba(16,185,129,0.18)]'
    : 'bg-gradient-to-b from-[#a4b998] to-[#96ab8a] border-[#6b8260] shadow-[inset_0_0_12px_rgba(0,0,0,0.25)]';

  // Manejo directo de escalas FAST y SLOW
  const selectFast = () => {
    if (!isPowered) return;
    if (onSetTimeWeighting) {
      onSetTimeWeighting('FAST');
    } else if (timeWeighting !== 'FAST') {
      onToggleTimeWeighting();
    }
  };

  const selectSlow = () => {
    if (!isPowered) return;
    if (onSetTimeWeighting) {
      onSetTimeWeighting('SLOW');
    } else if (timeWeighting !== 'SLOW') {
      onToggleTimeWeighting();
    }
  };

  // Manejo directo de filtros A y C
  const selectFilterA = () => {
    if (!isPowered) return;
    if (onSetFreqWeighting) {
      onSetFreqWeighting('A');
    } else if (freqWeighting !== 'A') {
      onToggleFreqWeighting();
    }
  };

  const selectFilterC = () => {
    if (!isPowered) return;
    if (onSetFreqWeighting) {
      onSetFreqWeighting('C');
    } else if (freqWeighting !== 'C') {
      onToggleFreqWeighting();
    }
  };

  // Rotación de rangos de medición
  const handleCycleRange = () => {
    if (!isPowered) return;
    if (rangeMode === 'auto') setRangeMode('30-80');
    else if (rangeMode === '30-80') setRangeMode('50-100');
    else if (rangeMode === '50-100') setRangeMode('80-130');
    else setRangeMode('auto');
  };

  return (
    <div className="relative mx-auto w-full max-w-[390px] flex flex-col items-center select-none font-sans">
      
      {/* =========================================================================
          CÁPSULA DEL MICRÓFONO METROLÓGICO (SONDA 1/2" CLASE 1 / TIPO 2)
          ========================================================================= */}
      <div className="relative -mb-4 flex flex-col items-center z-20 group">
        {/* Capuchón antiviento de espuma de poliuretano reticulado (desmontable con click) */}
        {hasWindscreen ? (
          <div
            onClick={() => setHasWindscreen(false)}
            title="Protector antiviento de espuma acústica instalado. Haga clic para retirar y ver la cápsula metálica de 1/2 pulgada."
            className="w-14 h-16 rounded-full bg-gradient-to-b from-[#1c222b] via-[#0f141c] to-[#1e2530] border border-slate-700/60 shadow-[0_6px_14px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.1)] cursor-pointer flex flex-col items-center justify-center relative overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            {/* Textura microporosa de espuma acústica */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:3px_3px] opacity-70"></div>
            <span className="text-[8px] font-mono font-bold text-slate-400/80 z-10 tracking-widest uppercase">
              FOAM WS
            </span>
          </div>
        ) : (
          <div
            onClick={() => setHasWindscreen(true)}
            title="Cápsula condensador de 1/2 pulgada en acero inoxidable y titanio. Haga clic para colocar el protector de viento."
            className="w-8 h-14 rounded-t-lg bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 border-2 border-slate-400 shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.9)] cursor-pointer flex flex-col items-center justify-between py-1 relative overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            {/* Rejilla protectora de cápsula electrostática */}
            <div className="w-6 h-6 rounded-t bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:2px_2px] opacity-90 border-b border-slate-400"></div>
            {/* Anillo de tolerancia y metrología láser */}
            <div className="w-full h-1 bg-[#ea580c] shadow-[0_0_4px_rgba(234,88,12,0.8)]"></div>
            <span className="text-[7px] font-mono font-black text-slate-700">1/2&quot; MIC</span>
          </div>
        )}

        {/* Cuello cónico mecanizado de transición (Aluminio aeronáutico anodizado) */}
        <div className="w-12 h-4 bg-gradient-to-b from-slate-500 via-slate-700 to-slate-800 rounded-b border-x border-b border-slate-600 shadow-inner flex items-center justify-center">
          <div className="w-8 h-0.5 bg-slate-400/50"></div>
        </div>
      </div>

      {/* =========================================================================
          CHASIS ERGONÓMICO DEL SONÓMETRO (ESTILO EXTECH 407780A / INSTRUMENTO REAL)
          Carcasa de polímero técnico en blanco hueso / platino con empuñaduras laterales
          ========================================================================= */}
      <div className="w-full bg-gradient-to-b from-[#e8ebf0] via-[#dde1e7] to-[#cbd2dc] text-slate-800 rounded-[38px] p-4 pt-6 border-2 border-slate-400 shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_6px_rgba(0,0,0,0.2)] relative overflow-hidden">
        
        {/* Grip lateral ergonómico izquierdo y derecho de elastómero vulcanizado */}
        <div className="absolute top-20 -left-1.5 w-3 h-48 bg-gradient-to-r from-[#181d24] to-[#2b3542] rounded-r-md border-y border-r border-slate-600 shadow-md flex flex-col justify-around py-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2 h-1 bg-slate-700/80 rounded-r"></div>
          ))}
        </div>
        <div className="absolute top-20 -right-1.5 w-3 h-48 bg-gradient-to-l from-[#181d24] to-[#2b3542] rounded-l-md border-y border-l border-slate-600 shadow-md flex flex-col justify-around py-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2 h-1 bg-slate-700/80 rounded-l ml-auto"></div>
          ))}
        </div>

        {/* Cabecera de Marca y Certificación Metrológica Normalizada */}
        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 font-mono">
                EXTECH
              </span>
              <span className="text-[10px] font-bold text-[#ea580c] bg-orange-100 px-1.5 py-0.2 rounded border border-orange-300">
                407780A
              </span>
            </div>
            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              INTEGRATING SOUND LEVEL METER
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[8px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300 shadow-inner">
              IEC 61672-1 CLASE 2
            </span>
            <span className="text-[8px] font-mono text-slate-400 mt-0.5">
              ANSI S1.4 TYPE 2
            </span>
          </div>
        </div>

        {/* =========================================================================
            PANTALLA DIGITAL LCD CIENTÍFICA (MONOCROMÁTICA / RETROILUMINADA)
            ========================================================================= */}
        <div className={`w-full rounded-2xl p-3 border-2 transition-colors duration-300 relative overflow-hidden ${lcdBg}`}>
          
          {/* Reflejo biselado de vidrio templado superior */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>

          {isPowered ? (
            <div className="space-y-1.5">
              {/* FILA 1 DE LA PANTALLA: Flags de estado, Rango y Batería */}
              <div className={`flex items-center justify-between text-[10px] font-mono font-bold border-b pb-1 ${
                backlit ? 'border-emerald-800/60 text-emerald-300' : 'border-[#6b8260]/40 text-[#142014]'
              }`}>
                {/* Indicador de Rango dinámico */}
                <div className="flex items-center gap-1.5">
                  <span className={`px-1 rounded text-[9px] ${
                    backlit ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' : 'bg-[#8aa37e] text-[#142014]'
                  }`}>
                    {rangeMode === 'auto' ? 'AUTO: 30-130 dB' : `RNG: ${rangeMode} dB`}
                  </span>
                  {displayHold && (
                    <span className="px-1 rounded bg-amber-500 text-black text-[9px] font-bold">
                      HOLD
                    </span>
                  )}
                </div>

                {/* Reloj y Estado de Grabación REC / PAUSE */}
                <div className="flex items-center gap-2">
                  {isCalibrating ? (
                    <span className="flex items-center gap-1 font-bold text-sky-400 animate-pulse">
                      <Radio className="w-3 h-3" />
                      CAL 94dB
                    </span>
                  ) : isLeqRunning ? (
                    <span className="flex items-center gap-1 font-bold text-[#ea580c]">
                      <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-ping"></span>
                      REC Leq
                    </span>
                  ) : (
                    <span className={`text-[9px] ${lcdTextDim}`}>
                      PAUSA
                    </span>
                  )}

                  {/* Cronómetro de integración */}
                  <span className="text-[10px] font-mono tracking-tight">
                    {formatTimer(measurement.runTimeSeconds)}
                  </span>

                  {/* Icono de Batería */}
                  <div className="flex items-center" title="Batería: 100% (9V Alcalina)">
                    <div className={`w-4 h-2 rounded-xs border flex items-center p-0.5 gap-0.5 ${
                      backlit ? 'border-emerald-400' : 'border-[#142014]'
                    }`}>
                      <div className={`w-0.5 h-full ${backlit ? 'bg-emerald-400' : 'bg-[#142014]'}`}></div>
                      <div className={`w-0.5 h-full ${backlit ? 'bg-emerald-400' : 'bg-[#142014]'}`}></div>
                      <div className={`w-0.5 h-full ${backlit ? 'bg-emerald-400' : 'bg-[#142014]'}`}></div>
                    </div>
                    <div className={`w-0.5 h-1 rounded-r-xs ${backlit ? 'bg-emerald-400' : 'bg-[#142014]'}`}></div>
                  </div>
                </div>
              </div>

              {/* FILA 2 DE LA PANTALLA: SELECTORES ACTIVOS SLOW / FAST Y FILTRO A / C */}
              <div className={`flex items-center justify-between text-[11px] font-mono font-bold py-0.5 border-b ${
                backlit ? 'border-emerald-800/40' : 'border-[#6b8260]/30'
              }`}>
                {/* SELECTORES DE PONDERACIÓN FRECUENCIAL: FILTRO A vs FILTRO C */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-slate-400 uppercase font-medium mr-0.5">FILTRO:</span>
                  <button
                    onClick={selectFilterA}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                      freqWeighting === 'A'
                        ? backlit
                          ? 'bg-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : 'bg-[#142014] text-[#a4b998]'
                        : `${lcdTextDim} hover:text-slate-300`
                    }`}
                    title="Filtro de Ponderación A: Curva perceptual humana (dBA). Obligatoria para higiene industrial y TLV 85 dBA."
                  >
                    A (dBA)
                  </button>
                  <button
                    onClick={selectFilterC}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                      freqWeighting === 'C'
                        ? backlit
                          ? 'bg-[#ea580c] text-white shadow-[0_0_8px_rgba(234,88,12,0.8)]'
                          : 'bg-[#142014] text-[#a4b998]'
                        : `${lcdTextDim} hover:text-slate-300`
                    }`}
                    title="Filtro de Ponderación C: Curva casi plana (dBC). Evalúa bajas frecuencias, maquinaria pesada e impactos."
                  >
                    C (dBC)
                  </button>
                </div>

                {/* SELECTORES DE ESCALA TEMPORAL: FAST vs SLOW */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-slate-400 uppercase font-medium mr-0.5">ESCALA:</span>
                  <button
                    onClick={selectFast}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                      timeWeighting === 'FAST'
                        ? backlit
                          ? 'bg-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                          : 'bg-[#142014] text-[#a4b998]'
                        : `${lcdTextDim} hover:text-slate-300`
                    }`}
                    title="Escala FAST: τ = 125 ms. Para ruido variable, herramientas de corte, impactos y eventos rápidos."
                  >
                    FAST
                  </button>
                  <button
                    onClick={selectSlow}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                      timeWeighting === 'SLOW'
                        ? backlit
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : 'bg-[#142014] text-[#a4b998]'
                        : `${lcdTextDim} hover:text-slate-300`
                    }`}
                    title="Escala SLOW: τ = 1000 ms (1s). Para ruido continuo estable según norma de higiene ocupacional."
                  >
                    SLOW
                  </button>
                  {timeWeighting === 'PEAK' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      PEAK
                    </span>
                  )}
                </div>
              </div>

              {/* LECTURA PRINCIPAL: DÍGITOS 7-SEGMENTOS LCD GIGANTES DE ALTA PRECISIÓN */}
              <div className="flex items-baseline justify-between pt-1 px-1">
                {/* Dígitos 7-segmentos */}
                <div className="flex items-baseline gap-0.5">
                  <SevenSegmentDigit char={char1} isLit={isPowered} backlit={backlit} />
                  <SevenSegmentDigit char={char2} isLit={isPowered} backlit={backlit} />
                  <SevenSegmentDigit char={char3} isLit={isPowered} backlit={backlit} />
                  {/* Punto decimal iluminado */}
                  <div className="mx-0.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        backlit
                          ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                          : 'bg-[#142014]'
                      }`}
                    ></div>
                  </div>
                  <SevenSegmentDigit char={charDec} isLit={isPowered} backlit={backlit} />
                </div>

                {/* Unidad de Medida en LCD */}
                <div className="text-right pl-2">
                  <div className={`text-2xl font-black font-mono leading-none ${lcdTextPrimary}`}>
                    dB<span className="text-sm font-bold ml-0.5">({freqWeighting})</span>
                  </div>
                  <div className={`text-[10px] font-mono mt-1 font-bold ${lcdTextDim}`}>
                    {timeWeighting === 'PEAK'
                      ? 'PEAK HOLD'
                      : timeWeighting === 'SLOW'
                      ? 'SPL SLOW (1s)'
                      : 'SPL FAST (125ms)'}
                  </div>
                  {currentDb >= 85 && (
                    <div className="text-[9px] font-mono font-black text-[#ea580c] mt-0.5 animate-pulse">
                      ALERTA ≥ 85 dB
                    </div>
                  )}
                </div>
              </div>

              {/* VÚMETRO ANALÓGICO BARGRAPH (ESCALA 30 A 130 dB) */}
              <div className="pt-1">
                {/* Escala graduada con marcas numéricas */}
                <div className={`flex justify-between text-[8px] font-mono font-bold mb-0.5 px-0.5 ${
                  backlit ? 'text-emerald-500' : 'text-[#142014]/70'
                }`}>
                  <span>30</span>
                  <span>40</span>
                  <span>50</span>
                  <span>60</span>
                  <span>70</span>
                  <span className="text-amber-400 font-black">80</span>
                  <span className="text-[#ea580c] font-black underline">85</span>
                  <span>100</span>
                  <span>110</span>
                  <span>120</span>
                  <span className="text-red-400 font-black">130</span>
                </div>

                {/* Pista de segmentos discretos de 2 dB cada uno */}
                <div className={`w-full h-3 rounded p-0.5 flex gap-[1.5px] items-center border ${
                  backlit ? 'bg-[#030e0a] border-emerald-900/60' : 'bg-[#7a936f] border-[#55694c]'
                }`}>
                  {[...Array(totalBargraphSegments)].map((_, idx) => {
                    const isLit = idx < activeSegments;
                    const isPeak = idx === peakSegment - 1;
                    const segmentDb = 30 + (idx + 1) * 2;

                    let segColor = backlit ? 'bg-emerald-400' : 'bg-[#142014]';
                    if (segmentDb >= 115) {
                      segColor = backlit ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]' : 'bg-[#7f1d1d]';
                    } else if (segmentDb >= 85) {
                      segColor = backlit ? 'bg-[#ea580c] shadow-[0_0_4px_rgba(234,88,12,0.8)]' : 'bg-[#9a3412]';
                    } else if (segmentDb >= 75) {
                      segColor = backlit ? 'bg-amber-400' : 'bg-[#b45309]';
                    }

                    return (
                      <div
                        key={idx}
                        className={`h-full flex-1 rounded-[1px] transition-all duration-75 ${
                          isLit
                            ? segColor
                            : isPeak
                            ? backlit ? 'bg-rose-400 shadow-[0_0_4px_rgba(251,113,133,0.9)]' : 'bg-red-900'
                            : backlit
                            ? 'bg-emerald-950/40'
                            : 'bg-[#142014]/10'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* MATRIZ DE PARÁMETROS SECUNDARIOS (Leq, Lmax, Lmin, Lpeak) */}
              <div className={`grid grid-cols-4 gap-1 text-[10px] pt-1.5 border-t rounded-lg p-1.5 font-mono ${
                backlit
                  ? 'border-emerald-900/60 bg-[#03130d]/90 text-emerald-300'
                  : 'border-[#6b8260]/40 bg-[#8da580]/70 text-[#142014]'
              }`}>
                <div className="text-center">
                  <span className={`block text-[8px] uppercase font-bold ${backlit ? 'text-emerald-500' : 'text-[#142014]/60'}`}>
                    Leq
                  </span>
                  <span className="font-bold text-[11px]">
                    {measurement.leq.toFixed(1)}
                  </span>
                </div>

                <div className="text-center">
                  <span className={`block text-[8px] uppercase font-bold ${backlit ? 'text-emerald-500' : 'text-[#142014]/60'}`}>
                    Lmax
                  </span>
                  <span className="font-bold text-[11px]">
                    {measurement.lmax.toFixed(1)}
                  </span>
                </div>

                <div className="text-center">
                  <span className={`block text-[8px] uppercase font-bold ${backlit ? 'text-emerald-500' : 'text-[#142014]/60'}`}>
                    Lmin
                  </span>
                  <span className="font-bold text-[11px]">
                    {measurement.lmin.toFixed(1)}
                  </span>
                </div>

                <div className="text-center">
                  <span className={`block text-[8px] uppercase font-bold ${backlit ? 'text-[#ea580c]' : 'text-red-900'}`}>
                    Lpeak
                  </span>
                  <span className={`font-bold text-[11px] ${backlit ? 'text-orange-200' : 'text-red-950'}`}>
                    {measurement.lpeak.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Pantalla apagada */
            <div className="h-44 flex flex-col items-center justify-center font-mono text-center">
              <Power className={`w-10 h-10 mb-2 ${backlit ? 'text-emerald-900/40' : 'text-[#142014]/20'}`} />
              <span className={`text-xs uppercase font-black tracking-widest ${backlit ? 'text-emerald-800' : 'text-[#142014]/40'}`}>
                SONÓMETRO APAGADO
              </span>
              <span className={`text-[10px] mt-1 ${backlit ? 'text-emerald-900/60' : 'text-[#142014]/30'}`}>
                Presione el pulsador rojo POWER para encender
              </span>
            </div>
          )}
        </div>

        {/* =========================================================================
            TECLADO FÍSICO DE CAUCHO TÁCTIL (ESTILO EXTECH / METROLOGÍA INDUSTRIAL)
            ========================================================================= */}
        <div className="mt-3.5 bg-gradient-to-b from-[#2a323d] via-[#1f2630] to-[#171d25] p-3 rounded-2xl border border-slate-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.5)]">
          
          {/* Fila 1 de Teclas: POWER, FILTRO A/C, ESCALAS FAST/SLOW */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            
            {/* BOTÓN POWER */}
            <button
              onClick={onTogglePower}
              className={`flex flex-col items-center justify-center p-2 rounded-xl font-bold transition-all ${
                isPowered
                  ? 'bg-gradient-to-b from-red-500 to-red-700 text-white border-2 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                  : 'bg-gradient-to-b from-slate-700 to-slate-800 text-slate-300 border border-slate-600 hover:text-white shadow-md'
              }`}
              title="Encender / Apagar Sonómetro"
            >
              <Power className="w-4 h-4 mb-0.5 text-white" />
              <span className="text-[10px] font-black tracking-wider">POWER</span>
            </button>

            {/* BOTÓN CONMUTADOR FILTRO A / C */}
            <button
              disabled={!isPowered}
              onClick={onToggleFreqWeighting}
              className={`flex flex-col items-center justify-center p-2 rounded-xl font-bold transition-all border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : freqWeighting === 'A'
                  ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-b from-[#ea580c] to-[#c2410c] text-white border-orange-400 shadow-[0_0_10px_rgba(234,88,12,0.5)]'
              }`}
              title="Filtro de Ponderación Frecuencial: Alternar entre A (Curva auditiva humana / Higiene) y C (Baja frecuencia e impactos)"
            >
              <Gauge className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-black tracking-wide">A / C</span>
              <span className="text-[8px] font-mono opacity-90">Activo: {freqWeighting}</span>
            </button>

            {/* BOTÓN CONMUTADOR ESCALAS FAST / SLOW */}
            <button
              disabled={!isPowered}
              onClick={onToggleTimeWeighting}
              className={`flex flex-col items-center justify-center p-2 rounded-xl font-bold transition-all border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : timeWeighting === 'FAST'
                  ? 'bg-gradient-to-b from-cyan-600 to-cyan-800 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'bg-gradient-to-b from-amber-600 to-amber-800 text-white border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              }`}
              title="Ponderación Temporal: Alternar entre FAST (τ=125ms / Ruido variable) y SLOW (τ=1000ms / Ruido continuo)"
            >
              <Timer className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-black tracking-wide">FAST / SLOW</span>
              <span className="text-[8px] font-mono opacity-90">Activo: {timeWeighting}</span>
            </button>
          </div>

          {/* Fila 2 de Teclas: PEAK, CAL 94dB, START/STOP Leq, RESET */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            
            {/* BOTÓN PEAK */}
            <button
              disabled={!isPowered}
              onClick={onTogglePeak}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-bold transition-all border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : timeWeighting === 'PEAK'
                  ? 'bg-gradient-to-b from-rose-600 to-rose-800 text-white border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'bg-slate-700 text-rose-300 border-slate-600 hover:text-white'
              }`}
              title="Modo PEAK: Retención de pico transitorio (< 50 microsegundos) para troqueladoras y martinetes"
            >
              <Zap className="w-3.5 h-3.5 mb-0.5" />
              <span className="text-[9px]">PEAK</span>
            </button>

            {/* BOTÓN CALIBRADOR 94dB */}
            <button
              disabled={!isPowered}
              onClick={onToggleCalibrator}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-bold transition-all border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : isCalibrating
                  ? 'bg-gradient-to-b from-sky-600 to-sky-800 text-white border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)] animate-pulse'
                  : 'bg-slate-700 text-sky-300 border-slate-600 hover:text-white'
              }`}
              title="Calibrador Acústico Pistófono Patrón: Inyecta tono de referencia de 94.0 dB a 1000 Hz según IEC 60942"
            >
              <Volume2 className="w-3.5 h-3.5 mb-0.5" />
              <span className="text-[9px]">CAL 94dB</span>
            </button>

            {/* BOTÓN START / PAUSE Leq */}
            <button
              disabled={!isPowered}
              onClick={onToggleLeq}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-bold transition-all border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : isLeqRunning
                  ? 'bg-gradient-to-b from-[#ea580c] to-[#c2410c] text-white border-orange-400 shadow-[0_0_10px_rgba(234,88,12,0.7)]'
                  : 'bg-slate-700 text-emerald-400 border-slate-600 hover:text-white'
              }`}
              title="Iniciar / Pausar Integrador de Nivel Continuo Equivalente (Leq) y Dosis Diaria"
            >
              {isLeqRunning ? <Pause className="w-3.5 h-3.5 mb-0.5" /> : <Play className="w-3.5 h-3.5 mb-0.5" />}
              <span className="text-[9px]">{isLeqRunning ? 'PAUSE' : 'LEQ REC'}</span>
            </button>

            {/* BOTÓN RESET MEDICIÓN */}
            <button
              disabled={!isPowered}
              onClick={onReset}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-bold transition-all border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white hover:bg-slate-600'
              }`}
              title="Poner a cero integrador Leq, registros Lmax, Lmin, Lpeak y cronómetro"
            >
              <RotateCcw className="w-3.5 h-3.5 mb-0.5" />
              <span className="text-[9px]">RESET</span>
            </button>
          </div>

          {/* Fila 3 de Teclas Auxiliares: RANGE, LIGHT, HOLD, INFO METROLÓGICA */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-700/80">
            {/* RANGE */}
            <button
              disabled={!isPowered}
              onClick={handleCycleRange}
              className={`py-1 rounded text-[9px] font-mono font-bold border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
              }`}
              title="Conmutar Rango de Medición (Auto 30-130 dB / 30-80 / 50-100 / 80-130)"
            >
              RNG
            </button>

            {/* LIGHT (Retroiluminación LCD) */}
            <button
              disabled={!isPowered}
              onClick={() => setBacklit(!backlit)}
              className={`py-1 rounded text-[9px] font-mono font-bold border flex items-center justify-center gap-1 ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : backlit
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
              title="Alternar entre pantalla LCD reflectiva diurna y retroiluminada verde esmeralda"
            >
              <Sun className="w-3 h-3" />
              LGT
            </button>

            {/* HOLD */}
            <button
              disabled={!isPowered}
              onClick={() => setDisplayHold(!displayHold)}
              className={`py-1 rounded text-[9px] font-mono font-bold border ${
                !isPowered
                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600 border-slate-700'
                  : displayHold
                  ? 'bg-amber-500 text-black border-amber-400 font-black'
                  : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
              title="Congelar lectura actual en pantalla"
            >
              HOLD
            </button>

            {/* INFO GUÍA TÉCNICA */}
            <button
              onClick={() => setShowTechInfo(!showTechInfo)}
              className={`py-1 rounded text-[9px] font-mono font-bold border flex items-center justify-center gap-0.5 ${
                showTechInfo
                  ? 'bg-[#ea580c] text-white border-orange-400'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
              }`}
              title="Ver guía técnica sobre Escalas FAST/SLOW y Filtros A/C"
            >
              <Info className="w-3 h-3" />
              GUÍA
            </button>
          </div>
        </div>

        {/* Panel Desplegable de Guía Técnica Didáctica sobre FAST, SLOW, A y C */}
        {showTechInfo && (
          <div className="mt-3 p-3 bg-slate-900/95 text-slate-200 rounded-xl border border-orange-500/50 text-[11px] font-sans space-y-2 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center justify-between font-bold font-mono text-[#f97316] pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                CRITERIOS DE MEDICIÓN ACÚSTICA
              </span>
              <button onClick={() => setShowTechInfo(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div>
                <strong className="text-cyan-400 font-mono">Escala FAST (τ = 125 ms):</strong>
                <p className="text-slate-300 text-[10px]">
                  Responde rápido a las variaciones de presión sonora. Es la escala requerida para medir <strong>ruidos variables, cíclicos e intermitentes</strong> (sierras circulares, pulidoras o escape neumático) y capturar picos de fluctuación.
                </p>
              </div>

              <div>
                <strong className="text-amber-400 font-mono">Escala SLOW (τ = 1000 ms / 1 s):</strong>
                <p className="text-slate-300 text-[10px]">
                  Aplica un promedio exponencial de 1 segundo que amortigua las oscilaciones. Es la escala obligatoria en <strong>evaluaciones de higiene ocupacional (OSHA / Res. 1792 / ISO 9612)</strong> para <strong>ruido continuo y estable</strong> (compresores, turbinas centrífugas).
                </p>
              </div>

              <div>
                <strong className="text-emerald-400 font-mono">Filtro A (dBA):</strong>
                <p className="text-slate-300 text-[10px]">
                  Emula la sensibilidad del oído humano atenuando frecuencias muy bajas y muy altas. Es el filtro reglamentario para <strong>determinar riesgo de hipoacusia y comparar contra el TLV de 85 dBA</strong>.
                </p>
              </div>

              <div>
                <strong className="text-[#ea580c] font-mono">Filtro C (dBC):</strong>
                <p className="text-slate-300 text-[10px]">
                  Curva prácticamente plana (31.5 Hz a 8 kHz). Mide la <strong>energía total acústica</strong>, incluyendo bajas frecuencias y vibraciones estructurales. Utilizado para diagnóstico de maquinaria, atenuación NRR de protectores y ruido de impacto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Zona Inferior: Puertos de Calibración y Rosca de Trípode Normalizada */}
        <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-center justify-between text-[8px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span>CAL POT Ø2.5mm</span>
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span>RS-232 / USB</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 font-bold">
            <span>TRIPOD: 1/4&quot;-20 UNC</span>
          </div>
        </div>

      </div>
    </div>
  );
};
