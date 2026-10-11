import React from 'react';
import type { ObservationMode } from '../types/radiation';
import { Radio, Wind, Droplets, Users, ShieldCheck, ChevronRight, Activity, Sparkles, Layers } from 'lucide-react';

interface MultiEnvironmentTreeProps {
  selectedMode: ObservationMode;
  onSelectMode: (mode: ObservationMode) => void;
  counts?: {
    all: number;
    ambient: number;
    aerosols: number;
    water: number;
    citizen: number;
  };
  compact?: boolean;
}

export const MultiEnvironmentTree: React.FC<MultiEnvironmentTreeProps> = ({
  selectedMode,
  onSelectMode,
  counts,
  compact = false,
}) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/90 p-5 md:p-6 shadow-2xl backdrop-blur-md">
      {/* Title & Concept Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Architecture Métrologique Multi-Environnement</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white font-mono tracking-tight mt-0.5">
            CARTE & SURVEILLANCE MULTI-ENVIRONNEMENT : AIR, EAU, SOL
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            L'ASNR et ses partenaires surveillent la radioactivité à travers trois matrices distinctes. Cliquez sur une branche pour filtrer la cartographie selon le vecteur souhaité.
          </p>
        </div>

        {/* Global Reset / All Button */}
        <button
          onClick={() => onSelectMode('ALL')}
          className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition shadow ${
            selectedMode === 'ALL'
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Tous les milieux {counts?.all !== undefined ? `(${counts.all})` : ''}</span>
        </button>
      </div>

      {/* Visual ASCII / Node Tree Diagram */}
      <div className="relative">
        {/* Top Node: RADIATOR */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 shadow text-xs font-mono font-black text-amber-300 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>RADIATOR • HUB MULTI-ENVIRONNEMENT</span>
          </div>
          {/* Vertical Stem */}
          <div className="w-0.5 h-6 bg-slate-700" />
        </div>

        {/* Horizontal Connector Bar */}
        <div className="relative mx-auto max-w-3xl">
          <div className="hidden md:block w-full h-0.5 bg-slate-700" />
          {/* Connection Drops */}
          <div className="hidden md:flex justify-between -mt-0.5 px-12">
            <div className="w-0.5 h-4 bg-emerald-500/70" />
            <div className="w-0.5 h-4 bg-cyan-500/70" />
            <div className="w-0.5 h-4 bg-purple-500/70" />
          </div>
        </div>

        {/* 3 Main Environment Pillars (Air, Eau, Sol/Env.) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 md:mt-0">
          {/* 1. AIR Branch */}
          <div
            className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
              selectedMode === 'AMBIENT_GAMMA' || selectedMode === 'ATMOSPHERIC_AEROSOLS'
                ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wide">
                  <Wind className="w-4 h-4" />
                  <span>1. Vecteur AIR</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                  Atmosphère
                </span>
              </div>

              {/* Sub-networks under AIR */}
              <div className="space-y-2">
                {/* Téléray Button */}
                <button
                  onClick={() => onSelectMode('AMBIENT_GAMMA')}
                  className={`w-full text-left p-3 rounded-xl border transition group ${
                    selectedMode === 'AMBIENT_GAMMA'
                      ? 'border-emerald-500 bg-emerald-900/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-emerald-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-emerald-300">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Téléray (ASNR)</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      nSv/h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Surveillance gamma ambiante externe.
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-400/90 mt-2 font-mono">
                    <span>Compteurs Geiger continus</span>
                    {counts?.ambient !== undefined && <span>{counts.ambient} stations</span>}
                  </div>
                </button>

                {/* OPERA-Air Button */}
                <button
                  onClick={() => onSelectMode('ATMOSPHERIC_AEROSOLS')}
                  className={`w-full text-left p-3 rounded-xl border transition group ${
                    selectedMode === 'ATMOSPHERIC_AEROSOLS'
                      ? 'border-teal-500 bg-teal-900/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-teal-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-teal-300">
                      <Wind className="w-3.5 h-3.5" />
                      <span>OPERA-Air (ASNR-IRSN)</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-teal-300 bg-slate-900 px-1.5 py-0.5 rounded">
                      Bq/m³ (µBq/m³)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Aérosols et radionucléides à l'état de traces (Cs-137, Be-7, I-131).
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-teal-400/90 mt-2 font-mono">
                    <span>Filtres 700 m³/h + Spectrométrie</span>
                    {counts?.aerosols !== undefined && <span>{counts.aerosols} stations</span>}
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Distinction clé :</span>
              <span className="text-emerald-400">Dose externe vs Traces dans l'air</span>
            </div>
          </div>

          {/* 2. EAU Branch */}
          <div
            className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
              selectedMode === 'WATER_RADIOACTIVITY'
                ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wide">
                  <Droplets className="w-4 h-4" />
                  <span>2. Vecteur EAU</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  Hydrographie
                </span>
              </div>

              {/* Sub-networks under EAU */}
              <div className="space-y-2">
                {/* HydroTéléray Button */}
                <button
                  onClick={() => onSelectMode('WATER_RADIOACTIVITY')}
                  className={`w-full text-left p-3 rounded-xl border transition group ${
                    selectedMode === 'WATER_RADIOACTIVITY'
                      ? 'border-cyan-500 bg-cyan-900/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-cyan-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-cyan-300">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>HydroTéléray (ASNR-IRSN)</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">
                      Bq/L
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Surveillance continue des principaux cours d'eau en aval des centrales.
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-cyan-400/90 mt-2 font-mono">
                    <span>Rhône, Loire, Seine, Rhin, Garonne...</span>
                    {counts?.water !== undefined && <span>{counts.water} stations</span>}
                  </div>
                </button>

                {/* Additional water context badge */}
                <div className="rounded-xl border border-cyan-900/40 bg-slate-950/40 p-2.5 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-cyan-300 text-[10px] uppercase font-mono">
                    Isotope cible principal : Tritium (H-3)
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Mesure l'activité volumique fluviale. Seuil OMS eau potable : 10 000 Bq/L (fleuves français : 1 à 4 Bq/L).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Cible :</span>
              <span className="text-cyan-400">Effluents liquides tritiés</span>
            </div>
          </div>

          {/* 3. SOL / ENV. Branch */}
          <div
            className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
              selectedMode === 'CITIZEN_DATA'
                ? 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs uppercase tracking-wide">
                  <Users className="w-4 h-4" />
                  <span>3. SOL / ENV. CITOYEN</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                  Participatif
                </span>
              </div>

              {/* Sub-networks under SOL / ENV */}
              <div className="space-y-2">
                {/* OpenRadiation & Safecast Button */}
                <button
                  onClick={() => onSelectMode('CITIZEN_DATA')}
                  className={`w-full text-left p-3 rounded-xl border transition group ${
                    selectedMode === 'CITIZEN_DATA'
                      ? 'border-purple-500 bg-purple-900/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-purple-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-purple-300">
                      <Users className="w-3.5 h-3.5" />
                      <span>OpenRadiation & Safecast</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-300 bg-slate-900 px-1.5 py-0.5 rounded">
                      µSv/h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Capteurs citoyens indépendants géolocalisés au sol et en déplacement.
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-purple-400/90 mt-2 font-mono">
                    <span>RiumBox, bGeigie Nano, Open Data</span>
                    {counts?.citizen !== undefined && <span>{counts.citizen} points</span>}
                  </div>
                </button>

                {/* Additional citizen context badge */}
                <div className="rounded-xl border border-purple-900/40 bg-slate-950/40 p-2.5 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-purple-300 text-[10px] uppercase font-mono">
                    Sciences citoyennes & Tiers de confiance
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Complément indépendant de terrain pour croiser les données institutionnelles d'État et citoyennes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Caractère :</span>
              <span className="text-purple-400">Complémentarité citoyenne</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
