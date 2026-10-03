import React, { useState, useMemo } from 'react';
import type { Station } from '../types/radiation';
import { Search, Radio, ShieldCheck, Users, MapPin, ArrowUpDown, ChevronRight, Activity, Wind, Droplets, Filter } from 'lucide-react';

interface StationsListPageProps {
  stations: Station[];
  onSelectStation: (stationId: number) => void;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const StationsListPage: React.FC<StationsListPageProps> = ({
  stations,
  onSelectStation,
  userCoords,
}) => {
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterMeasurementType, setFilterMeasurementType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'distance'>('name');

  const instCount = useMemo(() => stations.filter(s => s.source_code === 'TELERAY' || s.source_code === 'OPERA_AIR' || s.source_code === 'HYDROTELERAY').length, [stations]);
  const partCount = useMemo(() => stations.filter(s => s.source_code === 'OPENRADIATION').length, [stations]);
  const intlCount = useMemo(() => stations.filter(s => s.source_code === 'EURDEP' || s.source_code === 'SAFECAST').length, [stations]);

  const gammaCount = useMemo(() => stations.filter(s => !s.measurement_type || s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE').length, [stations]);
  const aerosolCount = useMemo(() => stations.filter(s => s.measurement_type === 'ATMOSPHERIC_AEROSOLS').length, [stations]);
  const waterCount = useMemo(() => stations.filter(s => s.measurement_type === 'WATER_RADIOACTIVITY').length, [stations]);

  const filteredAndSorted = useMemo(() => {
    let result = stations.filter(s => {
      // Source filter
      if (filterSource === 'INSTITUTIONAL' && s.source_code !== 'TELERAY' && s.source_code !== 'OPERA_AIR' && s.source_code !== 'HYDROTELERAY') return false;
      if (filterSource === 'PARTICIPATORY' && s.source_code !== 'OPENRADIATION') return false;
      if (filterSource === 'INTERNATIONAL' && (s.source_code !== 'EURDEP' && s.source_code !== 'SAFECAST')) return false;
      if (filterSource !== 'ALL' && filterSource !== 'INSTITUTIONAL' && filterSource !== 'PARTICIPATORY' && filterSource !== 'INTERNATIONAL' && s.source_code !== filterSource) return false;

      // Measurement type filter
      if (filterMeasurementType !== 'ALL') {
        const sType = s.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE';
        if (sType !== filterMeasurementType) return false;
      }

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
  }, [stations, search, filterSource, filterMeasurementType, sortBy]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Radio className="w-6 h-6 text-amber-400" />
            STATIONS DE SURVEILLANCE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {filteredAndSorted.length} balises et capteurs répertoriés sur le territoire (Dose gamma, Aérosols, Eaux)
          </p>
        </div>

        {/* 3 Pillars Filter Toggle */}
        <div className="flex flex-wrap rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs gap-1">
          <button
            onClick={() => setFilterSource('ALL')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              filterSource === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Toutes sources ({stations.length})
          </button>
          <button
            onClick={() => setFilterSource('INSTITUTIONAL')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              filterSource === 'INSTITUTIONAL' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Institutionnel ({instCount})</span>
          </button>
          <button
            onClick={() => setFilterSource('PARTICIPATORY')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              filterSource === 'PARTICIPATORY' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-300" />
            <span>Participatif ({partCount})</span>
          </button>
          <button
            onClick={() => setFilterSource('INTERNATIONAL')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              filterSource === 'INTERNATIONAL' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-300" />
            <span>International ({intlCount})</span>
          </button>
        </div>
      </div>

      {/* Measurement Type Sub-Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 border border-slate-800 p-1 rounded-2xl text-xs">
        <span className="text-[11px] font-mono text-slate-500 px-2 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>Type de mesure :</span>
        </span>

        <button
          onClick={() => setFilterMeasurementType('ALL')}
          className={`px-2.5 py-1 rounded-xl transition font-medium ${
            filterMeasurementType === 'ALL'
              ? 'bg-slate-700 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tous les types ({stations.length})
        </button>

        <button
          onClick={() => setFilterMeasurementType('AMBIENT_GAMMA_DOSE_RATE')}
          className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1 ${
            filterMeasurementType === 'AMBIENT_GAMMA_DOSE_RATE'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>⚡ Débit de dose gamma ({gammaCount})</span>
        </button>

        <button
          onClick={() => setFilterMeasurementType('ATMOSPHERIC_AEROSOLS')}
          className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1 ${
            filterMeasurementType === 'ATMOSPHERIC_AEROSOLS'
              ? 'bg-teal-600 text-white font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Wind className="w-3 h-3" />
          <span>Aérosols atmosphériques (OPERA-Air) ({aerosolCount})</span>
        </button>

        <button
          onClick={() => setFilterMeasurementType('WATER_RADIOACTIVITY')}
          className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1 ${
            filterMeasurementType === 'WATER_RADIOACTIVITY'
              ? 'bg-cyan-600 text-white font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Droplets className="w-3 h-3" />
          <span>Radioactivité dans l'eau (HydroTéléray) ({waterCount})</span>
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, isotope (Cs-137, H-3), commune, département..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Stations List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAndSorted.map(station => {
          const latest = station.latest_measurement;
          const val = latest?.value;
          const measType = station.measurement_type || latest?.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE';
          const unit = latest?.unit || station.latest_measurement?.unit || (measType === 'ATMOSPHERIC_AEROSOLS' ? 'µBq/m³' : measType === 'WATER_RADIOACTIVITY' ? 'Bq/L' : 'nSv/h');

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/60 transition cursor-pointer group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    measType === 'ATMOSPHERIC_AEROSOLS'
                      ? 'bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950'
                      : measType === 'WATER_RADIOACTIVITY'
                      ? 'bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950'
                      : 'bg-slate-800 text-amber-400 group-hover:bg-amber-500/20'
                  }`}
                >
                  {measType === 'ATMOSPHERIC_AEROSOLS' ? (
                    <Wind className="w-5 h-5" />
                  ) : measType === 'WATER_RADIOACTIVITY' ? (
                    <Droplets className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-white group-hover:text-amber-300 transition text-sm">
                      {station.name}
                    </span>

                    {/* Source Badge */}
                    {station.source_code === 'OPERA_AIR' ? (
                      <span className="text-[10px] font-semibold bg-teal-950/80 border border-teal-800 text-teal-300 px-1.5 py-0.5 rounded">
                        OPERA-Air
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
                    {measType === 'ATMOSPHERIC_AEROSOLS' ? (
                      <span className="text-[9px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20 px-1.5 py-0.5 rounded">
                        Aérosols
                      </span>
                    ) : measType === 'WATER_RADIOACTIVITY' ? (
                      <span className="text-[9px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                        Eau
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        Dose gamma
                      </span>
                    )}

                    {station.is_simulated || station.data_nature === 'DEMO' ? (
                      <span className="text-[9px] font-medium bg-amber-950/80 border border-amber-700/60 text-amber-300 px-1.5 py-0.2 rounded">
                        Simulé
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-1.5 py-0.2 rounded">
                        Réel
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
                      <span className="text-slate-500">
                        • Cible : <strong className="text-slate-300">{station.radionuclide_focus.split(',')[0]}</strong>
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

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-white group-hover:text-amber-400 transition">
                    {val !== undefined ? (val < 1 ? val.toFixed(2) : val.toFixed(1)) : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {unit}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
