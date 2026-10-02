import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Radio, ShieldCheck, ChevronRight } from 'lucide-react';
import type { Station } from '../types/radiation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  onSelectStation: (stationId: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  stations,
  onSelectStation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return stations
      .filter(s => {
        const name = s.name.toLowerCase();
        const commune = (s.commune || '').toLowerCase();
        const dept = (s.department_code || '').toLowerCase();
        const ext = s.external_id.toLowerCase();
        return name.includes(term) || commune.includes(term) || dept.includes(term) || ext.includes(term);
      })
      .slice(0, 15);
  }, [stations, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16 sm:pt-24 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 p-3 bg-slate-950/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher une commune, station, département (ex: Paris, 87, Limoges)..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 ml-1"
          >
            Fermer
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/60">
          {!searchTerm.trim() ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Tapez le nom d'une commune, un département ou l'identifiant d'une balise Téléray.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Aucune station trouvée pour "{searchTerm}".
            </div>
          ) : (
            filtered.map(station => (
              <button
                key={station.id}
                onClick={() => {
                  onSelectStation(station.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/60 rounded-xl transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-500/20">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition">
                        {station.name}
                      </span>
                      {station.is_official ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded font-medium">
                          <ShieldCheck className="w-3 h-3" /> Téléray
                        </span>
                      ) : (
                        <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/50 px-1.5 py-0.2 rounded font-medium">
                          Citoyen
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {station.commune || 'Localisation fixe'}
                        {station.department_code && ` (${station.department_code})`}
                      </span>
                      {station.latest_measurement && (
                        <span className="font-mono text-amber-300 font-semibold">
                          • {station.latest_measurement.value.toFixed(1)} nSv/h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
