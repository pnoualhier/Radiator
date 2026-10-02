import React from 'react';
import { Activity, ShieldCheck, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface RadiationGaugeProps {
  value: number; // in nSv/h
  unit?: string;
  isOfficial?: boolean;
  dataNature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
  isSimulated?: boolean;
  className?: string;
  showContext?: boolean;
}

export const RadiationGauge: React.FC<RadiationGaugeProps> = ({
  value,
  unit = 'nSv/h',
  isOfficial = true,
  dataNature = 'DEMO',
  isSimulated = false,
  className = '',
  showContext = true,
}) => {
  // Scientific classification according to IRSN French background baseline
  if (dataNature === 'UNAVAILABLE') {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-mono">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Débit de dose gamma</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shadow-xs">
            ⚪ Donnée indisponible
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-slate-500">
            —
          </span>
          <span className="text-sm font-semibold text-slate-500 font-mono">nSv/h</span>
        </div>

        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <span>
            <strong>Production active :</strong> En l'absence de flux certifié ASNR/Téléray en temps réel, aucune donnée simulée n'est générée afin de préserver l'intégrité de l'information.
          </span>
        </div>
      </div>
    );
  }

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

  // Determine provenance presentation
  const isDemo = isSimulated || dataNature === 'DEMO';
  const isLive = !isDemo && dataNature === 'LIVE';
  const isCached = !isDemo && dataNature === 'CACHED';

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-mono">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Débit de dose gamma</span>
        </div>

        {/* Provenance Badge */}
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Donnée réelle en direct
            </span>
          )}
          {isCached && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-sky-950/80 text-sky-400 border border-sky-700/60 shadow-xs">
              <Clock className="w-3 h-3 text-sky-400" /> Donnée archivée (cache)
            </span>
          )}
          {isDemo && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/70 shadow-xs">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Donnée simulée (Mode Démo)
            </span>
          )}

          {isOfficial ? (
            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <ShieldCheck className="w-2.5 h-2.5 text-slate-400" /> Balise officielle
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-purple-950/40 text-purple-300 border border-purple-800/40">
              Capteur citoyen
            </span>
          )}
        </div>
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

      {/* Demo warning disclaimer */}
      {isDemo && (
        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
          <span>
            <strong>Avertissement :</strong> Cette valeur est une <strong>simulation de référence</strong> basée sur la géologie locale et non une télémesure certifiée en temps réel.
          </span>
        </div>
      )}

      {/* Scientific progress gauge */}
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
