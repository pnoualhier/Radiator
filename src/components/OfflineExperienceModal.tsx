import React from 'react';
import { WifiOff, Database, CheckCircle2, AlertCircle, X, Clock, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import type { AuditTimestamps } from '../types/radiation';
import { safeFormatDateTime, safeFormatTime } from '../utils/dateUtils';
import { HelpTooltip } from './HelpTooltip';

interface OfflineExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSyncTimestamp?: string;
  timestamps?: AuditTimestamps | null;
  onNavigateToTab?: (tab: string) => void;
}

export const OfflineExperienceModal: React.FC<OfflineExperienceModalProps> = ({
  isOpen,
  onClose,
  lastSyncTimestamp,
  timestamps,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const dataTime = timestamps?.data_timestamp || lastSyncTimestamp;
  const dataLocal = safeFormatDateTime(dataTime, 'Non disponible');
  
  // Calculate relative age in minutes or hours
  const computeAge = (iso?: string) => {
    if (!iso) return 'Non renseigné';
    const t = new Date(iso).getTime();
    if (isNaN(t)) return 'Récemment';
    const diffMs = Date.now() - t;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Il y a moins d\'une minute';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  const relativeAge = computeAge(dataTime);

  const pagesAvailableOffline = [
    { name: 'Accueil & Vue Nationale', desc: 'Dernière mesure de référence et cartographie nationale en cache', tab: 'home' },
    { name: 'Annuaire des Balises', desc: 'Les 457 balises d\'État et capteurs citoyens enregistrés localement', tab: 'stations' },
    { name: 'Fiches Détaillées des Stations', desc: 'Historique des relevés, matrice géologique et métadonnées mémorisées', tab: 'stations' },
    { name: 'Comparateur de Balises', desc: 'Courbes temporelles comparatives pour les stations préchargées', tab: 'compare' },
    { name: 'Types de Mesure', desc: 'Répertoire complet des grandeurs physiques (gamma, aérosols, tritium)', tab: 'types' },
    { name: 'Méthodologie Scientifique', desc: 'Explications physiques (granite vs calcaire, pluie, altitude)', tab: 'info' },
    { name: 'Mentions Légales & Licences', desc: 'Régimes de réutilisation juridique et obligations d\'attribution', tab: 'disclaimer' },
  ];

  const featuresRequiringOnline = [
    { name: 'Synchronisation API en direct', desc: 'Interrogation instantanée des flux Téléray / ASNR et OpenRadiation' },
    { name: 'Téléchargement de nouvelles séries', desc: 'Récupération d\'historiques distants non encore visités' },
    { name: 'Recherche distante étendue', desc: 'Requêtes de géolocalisation pour des adresses non répertoriées en cache' },
    { name: 'Soumission citoyenne', desc: 'Envoi de nouvelles télémesures citoyennes vers le serveur central' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-100 font-mono text-xs max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Centre d'Expérience Hors Ligne
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Autonomie PWA
                </span>
                <HelpTooltip
                  title="Expérience hors ligne explicite"
                  position="bottom"
                  align="start"
                  content="Ce centre documente précisément l'ancienneté des données enregistrées dans votre base locale IndexedDB et sépare sans ambiguïté les modules consultables hors connexion de ceux qui exigent un accès réseau."
                />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Transparence sur l'état du cache local et la disponibilité des fonctionnalités
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Ancienneté et fraîcheur des données enregistrées */}
        <div className="rounded-2xl border border-amber-600/40 bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-amber-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-xs flex items-center gap-2 uppercase">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Ancienneté des Données Locales Enregistrées</span>
            </span>
            <span className="text-[10px] text-slate-400 font-sans bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              Base Dexie IndexedDB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase text-slate-500 block">Dernier enregistrement</span>
              <span className="text-white font-bold text-xs">{dataLocal}</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase text-slate-500 block">Âge relatif du cache</span>
              <span className="text-amber-300 font-bold text-xs">{relativeAge}</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase text-slate-500 block">Volume sauvegardé</span>
              <span className="text-emerald-400 font-bold text-xs">12 000+ télémesures</span>
            </div>
          </div>
        </div>

        {/* 2. Distinction des pages : Disponibles hors ligne vs Connexion requise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column A: Pages disponibles hors ligne */}
          <div className="rounded-2xl border border-emerald-800/60 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase border-b border-emerald-900/40 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>🟢 Disponibles Hors Connexion (7)</span>
            </div>
            <div className="space-y-2">
              {pagesAvailableOffline.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.name}</span>
                    {onNavigateToTab && item.tab && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToTab(item.tab);
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 transition flex items-center gap-0.5"
                      >
                        <span>Ouvrir</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column B: Fonctionnalités nécessitant une connexion */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase border-b border-slate-800 pb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>🟡 Nécessitent une Connexion (4)</span>
            </div>
            <div className="space-y-2">
              {featuresRequiringOnline.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-0.5 opacity-85">
                  <div className="font-bold text-slate-300">{item.name}</div>
                  <p className="text-[10px] text-slate-400 font-sans leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-sans">
            La synchronisation se déclenchera automatiquement dès la détection du retour du réseau.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
