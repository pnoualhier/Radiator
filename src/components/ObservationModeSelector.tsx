import React from 'react';
import type { ObservationMode } from '../types/radiation';
import { OBSERVATION_MODES } from '../types/radiation';
import { Radio, Wind, Droplets, Users, Layers, Info, Filter, Sparkles } from 'lucide-react';

interface ObservationModeSelectorProps {
  selectedMode: ObservationMode;
  onSelectMode: (mode: ObservationMode) => void;
  selectedRadionuclide?: string;
  onSelectRadionuclide?: (nuclide: string) => void;
  selectedAerosolUnit?: 'ubqm3' | 'bqm3';
  onSelectAerosolUnit?: (unit: 'ubqm3' | 'bqm3') => void;
  counts?: {
    all: number;
    ambient: number;
    aerosols: number;
    water: number;
    citizen: number;
  };
  compact?: boolean;
}

export const ObservationModeSelector: React.FC<ObservationModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  selectedRadionuclide = 'ALL',
  onSelectRadionuclide,
  selectedAerosolUnit = 'ubqm3',
  onSelectAerosolUnit,
  counts,
  compact = false,
}) => {
  const modes: {
    id: ObservationMode;
    title: string;
    flow: string;
    badge: string;
    unit: string;
    icon: any;
    color: string;
    activeBorder: string;
    activeBg: string;
    count?: number;
  }[] = [
    {
      id: 'AMBIENT_GAMMA',
      title: 'Rayonnement ambiant',
      flow: 'Téléray ↓ débit de dose ↓ nSv/h',
      badge: 'Surveillance d État',
      unit: 'nSv/h',
      icon: Radio,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20',
      activeBg: 'bg-emerald-950/40',
      count: counts?.ambient,
    },
    {
      id: 'ATMOSPHERIC_AEROSOLS',
      title: 'Radionucléides dans l atmosphère',
      flow: 'OPERA-Air ↓ radionucléide ↓ Bq/m³',
      badge: 'Aérosols & Traces',
      unit: 'Bq/m³ (µBq/m³)',
      icon: Wind,
      color: 'text-teal-400',
      activeBorder: 'border-teal-500 ring-2 ring-teal-500/20',
      activeBg: 'bg-teal-950/40',
      count: counts?.aerosols,
    },
    {
      id: 'WATER_RADIOACTIVITY',
      title: 'Radioactivité des eaux',
      flow: 'HydroTéléray ↓ fleuves ↓ Bq/L (Tritium)',
      badge: 'Bassin fluvial',
      unit: 'Bq/L',
      icon: Droplets,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/20',
      activeBg: 'bg-cyan-950/40',
      count: counts?.water,
    },
    {
      id: 'CITIZEN_DATA',
      title: 'Données citoyennes',
      flow: 'OpenRadiation & Safecast ↓ µSv/h',
      badge: 'Sciences participatives',
      unit: 'µSv/h',
      icon: Users,
      color: 'text-purple-400',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/20',
      activeBg: 'bg-purple-950/40',
      count: counts?.citizen,
    },
  ];

  const radionuclides = [
    { id: 'ALL', label: 'Tous les radionucléides', badge: 'Multi-isotopes' },
    { id: 'Cs-137', label: 'Césium-137 (Cs-137)', badge: 'Artificiel historique (0,2 - 0,5 µBq/m³)' },
    { id: 'Be-7', label: 'Béryllium-7 (Be-7)', badge: 'Naturel cosmogénique (~3500 µBq/m³)' },
    { id: 'Pb-210', label: 'Plomb-210 (Pb-210)', badge: 'Naturel descendant radon (~450 µBq/m³)' },
    { id: 'I-131', label: 'Iode-131 (I-131)', badge: 'Médical & réacteurs (< 0,15 µBq/m³)' },
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
          <span>☢️ Observer :</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {modes.map(m => {
            const Icon = m.icon;
            const isActive = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left border transition text-xs ${
                  isActive
                    ? `${m.activeBorder} ${m.activeBg} text-white font-semibold shadow-md`
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-slate-900' : 'bg-slate-800'} ${m.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{m.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{m.unit}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-5 md:p-6 shadow-2xl space-y-4">
      {/* Header Prompt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Sélecteur Métrologique Territorial</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight mt-1 flex items-center gap-2">
            <span>☢️ QUE SOUHAITEZ-VOUS OBSERVER ?</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Passez instantanément du <strong>débit de dose gamma externe (Téléray)</strong> à la <strong>surveillance des radionucléides atmosphériques (OPERA-Air)</strong>, des cours d eau ou des capteurs citoyens.
          </p>
        </div>

        {/* Button to reset to view all */}
        <button
          onClick={() => onSelectMode('ALL')}
          className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition ${
            selectedMode === 'ALL'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
              : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Vue complète {counts?.all ? `(${counts.all})` : ''}</span>
        </button>
      </div>

      {/* 4 Multi-Level Surveillance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map(m => {
          const Icon = m.icon;
          const isActive = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition relative overflow-hidden group shadow-lg ${
                isActive
                  ? `${m.activeBorder} ${m.activeBg} shadow-slate-950`
                  : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    isActive ? 'bg-slate-900 shadow-inner' : 'bg-slate-800 group-hover:scale-105'
                  } ${m.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-slate-900/80 border-slate-700 text-white font-semibold'
                      : 'bg-slate-800/60 border-slate-800 text-slate-400'
                  }`}>
                    {m.badge}
                  </span>
                </div>

                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                  {m.title}
                </div>

                <div className="mt-2 text-[11px] font-mono text-amber-400/90 font-semibold bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-lg">
                  {m.flow}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Unité : <strong className="text-white">{m.unit}</strong></span>
                {m.count !== undefined && (
                  <span className="font-mono text-[11px] text-slate-300 font-bold bg-slate-800/80 px-1.5 py-0.5 rounded">
                    {m.count} stations
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-Panel: When Atmospheric Aerosols (OPERA-Air) is active */}
      {selectedMode === 'ATMOSPHERIC_AEROSOLS' && (
        <div className="rounded-2xl border border-teal-800/80 bg-gradient-to-r from-teal-950/60 via-slate-900/90 to-teal-950/40 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-800/40 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                  Surveillance fine des aérosols : Réseau OPERA-Air (ASNR-IRSN)
                </span>
                <p className="text-[11px] text-teal-200/80">
                  Prélèvements en continu à très grand débit (700 m³/h) sur filtres polypropylène plissés & analyse spectrale HPGe.
                </p>
              </div>
            </div>

            {/* Unit Toggle: µBq/m³ vs Bq/m³ */}
            {onSelectAerosolUnit && (
              <div className="flex items-center gap-1 bg-slate-950/80 border border-teal-800/60 p-1 rounded-xl text-xs font-mono">
                <span className="text-[10px] text-slate-400 px-1.5">Unité :</span>
                <button
                  onClick={() => onSelectAerosolUnit('ubqm3')}
                  className={`px-2 py-0.5 rounded-lg transition font-bold ${
                    selectedAerosolUnit === 'ubqm3'
                      ? 'bg-teal-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Microbecquerels par m³ (valeurs usuelles lisibles : ~0.35 µBq/m³)"
                >
                  µBq/m³ (micro)
                </button>
                <button
                  onClick={() => onSelectAerosolUnit('bqm3')}
                  className={`px-2 py-0.5 rounded-lg transition font-bold ${
                    selectedAerosolUnit === 'bqm3'
                      ? 'bg-teal-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Becquerels par m³ (notation scientifique SI : 3.5e-7 Bq/m³)"
                >
                  Bq/m³ (SI)
                </button>
              </div>
            )}
          </div>

          {/* Radionuclide Pills */}
          {onSelectRadionuclide && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-teal-300 font-semibold flex items-center gap-1.5">
                <Filter className="w-3 h-3" />
                <span>Sélectionner le radionucléide cible à observer :</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {radionuclides.map(r => {
                  const isRActive = selectedRadionuclide === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelectRadionuclide(r.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition ${
                        isRActive
                          ? 'bg-teal-500 text-slate-950 border-teal-300 font-bold shadow'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{r.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isRActive ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {r.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Panel: When Water Radioactivity (HydroTéléray) is active */}
      {selectedMode === 'WATER_RADIOACTIVITY' && (
        <div className="rounded-2xl border border-cyan-800/80 bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-cyan-950/40 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-800/40 pb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                  Surveillance continue des fleuves : Réseau HydroTéléray (ASNR-IRSN)
                </span>
                <p className="text-[11px] text-cyan-200/80">
                  Mesure en continu de la radioactivité liquide dans les grands cours d'eau (Rhône, Loire, Seine, Rhin, Garonne, Meuse, Moselle) en aval des centrales nucléaires.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span className="bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-xl">
                Unité : <strong>Bq/L</strong> (Tritium H-3)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-800/40">
              <div className="text-[10px] uppercase font-mono text-slate-400">Niveaux usuels constatés</div>
              <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">1,5 à 4,0 Bq/L</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Dilution fluviale normale</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Référence qualité UE</div>
              <div className="text-base font-bold font-mono text-amber-400 mt-0.5">100 Bq/L</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Directive 2013/51/Euratom</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Guide santé OMS</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">10 000 Bq/L</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Eau de consommation</div>
            </div>
          </div>
        </div>
      )}

      {/* Fundamental Metrological Explanation Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3.5 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p>
            <strong>Pourquoi deux niveaux distincts ?</strong> Une balise <strong>Téléray</strong> (débit gamma en <em>nSv/h</em>) compte les rayonnements ambiants externes instantanés, sans aspirer l air ni identifier les isotopes. À l inverse, le réseau sentinelle <strong>OPERA-Air</strong> aspire 700 m³ d air par heure sur des filtres et les analyse par <strong>spectrométrie gamma en laboratoire</strong> pour quantifier l activité en <em>Bq/m³</em> de chaque radionucléide (Césium-137, Béryllium-7, etc.) à l échelle de l infime trace.
          </p>
        </div>
      </div>
    </div>
  );
};
