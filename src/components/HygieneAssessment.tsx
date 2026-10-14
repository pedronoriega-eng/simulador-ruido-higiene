import React, { useState } from 'react';
import { calculateDosimetry, ExchangeRateType } from '../hygieneStandards';
import { ShieldAlert, ShieldCheck, Clock, FileText, AlertOctagon, HelpCircle } from 'lucide-react';

interface HygieneAssessmentProps {
  leq: number;
  lpeak: number;
  instantSPL: number;
}

export const HygieneAssessment: React.FC<HygieneAssessmentProps> = ({
  leq,
  lpeak,
  instantSPL
}) => {
  const [shiftHours, setShiftHours] = useState<number>(8);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateType>(5);

  const dosimetry = calculateDosimetry(leq, lpeak, shiftHours, exchangeRate);

  // Semáforo y estilos cromáticos según nivel de riesgo
  const getBadgeStyle = () => {
    switch (dosimetry.riskLevel) {
      case 'peligro_pico':
        return 'bg-purple-950/90 text-purple-200 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
      case 'critico':
        return 'bg-red-950/90 text-red-200 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
      case 'accion':
        return 'bg-amber-950/90 text-amber-200 border-amber-500';
      case 'seguro':
      default:
        return 'bg-emerald-950/90 text-emerald-200 border-emerald-500';
    }
  };

  const getDoseBarColor = () => {
    if (dosimetry.dailyDosePercent >= 100) return 'bg-red-500';
    if (dosimetry.dailyDosePercent >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between">
      {/* Tornillería Allen de fijación en las esquinas */}
      <div className="absolute top-2.5 left-2.5 cad-allen-bolt" />
      <div className="absolute top-2.5 right-2.5 cad-allen-bolt" />

      <div>
        {/* Título y Selector de Normativa */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80 px-1 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#f97316]" />
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                HIGIENE Y DOSIMETRÍA OCUPACIONAL
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluación según Resolución 1792 de 1990 (Colombia), ACGIH y GATISO-HNIR
            </p>
          </div>

          {/* Selectores de Turno y Tasa de Cambio */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 cad-gunmetal px-2.5 py-1 rounded-lg border border-slate-700/80 cad-bevel-panel-subtle">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Jornada:</span>
              <select
                value={shiftHours}
                onChange={(e) => setShiftHours(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer font-mono"
              >
                <option value={8} className="bg-slate-900">8 Horas</option>
                <option value={6} className="bg-slate-900">6 Horas</option>
                <option value={4} className="bg-slate-900">4 Horas</option>
                <option value={2} className="bg-slate-900">2 Horas</option>
              </select>
            </div>

            <div className="flex items-center gap-1 cad-gunmetal px-2.5 py-1 rounded-lg border border-slate-700/80 cad-bevel-panel-subtle">
              <span className="text-[11px] text-slate-400">Tasa q:</span>
              <button
                onClick={() => setExchangeRate(exchangeRate === 5 ? 3 : 5)}
                className="text-xs font-bold font-mono text-[#f97316] hover:text-[#fb923c]"
                title="Alternar entre 5 dB (Res. 1792 Col / OSHA) y 3 dB (ACGIH / NIOSH / ISO 9612)"
              >
                {exchangeRate} dB ({exchangeRate === 5 ? 'Res 1792' : 'NIOSH'})
              </button>
            </div>
          </div>
        </div>

        {/* Semáforo de Riesgo con Bisel Mecanizado */}
        <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between gap-3 ${getBadgeStyle()}`}>
          <div className="flex items-center gap-3">
            {dosimetry.riskLevel === 'seguro' ? (
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <AlertOctagon className="w-8 h-8 shrink-0 animate-pulse text-[#f97316]" />
            )}
            <div>
              <div className="text-xs uppercase font-bold tracking-wider opacity-80 font-mono">
                Condición de Exposición
              </div>
              <div className="text-base font-extrabold tracking-tight">
                {dosimetry.riskLabel}
              </div>
              <div className="text-xs opacity-90 mt-0.5">
                {dosimetry.normativeReference}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400 font-mono">Leq Evaluado</div>
            <div className="text-2xl font-mono font-bold">{leq.toFixed(1)} <span className="text-sm font-normal text-slate-400">dBA</span></div>
          </div>
        </div>

        {/* Indicadores Clave: Dosis Diaria y Tiempo Máximo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Tarjeta Dosis Diaria */}
          <div className="cad-gunmetal p-3 rounded-xl cad-bevel-panel-subtle">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Dosis de Ruido Diaria (D%)</span>
              <span className="font-mono font-bold text-slate-200">
                Límite: 100%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 mb-2">
              {dosimetry.dailyDosePercent}%
            </div>
            {/* Barra de progreso de Dosis en ranura mecanizada */}
            <div className="w-full h-2.5 cad-inset-slot rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getDoseBarColor()}`}
                style={{ width: `${Math.min(100, dosimetry.dailyDosePercent)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1.5 flex justify-between">
              <span>0% Seguro</span>
              <span className="text-[#f97316]">50% Nivel Acción</span>
              <span className="text-red-400">100% Infracción</span>
            </div>
          </div>

          {/* Tarjeta Tiempo Máximo Permisible */}
          <div className="cad-gunmetal p-3 rounded-xl cad-bevel-panel-subtle">
            <div className="text-xs text-slate-400 mb-1">
              Tiempo Máximo Permisible (T_perm)
            </div>
            <div className="text-xl font-bold font-mono text-[#f97316] mb-1">
              {dosimetry.tPermittedFormatted}
            </div>
            <div className="text-[11px] text-slate-400 leading-snug">
              Tiempo que un operario puede laborar sin protección auditiva para no superar el TLV de 85 dBA.
            </div>
          </div>
        </div>
      </div>

      {/* Recomendación de EPP y Medidas de Control */}
      <div className="mt-4 pt-3 border-t border-slate-700/80 cad-gunmetal p-3 rounded-xl cad-bevel-panel-subtle">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
          <FileText className="w-3.5 h-3.5 text-[#f97316]" />
          <span>Recomendación Técnica de Control y EPP Auditivo (NRR)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {dosimetry.eppRecommendation}
        </p>
        {dosimetry.nrrRequired > 0 && (
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Atenuación mínima del protector auditivo: <span className="text-[#f97316] font-bold">NRR ≥ {dosimetry.nrrRequired} dB</span> (Factor de corrección NIOSH aplicado).
          </div>
        )}
      </div>
    </div>
  );
};
