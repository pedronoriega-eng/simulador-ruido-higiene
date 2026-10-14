import React, { useState } from 'react';
import { LAB_PRACTICES } from '../hygieneStandards';
import { BookOpen, CheckCircle, ChevronRight, X, Play, Award } from 'lucide-react';

interface LabPracticesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoConfigurePractice: (sourceId: string) => void;
}

export const LabPracticesModal: React.FC<LabPracticesModalProps> = ({
  isOpen,
  onClose,
  onAutoConfigurePractice
}) => {
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<number>(0);
  const practice = LAB_PRACTICES[selectedPracticeIndex];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="cad-industrial-steel cad-bevel-panel w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
        {/* Tornillería Allen en las esquinas del bastidor */}
        <div className="absolute top-2.5 left-2.5 cad-allen-bolt" />
        <div className="absolute top-2.5 right-2.5 cad-allen-bolt" />

        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 cad-chassis-faceplate px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg cad-orange-btn flex items-center justify-center text-slate-950 font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                GUÍA EXPERIMENTAL DE HIGIENE ACÚSTICA
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Protocolos de ensayo conforme a ISO 9612 y Res. 1792 de 1990
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white cad-bevel-btn transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de las 3 Prácticas */}
        <div className="flex border-b border-slate-700/80 cad-gunmetal p-2 gap-2 overflow-x-auto">
          {LAB_PRACTICES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedPracticeIndex(idx)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                selectedPracticeIndex === idx
                  ? 'cad-orange-btn font-bold text-slate-950 shadow-md'
                  : 'cad-bevel-btn text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Práctica {p.id}</span>
            </button>
          ))}
        </div>

        {/* Contenido de la Práctica Seleccionada */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-300">
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-1 font-mono">
              {practice.title}
            </h3>
            <p className="text-xs text-[#f97316] font-medium font-mono">
              Objetivo Académico: <span className="text-slate-300 font-normal font-sans">{practice.objective}</span>
            </p>
          </div>

          {/* Procedimiento Paso a Paso */}
          <div className="cad-gunmetal p-4 rounded-xl cad-bevel-panel-subtle">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              Procedimiento Experimental Paso a Paso
            </h4>
            <ul className="space-y-2 text-xs leading-relaxed">
              {practice.procedure.map((step, sIdx) => (
                <li key={sIdx} className="p-2.5 cad-industrial-steel rounded-lg border border-slate-700/60 text-slate-300 cad-bevel-panel-subtle">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Fenómeno Físico y Acústico Esperado */}
          <div className="cad-gunmetal border border-emerald-800/50 p-3.5 rounded-xl cad-bevel-panel-subtle">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 font-mono">
              Comprobación y Resultado Esperado
            </h4>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {practice.expectedObservation}
            </p>
          </div>
        </div>

        {/* Pie del Modal con Acción de Carga Rápida */}
        <div className="p-4 border-t border-slate-700/80 cad-chassis-faceplate flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Fuente recomendada: <strong className="text-[#f97316] capitalize">{practice.recommendedSource}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAutoConfigurePractice(practice.recommendedSource);
                onClose();
              }}
              className="px-4 py-2 cad-orange-btn font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Play className="w-4 h-4" />
              Cargar Máquina y Configurar Laboratorio
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 cad-bevel-btn text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
