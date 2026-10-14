import React, { useState } from 'react';
import { SoundSource, NoiseGeneratorPoint } from '../types';
import { HyperRealisticMachineView } from './HyperRealisticMachineView';
import { SolidWorksViewport } from './cad/SolidWorksViewport';
import { MachineVisualizer } from './MachineVisualizer';
import { Sparkles, Box, FileText } from 'lucide-react';

interface MachineAnimatorProps {
  source: SoundSource;
  isActive: boolean;
  distance: number;
}

export const MachineAnimator: React.FC<MachineAnimatorProps> = ({
  source,
  isActive,
  distance,
}) => {
  const [selectedGenerator, setSelectedGenerator] = useState<NoiseGeneratorPoint | null>(
    source.noiseGenerators?.[0] || null
  );
  // Por defecto: '3d' (Ensamblaje CAD Experto 3D con RealView Graphics y cinemática)
  const [viewFormat, setViewFormat] = useState<'3d' | 'hyperrealistic' | 'blueprint'>('3d');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
          <span className="font-bold tracking-wide">VISUALIZACIÓN DE INGENIERÍA:</span>
        </span>
        
        {/* Selector de Modos: Ensamblaje CAD Experto 3D vs Taller Fotorrealista HD vs Plano Técnico */}
        <div className="flex items-center cad-gunmetal p-0.5 rounded-lg border border-slate-700/80 text-[10px] font-mono shadow-inner">
          {/* MODO 1: Ensamblaje 3D CAD Experto (Default) */}
          <button
            onClick={() => setViewFormat('3d')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              viewFormat === '3d'
                ? 'cad-orange-active font-bold text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Ensamblaje CAD 3D de alta precisión tipo SolidWorks / NX con RealView Graphics, árbol de operaciones, explosión y corte"
          >
            <Box className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-semibold">CAD Experto 3D (SolidWorks)</span>
          </button>

          {/* MODO 2: Taller Fotorrealista HD */}
          <button
            onClick={() => setViewFormat('hyperrealistic')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              viewFormat === 'hyperrealistic'
                ? 'cad-orange-active font-bold text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Simulación Fotorrealista HD de Taller con física dinámica de partículas y ambiente industrial"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
            <span>Taller Dinámico HD</span>
          </button>

          {/* MODO 3: Plano Técnico 2D ISO 7200 */}
          <button
            onClick={() => setViewFormat('blueprint')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              viewFormat === 'blueprint'
                ? 'cad-orange-active font-bold text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Plano de ingeniería 2D normalizado con cotas ISO 7200, rayado de corte DIN 476 y tolerancias"
          >
            <FileText className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Plano 2D ISO</span>
          </button>
        </div>
      </div>

      {viewFormat === 'hyperrealistic' ? (
        <HyperRealisticMachineView
          source={source}
          isActive={isActive}
          distance={distance}
          selectedGenerator={selectedGenerator}
          onSelectGenerator={setSelectedGenerator}
        />
      ) : viewFormat === '3d' ? (
        <SolidWorksViewport
          source={source}
          isActive={isActive}
          distance={distance}
          selectedGenerator={selectedGenerator}
          onSelectGenerator={setSelectedGenerator}
        />
      ) : (
        <MachineVisualizer
          selectedSource={source}
          isActive={isActive}
          distance={distance}
        />
      )}
    </div>
  );
};
