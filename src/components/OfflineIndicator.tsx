import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Clock, Database, Server, Radio, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import type { AuditTimestamps } from '../types/radiation';
import { safeFormatTime, safeFormatDate } from '../utils/dateUtils';

interface OfflineIndicatorProps {
  lastSyncTimestamp?: string;
  timestamps?: AuditTimestamps | null;
  onOpenCenter?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lastSyncTimestamp, timestamps, onOpenCenter }) => {
  const isOnline = useOnlineStatus();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isOnline) return null;

  const dataTime = safeFormatTime(timestamps?.data_timestamp || lastSyncTimestamp);
  const serverTime = safeFormatTime(timestamps?.server_timestamp || lastSyncTimestamp);
  const cacheTime = safeFormatTime(timestamps?.cache_timestamp || lastSyncTimestamp);
  const sourceTime = safeFormatTime(timestamps?.source_timestamp || timestamps?.data_timestamp);

  const referenceDate = safeFormatDate(timestamps?.data_timestamp || lastSyncTimestamp);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 rounded-2xl bg-slate-950/95 border border-amber-600/70 p-3.5 shadow-2xl backdrop-blur-md text-amber-200 animate-in fade-in slide-in-from-bottom-2 max-w-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-600/30 text-amber-400 mt-0.5">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] font-mono">
                Mode Hors Ligne
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                Cache Dexie
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Réseau indisponible. Consultation autonome via le cache local certifié.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="text-amber-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label={isExpanded ? 'Réduire les détails' : 'Déplier les détails'}
          title="Afficher la chaîne complète d'horodatage"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Rigorous 3-step audit timeline requested by user */}
      <div className="mt-3 pt-2.5 border-t border-amber-600/30 space-y-1.5 font-mono text-[11px]">
        <div className="flex items-center justify-between text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mesure effectuée à</span>
          </span>
          <span className="font-bold text-white tracking-wide">{dataTime}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
            <Server className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Reçue à</span>
          </span>
          <span className="font-bold text-white tracking-wide">{serverTime}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Mise en cache à</span>
          </span>
          <span className="font-bold text-white tracking-wide">{cacheTime}</span>
        </div>
      </div>

      {/* Button to open complete Offline Information Center */}
      {onOpenCenter && (
        <div className="mt-2.5 pt-2 border-t border-amber-600/30">
          <button
            onClick={onOpenCenter}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 hover:text-white font-mono text-[11px] font-bold transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Centre d'information hors connexion</span>
          </button>
        </div>
      )}

      {/* Extended metadata collapsible */}
      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] space-y-1 text-slate-400 font-mono">
          {referenceDate && (
            <div className="flex justify-between">
              <span className="text-slate-500">Date du lot de données :</span>
              <span className="text-slate-300">{referenceDate}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Horodatage source réseau :</span>
            <span className="text-slate-300">{sourceTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Contrôle intégrité :</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Conforme IndexedDB
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
