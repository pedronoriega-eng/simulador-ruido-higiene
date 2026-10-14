import React, { useEffect, useRef, useState } from 'react';
import { acousticEngine, getAWeighting, getCWeighting } from '../audioEngine';
import { FrequencyWeighting } from '../types';
import { Activity, BarChart2, TrendingUp, Waves, Maximize2 } from 'lucide-react';

interface AcousticCanvasProps {
  freqWeighting: FrequencyWeighting;
  isActive: boolean;
  isCalibrating: boolean;
  instantSPL?: number;
  lpeak?: number;
}

export const AcousticCanvas: React.FC<AcousticCanvasProps> = ({
  freqWeighting,
  isActive,
  isCalibrating,
  instantSPL = 42.1,
  lpeak = 46.2
}) => {
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rtaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Selector de gráfico en el dominio del tiempo: Osciloscopio p(t) vs Historial SPL (dB vs t)
  const [timeGraphMode, setTimeGraphMode] = useState<'onda' | 'historial' | 'ambos'>('onda');

  // Historial de niveles de presión sonora (dB vs tiempo)
  const splHistoryRef = useRef<{ time: number; spl: number; peak: number }[]>([]);
  const lastHistoryPushRef = useRef<number>(0);

  // Peak hold array para las 10 bandas de octava
  const peakHoldBars = useRef<number[]>(new Array(10).fill(30));

  // Frecuencias centrales normalizadas de bandas de octava (IEC 61260)
  const octaveCenters = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const octaveLabels = ['31.5', '63', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

  // Fase para generar onda ambiental viva cuando la máquina está en reposo
  const ambientPhaseRef = useRef<number>(0);

  // Actualizar historial SPL cada 60ms
  useEffect(() => {
    const now = performance.now();
    if (now - lastHistoryPushRef.current > 50) {
      lastHistoryPushRef.current = now;
      const history = splHistoryRef.current;
      history.push({
        time: now,
        spl: instantSPL,
        peak: lpeak
      });
      // Mantener últimos 160 puntos (~10 segundos de registro continuo)
      if (history.length > 160) {
        history.shift();
      }
    }
  }, [instantSPL, lpeak]);

  useEffect(() => {
    const render = () => {
      const oscCanvas = oscCanvasRef.current;
      const rtaCanvas = rtaCanvasRef.current;
      const historyCanvas = historyCanvasRef.current;
      const analyser = acousticEngine.getAnalyser();
      ambientPhaseRef.current += 0.08;

      // =========================================================================
      // 1. FORMA DE ONDA DE RUIDO p(t) - OSCILOSCOPIO ACÚSTICO
      // =========================================================================
      if (oscCanvas) {
        const ctx = oscCanvas.getContext('2d');
        if (ctx) {
          const w = oscCanvas.width;
          const h = oscCanvas.height;

          // Fondo oscuro tipo pantalla CRT de fósforo verde militar
          ctx.fillStyle = '#031008';
          ctx.fillRect(0, 0, w, h);

          // Retícula milimetrada verde fósforo
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.lineWidth = 1;

          // Divisiones de tiempo (verticales)
          const cols = 10;
          for (let i = 0; i <= cols; i++) {
            const x = (w / cols) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }

          // Divisiones de presión acústica (horizontales)
          const rows = 8;
          for (let i = 0; i <= rows; i++) {
            const y = (h / rows) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          // Eje central de referencia (0 Pascales / Presión atmosférica estática P0)
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Escala de calibración de presión sonora en Pascales (Pa)
          ctx.fillStyle = 'rgba(110, 231, 183, 0.85)';
          ctx.font = '9px monospace';
          ctx.fillText('+1.5 Pa (Pico)', 6, 13);
          ctx.fillText(' 0.0 Pa (Ref 20 µPa)', 6, h / 2 - 4);
          ctx.fillText('-1.5 Pa', 6, h - 6);
          ctx.fillText('5 ms/div', w - 55, h - 6);

          // TRAZO DE LA ONDA DE RUIDO
          if (analyser && isActive) {
            // Onda física real proveniente del motor Web Audio
            const bufferLength = analyser.fftSize;
            const timeData = new Float32Array(bufferLength);
            analyser.getFloatTimeDomainData(timeData);

            ctx.lineWidth = 2.2;
            ctx.strokeStyle = isCalibrating ? '#38bdf8' : '#22c55e';
            ctx.shadowBlur = 10;
            ctx.shadowColor = isCalibrating ? 'rgba(56, 189, 248, 0.9)' : 'rgba(34, 197, 94, 0.9)';

            ctx.beginPath();
            const sliceWidth = w / (bufferLength / 2);
            let x = 0;

            for (let i = 0; i < bufferLength / 2; i++) {
              const v = timeData[i] * 1.9; // Ganancia visual para visualización clara
              const y = (h / 2) - (v * (h / 2.2));

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              x += sliceWidth;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else {
            // Ruido de fondo ambiente industrial simulado (~42 dBA)
            // Permite ver la onda de ruido rizado en reposo en vez de una línea muerta
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.75)';
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
            ctx.beginPath();

            const p = ambientPhaseRef.current;
            for (let x = 0; x < w; x += 2) {
              const ambientNoise =
                Math.sin(x * 0.04 + p) * 4 +
                Math.sin(x * 0.09 - p * 1.5) * 2.5 +
                (Math.random() - 0.5) * 3;
              const y = h / 2 + ambientNoise;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // =========================================================================
      // 2. REGISTRADOR DE NIVEL DE PRESIÓN SONORA (dB SPL vs TIEMPO)
      // =========================================================================
      if (historyCanvas) {
        const ctx = historyCanvas.getContext('2d');
        if (ctx) {
          const w = historyCanvas.width;
          const h = historyCanvas.height;

          // Fondo
          ctx.fillStyle = '#060a14';
          ctx.fillRect(0, 0, w, h);

          // Líneas de referencia normativas (40 dB, 80 dB Acción, 85 dB TLV, 140 dB Peak)
          const leftPad = 36;
          const bottomPad = 18;
          const chartW = w - leftPad - 10;
          const chartH = h - bottomPad - 10;

          // Escala dB de 40 a 140 dB
          const minDb = 40;
          const maxDb = 140;
          const dbToY = (db: number) => {
            const clamped = Math.max(minDb, Math.min(maxDb, db));
            return 10 + chartH * (1 - (clamped - minDb) / (maxDb - minDb));
          };

          // Cuadrícula horizontal
          [40, 60, 80, 85, 100, 120, 140].forEach((dbVal) => {
            const y = dbToY(dbVal);
            ctx.strokeStyle =
              dbVal === 85
                ? 'rgba(239, 68, 68, 0.6)'
                : dbVal === 80
                ? 'rgba(245, 158, 11, 0.5)'
                : dbVal === 140
                ? 'rgba(220, 38, 38, 0.8)'
                : 'rgba(51, 65, 85, 0.35)';
            ctx.lineWidth = dbVal === 85 || dbVal === 140 ? 1.5 : 1;
            ctx.setLineDash(dbVal === 85 || dbVal === 80 ? [3, 3] : []);
            ctx.beginPath();
            ctx.moveTo(leftPad, y);
            ctx.lineTo(w - 10, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Texto de decibelios
            ctx.fillStyle =
              dbVal === 85
                ? '#f87171'
                : dbVal === 80
                ? '#fbbf24'
                : dbVal === 140
                ? '#ef4444'
                : '#64748b';
            ctx.font = '8px monospace';
            ctx.fillText(`${dbVal}`, 4, y + 3);
          });

          // Trazado de la curva SPL continua en el tiempo
          const history = splHistoryRef.current;
          if (history.length > 1) {
            // 1. Relleno bajo la curva
            const grad = ctx.createLinearGradient(0, dbToY(100), 0, dbToY(40));
            grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
            grad.addColorStop(1, 'rgba(16, 185, 129, 0.05)');

            ctx.beginPath();
            ctx.moveTo(leftPad, dbToY(minDb));
            for (let i = 0; i < history.length; i++) {
              const x = leftPad + (i / (history.length - 1)) * chartW;
              const y = dbToY(history[i].spl);
              ctx.lineTo(x, y);
            }
            ctx.lineTo(leftPad + chartW, dbToY(minDb));
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // 2. Línea de trazo de SPL instantáneo
            ctx.beginPath();
            for (let i = 0; i < history.length; i++) {
              const x = leftPad + (i / (history.length - 1)) * chartW;
              const y = dbToY(history[i].spl);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // 3. Pico actual marcado
            const lastPoint = history[history.length - 1];
            const lastX = leftPad + chartW;
            const lastY = dbToY(lastPoint.spl);
            ctx.beginPath();
            ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Etiqueta del valor instantáneo al final
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`${lastPoint.spl.toFixed(1)} dB`, lastX - 45, Math.max(18, lastY - 6));
          }

          // Eje de tiempo inferior
          ctx.fillStyle = '#64748b';
          ctx.font = '8px monospace';
          ctx.fillText('-10 s', leftPad, h - 5);
          ctx.fillText('-5 s', leftPad + chartW / 2 - 10, h - 5);
          ctx.fillText('Ahora (t)', leftPad + chartW - 35, h - 5);
        }
      }

      // =========================================================================
      // 3. ANALIZADOR DE ESPECTRO EN TIEMPO REAL (RTA - BANDAS DE OCTAVA)
      // =========================================================================
      if (rtaCanvas) {
        const ctx = rtaCanvas.getContext('2d');
        if (ctx) {
          const w = rtaCanvas.width;
          const h = rtaCanvas.height;

          ctx.fillStyle = '#080e1c';
          ctx.fillRect(0, 0, w, h);

          // Cuadrícula horizontal de nivel en decibeles (30 dB a 120 dB)
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
          ctx.lineWidth = 1;
          const dbSteps = [110, 90, 70, 50, 30];
          dbSteps.forEach((dbVal) => {
            const y = (1 - (dbVal - 30) / 90) * (h - 26) + 6;
            ctx.beginPath();
            ctx.moveTo(35, y);
            ctx.lineTo(w - 5, y);
            ctx.stroke();

            // Etiqueta de decibelios a la izquierda
            ctx.fillStyle = '#64748b';
            ctx.font = '9px monospace';
            ctx.fillText(`${dbVal}dB`, 2, y + 3);
          });

          // Obtención de datos del Analizador FFT
          const bandLevels = new Array(10).fill(30);

          if (analyser && isActive) {
            const freqData = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(freqData);

            const binWidth = 48000 / analyser.fftSize;

            octaveCenters.forEach((centerFreq, index) => {
              const lowerBound = centerFreq / Math.SQRT2;
              const upperBound = centerFreq * Math.SQRT2;

              let powerSum = 0;
              const minBin = Math.floor(lowerBound / binWidth);
              const maxBin = Math.ceil(upperBound / binWidth);

              for (let k = minBin; k <= maxBin; k++) {
                if (k < freqData.length) {
                  const dbVal = freqData[k];
                  if (dbVal > -120) {
                    const f = k * binWidth;
                    const weight = freqWeighting === 'A' ? getAWeighting(f) : getCWeighting(f);
                    powerSum += Math.pow(10, (dbVal + weight) / 10);
                  }
                }
              }

              const bandDb = powerSum > 1e-12 ? 10 * Math.log10(powerSum) + 115 : 30;
              bandLevels[index] = Math.max(30, Math.min(125, bandDb));

              // Actualización de Peak Hold
              if (bandLevels[index] > peakHoldBars.current[index]) {
                peakHoldBars.current[index] = bandLevels[index];
              } else {
                peakHoldBars.current[index] = Math.max(
                  30,
                  peakHoldBars.current[index] - 0.35
                );
              }
            });
          } else {
            // Nivel ambiente suave en reposo para mostrar espectro vivo
            octaveCenters.forEach((_, idx) => {
              const ambientVal = 38 + Math.sin(ambientPhaseRef.current + idx * 0.8) * 3 + Math.random() * 2;
              bandLevels[idx] = ambientVal;
              if (ambientVal > peakHoldBars.current[idx]) {
                peakHoldBars.current[idx] = ambientVal;
              } else {
                peakHoldBars.current[idx] = Math.max(30, peakHoldBars.current[idx] - 0.4);
              }
            });
          }

          // Dibujar barras del espectrograma
          const chartLeft = 38;
          const chartWidth = w - chartLeft - 8;
          const barSpacing = 4;
          const barWidth = (chartWidth - (10 - 1) * barSpacing) / 10;
          const bottomY = h - 18;

          bandLevels.forEach((level, i) => {
            const x = chartLeft + i * (barWidth + barSpacing);
            const barHeight = ((level - 30) / 90) * (bottomY - 8);
            const y = bottomY - barHeight;

            // Degradado de color según el riesgo industrial
            const gradient = ctx.createLinearGradient(0, bottomY, 0, y);
            if (level >= 85) {
              gradient.addColorStop(0, '#10b981');
              gradient.addColorStop(0.6, '#f59e0b');
              gradient.addColorStop(1, '#ef4444');
            } else if (level >= 80) {
              gradient.addColorStop(0, '#10b981');
              gradient.addColorStop(1, '#eab308');
            } else {
              gradient.addColorStop(0, '#047857');
              gradient.addColorStop(1, '#10b981');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Línea de retención de pico (Peak Hold Tick)
            const peakY = bottomY - ((peakHoldBars.current[i] - 30) / 90) * (bottomY - 8);
            ctx.fillStyle = '#f87171';
            ctx.fillRect(x, peakY - 1, barWidth, 2);

            // Etiqueta de frecuencia de la banda (centrada)
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(octaveLabels[i], x + barWidth / 2, h - 5);
          });
          ctx.textAlign = 'left';
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [freqWeighting, isActive, isCalibrating]);

  return (
    <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-3.5 relative overflow-hidden flex flex-col gap-3">
      {/* Tornillería Allen de fijación en el marco de instrumentación */}
      <div className="absolute top-2.5 left-2.5 cad-allen-bolt" />
      <div className="absolute top-2.5 right-2.5 cad-allen-bolt" />

      {/* Cabecera del Panel de Gráficas Acústicas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-2 px-1 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg cad-chassis-faceplate cad-bevel-panel-subtle flex items-center justify-center text-[#f97316]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>METROLOGÍA DE SEÑAL ACÚSTICA</span>
              <span className="text-[10px] text-slate-400 font-mono">
                · 60 FPS DSP
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Onda de presión sonora p(t), nivel dB vs tiempo y analizador espectral RTA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de modo temporal con botones biselados mecanizados */}
          <div className="flex items-center cad-gunmetal p-1 rounded-lg border border-slate-700/70 text-xs">
            <button
              onClick={() => setTimeGraphMode('onda')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                timeGraphMode === 'onda'
                  ? 'cad-orange-btn font-bold text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver forma de onda física osciloscópica p(t)"
            >
              <Waves className="w-3 h-3" />
              <span>Onda p(t)</span>
            </button>
            <button
              onClick={() => setTimeGraphMode('historial')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                timeGraphMode === 'historial'
                  ? 'cad-orange-btn font-bold text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver registrador temporal de Nivel de Presión Sonora (dB vs Tiempo)"
            >
              <TrendingUp className="w-3 h-3" />
              <span>Nivel SPL (t)</span>
            </button>
            <button
              onClick={() => setTimeGraphMode('ambos')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                timeGraphMode === 'ambos'
                  ? 'cad-orange-btn font-bold text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver ambas gráficas temporales a la vez"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Todas</span>
            </button>
          </div>

          <span className="px-2.5 py-1 rounded-lg cad-gunmetal border border-slate-700/80 text-[#f97316] font-mono text-[11px] font-bold">
            Ponderación: dB({freqWeighting})
          </span>
        </div>
      </div>

      {/* Grid de Gráficas: Onda de Ruido Temporal + Analizador Espectral de Octavas */}
      <div className={`grid grid-cols-1 ${timeGraphMode === 'ambos' ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
        {/* 1. Osciloscopio Acústico: Onda de Ruido en el Dominio del Tiempo */}
        {(timeGraphMode === 'onda' || timeGraphMode === 'ambos') && (
          <div className="cad-gunmetal rounded-xl p-3 cad-bevel-panel-subtle flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <Waves className="w-3.5 h-3.5" />
                ONDA DE PRESIÓN p(t)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Presión en Pascales (Pa)</span>
            </div>

            <div className="relative cad-inset-well rounded-lg overflow-hidden border border-emerald-900/60 aspect-[16/10]">
              <canvas
                ref={oscCanvasRef}
                width={560}
                height={320}
                className="w-full h-full block"
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-mono">
              <span className="text-emerald-400">±1.5 Pa Escala</span>
              <span>Trigger: Auto-Zero</span>
              <span className="text-slate-400">IEC 61672 Clase 1</span>
            </div>
          </div>
        )}

        {/* 2. Registrador Continuo: Nivel de Presión Sonora (dB vs Tiempo) */}
        {(timeGraphMode === 'historial' || timeGraphMode === 'ambos') && (
          <div className="cad-gunmetal rounded-xl p-3 cad-bevel-panel-subtle flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#f97316] flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                NIVEL Lp EN EL TIEMPO (dB vs t)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Registro 10s</span>
            </div>

            <div className="relative cad-inset-well rounded-lg overflow-hidden border border-[#ea580c]/40 aspect-[16/10]">
              <canvas
                ref={historyCanvasRef}
                width={560}
                height={320}
                className="w-full h-full block"
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-mono">
              <span className="text-[#f97316] font-bold">Lp: {instantSPL.toFixed(1)} dB</span>
              <span className="text-amber-400">TLV: 85 dB</span>
              <span className="text-rose-400">Peak: {lpeak.toFixed(1)} dB</span>
            </div>
          </div>
        )}

        {/* 3. Analizador de Espectro por Bandas de Octava (RTA) */}
        <div className="cad-gunmetal rounded-xl p-3 cad-bevel-panel-subtle flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
              <BarChart2 className="w-3.5 h-3.5" />
              ESPECTRO RTA (BANDAS DE OCTAVA)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">31.5 Hz a 16 kHz</span>
          </div>

          <div className="relative cad-inset-well rounded-lg overflow-hidden border border-cyan-950/80 aspect-[16/10]">
            <canvas
              ref={rtaCanvasRef}
              width={560}
              height={320}
              className="w-full h-full block"
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-mono">
            <span className="text-emerald-400">&lt;80 dB</span>
            <span className="text-amber-400">80-84 dB</span>
            <span className="text-[#f97316]">&ge;85 dB</span>
            <span className="text-rose-400">Peak Hold: ON</span>
          </div>
        </div>
      </div>
    </div>
  );
};
