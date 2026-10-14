import React, { useEffect, useRef, useState } from 'react';
import { SoundSource, NoiseGeneratorPoint } from '../types';
import {
  Activity,
  Volume2,
  ShieldCheck,
  Zap,
  Flame,
  Wind,
  Maximize2,
  Info,
  Radio,
  Sliders
} from 'lucide-react';

interface HyperRealisticMachineViewProps {
  source: SoundSource;
  isActive: boolean;
  distance: number;
  onSelectGenerator?: (gen: NoiseGeneratorPoint) => void;
  selectedGenerator?: NoiseGeneratorPoint | null;
}

export const HyperRealisticMachineView: React.FC<HyperRealisticMachineViewProps> = ({
  source,
  isActive,
  distance,
  onSelectGenerator,
  selectedGenerator
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showAcousticWaves, setShowAcousticWaves] = useState<boolean>(true);

  // Sistema de partículas dinámicas para chispas, virutas, calor y ondas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Array de chispas balísticas para la pulidora y martinete
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
    }
    const sparks: Spark[] = [];

    // Partículas de virutas para la sierra circular
    interface Chip {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
    }
    const chips: Chip[] = [];

    // Partículas de humo / vapor / calor
    interface Vapor {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }
    const vapors: Vapor[] = [];

    const render = () => {
      time += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Efectos específicos de maquinaria activa
      if (isActive) {
        // --- A. PULIDORA ANGULAR: LLUVIA DE CHISPAS BALÍSTICAS ---
        if (source.id === 'pulidora') {
          // Emitir 12-20 nuevas chispas por frame
          const originX = w * 0.47;
          const originY = h * 0.72;

          for (let i = 0; i < 14; i++) {
            const angle = Math.PI * 0.15 + (Math.random() - 0.5) * 0.45;
            const speed = 6 + Math.random() * 12;
            const colors = ['#ffffff', '#ffedd5', '#fed7aa', '#f97316', '#ea580c', '#ef4444'];
            sparks.push({
              x: originX,
              y: originY,
              vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
              vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
              alpha: 1.0,
              size: 1 + Math.random() * 2.2,
              color: colors[Math.floor(Math.random() * colors.length)],
              life: 0,
              maxLife: 30 + Math.random() * 25
            });
          }

          // Resplandor térmico en la zona de corte (HAZ)
          const radGrad = ctx.createRadialGradient(originX, originY, 4, originX, originY, 65);
          radGrad.addColorStop(0, 'rgba(255, 237, 213, 0.9)');
          radGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.6)');
          radGrad.addColorStop(0.7, 'rgba(234, 88, 12, 0.2)');
          radGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(originX, originY, 65, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- B. MARTINETE DE FORJA: IMPACTO, RESPLANDOR Y ESCAMAS ---
        if (source.id === 'martinete') {
          const anvilX = w * 0.50;
          const anvilY = h * 0.69;

          // Ciclo de golpeo periódico (cada 1.2 segundos aprox)
          const strikeCycle = (time * 1.5) % Math.PI;
          const isStrikeMoment = Math.sin(strikeCycle) > 0.95;

          if (isStrikeMoment) {
            // Emisión de chispas de escamas al golpear
            for (let i = 0; i < 22; i++) {
              const angle = (Math.random() - 0.5) * Math.PI * 1.6 - Math.PI * 0.5;
              const speed = 4 + Math.random() * 10;
              sparks.push({
                x: anvilX,
                y: anvilY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                size: 1.5 + Math.random() * 2.5,
                color: '#fed7aa',
                life: 0,
                maxLife: 25 + Math.random() * 20
              });
            }
          }

          // Resplandor térmico de la barra al rojo vivo (1100°C)
          const glowGrad = ctx.createRadialGradient(anvilX, anvilY, 8, anvilX, anvilY, 80);
          glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          glowGrad.addColorStop(0.2, 'rgba(251, 146, 60, 0.7)');
          glowGrad.addColorStop(0.6, 'rgba(234, 88, 12, 0.3)');
          glowGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(anvilX, anvilY, 80, 0, Math.PI * 2);
          ctx.fill();

          // Emisión de vapor / humo térmico ascendente
          if (Math.random() < 0.4) {
            vapors.push({
              x: anvilX + (Math.random() - 0.5) * 30,
              y: anvilY - 10,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -1.2 - Math.random() * 1.2,
              radius: 6 + Math.random() * 10,
              alpha: 0.35
            });
          }
        }

        // --- C. SIERRA CIRCULAR: CORTE Y VIRUTAS DE ALUMINIO ---
        if (source.id === 'sierra') {
          const cutX = w * 0.51;
          const cutY = h * 0.64;

          for (let i = 0; i < 8; i++) {
            chips.push({
              x: cutX,
              y: cutY,
              vx: 3 + Math.random() * 8,
              vy: -2 + (Math.random() - 0.5) * 6,
              alpha: 0.9,
              size: 1 + Math.random() * 2
            });
          }

          // Línea de corte láser rojo proyectada en la pieza
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(cutX - 120, cutY + 2);
          ctx.lineTo(cutX + 120, cutY + 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // --- D. TURBINA: FLUJO DE AIRE TURBULENTO EN BOCA DE DESCARGA ---
        if (source.id === 'turbina') {
          const nozzleX = w * 0.74;
          const nozzleY = h * 0.36;

          // Dibujar líneas aerodinámicas de velocidad de aire
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 5; i++) {
            const offset = (time * 80 + i * 40) % 220;
            const yOff = nozzleY + (i - 2) * 8;
            ctx.beginPath();
            ctx.moveTo(nozzleX + offset, yOff);
            ctx.lineTo(nozzleX + offset + 25, yOff);
            ctx.stroke();
          }
        }

        // --- E. FRENTES DE ONDA ACÚSTICA RADIALES (SPL EN VIVO) ---
        if (showAcousticWaves) {
          const centerX = w * 0.5;
          const centerY = h * 0.55;
          const numWaves = 4;
          for (let i = 0; i < numWaves; i++) {
            const waveProgress = ((time * 0.8 + i / numWaves) % 1);
            const radius = waveProgress * Math.min(w, h) * 0.55;
            const waveAlpha = Math.max(0, (1 - waveProgress) * 0.28);

            ctx.strokeStyle = source.category === 'impacto'
              ? `rgba(244, 63, 94, ${waveAlpha})`
              : `rgba(249, 115, 22, ${waveAlpha})`;
            ctx.lineWidth = 2 + (1 - waveProgress) * 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // 2. Renderizado de partículas de vapor / calor
      for (let i = vapors.length - 1; i >= 0; i--) {
        const v = vapors[i];
        v.x += v.vx;
        v.y += v.vy;
        v.radius += 0.25;
        v.alpha -= 0.006;

        if (v.alpha <= 0) {
          vapors.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(226, 232, 240, ${v.alpha})`;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Renderizado de partículas de virutas
      for (let i = chips.length - 1; i >= 0; i--) {
        const c = chips[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.35; // Gravedad
        c.alpha -= 0.025;

        if (c.alpha <= 0 || c.y > h * 0.85) {
          chips.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(241, 245, 249, ${c.alpha})`;
        ctx.fillRect(c.x, c.y, c.size, c.size);
      }

      // 4. Renderizado y física balística de chispas
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.28; // Gravedad
        s.life++;
        s.alpha = Math.max(0, 1 - s.life / s.maxLife);

        // Rebote en el suelo del taller industrial
        if (s.y >= h * 0.85) {
          s.y = h * 0.85;
          s.vy = -s.vy * 0.35;
          s.vx *= 0.7;
        }

        if (s.life >= s.maxLife || s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 1.5, s.y - s.vy * 1.5);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, source.id, showAcousticWaves]);

  return (
    <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-3 sm:p-4 text-slate-100 relative overflow-hidden flex flex-col gap-3">
      
      {/* Tornillería Allen de fijación en las esquinas */}
      <div className="absolute top-2.5 left-2.5 cad-allen-bolt z-20" />
      <div className="absolute top-2.5 right-2.5 cad-allen-bolt z-20" />

      {/* Barra Superior: Título de Maquinaria y Modo Fotorrealista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-700/80 px-1 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-[#ea580c] shadow-[0_0_12px_rgba(234,88,12,0.9)] animate-pulse' : 'bg-slate-600'}`}></span>
            <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-white flex items-center gap-2">
              {source.name}
            </h2>
            <span className="text-[10px] font-mono font-bold bg-[#ea580c]/20 text-[#ea580c] px-2 py-0.5 rounded border border-[#ea580c]/40 uppercase">
              HD FOTORREALISTA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            {source.description}
          </p>
        </div>

        {/* Controles de visualización fotográfica */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all border ${
              showHotspots
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Activar/Desactivar balizas de focos de ruido acústico ISO 9612"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Focos ISO 9612: {showHotspots ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowAcousticWaves(!showAcousticWaves)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all border ${
              showAcousticWaves
                ? 'bg-[#ea580c]/20 text-[#ea580c] border-[#ea580c]/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Visualizar frentes de onda de presión sonora dinámicos"
          >
            <Activity className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Ondas SPL: {showAcousticWaves ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONTENEDOR DEL ESCENARIO INDUSTRIAL HIPERREALISTA
          Renderizado fotográfico en capas con física de partículas en tiempo real
          ========================================================================= */}
      <div className="relative w-full aspect-[16/9] min-h-[360px] sm:min-h-[440px] bg-gradient-to-b from-[#0b0e14] via-[#121721] to-[#0a0d12] rounded-xl border border-slate-700/80 overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* Capa 1: Fondo de Nave Industrial (Taller con iluminación volumétrica y vigas de acero) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,#38bdf8_0%,transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>

        {/* Capa 2: Suelo de Taller Industrial de Hormigón Epoxi Pulido con Reflejo Especular */}
        <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-gradient-to-t from-[#0e1217] via-[#151a22] to-[#1c222c] border-t border-slate-700/60 shadow-inner">
          {/* Línea de demarcación de seguridad peatonal amarilla / negra industrial */}
          <div className="w-full h-1.5 bg-[repeating-linear-gradient(45deg,#f59e0b_0px,#f59e0b_12px,#0f172a_12px,#0f172a_24px)] opacity-60"></div>
          {/* Sombra de contacto suave y difusa de la máquina */}
          <div className="w-3/4 h-12 mx-auto bg-black/80 blur-xl rounded-full mt-2"></div>
        </div>

        {/* Capa 3: Ilustración Fotorrealista Vectorial Paramétrica de Alta Resolución de la Máquina */}
        <div className={`relative z-10 w-full h-full flex items-center justify-center p-4 transition-transform duration-700 ${isActive ? 'scale-[1.01]' : 'scale-100'}`}>
          <RealisticMachineIllustration sourceId={source.id} isActive={isActive} />
        </div>

        {/* Capa 4: Canvas de Partículas Dinámicas en Tiempo Real (Chispas, Vapor, Ondas, Luz) */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
        />

        {/* Capa 5: Balizas Interactivas de Focos Acústicos ISO 9612 con Banderolas de Inspección */}
        {showHotspots && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            {source.noiseGenerators.map((gen, index) => {
              const isSelected = selectedGenerator?.id === gen.id || activePin === gen.id;
              return (
                <div
                  key={gen.id}
                  style={{ left: `${gen.relativeX}%`, top: `${gen.relativeY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                  onClick={() => {
                    setActivePin(gen.id);
                    if (onSelectGenerator) onSelectGenerator(gen);
                  }}
                >
                  {/* Baliza Luminosa Pulsante */}
                  <div className="relative flex items-center justify-center">
                    <span className={`absolute w-7 h-7 rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#ea580c] animate-ping opacity-75'
                        : 'bg-amber-500/60 group-hover:animate-ping opacity-50'
                    }`}></span>
                    <span className={`relative w-4 h-4 rounded-full border-2 border-white flex items-center justify-center font-mono font-bold text-[8px] text-white shadow-lg ${
                      isSelected ? 'bg-[#ea580c] scale-125' : 'bg-slate-900 group-hover:bg-amber-600'
                    }`}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Banderola de Inspección Metrológica SolidWorks MBD */}
                  <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-200 pointer-events-none whitespace-nowrap ${
                    isSelected
                      ? 'opacity-100 scale-100 z-40'
                      : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                  }`}>
                    <div className="bg-[#0f141c]/95 text-slate-100 px-2.5 py-1.5 rounded-lg border border-[#ea580c] shadow-[0_4px_16px_rgba(0,0,0,0.8)] font-mono text-[10px] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-3 font-bold border-b border-slate-700/80 pb-0.5">
                        <span className="text-[#ea580c]">F{index + 1}: {gen.name}</span>
                        <span className="bg-[#ea580c] text-slate-950 px-1 py-0.2 rounded font-black text-[9px]">
                          {gen.splContribution} dB(A)
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400">
                        Banda: <strong className="text-slate-200">{gen.freqRange}</strong>
                      </div>
                      <div className="text-[8px] text-slate-500 max-w-[200px] truncate">
                        {gen.type}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Indicador de Distancia Virtual del Inspector Acústico */}
        <div className="absolute top-3 left-3 z-30 bg-[#0e131b]/85 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
          <span>DISTANCIA AL SONÓMETRO: <strong className="text-white">{distance.toFixed(1)} m</strong></span>
          <span className="text-slate-500">(-{Math.round(20 * Math.log10(distance))} dB)</span>
        </div>

        {/* Indicador de Pico Espectral */}
        <div className="absolute top-3 right-3 z-30 bg-[#0e131b]/85 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <span className="text-slate-400">PICO ESPECTRAL:</span>
          <strong className="text-amber-400">{source.spectralPeak}</strong>
        </div>
      </div>

      {/* Tarjeta Inferior de Mecanismo Físico de Generación Acústica del Componente Seleccionado */}
      <div className="cad-gunmetal cad-bevel-panel-subtle rounded-xl p-3 border border-slate-700/80 text-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5 mb-2">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
            <Info className="w-4 h-4 text-[#ea580c]" />
            <span>ANÁLISIS DEL FOCO ACÚSTICO SELECCIONADO</span>
          </div>
          <span className="text-[11px] font-mono text-[#ea580c]">
            {selectedGenerator ? `${selectedGenerator.splContribution} dB(A) @ 1m` : `${source.baseSPL} dB(A) Global`}
          </span>
        </div>

        {selectedGenerator ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-sans">
            <div>
              <span className="text-slate-400 block font-mono text-[10px]">Componente Físico:</span>
              <strong className="text-slate-100 font-medium">{selectedGenerator.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px]">Tipo de Fenómeno Acústico:</span>
              <span className="text-amber-300 font-medium">{selectedGenerator.type} ({selectedGenerator.freqRange})</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px]">Mecanismo de Generación:</span>
              <p className="text-slate-300 text-[11px] leading-tight">{selectedGenerator.mechanism}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-xs">
            Haga clic en cualquiera de las balizas numeradas para inspeccionar el fenómeno físico generador de ruido.
          </p>
        )}
      </div>

    </div>
  );
};

// =========================================================================
// ILUSTRACIONES HIPERREALISTAS VECTORIALES CON DETALLE INDUSTRIAL
// =========================================================================
interface RealisticIllustrationProps {
  sourceId: string;
  isActive: boolean;
}

const RealisticMachineIllustration: React.FC<RealisticIllustrationProps> = ({ sourceId, isActive }) => {
  switch (sourceId) {
    case 'compresor':
      return <RealisticCompressorIllustration isActive={isActive} />;
    case 'turbina':
      return <RealisticTurbineIllustration isActive={isActive} />;
    case 'sierra':
      return <RealisticCircularSawIllustration isActive={isActive} />;
    case 'pulidora':
      return <RealisticAngleGrinderIllustration isActive={isActive} />;
    case 'troqueladora':
      return <RealisticPunchPressIllustration isActive={isActive} />;
    case 'martinete':
      return <RealisticForgingHammerIllustration isActive={isActive} />;
    default:
      return <div className="text-slate-400">Ilustración no disponible</div>;
  }
};

// 1. COMPRESOR DE TORNILLO KAESER CSDX 165
const RealisticCompressorIllustration: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 800 480" className="w-full h-full max-h-[380px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]">
    <defs>
      <linearGradient id="kaeserYellowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="anthraciteGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="steelPipeGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>

    {/* Sombra proyectada en el suelo */}
    <ellipse cx="400" cy="440" rx="320" ry="18" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />

    {/* Chasis UPN de Acero con cajeras para horquillas de montacargas */}
    <rect x="120" y="405" width="560" height="25" rx="4" fill="url(#anthraciteGrad)" stroke="#475569" strokeWidth="2" />
    <rect x="220" y="413" width="70" height="12" rx="2" fill="#090d16" />
    <rect x="510" y="413" width="70" height="12" rx="2" fill="#090d16" />

    {/* Carcasa Acústica Principal en Amarillo Kaeser SIGMA */}
    <rect x="130" y="160" width="540" height="248" rx="8" fill="url(#kaeserYellowGrad)" stroke="#b45309" strokeWidth="2" />

    {/* Paneles de Puerta con Juntas de Goma Acústica y Tornillería */}
    <rect x="140" y="172" width="250" height="224" rx="4" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="12 4" />
    <rect x="410" y="172" width="250" height="224" rx="4" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="12 4" />

    {/* Rejillas de Ventilación Acústica Microperforadas en Antracita */}
    <rect x="155" y="185" width="220" height="70" rx="4" fill="url(#anthraciteGrad)" stroke="#0f172a" strokeWidth="2" />
    {[...Array(6)].map((_, i) => (
      <rect key={i} x="165" y={194 + i * 10} width="200" height="3" rx="1.5" fill="#334155" />
    ))}

    {/* Chimenea Silenciadora de Admisión Superior */}
    <path d="M 180 160 L 195 90 L 325 90 L 340 160 Z" fill="url(#anthraciteGrad)" stroke="#475569" strokeWidth="2" />
    <rect x="205" y="80" width="110" height="14" rx="3" fill="#475569" stroke="#64748b" strokeWidth="1" />
    {/* Rejilla de aspiración con flechas de flujo si está activo */}
    {isActive && (
      <g opacity="0.8">
        <line x1="260" y1="50" x2="260" y2="75" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 3" />
        <polygon points="255,75 265,75 260,82" fill="#38bdf8" />
      </g>
    )}

    {/* Pantalla Touchscreen SIGMA CONTROL 2 con Indicadores Reales */}
    <rect x="430" y="185" width="130" height="90" rx="6" fill="#090d16" stroke="#475569" strokeWidth="3" />
    <rect x="438" y="193" width="114" height="74" rx="3" fill={isActive ? '#042f2e' : '#021817'} />
    <text x="445" y="210" fill="#2dd4bf" fontSize="10" fontFamily="monospace" fontWeight="bold">SIGMA CONTROL</text>
    <text x="445" y="228" fill="#5eead4" fontSize="14" fontFamily="monospace" fontWeight="bold">
      {isActive ? '8.45 bar' : '0.00 bar'}
    </text>
    <text x="445" y="244" fill="#99f6e4" fontSize="9" fontFamily="monospace">
      {isActive ? 'T: 82.4°C · CARGA' : 'PARADA / STANDBY'}
    </text>
    {/* Barra de Carga */}
    <rect x="445" y="252" width="100" height="5" rx="2" fill="#134e4a" />
    <rect x="445" y="252" width={isActive ? '85' : '0'} height="5" rx="2" fill="#2dd4bf" />

    {/* Visor de Nivel de Aceite Sintético de Refrigeración (ISO VG 46) */}
    <rect x="585" y="210" width="18" height="50" rx="9" fill="#090d16" stroke="#475569" strokeWidth="2" />
    <rect x="588" y="222" width="12" height="32" rx="4" fill="#f59e0b" opacity="0.9" />
    <line x1="585" y1="230" x2="603" y2="230" stroke="#ef4444" strokeWidth="1" />
    <line x1="585" y1="245" x2="603" y2="245" stroke="#10b981" strokeWidth="1" />

    {/* Tuberías de Acero Inoxidable de Descarga y Mangueras Flexibles */}
    <path d="M 640 280 L 685 280 L 685 360 L 660 360" fill="none" stroke="url(#steelPipeGrad)" strokeWidth="14" strokeLinecap="round" />
    <circle cx="685" cy="280" r="10" fill="#475569" />

    {/* Manómetro Analógico de Presión de Aceite de Latón */}
    <circle cx="595" cy="295" r="14" fill="#f8fafc" stroke="#d97706" strokeWidth="3" />
    <line x1="595" y1="295" x2="602" y2="290" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />

    {/* Logotipo Kaeser Kompressoren */}
    <text x="160" y="380" fill="#0f172a" fontSize="24" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
      KAESER
    </text>
    <text x="160" y="395" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1">
      KOMPRESSOREN CSDX 165
    </text>

    {/* Parada de Emergencia Tipo Seta Roja */}
    <circle cx="630" cy="200" r="12" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
    <circle cx="630" cy="200" r="8" fill="#ef4444" />
  </svg>
);

// 2. TURBINA CENTRÍFUGA INDUSTRIAL DE TIRO INDUCIDO
const RealisticTurbineIllustration: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 800 480" className="w-full h-full max-h-[380px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]">
    <defs>
      <linearGradient id="voluteGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="motorBlueGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="50%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
    </defs>

    <ellipse cx="400" cy="440" rx="340" ry="18" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />

    {/* Bancada Estructural de Vigas I-Beam */}
    <rect x="100" y="410" width="600" height="22" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />

    {/* Gran Carcasa Espiral / Voluta de Fundición Gris */}
    <path
      d="M 260 410 C 160 380 120 270 160 170 C 200 80 320 60 420 80 C 470 90 530 110 570 150 L 660 150 L 660 250 L 520 250 C 530 350 420 410 260 410 Z"
      fill="url(#voluteGrad)"
      stroke="#1e293b"
      strokeWidth="4"
    />

    {/* Boca de Descarga Rectangular con Brida Apernada */}
    <rect x="580" y="140" width="85" height="115" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
    {[...Array(6)].map((_, i) => (
      <circle key={i} cx="655" cy={155 + i * 18} r="3" fill="#94a3b8" />
    ))}

    {/* Brida de Aspiración Circular Frontal con Rejilla */}
    <circle cx="330" cy="240" r="95" fill="#1e293b" stroke="#64748b" strokeWidth="6" />
    <circle cx="330" cy="240" r="75" fill="#0f172a" />
    {/* Álabes Curvos Girando dentro de la Carcasa */}
    <g transform={`rotate(${isActive ? 45 : 0} 330 240)`}>
      {[...Array(8)].map((_, i) => (
        <path
          key={i}
          d="M 330 240 Q 360 200 395 195"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="6"
          strokeLinecap="round"
          transform={`rotate(${i * 45} 330 240)`}
        />
      ))}
      <circle cx="330" cy="240" r="22" fill="#cbd5e1" stroke="#475569" strokeWidth="4" />
    </g>

    {/* Chumaceras de Cojinete y Eje Macizo de Transmisión */}
    <rect x="220" y="340" width="50" height="70" rx="4" fill="#334155" stroke="#64748b" strokeWidth="2" />
    <circle cx="245" cy="360" r="8" fill="#d97706" />

    {/* Motor Eléctrico Trifásico Aletado en Azul Siemens */}
    <rect x="130" y="270" width="130" height="140" rx="6" fill="url(#motorBlueGrad)" stroke="#0369a1" strokeWidth="3" />
    {[...Array(7)].map((_, i) => (
      <line key={i} x1={140 + i * 16} y1="270" x2={140 + i * 16} y2="410" stroke="#0284c7" strokeWidth="3" />
    ))}
    {/* Caperuza del Ventilador Trasero del Motor */}
    <path d="M 130 285 C 105 295 105 395 130 405 Z" fill="#0369a1" stroke="#075985" strokeWidth="2" />
  </svg>
);

// 3. SIERRA CIRCULAR / TRONZADORA INDUSTRIAL DE ALUMINIO
const RealisticCircularSawIllustration: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 800 480" className="w-full h-full max-h-[380px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]">
    <ellipse cx="400" cy="440" rx="320" ry="16" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />

    {/* Mesa de Trabajo de Fundición Rectificada con Guías */}
    <rect x="120" y="380" width="560" height="35" rx="4" fill="#334155" stroke="#475569" strokeWidth="3" />
    <rect x="140" y="388" width="520" height="8" rx="2" fill="#0f172a" />

    {/* Perfil de Aluminio Extruido Sujeto en la Prensa */}
    <rect x="160" y="340" width="480" height="40" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
    <rect x="200" y="348" width="60" height="24" rx="1" fill="#94a3b8" />
    <rect x="300" y="348" width="60" height="24" rx="1" fill="#94a3b8" />
    <rect x="440" y="348" width="60" height="24" rx="1" fill="#94a3b8" />

    {/* Mordazas Neumáticas de Apriete Vertical con Cilindro */}
    <rect x="250" y="270" width="30" height="70" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
    <rect x="260" y="220" width="10" height="50" fill="#cbd5e1" />
    <rect x="245" y="190" width="40" height="30" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />

    {/* Brazo Articulado y Motor de la Tronzadora */}
    <path d="M 400 390 L 400 180 L 480 180 L 480 320" fill="none" stroke="#475569" strokeWidth="24" strokeLinecap="round" />

    {/* Protector de Disco Superior en Naranja Industrial */}
    <path d="M 320 280 C 320 180 480 180 480 280 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="4" />

    {/* Disco de Sierra Circular de Carburo de Tungsteno (TCT) */}
    <g transform={`rotate(${isActive ? 30 : 0} 400 280)`}>
      <circle cx="400" cy="280" r="85" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
      {/* Ranuras de dilatación térmica por láser */}
      {[...Array(6)].map((_, i) => (
        <line
          key={i}
          x1="400"
          y1="280"
          x2="465"
          y2="280"
          stroke="#475569"
          strokeWidth="2"
          transform={`rotate(${i * 60} 400 280)`}
        />
      ))}
      {/* Dientes de carburo con filo afilado */}
      {[...Array(24)].map((_, i) => (
        <polygon
          key={i}
          points="483,278 488,280 484,284"
          fill="#475569"
          transform={`rotate(${i * 15} 400 280)`}
        />
      ))}
      <circle cx="400" cy="280" r="24" fill="#334155" stroke="#cbd5e1" strokeWidth="3" />
    </g>

    {/* Pantalla Transparente Antiproyecciones de Policarbonato */}
    <path d="M 315 280 C 315 360 485 360 485 280 Z" fill="rgba(251, 191, 36, 0.25)" stroke="#f59e0b" strokeWidth="2" />
  </svg>
);

// 4. PULIDORA / AMOLADORA ANGULAR 9 PULGADAS (230 mm)
const RealisticAngleGrinderIllustration: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 800 480" className="w-full h-full max-h-[380px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]">
    <ellipse cx="400" cy="440" rx="300" ry="16" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />

    {/* Viga Estructural de Acero I-Beam que está siendo cortada */}
    <path d="M 120 400 L 680 400 L 680 340 L 440 340 L 440 360 L 120 360 Z" fill="#334155" stroke="#475569" strokeWidth="3" />
    {/* Ranura de corte con zona afectada por calor (HAZ) azulada */}
    <rect x="375" y="340" width="8" height="25" fill="#ea580c" />
    <rect x="370" y="338" width="18" height="4" fill="#38bdf8" opacity="0.8" />

    {/* Cabezal de Engranajes Cónicos de Fundición de Aluminio Plateado */}
    <path d="M 340 310 L 410 310 L 430 250 L 320 250 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="3" />
    <circle cx="375" cy="275" r="8" fill="#475569" />

    {/* Guarda Protectora de Acero Negro en 180° */}
    <path d="M 280 290 C 280 190 470 190 470 290 Z" fill="#1e293b" stroke="#475569" strokeWidth="3" />

    {/* Disco Abrasivo de Corte de 230 mm x 2.5 mm */}
    <ellipse cx="375" cy="300" rx="90" ry="40" fill="#262626" stroke="#525252" strokeWidth="2" />
    <ellipse cx="375" cy="300" rx="30" ry="14" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />

    {/* Cuerpo Ergonómico del Motor en Azul Bosch Professional / Negro */}
    <path d="M 375 250 L 580 180 L 620 200 L 415 270 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
    <rect x="580" y="175" width="80" height="35" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />

    {/* Empuñadura Auxiliar Antivibratoria con Anillo Rojo */}
    <path d="M 350 250 L 290 200" stroke="#0f172a" strokeWidth="26" strokeLinecap="round" />
    <line x1="320" y1="225" x2="330" y2="233" stroke="#ef4444" strokeWidth="6" />

    {/* Cable de Alimentación Industrial Reforzado */}
    <path d="M 660 190 Q 720 220 740 380" fill="none" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

// 5. PRENSA TROQUELADORA EXCÉNTRICA EP-500
const RealisticPunchPressIllustration: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 800 480" className="w-full h-full max-h-[380px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]">
    <ellipse cx="400" cy="445" rx="300" ry="16" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />

    {/* Gran Bastidor C Monobloque de Fundición Gris/Verde Industrial */}
    <path
      d="M 220 420 L 520 420 L 520 370 L 420 370 L 420 240 L 500 240 L 500 110 L 250 110 L 250 420 Z"
      fill="#1e293b"
      stroke="#334155"
      strokeWidth="4"
    />

    {/* Mesa de Trabajo y Placa Portamatriz */}
    <rect x="360" y="340" width="180" height="30" rx="3" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />

    {/* Corredera Guiada Verticalmente con Troquel de Acero D2 */}
    <rect x="390" y={isActive ? "260" : "230"} width="100" height="70" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
    <rect x="420" y={isActive ? "325" : "295"} width="40" height="25" rx="1" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />

    {/* Enorme Volante de Inercia de 1.4 metros en Amarillo con Reja */}
    <circle cx="260" cy="180" r="95" fill="#f59e0b" stroke="#b45309" strokeWidth="5" />
    {[...Array(6)].map((_, i) => (
      <line
        key={i}
        x1="260"
        y1="180"
        x2="345"
        y2="180"
        stroke="#78350f"
        strokeWidth="10"
        transform={`rotate(${i * 60} 260 180)`}
      />
    ))}
    <circle cx="260" cy="180" r="30" fill="#1e293b" stroke="#cbd5e1" strokeWidth="4" />

    {/* Reja de Seguridad Envolvente Amarilla */}
    <rect x="370" y="220" width="140" height="150" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 6" />
  </svg>
);

// 6. MARTINETE DE FORJA NEUMÁTICO
const RealisticForgingHammerIllustration: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 800 480" className="w-full h-full max-h-[380px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]">
    <ellipse cx="400" cy="445" rx="280" ry="16" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />

    {/* Bloque del Yunque Monolítico de Acero Forjado */}
    <polygon points="320,420 480,420 460,330 340,330" fill="#1e293b" stroke="#475569" strokeWidth="4" />
    {/* Zapata / Estampa Inferior de Forja */}
    <rect x="360" y="315" width="80" height="20" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />

    {/* Barra Incandescente al Rojo Vivo (1100°C) sobre el Yunque */}
    <rect x="330" y="300" width="140" height="16" rx="3" fill="#f97316" stroke="#ea580c" strokeWidth="2" filter="drop-shadow(0 0 10px #ea580c)" />
    <rect x="375" y="302" width="50" height="12" rx="2" fill="#fef08a" />

    {/* Tenazas de Forja Sujetando la Pieza al Rojo Vivo */}
    <path d="M 220 310 L 340 308" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
    <path d="M 210 320 L 340 312" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

    {/* Maza Superior (Tup de 250 kg) y Cilindro de Potencia Neumático */}
    <rect x="370" y={isActive ? "245" : "200"} width="60" height="70" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="3" />
    <rect x="375" y={isActive ? "295" : "250"} width="50" height="18" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="2" />

    {/* Cilindro Neumático Superior y Bastidor de Forja */}
    <rect x="350" y="80" width="100" height="130" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="4" />
    <line x1="350" y1="120" x2="450" y2="120" stroke="#334155" strokeWidth="4" />
    <line x1="350" y1="160" x2="450" y2="160" stroke="#334155" strokeWidth="4" />

    {/* Mangueras de Presión Neumática y Válvula de Pedal */}
    <path d="M 450 100 Q 520 120 540 300 Q 550 400 480 420" fill="none" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" />
  </svg>
);
