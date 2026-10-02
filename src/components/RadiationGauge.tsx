import React from 'react';
import { Activity, ShieldCheck, Info } from 'lucide-react';

interface RadiationGaugeProps {
  value: number; // in nSv/h
  unit?: string;
  isOfficial?: boolean;
  className?: string;
  showContext?: boolean;
}

export const RadiationGauge: React.FC<RadiationGaugeProps> = ({
  value,
  unit = 'nSv/h',
  isOfficial = true,
  className = '',
  showContext = true,
}) => {
  // Scientific classification according to IRSN French background baseline
  let levelColor = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50';
  let barColor = 'bg-cyan-500';
  let badgeText = 'Fond ambiant normal (sédimentaire)';
  let maxScale = 500; // nSv/h scale reference

  if (value > 300) {
    levelColor = 'text-amber-400 bg-amber-950/40 border-amber-800/50';
    barColor = 'bg-amber-500';
    badgeText = 'Valeur à surveiller (naturelle ou événementielle)';
  } else if (value > 180) {
    levelColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
    barColor = 'bg-emerald-500';
    badgeText = 'Fond naturel élevé (massif granitique / altitude)';
  } else if (value > 100) {
    levelColor = 'text-sky-400 bg-sky-950/40 border-sky-800/50';
    barColor = 'bg-sky-500';
    badgeText = 'Fond ambiant standard';
  }

  const percentage = Math.min(100, Math.max(5, (value / maxScale) * 100));

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-mono">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Débit de dose gamma</span>
        </div>
        {isOfficial ? (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3" /> Officiel
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
            Citoyen
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-white">
          {value.toFixed(1)}
        </span>
        <span className="text-sm font-semibold text-slate-400 font-mono">{unit}</span>
        <span className="text-xs text-slate-500">
          ({(value / 1000).toFixed(3)} µSv/h)
        </span>
      </div>

      {/* Sober scientific progress gauge */}
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-mono text-slate-500">
          <span>0 nSv/h</span>
          <span>150 (moyenne nat.)</span>
          <span>300 (granit)</span>
          <span>500+</span>
        </div>
      </div>

      {showContext && (
        <div className={`mt-3 flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${levelColor}`}>
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
};
