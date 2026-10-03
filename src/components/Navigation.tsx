import React from 'react';
import { Home, Map, Radio, AlertTriangle, BookOpen, Database, Layers } from 'lucide-react';

export type NavTab = 'home' | 'map' | 'stations' | 'types' | 'alerts' | 'sources' | 'info';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  alertCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  alertCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Accueil', icon: Home },
    { id: 'map' as NavTab, label: 'Carte', icon: Map },
    { id: 'stations' as NavTab, label: 'Stations', icon: Radio },
    { id: 'types' as NavTab, label: 'Types de mesure', icon: Layers },
    {
      id: 'alerts' as NavTab,
      label: 'Alertes',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : undefined,
    },
    { id: 'sources' as NavTab, label: 'Sources', icon: Database },
    { id: 'info' as NavTab, label: 'Comprendre', icon: BookOpen },
  ];

  return (
    <>
      {/* Desktop Navigation Top Bar (embedded below header or inside pages) */}
      <nav className="hidden md:flex items-center justify-center gap-1 border-b border-slate-800/60 bg-slate-950/40 py-2">
        <div className="flex rounded-xl bg-slate-900/60 p-1 border border-slate-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-lg px-1.5 py-1 safe-area-inset-bottom">
        <div className="grid grid-cols-7 gap-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-500/10' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-medium tracking-tight mt-0.5 truncate max-w-full px-0.5">
                  {tab.id === 'types' ? 'Mesures' : tab.label}
                </span>
                {tab.badge !== undefined && (
                  <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[7px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
