import React, { useState, useMemo } from 'react';
import type { Station, ObservationMode } from '../types/radiation';
import { ObservationModeSelector } from '../components/ObservationModeSelector';
import { QualityBadge } from '../components/QualityBadge';
import { HelpTooltip } from '../components/HelpTooltip';
import { Search, Radio, ShieldCheck, Users, MapPin, ArrowUpDown, ChevronRight, Activity, Wind, Droplets, Filter, Sparkles, GitCompare, Star } from 'lucide-react';

interface StationsListPageProps {
  stations: Station[];
  onSelectStation: (stationId: number) => void;
  onCompareStation?: (stationId: number) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  favoriteIds?: number[];
  onToggleFavorite?: (stationId: number) => void;
}

export const StationsListPage: React.FC<StationsListPageProps> = ({
  stations,
  onSelectStation,
  onCompareStation,
  userCoords,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [observationMode, setObservationMode] = useState<ObservationMode>('ALL');
  const [selectedNuclide, setSelectedNuclide] = useState<string>('ALL');
  const [aerosolUnit, setAerosolUnit] = useState<'ubqm3' | 'bqm3'>('ubqm3');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'distance'>('name');

  const counts = useMemo(() => ({
    all: stations.length,
    ambient: stations.filter(s => !s.measurement_type || s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE').length,
    aerosols: stations.filter(s => s.source_code === 'OPERA_AIR' || s.measurement_type === 'ATMOSPHERIC_AEROSOLS').length,
    water: stations.filter(s => s.source_code === 'HYDROTELERAY' || s.measurement_type === 'WATER_RADIOACTIVITY').length,
    citizen: stations.filter(s => s.source_code === 'OPENRADIATION' || s.source_code === 'SAFECAST').length,
  }), [stations]);

  const filteredAndSorted = useMemo(() => {
    let result = stations.filter(s => {
      // 1. Observation Mode Filter
      if (observationMode === 'AMBIENT_GAMMA') {
        if (s.measurement_type && s.measurement_type !== 'AMBIENT_GAMMA_DOSE_RATE') return false;
      } else if (observationMode === 'ATMOSPHERIC_AEROSOLS') {
        if (s.source_code !== 'OPERA_AIR' && s.measurement_type !== 'ATMOSPHERIC_AEROSOLS') return false;
      } else if (observationMode === 'WATER_RADIOACTIVITY') {
        if (s.source_code !== 'HYDROTELERAY' && s.measurement_type !== 'WATER_RADIOACTIVITY') return false;
      } else if (observationMode === 'CITIZEN_DATA') {
        if (s.source_code !== 'OPENRADIATION' && s.source_code !== 'SAFECAST') return false;
      }

      // 2. Radionuclide Filter
      if (selectedNuclide && selectedNuclide !== 'ALL') {
        const target = selectedNuclide.toUpperCase();
        if (!s.radionuclide_focus || !s.radionuclide_focus.toUpperCase().includes(target)) {
          return false;
        }
      }

      // 2b. Only Favorites filter
      if (onlyFavorites) {
        if (!favoriteIds.includes(s.id)) return false;
      }

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const n = s.name.toLowerCase();
        const c = (s.commune || '').toLowerCase();
        const d = (s.department_code || '').toLowerCase();
        const src = (s.source_code || '').toLowerCase();
        const rad = (s.radionuclide_focus || '').toLowerCase();
        return n.includes(q) || c.includes(q) || d.includes(q) || src.includes(q) || rad.includes(q);
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'value') {
        const valA = a.latest_measurement?.value ?? -1;
        const valB = b.latest_measurement?.value ?? -1;
        return valB - valA;
      }
      if (sortBy === 'distance') {
        const distA = a.distance_km ?? 999999;
        const distB = b.distance_km ?? 999999;
        return distA - distB;
      }
      return a.name.localeCompare(b.name, 'fr');
    });

    return result;
  }, [stations, search, observationMode, selectedNuclide, sortBy, onlyFavorites, favoriteIds]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Radio className="w-6 h-6 text-amber-400" />
            <span>STATIONS & BALISES DU TERRITOIRE</span>
            <HelpTooltip
              title="Inventaire métrologique national"
              position="bottom"
              align="start"
              content="Répertoire exhaustif de l'ensemble des points d'échantillonnage et de télémesure active en France métropolitaine et Corse : sondes gamma fixes d'ambiance Téléray (ASNR), stations de filtration d'air à grand débit OPERA-Air (IRSN), stations de surveillance des eaux fluviales HydroTéléray et capteurs citoyens OpenRadiation."
            />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {filteredAndSorted.length} stations sélectionnées sur {stations.length} au total (Téléray, OPERA-Air, HydroTéléray, OpenRadiation)
          </p>
        </div>
      </div>

      {/* ☢️ Primary Observation Mode Selector: "Que souhaitez-vous observer ?" */}
      <ObservationModeSelector
        selectedMode={observationMode}
        onSelectMode={setObservationMode}
        selectedRadionuclide={selectedNuclide}
        onSelectRadionuclide={setSelectedNuclide}
        selectedAerosolUnit={aerosolUnit}
        onSelectAerosolUnit={setAerosolUnit}
        counts={counts}
      />

      {/* Search & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par station, isotope (Cs-137, Be-7, H-3), commune, département..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-10 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <div className="absolute right-3 top-2.5">
            <HelpTooltip
              title="Recherche multi-critères"
              position="bottom"
              align="end"
              content="Recherchez par nom de commune, numéro de département (ex: 75, 87, 29), identifiant de balise, réseau source (Téléray, OPERA, OpenRadiation) ou par isotope analysé (Césium-137, Béryllium-7, Tritium H-3)."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {favoriteIds && favoriteIds.length > 0 && (
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-semibold transition shrink-0 ${
                onlyFavorites
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
              <span>Mes favoris ({favoriteIds.length})</span>
            </button>
          )}

          <div className="flex items-center gap-2 flex-1 sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="name">Trier par : Nom alphabétique</option>
              <option value="value">Trier par : Valeur la plus forte</option>
              {userCoords && <option value="distance">Trier par : Distance la plus proche</option>}
            </select>
            <HelpTooltip
              title="Critères de tri"
              position="bottom"
              align="end"
              content="Permet d'ordonner la liste par ordre alphabétique, par niveau d'activité radiologique décroissant (pour identifier rapidement les valeurs les plus hautes de France) ou par distance kilométrique si la géolocalisation est activée."
            />
          </div>
        </div>
      </div>

      {/* Stations List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAndSorted.map(station => {
          const latest = station.latest_measurement;
          const val = latest?.value;
          const measType = station.measurement_type || latest?.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE';
          const isOpera = station.source_code === 'OPERA_AIR';
          const isHydro = station.source_code === 'HYDROTELERAY';

          let displayVal = '—';
          let displayUnit = latest?.unit || station.unit || 'nSv/h';

          if (val !== undefined) {
            if (isOpera) {
              if (aerosolUnit === 'bqm3') {
                displayVal = (val * 1e-6).toExponential(2);
                displayUnit = 'Bq/m³';
              } else {
                displayVal = val < 1 ? val.toFixed(2) : val.toFixed(1);
                displayUnit = 'µBq/m³';
              }
            } else if (isHydro) {
              displayVal = val.toFixed(1);
              displayUnit = 'Bq/L';
            } else {
              displayVal = val < 1 ? val.toFixed(2) : val.toFixed(1);
              displayUnit = 'nSv/h';
            }
          }

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/60 transition cursor-pointer group shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isOpera
                      ? 'bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950'
                      : isHydro
                      ? 'bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950'
                      : 'bg-slate-800 text-amber-400 group-hover:bg-amber-500/20'
                  }`}
                >
                  {isOpera ? (
                    <Wind className="w-5 h-5" />
                  ) : isHydro ? (
                    <Droplets className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-white group-hover:text-amber-300 transition text-sm truncate">
                      {station.name}
                    </span>

                    {/* Source Badge */}
                    {station.source_code === 'OPERA_AIR' ? (
                      <span className="text-[10px] font-semibold bg-teal-950/80 border border-teal-800 text-teal-300 px-1.5 py-0.5 rounded">
                        OPERA-Air (Aérosols)
                      </span>
                    ) : station.source_code === 'HYDROTELERAY' ? (
                      <span className="text-[10px] font-semibold bg-cyan-950/80 border border-cyan-800 text-cyan-300 px-1.5 py-0.5 rounded">
                        HydroTéléray
                      </span>
                    ) : station.source_code === 'TELERAY' ? (
                      <span className="text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded">
                        Téléray
                      </span>
                    ) : station.source_code === 'OPENRADIATION' ? (
                      <span className="text-[10px] font-semibold bg-purple-950/80 border border-purple-800 text-purple-300 px-1.5 py-0.5 rounded">
                        OpenRadiation
                      </span>
                    ) : station.source_code === 'EURDEP' ? (
                      <span className="text-[10px] font-semibold bg-sky-950/80 border border-sky-800 text-sky-400 px-1.5 py-0.5 rounded">
                        EURDEP (UE)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-indigo-950/80 border border-indigo-800 text-indigo-300 px-1.5 py-0.5 rounded">
                        Safecast
                      </span>
                    )}

                    {/* Vector Type Tag */}
                    {isOpera ? (
                      <span className="text-[9px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20 px-1.5 py-0.5 rounded">
                        700 m³/h • Filtre PPO
                      </span>
                    ) : isHydro ? (
                      <span className="text-[9px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                        Eau fluviale
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        Dose gamma
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {station.commune || station.country || 'France'}
                      {station.department_code && ` (${station.department_code})`}
                    </span>
                    {station.radionuclide_focus && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        • Nucléides : <strong className="text-amber-300">{station.radionuclide_focus}</strong>
                      </span>
                    )}
                    {station.distance_km !== undefined && (
                      <span className="text-sky-400">
                        • {station.distance_km} km
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-end text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-white group-hover:text-amber-400 transition">
                      {displayVal}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {displayUnit}
                    </span>
                  </div>

                  <div className="mt-1">
                    <QualityBadge
                      measuredAt={station.latest_measurement?.measured_at}
                      qualityStatus={station.latest_measurement?.quality_status}
                      sourceCode={station.source_code}
                      measurementType={station.measurement_type}
                      dataNature={station.latest_measurement?.data_nature || station.data_nature}
                      variant="full"
                      align="right"
                    />
                  </div>
                </div>

                {onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(station.id);
                    }}
                    title={favoriteIds.includes(station.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border border-slate-700/60 transition"
                  >
                    <Star className={`w-4 h-4 ${favoriteIds.includes(station.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-500 hover:text-amber-400'}`} />
                  </button>
                )}

                {onCompareStation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompareStation(station.id);
                    }}
                    title="Comparer cette balise avec Paris, Limoges, Brest ou Lyon"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700/60 transition"
                  >
                    <GitCompare className="w-4 h-4" />
                  </button>
                )}

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
