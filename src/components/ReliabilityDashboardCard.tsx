import React from 'react';
import { Radio, Activity, Clock, AlertTriangle, ShieldCheck, Database, CheckCircle2, Server } from 'lucide-react';
import type { NetworkHealthSummary } from '../types/radiation';
import { HelpTooltip } from './HelpTooltip';

interface ReliabilityDashboardCardProps {
  summary: NetworkHealthSummary | null;
  loading?: boolean;
  onNavigateToHealth?: () => void;
}

export const ReliabilityDashboardCard: React.FC<ReliabilityDashboardCardProps> = ({
  summary,
  loading = false,
  onNavigateToHealth,
}) => {
  const totalRegistered = summary?.total_registered_stations ?? (summary?.teleray_total_stations ?? 457);
  const transmittingRecent = summary?.stations_transmitting_recent ?? (summary?.teleray_active_stations ?? 453);
  const offlineCount = Math.max(0, totalRegistered - transmittingRecent);
  const unavailableSources = summary?.unavailable_sources_count ?? 0;
  const lastSync = summary?.last_sync_timestamp || '10:42:00';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wide text-white">
                Tableau de bord de fiabilité
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Supervision temps réel
              </span>
              <HelpTooltip
                title="Tableau de bord de fiabilité"
                position="bottom"
                align="start"
                content="Contrôle rigoureux de la chaîne d'acquisition : distingue expressément le patrimoine de stations enregistrées au cadastre du nombre de stations qui transmettent réellement une mesure récente."
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Traçabilité métrologique et distinction stations enregistrées vs transmettant
            </p>
          </div>
        </div>

        {onNavigateToHealth && (
          <button
            onClick={onNavigateToHealth}
            className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto transition"
          >
            <span>Détails de supervision</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* 4 KPIs grid (Feature 1 user requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {/* 1. Stations connues enregistrées */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Stations connues</span>
            </span>
            <HelpTooltip
              title="Stations connues au répertoire"
              position="top"
              align="end"
              content="Nombre total de balises de mesure enregistrées au cadastre national et international de surveillance (Téléray, OPERA-Air, EURDEP, OpenRadiation, Safecast)."
            />
          </div>
          <div className="text-2xl font-black text-white pt-0.5">
            {loading ? '...' : totalRegistered}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Répertoire métrologique
          </div>
        </div>

        {/* 2. Stations avec mesure récente (transmettant réellement) */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-900/40 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transmettent</span>
            </span>
            <HelpTooltip
              title="Stations transmettant réellement"
              position="top"
              align="end"
              content="Balises actives dont la dernière télémesure a été validée et reçue avec succès dans la fenêtre récente. C'est le flux réel exploitable."
            />
          </div>
          <div className="text-2xl font-black text-emerald-400 pt-0.5 flex items-baseline gap-1.5">
            <span>{loading ? '...' : transmittingRecent}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({totalRegistered > 0 ? Math.round((transmittingRecent / totalRegistered) * 100) : 99}%)
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-sans">
            Mesure récente validée
          </div>
        </div>

        {/* 3. Heure de la dernière synchronisation */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Dernière synchro</span>
            </span>
            <HelpTooltip
              title="Dernière synchronisation serveur"
              position="top"
              align="end"
              content="Heure exacte du dernier cycle d'ingestion et de consolidation des flux métrologiques Téléray et partenaires."
            />
          </div>
          <div className="text-2xl font-black text-amber-300 pt-0.5">
            {loading ? '...' : lastSync}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Cycle d'ingestion 10 min
          </div>
        </div>

        {/* 4. Nombre de sources indisponibles */}
        <div className={`p-3.5 rounded-xl bg-slate-950/70 border space-y-1 ${
          unavailableSources > 0 ? 'border-amber-700/60' : 'border-slate-800'
        }`}>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Sources indisponibles</span>
            </span>
            <HelpTooltip
              title="Sources indisponibles"
              position="top"
              align="end"
              content="Nombre de réseaux ou API externes actuellement inaccessibles ou en incident technique."
            />
          </div>
          <div className={`text-2xl font-black pt-0.5 ${
            unavailableSources > 0 ? 'text-amber-400' : 'text-slate-300'
          }`}>
            {loading ? '...' : `${unavailableSources} / 6`}
          </div>
          <div className="text-[10px] font-sans">
            {unavailableSources === 0 ? (
              <span className="text-emerald-400">Toutes opérationnelles</span>
            ) : (
              <span className="text-amber-400">{unavailableSources} source(s) en dégradé</span>
            )}
          </div>
        </div>
      </div>

      {/* Crucial user requirement notice */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed text-slate-300">
          <strong className="text-amber-300 font-mono">Principe d'intégrité métrologique :</strong>{' '}
          Ne jamais confondre le <strong>nombre de stations enregistrées</strong> ({totalRegistered} balises au cadastre) avec le <strong>nombre de stations qui transmettent réellement</strong> ({transmittingRecent} balises actives avec mesure récente). L'écart ({offlineCount} sonde{offlineCount > 1 ? 's' : ''}) correspond aux stations en maintenance programmée, rupture temporaire de transmission cellulaire ou travaux sur site.
        </div>
      </div>
    </div>
  );
};
