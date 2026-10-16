import React from 'react';
import type { NavTab } from './Navigation';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Home,
  Map,
  Radio,
  GitCompare,
  History,
  Activity,
  Layers,
  AlertTriangle,
  Database,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Download,
  ShieldAlert,
  Compass,
  Wifi,
  WifiOff,
  ChevronRight,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { HelpTooltip } from './HelpTooltip';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onOpenDisclaimer: () => void;
  onOpenTour: () => void;
  onOpenOfflineCenter?: () => void;
  alertCount?: number;
}

interface NavCategory {
  title: string;
  icon: string;
  tooltip?: string;
  items: {
    id?: NavTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: () => void;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  onOpenSettings,
  onOpenDisclaimer,
  onOpenTour,
  onOpenOfflineCenter,
  alertCount = 0,
}) => {
  const { isLight, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

  if (!isOpen) return null;

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    onClose();
  };

  const categories: NavCategory[] = [
    {
      title: 'SURVEILLANCE & CARTOGRAPHIE',
      icon: '📡',
      tooltip: 'Modules de cartographie dynamique et inventaire des sondes de détection géolocalisées en temps réel.',
      items: [
        {
          id: 'home',
          label: 'Accueil',
          description: 'Vue nationale, dernière mesure et état du réseau',
          icon: Home,
        },
        {
          id: 'map',
          label: 'Carte Interactive',
          description: 'Cartographie des 457 balises géolocalisées',
          icon: Map,
        },
        {
          id: 'stations',
          label: 'Annuaire des Stations',
          description: 'Liste complète des sondes avec recherche et filtres',
          icon: Radio,
        },
      ],
    },
    {
      title: 'ANALYSES & OUTILS AVANCÉS',
      icon: '📊',
      tooltip: 'Outils avancés de comparaison multi-stations, typologie des capteurs et timeline historique chronologique 2026.',
      items: [
        {
          id: 'compare',
          label: 'Comparateur de Stations',
          description: 'Superposition et analyse croisée jusqu\'à 4 balises',
          icon: GitCompare,
        },
        {
          id: 'types',
          label: 'Types de Mesure',
          description: 'Dose gamma ambiante, aérosols OPERA-Air et fleuves',
          icon: Layers,
        },
        {
          id: 'timeline',
          label: 'Timeline des Événements',
          description: 'Chronologie 2026 : Téléray + Alertes + Météo',
          icon: History,
          badge: '2026',
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        },
      ],
    },
    {
      title: 'RÉSEAU, ALERTES & SOURCES',
      icon: '🚨',
      tooltip: 'Veille technique sur les seuils d\'alerte de sécurité civile, disponibilité des balises et catalogue des sources.',
      items: [
        {
          id: 'alerts',
          label: 'Alertes & Bulletins',
          description: 'Surveillance des seuils d\'alerte et échelle INES',
          icon: AlertTriangle,
          badge: alertCount > 0 ? alertCount : undefined,
          badgeColor: 'bg-red-500 text-white',
        },
        {
          id: 'health',
          label: 'Santé Réseau',
          description: 'Disponibilité 99,1%, latences et télésurveillance',
          icon: Activity,
        },
        {
          id: 'sources',
          label: 'Registre des Sources',
          description: 'Téléray, EURDEP, OpenRadiation, Safecast',
          icon: Database,
        },
      ],
    },
    {
      title: 'PÉDAGOGIE & MÉTROLOGIE',
      icon: '📖',
      tooltip: 'Guides pédagogiques de métrologie nucléaire, parcours guidé interactif et mentions légales obligatoires.',
      items: [
        {
          id: 'info',
          label: 'Méthodologie Scientifique',
          description: 'Dose vs Activité, Géologie, Pluie/Radon, Cosmique',
          icon: BookOpen,
        },
        {
          label: 'Visite Guidée / Onboarding',
          description: 'Parcours explicatif des fonctionnalités clés',
          icon: Compass,
          action: () => {
            onClose();
            onOpenTour();
          },
        },
        {
          label: 'Mentions Légales & Non-Responsabilité',
          description: 'Conditions d\'utilisation et clause de décharge d\'auteur',
          icon: ShieldAlert,
          action: () => {
            onClose();
            onOpenDisclaimer();
          },
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm animate-in fade-in">
      {/* Side Drawer */}
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-2xl text-slate-100 font-mono text-xs animate-in slide-in-from-left duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <span>RADIATION FRANCE</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                  Menu
                </span>
                <HelpTooltip
                  title="Menu de Navigation Thématique"
                  position="bottom"
                  align="start"
                  content="Regroupe l'ensemble des modules applicatifs organisés en 4 grandes catégories thématiques : surveillance, analyse, réseau et pédagogie."
                />
              </div>
              <p className="text-[10px] text-slate-400">Navigation catégorisée</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Top Bar (PWA Install + Theme Toggle + Offline Center) */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition font-semibold"
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLight ? 'Thème Sombre' : 'Thème Clair'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition font-semibold"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Paramètres</span>
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 tracking-wider flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                </div>
                {cat.tooltip && (
                  <HelpTooltip
                    title={cat.title}
                    position="left"
                    content={cat.tooltip}
                  />
                )}
              </div>

              <div className="space-y-1">
                {cat.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = item.id && currentTab === item.id;

                  return (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.id) {
                          handleSelectTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left group ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 pr-2">
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                          }`}
                        />
                        <div className="truncate">
                          <div className={`text-xs ${isActive ? 'text-slate-950 font-bold' : 'text-white'}`}>
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive ? 'text-slate-900/80' : 'text-slate-400'
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.badge !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-slate-950' : 'text-slate-600 group-hover:text-slate-300'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Install Application Button in Hamburger */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="text-[10px] font-bold text-slate-500 tracking-wider px-2 uppercase">
              📱 Application Hors Ligne
            </div>
            <PWAInstallButton className="w-full justify-center py-2.5 text-xs font-bold" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Connecté</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">Hors ligne</span>
              </>
            )}
          </div>

          <span className="text-slate-500">v1.4.2 • 2026</span>
        </div>
      </div>

      {/* Backdrop clickable to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
