import React from 'react';
import { Radio, Database, AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react';

export interface DataNatureBadgeProps {
  dataNature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE' | string;
  validationStatus?: string;
  isSimulated?: boolean;
  className?: string;
  compact?: boolean;
}

export const DataNatureBadge: React.FC<DataNatureBadgeProps> = ({
  dataNature,
  validationStatus,
  isSimulated,
  className = '',
  compact = false,
}) => {
  const isDemo = isSimulated || dataNature === 'DEMO';
  const isUnavailable = dataNature === 'UNAVAILABLE';
  const isCached = !isDemo && !isUnavailable && dataNature === 'CACHED';
  const isLive = !isDemo && !isUnavailable && (dataNature === 'LIVE' || (!dataNature && !isCached));
  const isUnverified = validationStatus?.includes('NON_VERIFIE') || validationStatus?.includes('SOURCE_NON_VERIFIEE');

  if (isDemo) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-600/60 shadow-xs ${className}`}
        title="Donnée de démonstration / simulation d'étalonnage. Strictly reserved for testing."
      >
        <AlertTriangle className="w-3 h-3 text-purple-400 shrink-0" />
        <span>DEMO</span>
        {!compact && <span className="text-purple-400/80 font-normal">| Simulation</span>}
      </span>
    );
  }

  if (isUnavailable || isUnverified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/90 text-amber-300 border border-amber-600/50 shadow-xs ${className}`}
        title="Télémesure directe indisponible ou en cours de vérification. Aucune donnée simulée n'est générée."
      >
        <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
        <span>{isUnverified ? 'NON VÉRIFIÉ' : 'UNAVAILABLE'}</span>
        {!compact && (
          <span className="text-slate-400 font-normal">
            | {isUnverified ? 'Source non validée' : 'Indisponible'}
          </span>
        )}
      </span>
    );
  }

  if (isCached) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-950/80 text-sky-300 border border-sky-600/60 shadow-xs ${className}`}
        title="Donnée réelle archivée consultée depuis le cache local sécurisé (Dexie)."
      >
        <Database className="w-3 h-3 text-sky-400 shrink-0" />
        <span>CACHED</span>
        {!compact && <span className="text-sky-400/80 font-normal">| Cache local</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-xs ${className}`}
      title="Télémesure réelle certifiée reçue en direct du réseau."
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
      <span>LIVE</span>
      {!compact && <span className="text-emerald-400/80 font-normal">| En direct</span>}
    </span>
  );
};
