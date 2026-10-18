import React from 'react';
import { Radio, Search, RefreshCw, Wifi, WifiOff, Menu, Settings, Sun, Moon, Compass } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTheme } from '../context/ThemeContext';
import { HelpTooltip } from './HelpTooltip';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenAdminSync?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onNavigateToHealth?: () => void;
  onOpenOfflineCenter?: () => void;
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenTour?: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAdminSync,
  isRefreshing,
  onRefresh,
  onNavigateToHealth,
  onOpenOfflineCenter,
  onOpenMenu,
  onOpenSettings,
  onOpenTour,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const isOnline = useOnlineStatus();
  const { isLight, toggleTheme } = useTheme();

  const handleConnectivityClick = () => {
    if (!isOnline && onOpenOfflineCenter) {
      onOpenOfflineCenter();
    } else if (onNavigateToHealth) {
      onNavigateToHealth();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Left: Hamburger button + Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Hamburger Menu Trigger */}
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Ouvrir le menu de navigation"
              title="Menu principal"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>
          )}

          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-tight text-white">
                RADIATION FRANCE
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-amber-400 uppercase hidden xs:inline">
                Téléray
              </span>
              <HelpTooltip
                title="Plateforme Radiation France"
                position="bottom"
                align="start"
                content="Portail métrologique indépendant de restitution en direct de la radioactivité environnementale en France métropolitaine et Corse. Centralise les flux Téléray et OPERA-Air (ASNR-IRSN), EURDEP (Union Européenne) et les capteurs citoyens (OpenRadiation, Safecast)."
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5 hidden sm:block">
              Surveillance de la radioactivité environnementale
            </p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
            aria-label="Changer de thème"
          >
            {isLight ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Contextual Tour button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Lancer la visite guidée"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Visite</span>
            </button>
          )}

          {/* Demo Mode Toggle */}
          {onToggleDemoMode && (
            <button
              onClick={onToggleDemoMode}
              title={isDemoMode ? "Mode Démonstration actif. Cliquer pour revenir au mode Données Réelles." : "Basculer en Mode Démonstration (données simulées pour tests)."}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono font-bold border transition cursor-pointer ${
                isDemoMode
                  ? 'border-purple-500/50 bg-purple-950/80 text-purple-300 hover:bg-purple-900/60 shadow-xs'
                  : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{isDemoMode ? '🧪 DÉMO' : '🛡️ RÉEL'}</span>
            </button>
          )}

          {/* Connectivity Badge */}
          <button
            onClick={handleConnectivityClick}
            title={isOnline ? "Consulter l'état de santé du réseau et des sources" : "Ouvrir le centre d'information hors connexion"}
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition cursor-pointer hover:opacity-90 ${
              isOnline
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/70'
                : 'border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-950/70'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="font-mono">En direct</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="font-mono">Hors ligne</span>
              </>
            )}
          </button>

          {/* Search Trigger */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Rechercher une station ou commune"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Rechercher</span>
            </button>
          )}

          {/* Settings Trigger */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Paramètres système et mises à jour"
              aria-label="Paramètres système"
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-amber-400" />
            </button>
          )}

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              title="Rafraîchir les mesures"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
