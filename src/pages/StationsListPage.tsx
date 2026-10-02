import React, { useState, useMemo } from 'react';
import type { Station } from '../types/radiation';
import { Search, Radio, ShieldCheck, Users, MapPin, ArrowUpDown, ChevronRight, Activity } from 'lucide-react';

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
  const [filterSource, setFilterSource] = useState<'ALL' | 'OFFICIAL' | 'CITIZEN'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'distance'>('name');

  const filteredAndSorted = useMemo(() => {
    let result = stations.filter(s => {
      if (filterSource === 'OFFICIAL' && !s.is_official) return false;
      if (filterSource === 'CITIZEN' && s.is_official) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const n = s.name.toLowerCase();
        const c = (s.commune || '').toLowerCase();
        const d = (s.department_code || '').toLowerCase();
        return n.includes(q) || c.includes(q) || d.includes(q);
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
  }, [stations, search, filterSource, sortBy]);

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
            {filteredAndSorted.length} balises de détection répertoriées sur le territoire
          </p>
        </div>

        {/* Source Filter Toggle */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setFilterSource('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterSource === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Toutes ({stations.length})
          </button>
          <button
            onClick={() => setFilterSource('OFFICIAL')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filterSource === 'OFFICIAL' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Téléray</span>
          </button>
          <button
            onClick={() => setFilterSource('CITIZEN')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filterSource === 'CITIZEN' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citoyennes</span>
          </button>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrer par nom, commune, département (ex: Cherbourg, 75, Limoges)..."
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
            <option value="value">Trier par : Débit de dose le plus fort</option>
            {userCoords && <option value="distance">Trier par : Distance la plus proche</option>}
          </select>
        </div>
      </div>

      {/* Stations List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAndSorted.map(station => {
          const latest = station.latest_measurement;
          const val = latest?.value;

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/60 transition cursor-pointer group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-amber-400 group-hover:bg-amber-500/20 transition">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-amber-300 transition text-sm">
                      {station.name}
                    </span>
                    {station.is_official ? (
                      <span className="text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-1.5 py-0.2 rounded">
                        Téléray
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-purple-950/80 border border-purple-800 text-purple-400 px-1.5 py-0.2 rounded">
                        Citoyen
                      </span>
                    )}

                    {station.is_simulated || station.data_nature === 'DEMO' ? (
                      <span className="text-[10px] font-medium bg-amber-950/80 border border-amber-700/60 text-amber-300 px-1.5 py-0.2 rounded">
                        Simulé
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-1.5 py-0.2 rounded">
                        Réel
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {station.commune || 'France'}
                      {station.department_code && ` (${station.department_code})`}
                    </span>
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
                    {val !== undefined ? val.toFixed(1) : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    nSv/h
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
