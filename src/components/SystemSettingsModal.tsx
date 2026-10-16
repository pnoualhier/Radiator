import React from 'react';
import { useAppUpdate } from '../hooks/useAppUpdate';
import { useTheme } from '../context/ThemeContext';
import { safeFormatDateTime } from '../utils/dateUtils';
import {
  Settings,
  X,
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  Calendar,
  Clock,
  Sun,
  Moon,
  ShieldAlert,
  Download,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { HelpTooltip } from './HelpTooltip';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDisclaimer?: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenDisclaimer,
}) => {
  const {
    appVersion,
    releaseDate,
    buildCommit,
    lastCheckedAt,
    isChecking,
    updateAvailable,
    statusMessage,
    autoUpdateEnabled,
    toggleAutoUpdate,
    checkForUpdate,
    forceUpdate,
  } = useAppUpdate();

  const { theme, toggleTheme, isLight } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">Paramètres Système</h2>
                <HelpTooltip
                  title="Centre de Configuration Système"
                  position="bottom"
                  align="start"
                  content="Paramétrez les fonctionnalités globales de l'application : gestion des versions logicielles, système de mises à jour silencieuses en tâche de fond, bascule de thème clair/sombre et installation sur votre bureau ou mobile."
                />
              </div>
              <p className="text-xs text-slate-400">Version, mises à jour & affichage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs font-mono">
          
          {/* SECTION 1: Version & Release Information */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Version du système</span>
                <HelpTooltip
                  title="Traçabilité du Logiciel"
                  position="bottom"
                  align="start"
                  content="Indique le numéro de version déployée, la date de compilation et le hash du commit Git assurant l'intégrité du code source exécuté dans votre navigateur."
                />
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                {appVersion}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <Calendar className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Date de sortie</div>
                  <div className="font-bold text-white mt-0.5">{releaseDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Dernière vérification</div>
                  <div className="font-semibold text-slate-200 mt-0.5 text-[11px]">
                    {safeFormatDateTime(lastCheckedAt || new Date().toISOString(), 'À l\'instant')}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
              <span>Build identifiant : <code>{buildCommit}</code></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connecté PWA
              </span>
            </div>
          </div>

          {/* SECTION 2: Update Management */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <RefreshCw className="w-4 h-4 text-sky-400" />
                <span>Gestion des Mises à Jour</span>
                <HelpTooltip
                  title="Gestionnaire des Mises à Jour & Cache"
                  position="bottom"
                  align="start"
                  content="Contrôle les mises à jour automatiques en tâche de fond (toutes les 15 min via Service Worker). Le bouton « Forcer la mise à jour » vide le cache HTTP/IndexedDB et recharge les bundles JS les plus récents."
                />
              </div>
              <span className="text-[11px] text-slate-400">
                {updateAvailable ? '🔔 Mise à jour prête' : '✅ À jour'}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              Le système compare régulièrement les signatures logicielles et télécharge automatiquement les nouvelles versions sans interrompre la surveillance radiologique.
            </p>

            {/* Status message */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-300">{statusMessage}</span>
              {isChecking && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            </div>

            {/* Auto-update Background Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mises à jour automatiques en arrière-plan</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Vérification toutes les 15 minutes et installation transparente
                </div>
              </div>

              <button
                type="button"
                onClick={toggleAutoUpdate}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  autoUpdateEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={autoUpdateEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoUpdateEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Update Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => checkForUpdate()}
                disabled={isChecking}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-400' : ''}`} />
                <span>Vérifier les mises à jour</span>
              </button>

              <button
                onClick={forceUpdate}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition"
                title="Purge tous les caches du navigateur et recharge la version la plus récente"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Forcer la mise à jour</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: Theme Appearance Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                {isLight ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
                <span>Thème & Apparence visuelle</span>
                <HelpTooltip
                  title="Confort Visuel & Thèmes"
                  position="bottom"
                  align="start"
                  content="Basculez entre le Mode Sombre (optimisé pour les salles de contrôle et environnements nocturnes) et le Mode Clair (contraste renforcé pour une lisibilité parfaite en plein jour avec textes foncés)."
                />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                {isLight ? 'Clair' : 'Sombre'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Basculer le thème</div>
                <div className="text-[10px] text-slate-400">
                  {isLight ? 'Thème clair haute lisibilité activé' : 'Thème sombre tactique activé'}
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition font-mono text-xs font-bold"
              >
                {isLight ? (
                  <>
                    <Moon className="w-4 h-4 text-sky-400" />
                    <span>Mode Sombre</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Mode Clair</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 4: Install PWA Application */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Installer l'application sur l'appareil</span>
                <HelpTooltip
                  title="Application Web Progressive (PWA)"
                  position="bottom"
                  align="start"
                  content="Permet d'ajouter un raccourci direct sur votre bureau Windows/Mac/Linux ou sur l'écran d'accueil iOS/Android, fonctionnant en plein écran avec persistance intégrale des mesures hors ligne."
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ajoute l'icône de Radiation France sur votre écran d'accueil (mobile ou PC) pour un accès instantané et une consultation hors connexion.
            </p>
            <div className="pt-1">
              <PWAInstallButton className="w-full justify-center py-2" />
            </div>
          </div>

          {/* SECTION 5: Legal Mentions & Disclaimer */}
          {onOpenDisclaimer && (
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenDisclaimer();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Consulter les Mentions Légales & Avertissement de Non-Responsabilité</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Radiation France • Open Data</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
