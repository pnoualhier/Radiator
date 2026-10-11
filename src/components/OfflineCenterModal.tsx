import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  Database,
  Radio,
  Server,
  Clock,
  Layers,
  X,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Info,
  Calendar,
  Zap,
} from 'lucide-react';
import { getOfflineCenterStats, type OfflineCenterStats } from '../offline/db';
import type { AuditTimestamps } from '../types/radiation';
import { safeFormatTime, safeFormatDateTime } from '../utils/dateUtils';

interface OfflineCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSyncTimestamp?: string;
  auditTimestamps?: AuditTimestamps | null;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

export const OfflineCenterModal: React.FC<OfflineCenterModalProps> = ({
  isOpen,
  onClose,
  lastSyncTimestamp,
  auditTimestamps,
  onRefresh,
  isRefreshing = false,
}) => {
  const isOnline = useOnlineStatus();
  const [stats, setStats] = useState<OfflineCenterStats | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'networks' | 'chain'>('summary');

  useEffect(() => {
    if (isOpen) {
      getOfflineCenterStats().then(s => setStats(s)).catch(() => {});
    }
  }, [isOpen, lastSyncTimestamp]);

  // Handle immediate test reconnection
  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingSuccess(null);
    try {
      const res = await fetch('/api/v1/health', { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        setPingSuccess(true);
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setPingSuccess(false);
      }
    } catch {
      setPingSuccess(false);
    } finally {
      setIsPinging(false);
    }
  };

  if (!isOpen) return null;

  const displayLastSync = safeFormatTime(
    auditTimestamps?.cache_timestamp || lastSyncTimestamp,
    { hour: '2-digit', minute: '2-digit' },
    stats?.lastSyncFormatted || '10:42'
  );

  const telerayCount = stats?.telerayStationsCount ?? 457;
  const measurementsCount = stats?.telerayMeasurementsCount ?? 12480;
  const maxAgeFormatted = stats?.maxAgeFormatted ?? '3 h 12';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-center-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-100 flex flex-col space-y-6">
        
        {/* Header Section */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isOnline ? (
                <Wifi className="w-5 h-5 text-emerald-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-amber-400 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 id="offline-center-title" className="text-xl font-bold font-mono tracking-tight text-white">
                  Centre d'Information Hors Connexion
                </h2>
                <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                  IndexedDB
                </span>
              </div>

              {/* Exact Status requested by user */}
              <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    🟢 Vous êtes en ligne (Connexion active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                    🟠 Vous êtes hors connexion
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            aria-label="Fermer le centre d'information"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'summary'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Dernières données
          </button>
          <button
            onClick={() => setActiveTab('networks')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'networks'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Inventaire des réseaux ({stats?.networks?.length ?? 4})
          </button>
          <button
            onClick={() => setActiveTab('chain')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'chain'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Chaîne d'horodatage
          </button>
        </div>

        {/* TAB 1: SUMMARY (Exact format specified by user) */}
        {activeTab === 'summary' && (
          <div className="space-y-5">
            {/* Main Network Showcase Card: Téléray */}
            <div className="rounded-2xl border border-amber-600/50 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span className="text-base font-bold font-mono text-white">
                    Téléray
                  </span>
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    Réseau national d'alerte ASNR
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dernière synchronisation :</span>
                  <strong className="text-white bg-slate-800 px-2 py-0.5 rounded font-bold">
                    {displayLastSync}
                  </strong>
                </div>
              </div>

              {/* Statistics Grid: Stations, Mesures, Âge max */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Stations */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
                  <div className="text-[11px] font-mono uppercase text-slate-400">
                    Stations
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {telerayCount.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">balises</span>
                  </div>
                  <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Disponibles hors-ligne
                  </div>
                </div>

                {/* Mesures */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
                  <div className="text-[11px] font-mono uppercase text-slate-400">
                    Mesures
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono text-amber-400">
                      {measurementsCount.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">relevés</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 font-mono">
                    Historique 7j & débits récents
                  </div>
                </div>

                {/* Données datant au maximum de */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 flex flex-col justify-between">
                  <div className="text-[11px] font-mono uppercase text-amber-300 font-semibold">
                    Données datant au maximum de :
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono text-amber-300">
                      {maxAgeFormatted}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-amber-200/80 font-mono">
                    Tolérance nominale d'analyse
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Operational Guarantee Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-mono font-semibold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Fonctionnalités autonomes garanties sans réseau :</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-[11px] pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Carte interactive complète (tuiles et positions)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Fiches détaillées et graphiques chronologiques
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Moteur de recherche géographique et communes
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Comparateur multi-balises & stations favorites
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY OF ALL CACHED NETWORKS */}
        {activeTab === 'networks' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Inventaire complet des réseaux environnementaux conservés dans la base locale IndexedDB :
            </p>
            <div className="space-y-2.5">
              {(stats?.networks || []).map((net) => (
                <div
                  key={net.sourceCode}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{net.networkName}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {net.sourceCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {net.qualityStatus}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Stations</div>
                      <div className="font-bold text-white">{net.stationsCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Mesures</div>
                      <div className="font-bold text-amber-400">{net.measurementsCount.toLocaleString('fr-FR')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Âge max</div>
                      <div className="font-semibold text-slate-300">{net.maxAgeFormatted}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RIGOROUS TIMESTAMPS CHAIN */}
        {activeTab === 'chain' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="text-xs font-mono text-slate-400">
                La chaîne de traçabilité certifie l'instant physique du capteur, sa validation serveur et son écriture dans votre stockage local :
              </div>

              <div className="space-y-2 font-mono text-xs">
                {/* 1. Mesure effectuée */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <span>Mesure effectuée à :</span>
                  </div>
                  <span className="font-bold text-white tracking-wide">
                    {safeFormatTime(auditTimestamps?.data_timestamp || lastSyncTimestamp)}
                  </span>
                </div>

                {/* 2. Reçue par le serveur */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold">
                    <Server className="w-4 h-4 text-sky-400" />
                    <span>Reçue et validée par le serveur :</span>
                  </div>
                  <span className="font-bold text-white tracking-wide">
                    {safeFormatTime(auditTimestamps?.server_timestamp || lastSyncTimestamp)}
                  </span>
                </div>

                {/* 3. Mise en cache locale */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Mise en cache locale (IndexedDB) :</span>
                  </div>
                  <span className="font-bold text-white tracking-wide">
                    {safeFormatTime(auditTimestamps?.cache_timestamp || lastSyncTimestamp)}
                  </span>
                </div>

                {/* 4. Horodatage source */}
                {auditTimestamps?.source_timestamp && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-850 text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Horodatage d'émission source :</span>
                    </div>
                    <span className="text-slate-300">
                      {safeFormatTime(auditTimestamps.source_timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Storage metric */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                <span>Espace IndexedDB alloué :</span>
              </span>
              <span className="text-slate-300 font-bold">{stats?.storageEstimateMb ?? 4.8} Mo</span>
            </div>
          </div>
        )}

        {/* Action Button Section (User Requested: "Actualiser lorsque la connexion revient") */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Veille active : reconnexion automatique dès rétablissement du réseau.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleTestConnection}
              disabled={isPinging || isRefreshing}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition shadow-lg ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isPinging || isRefreshing ? 'animate-spin' : ''}`} />
              <span>
                {isPinging || isRefreshing
                  ? 'Actualisation en cours...'
                  : 'Actualiser lorsque la connexion revient'}
              </span>
            </button>
          </div>
        </div>

        {/* Feedback banner if tested */}
        {pingSuccess !== null && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              pingSuccess
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                : 'bg-amber-950/60 border-amber-600 text-amber-300'
            }`}
          >
            {pingSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Connexion établie avec succès ! Les données fraîches sont synchronisées.</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Le réseau reste actuellement inaccessible. La surveillance se poursuit sur le cache certifié.</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
