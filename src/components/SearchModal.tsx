import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  MapPin,
  Radio,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Station } from '../types/radiation';
import { searchGeographicZones, type GeoZone } from '../utils/geoSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  onSelectStation: (stationId: number) => void;
  onMeasureZone?: (zone: GeoZone) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  stations,
  onSelectStation,
  onMeasureZone,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);

  // Search resolution with intelligent geographic grouping
  const searchResult = useMemo(() => {
    return searchGeographicZones(searchTerm, stations);
  }, [searchTerm, stations]);

  if (!isOpen) return null;

  const handleZoneMeasureClick = (zone: GeoZone) => {
    if (onMeasureZone) {
      onMeasureZone(zone);
    }
    onClose();
  };

  const toggleExpandZone = (zoneId: string) => {
    setExpandedZoneId(prev => (prev === zoneId ? null : zoneId));
  };

  // Quick preset pills suggested in user brief
  const QUICK_SUGGESTIONS = [
    'Paris',
    'Limoges',
    'Brest',
    'Cattenom',
    '75',
    'Haute-Vienne',
    'Bretagne',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-3 pt-12 sm:pt-20 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher une commune, département, région, site (ex: Paris, Limoges, 75, Cattenom)..."
              autoFocus
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-hidden font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white transition"
            >
              Fermer
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Exemples :
            </span>
            {QUICK_SUGGESTIONS.map(sug => (
              <button
                key={sug}
                onClick={() => setSearchTerm(sug)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition ${
                  searchTerm.toLowerCase() === sug.toLowerCase()
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 divide-y divide-slate-800/80">
          {!searchTerm.trim() ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white font-mono">
                RECHERCHE GÉOGRAPHIQUE HIERARCHIQUE
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Tapez le nom d'une <strong>commune</strong> (Paris, Limoges, Brest), d'un <strong>département</strong> (75, Haute-Vienne), d'une <strong>région</strong> (Bretagne) ou d'un <strong>site nucléaire</strong> (Cattenom, Gravelines) pour mesurer instantanément la radioactivité ambiante dans cette zone.
              </p>
            </div>
          ) : searchResult.zones.length === 0 && searchResult.matchingStations.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm text-slate-300 font-mono">
                Aucun résultat géographique trouvé pour « {searchTerm} ».
              </p>
              <p className="text-xs text-slate-500">
                Vérifiez l'orthographe ou essayez avec un numéro de département (ex: 87, 75, 29).
              </p>
            </div>
          ) : (
            <>
              {/* 1. Grouped Geographic Zones Section (Requested by User) */}
              {searchResult.zones.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5 tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Zones géographiques détectées ({searchResult.zones.length})</span>
                  </div>

                  <div className="space-y-3">
                    {searchResult.zones.map(zone => {
                      const isExpanded = expandedZoneId === zone.id;

                      return (
                        <div
                          key={zone.id}
                          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-md hover:border-amber-500/40 transition space-y-3"
                        >
                          {/* Zone Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-bold text-white font-mono">
                                    {zone.name}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
                                    {zone.stationsCount} station{zone.stationsCount > 1 ? 's' : ''}
                                  </span>
                                  {zone.type === 'FACILITY' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-950 border border-sky-800 text-sky-300">
                                      Site surveillé
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {zone.subtitle}
                                </p>
                              </div>
                            </div>

                            {/* Action Button: « Mesurer autour de cette zone » */}
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <button
                                onClick={() => handleZoneMeasureClick(zone)}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 text-xs font-mono transition shadow-md group"
                                title="Centrer la carte et afficher les mesures de cette zone"
                              >
                                <Compass className="w-4 h-4 group-hover:rotate-45 transition duration-200" />
                                <span>Mesurer autour de cette zone</span>
                              </button>
                            </div>
                          </div>

                          {/* Zone Metrics Bar */}
                          {zone.stationsCount > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans">Moyenne radiologique</span>
                                <span className="text-sm font-bold text-white">
                                  {zone.averageDoseRate !== undefined ? `${zone.averageDoseRate} nSv/h` : '—'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans">Plage locale</span>
                                <span className="text-slate-300 font-semibold">
                                  {zone.minDoseRate !== undefined ? `${zone.minDoseRate} à ${zone.maxDoseRate} nSv/h` : '—'}
                                </span>
                              </div>
                              <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Fond normal
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Geological Context Note */}
                          {zone.geologicalContext && (
                            <div className="text-[11px] text-slate-400 font-mono italic px-1">
                              {zone.geologicalContext}
                            </div>
                          )}

                          {/* Accordion Toggle to view stations in this zone */}
                          {zone.stationsCount > 0 && (
                            <div>
                              <button
                                onClick={() => toggleExpandZone(zone.id)}
                                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition"
                              >
                                <span>{isExpanded ? 'Masquer la liste des balises' : `Voir les ${zone.stationsCount} balises`}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 divide-y divide-slate-800/60 rounded-xl bg-slate-900 border border-slate-800 p-2 space-y-1">
                                  {zone.stations.map(st => (
                                    <button
                                      key={st.id}
                                      onClick={() => {
                                        onSelectStation(st.id);
                                        onClose();
                                      }}
                                      className="w-full text-left p-2 hover:bg-slate-800 rounded-lg flex items-center justify-between text-xs font-mono transition group"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="text-white group-hover:text-amber-300 font-semibold">
                                          {st.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-amber-400">
                                          {st.latest_measurement ? `${st.latest_measurement.value.toFixed(1)} nSv/h` : '—'}
                                        </span>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Direct Matching Stations Section */}
              {searchResult.matchingStations.length > 0 && (
                <div className="pt-4 space-y-3">
                  <div className="text-[11px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5 tracking-wider">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span>Balises individuelles correspondantes ({searchResult.matchingStations.length})</span>
                  </div>

                  <div className="space-y-1 divide-y divide-slate-800/60">
                    {searchResult.matchingStations.map(station => (
                      <button
                        key={station.id}
                        onClick={() => {
                          onSelectStation(station.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/60 rounded-xl transition group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-500/20 transition">
                            <Radio className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition font-mono">
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
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {station.commune || 'Localisation fixe'}
                                {station.department_code && ` (${station.department_code})`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-300 font-bold text-sm">
                            {station.latest_measurement ? `${station.latest_measurement.value.toFixed(1)} nSv/h` : '—'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
