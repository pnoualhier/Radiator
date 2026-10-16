import React, { useMemo } from 'react';
import type { Station } from '../types/radiation';
import { BarChart3, Info, ShieldCheck, Activity, MapPin } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface NationalDistributionCardProps {
  stations: Station[];
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return Math.round((sorted[base] + rest * (sorted[base + 1] - sorted[base])) * 10) / 10;
  }
  return Math.round(sorted[base] * 10) / 10;
}

export const NationalDistributionCard: React.FC<NationalDistributionCardProps> = ({ stations }) => {
  // Extract and sort ambient gamma measurements in nSv/h
  const { quantiles, count } = useMemo(() => {
    const ambientStations = stations.filter(s => {
      const type = s.measurement_type;
      return (
        type === 'AMBIENT_GAMMA_DOSE_RATE' ||
        !type ||
        s.source_code === 'TELERAY' ||
        s.source_code === 'EURDEP'
      );
    });

    const values = ambientStations
      .map(s => s.latest_measurement?.value)
      .filter((v): v is number => typeof v === 'number' && v > 0 && v < 2000)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return {
        quantiles: null,
        count: 0,
      };
    }

    return {
      count: values.length,
      quantiles: {
        min: Math.round(values[0] * 10) / 10,
        p10: quantile(values, 0.10),
        p25: quantile(values, 0.25),
        mediane: quantile(values, 0.50),
        p75: quantile(values, 0.75),
        p90: quantile(values, 0.90),
        max: Math.round(values[values.length - 1] * 10) / 10,
      },
    };
  }, [stations]);

  if (!quantiles) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Title & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <span>Distribution des mesures (Rayonnement ambiant gamma)</span>
              <HelpTooltip
                title="Distribution statistique nationale (Quantiles)"
                position="bottom"
                align="start"
                content="Synthèse statistique sur l'ensemble des balises gamma de France. La médiane (P50) représente le niveau central nominal national. L'intervalle interquartile (P25 - P75) regroupe la moitié du territoire (plaines sédimentaires). Les valeurs supérieures correspondent aux massifs géologiques granitiques (Bretagne, Massif Central, Vosges, Corse) naturellement plus radioactifs."
              />
            </h3>
            <p className="text-[11px] text-slate-400">
              Échantillon métropolitain homogène ({count} balises gamma en nSv/h)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">
          Unité : nSv/h • Débit d'équivalent de dose
        </span>
      </div>

      {/* 7 Quantiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Minimum */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Minimum</div>
          <div className="text-xl font-bold font-mono text-slate-200">
            {quantiles.min.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">nSv/h</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">Plaines sédimentaires</div>
        </div>

        {/* P10 */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
          <div className="text-[10px] font-mono uppercase font-bold text-sky-400">P10</div>
          <div className="text-xl font-bold font-mono text-white">
            {quantiles.p10.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">nSv/h</span>
          </div>
          <div className="text-[9px] text-slate-400">10% sous ce seuil</div>
        </div>

        {/* P25 (1er quartile) */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
          <div className="text-[10px] font-mono uppercase font-bold text-sky-400">P25 (Q1)</div>
          <div className="text-xl font-bold font-mono text-white">
            {quantiles.p25.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">nSv/h</span>
          </div>
          <div className="text-[9px] text-slate-400">Bassin parisien</div>
        </div>

        {/* Médiane (P50) - Highlighted */}
        <div className="p-3 rounded-xl bg-gradient-to-b from-emerald-950/50 to-slate-950 border border-emerald-500/50 ring-1 ring-emerald-500/30 text-center space-y-0.5 shadow-md">
          <div className="text-[10px] font-mono uppercase font-black text-emerald-400 flex items-center justify-center gap-1">
            <span>Médiane</span>
            <span className="text-[9px] px-1 rounded bg-emerald-900/60 text-emerald-300">P50</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">
            {quantiles.mediane.toFixed(0)} <span className="text-xs font-normal text-emerald-400/80">nSv/h</span>
          </div>
          <div className="text-[9px] text-emerald-300/80 font-semibold">Niveau central national</div>
        </div>

        {/* P75 (3e quartile) */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
          <div className="text-[10px] font-mono uppercase font-bold text-amber-400">P75 (Q3)</div>
          <div className="text-xl font-bold font-mono text-white">
            {quantiles.p75.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">nSv/h</span>
          </div>
          <div className="text-[9px] text-slate-400">Sols anciens</div>
        </div>

        {/* P90 */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
          <div className="text-[10px] font-mono uppercase font-bold text-amber-400">P90</div>
          <div className="text-xl font-bold font-mono text-white">
            {quantiles.p90.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">nSv/h</span>
          </div>
          <div className="text-[9px] text-slate-400">Granite / altitude</div>
        </div>

        {/* Maximum */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
          <div className="text-[10px] font-mono uppercase font-bold text-amber-400">Maximum</div>
          <div className="text-xl font-bold font-mono text-amber-300">
            {quantiles.max.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">nSv/h</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">Massifs granitiques</div>
        </div>
      </div>

      {/* Visual Percentile Range Bar */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Min : {quantiles.min} nSv/h</span>
          <span className="text-emerald-400 font-bold">Médiane : {quantiles.mediane} nSv/h</span>
          <span>Max : {quantiles.max} nSv/h</span>
        </div>
        <div className="h-2.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative flex">
          {/* Lower tail [Min - P25] */}
          <div
            className="h-full bg-sky-900/60"
            style={{ width: `${Math.max(5, ((quantiles.p25 - quantiles.min) / (quantiles.max - quantiles.min || 1)) * 100)}%` }}
            title={`Bas de distribution : ${quantiles.min} à ${quantiles.p25} nSv/h`}
          />
          {/* Interquartile range [P25 - P75] - 50% central */}
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-amber-400"
            style={{ width: `${Math.max(20, ((quantiles.p75 - quantiles.p25) / (quantiles.max - quantiles.min || 1)) * 100)}%` }}
            title={`Cœur de distribution (50% des stations) : ${quantiles.p25} à ${quantiles.p75} nSv/h`}
          />
          {/* Upper tail [P75 - Max] */}
          <div
            className="h-full bg-amber-900/60 flex-1"
            title={`Haut de distribution : ${quantiles.p75} à ${quantiles.max} nSv/h`}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400 px-1">
          <span>P10 : {quantiles.p10}</span>
          <span className="text-slate-400">Intervalle interquartile P25-P75 : {quantiles.p25} - {quantiles.p75} nSv/h</span>
          <span>P90 : {quantiles.p90}</span>
        </div>
      </div>

      {/* Geological & Metrological Scientific Note */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed text-[11px]">
          <p>
            <strong className="text-white">Pourquoi l'ASNR préconise-t-elle la distribution plutôt qu'une « moyenne nationale » ?</strong>
          </p>
          <p className="text-slate-400">
            Le rayonnement tellurique naturel varie fortement selon la géologie du sous-sol (<strong>70 à 90 nSv/h</strong> dans les bassins sédimentaires calcaire comme le Bassin Parisien, contre <strong>150 à 250 nSv/h</strong> sur les roches granitiques anciennes comme le Limousin, la Bretagne ou le Massif Central) ainsi que selon l'altitude (exposition au rayonnement cosmique).
          </p>
          <p className="text-slate-400">
            Calculer une moyenne arithmétique simple masquerait cette réalité géographique et géologique fondamentale. La <strong>médiane</strong> et les <strong>percentiles</strong> (P10, P25, P75, P90) offrent une représentation scientifiquement robuste et représentative de la diversité des territoires.
          </p>
        </div>
      </div>
    </div>
  );
};
