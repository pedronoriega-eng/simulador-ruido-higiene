import React, { useState } from 'react';
import { SoundSource, NoiseType } from '../types';
import { Volume2, Power, Sliders, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';

interface MachineSelectorProps {
  sources: SoundSource[];
  activeSourceId: string | null;
  selectedMachineId: string;
  onSelectSource: (sourceId: string) => void;
  onStopAll: () => void;
  distance: number;
  onChangeDistance: (d: number) => void;
  isEngineActive: boolean;
  onStartEngine: () => void;
}

export const MachineSelector: React.FC<MachineSelectorProps> = ({
  sources,
  activeSourceId,
  selectedMachineId,
  onSelectSource,
  onStopAll,
  distance,
  onChangeDistance,
  isEngineActive,
  onStartEngine
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Cálculo de atenuación teórica por distancia
  const attenuationDb = 20 * Math.log10(distance);

  const getCategoryText = (cat: NoiseType) => {
    switch (cat) {
      case 'continuo':
        return <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase">Continuo</span>;
      case 'intermitente':
        return <span className="text-[10px] text-[#f97316] font-mono font-semibold uppercase">Intermitente</span>;
      case 'impacto':
        return <span className="text-[10px] text-rose-400 font-mono font-semibold uppercase">Impacto</span>;
    }
  };

  return (
    <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-3.5 relative overflow-hidden">
      {/* Detalle de esquinas mecanizadas tipo bastidor de máquina */}
      <div className="absolute top-2.5 left-2.5 cad-allen-bolt" />
      <div className="absolute top-2.5 right-2.5 cad-allen-bolt" />

      {/* Barra Compacta Superior de Selección de Máquina */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Selector Rápido de las 6 Máquinas */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.8)]"></span>
              <span className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono">
                Maquinaria Industrial (6 Ensayos CAD):
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-slate-400 hover:text-[#fb923c] flex items-center gap-1 transition-colors cad-bevel-btn px-2 py-0.5 rounded-lg"
            >
              <span>{isExpanded ? 'Vista Resumida' : 'Fichas de Ingeniería'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {sources.map((src) => {
              const isOperating = activeSourceId === src.id;
              const isInspected = selectedMachineId === src.id;

              return (
                <button
                  key={src.id}
                  onClick={() => {
                    if (!isEngineActive) onStartEngine();
                    onSelectSource(src.id);
                  }}
                  className={`p-2 rounded-xl text-left transition-all relative flex flex-col justify-between ${
                    isOperating
                      ? 'cad-orange-active ring-1 ring-[#f97316] border-[#ea580c]'
                      : isInspected
                      ? 'cad-brushed-aluminum border-slate-500 text-slate-100 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.5)]'
                      : 'cad-gunmetal cad-bevel-panel-subtle hover:border-slate-600 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold truncate text-slate-100">
                      {src.name.split(' ')[0]} {src.name.split(' ')[1] || ''}
                    </span>
                    {isOperating && (
                      <span className="w-2 h-2 rounded-full bg-[#f97316] animate-ping shrink-0"></span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isOperating ? 'text-[#fed7aa] font-bold' : 'text-slate-300'}>
                      ~{src.baseSPL} dB
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                      {src.category.substring(0, 4)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Control del Potenciómetro de Distancia (1.0m a 4.0m) y Parada con Ranura Mecanizada */}
        <div className="cad-gunmetal cad-inset-well p-2.5 rounded-xl flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#f97316] shrink-0" />
            <div className="text-left">
              <div className="text-[11px] font-semibold text-slate-200 leading-tight font-mono">
                Distancia: <span className="text-[#f97316] font-bold">{distance.toFixed(1)} m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Atenuación: <span className="text-amber-400 font-bold">-{attenuationDb.toFixed(1)} dB</span>
              </div>
            </div>
          </div>

          <div className="w-28 flex flex-col justify-center">
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
              <span>1.0m</span>
              <span>4.0m</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={distance}
              onChange={(e) => onChangeDistance(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#0a0d12] rounded-lg appearance-none cursor-pointer accent-[#ea580c] shadow-inner"
            />
            {/* Escala calibrada tipo nonio de pie de rey */}
            <div className="cad-caliper-scale w-full mt-1 opacity-40"></div>
          </div>

          {activeSourceId && (
            <button
              onClick={onStopAll}
              className="px-2.5 py-1 text-[11px] font-bold cad-bevel-btn text-rose-300 hover:text-white border-rose-800/80 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              title="Detener emisión acústica"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span>PARADA</span>
            </button>
          )}
        </div>
      </div>

      {/* Fichas Técnicas Expandibles */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-700/80 text-xs">
          {sources.map((src) => {
            const isOperating = activeSourceId === src.id;
            return (
              <div
                key={src.id}
                onClick={() => {
                  if (!isEngineActive) onStartEngine();
                  onSelectSource(src.id);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isOperating
                    ? 'cad-orange-active border-[#ea580c]'
                    : 'cad-gunmetal cad-bevel-panel-subtle hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-100">{src.name}</span>
                  {getCategoryText(src.category)}
                </div>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{src.description}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800">
                  <span>Pico: {src.spectralPeak}</span>
                  <span className="text-[#f97316] font-bold">{src.noiseGenerators?.length || 0} Focos 3D</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
