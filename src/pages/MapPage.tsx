import React, { useState, useMemo } from 'react';
import type { Station, ObservationMode } from '../types/radiation';
import { RadiationMap } from '../components/RadiationMap';
import { MultiEnvironmentTree } from '../components/MultiEnvironmentTree';
import { ObservationModeSelector } from '../components/ObservationModeSelector';
import { QualityBadge } from '../components/QualityBadge';
import { OperaAirPanel } from '../components/OperaAirPanel';
import { HydrotelerayPanel } from '../components/HydrotelerayPanel';
import { Radio, MapPin, Calendar, ExternalLink, ShieldCheck, Users, Layers, Wind, Droplets, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { GeoZone } from '../utils/geoSearch';
import { safeFormatDateTime } from '../utils/dateUtils';

interface MapPageProps {
  stations: Station[];
  selectedStationId?: number | null;
  onSelectStation?: (stationId: number) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onLocateMe: () => void;
  isLocating?: boolean;
  activeZone?: GeoZone | null;
  onClearActiveZone?: () => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  userCoords,
  onLocateMe,
  isLocating,
  activeZone,
  onClearActiveZone,
}) => {
  const [observationMode, setObservationMode] = useState<ObservationMode>('ALL');
  const [selectedNuclide, setSelectedNuclide] = useState<string>('ALL');
  const [aerosolUnit, setAerosolUnit] = useState<'ubqm3' | 'bqm3'>('ubqm3');
  const [showArchitectureTree, setShowArchitectureTree] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  });

  const selectedStation = stations.find(s => s.id === selectedStationId);

  // Counts by environment
  const counts = useMemo(() => {
    const ambient = stations.filter(
      s => s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE' || s.source_code === 'TELERAY' || s.source_code === 'EURDEP'
    ).length;
    const aerosols = stations.filter(
      s => s.measurement_type === 'ATMOSPHERIC_AEROSOLS' || s.source_code === 'OPERA_AIR'
    ).length;
    const water = stations.filter(
      s => s.measurement_type === 'WATER_RADIOACTIVITY' || s.source_code === 'HYDROTELERAY'
    ).length;
    const citizen = stations.filter(
      s => s.source_code === 'OPENRADIATION' || s.source_code === 'SAFECAST'
    ).length;
    return {
      all: stations.length,
      ambient,
      aerosols,
      water,
      citizen,
    };
  }, [stations]);

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* ☢️ Interactive Multi-Environment Architecture Tree Banner */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <Layers className="w-4 h-4" />
            <span>CARTE MULTI-ENVIRONNEMENT : AIR • EAU • SOL / PARTICIPATIF</span>
          </div>

          <button
            onClick={() => setShowArchitectureTree(!showArchitectureTree)}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition"
          >
            <span>{showArchitectureTree ? 'Masquer l\'arbre' : 'Afficher l\'arbre multi-environnement'}</span>
            {showArchitectureTree ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showArchitectureTree && (
          <MultiEnvironmentTree
            selectedMode={observationMode}
            onSelectMode={setObservationMode}
            counts={counts}
          />
        )}
      </div>

      {/* Observation Mode Selector (Compact & Direct) */}
      <ObservationModeSelector
        selectedMode={observationMode}
        onSelectMode={setObservationMode}
        selectedRadionuclide={selectedNuclide}
        onSelectRadionuclide={setSelectedNuclide}
        selectedAerosolUnit={aerosolUnit}
        onSelectAerosolUnit={setAerosolUnit}
        counts={counts}
      />

      {/* Active Geographic Zone Banner */}
      {activeZone && (
        <div className="rounded-2xl border border-amber-600/70 bg-gradient-to-r from-amber-950/80 via-slate-900/95 to-slate-950 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Zone active : {activeZone.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {activeZone.stationsCount} balise{activeZone.stationsCount > 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Mesures en direct
                </span>
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                {activeZone.averageDoseRate !== undefined ? (
                  <span>Moyenne mesurée : <strong className="text-amber-300">{activeZone.averageDoseRate} nSv/h</strong> • Plage : {activeZone.minDoseRate} à {activeZone.maxDoseRate} nSv/h</span>
                ) : (
                  <span>{activeZone.subtitle}</span>
                )}
                {activeZone.geologicalContext && (
                  <span className="text-slate-400 block mt-0.5 font-sans italic">{activeZone.geologicalContext}</span>
                )}
              </div>
            </div>
          </div>

          {onClearActiveZone && (
            <button
              onClick={onClearActiveZone}
              className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
            >
              Fermer la zone
            </button>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="h-[62vh] md:h-[70vh] w-full relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <RadiationMap
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={onSelectStation}
          userCoords={userCoords}
          onLocateMe={onLocateMe}
          isLocating={isLocating}
          observationMode={observationMode}
          onObservationModeChange={(mode) => setObservationMode(mode as ObservationMode)}
          radionuclideFilter={selectedNuclide}
          onRadionuclideFilterChange={setSelectedNuclide}
          aerosolUnit={aerosolUnit}
          onAerosolUnitChange={setAerosolUnit}
          focusCoords={activeZone ? activeZone.center : null}
          focusZoom={activeZone ? activeZone.suggestedZoom : undefined}
        />
      </div>

      {/* Selected Station Bottom Card if any */}
      {selectedStation && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white font-mono">
                  {selectedStation.name}
                </span>
                {selectedStation.source_code === 'OPERA_AIR' ? (
                  <span className="flex items-center gap-1 rounded bg-teal-950/80 border border-teal-700 text-teal-300 px-2 py-0.5 text-xs font-semibold">
                    💨 OPERA-Air
                  </span>
                ) : selectedStation.source_code === 'HYDROTELERAY' ? (
                  <span className="flex items-center gap-1 rounded bg-cyan-950/80 border border-cyan-700 text-cyan-300 px-2 py-0.5 text-xs font-semibold">
                    💧 HydroTéléray
                  </span>
                ) : selectedStation.source_code === 'TELERAY' ? (
                  <span className="flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-0.5 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Téléray
                  </span>
                ) : selectedStation.source_code === 'OPENRADIATION' ? (
                  <span className="flex items-center gap-1 rounded bg-purple-950/80 border border-purple-800 text-purple-400 px-2 py-0.5 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" /> Participatif
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded bg-sky-950/80 border border-sky-800 text-sky-400 px-2 py-0.5 text-xs font-semibold">
                    🌐 {selectedStation.source_name || selectedStation.source_code}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedStation.commune || 'Localisation métropolitaine'}
                  {selectedStation.department_code && ` (${selectedStation.department_code})`}
                </span>
                {selectedStation.radionuclide_focus && (
                  <span className="text-amber-400/90 font-mono text-[11px]">
                    Cible : {selectedStation.radionuclide_focus}
                  </span>
                )}
                {selectedStation.latest_measurement && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {safeFormatDateTime(selectedStation.latest_measurement.measured_at)}
                  </span>
                )}
                <span>Source : {selectedStation.source_name || selectedStation.source_code || 'ASNR-IRSN'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selectedStation.latest_measurement && (
                <div className="flex flex-col items-end text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-500">
                    {selectedStation.measurement_type === 'ATMOSPHERIC_AEROSOLS'
                      ? 'Concentration volumique'
                      : selectedStation.measurement_type === 'WATER_RADIOACTIVITY'
                      ? "Activité volumique fluviale"
                      : 'Dernière mesure'}
                  </div>
                  <div className="font-mono text-2xl font-bold text-amber-400">
                    {selectedStation.latest_measurement.value < 1
                      ? selectedStation.latest_measurement.value.toFixed(2)
                      : selectedStation.latest_measurement.value.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {selectedStation.latest_measurement.unit || selectedStation.unit || 'nSv/h'}
                    </span>
                  </div>

                  <div className="mt-1">
                    <QualityBadge
                      measuredAt={selectedStation.latest_measurement.measured_at}
                      qualityStatus={selectedStation.latest_measurement.quality_status}
                      sourceCode={selectedStation.source_code}
                      measurementType={selectedStation.measurement_type}
                      dataNature={selectedStation.latest_measurement.data_nature || selectedStation.data_nature}
                      variant="full"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => onSelectStation?.(selectedStation.id)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow shrink-0"
              >
                <span>Détails & Graphique</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vector-Specific Dedicated Panels */}
      {observationMode === 'ATMOSPHERIC_AEROSOLS' && (
        <OperaAirPanel
          stations={stations}
          onSelectStation={onSelectStation || (() => {})}
          selectedAerosolUnit={aerosolUnit}
        />
      )}

      {observationMode === 'WATER_RADIOACTIVITY' && (
        <HydrotelerayPanel
          stations={stations}
          onSelectStation={onSelectStation || (() => {})}
        />
      )}
    </div>
  );
};
