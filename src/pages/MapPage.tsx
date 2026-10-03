import React from 'react';
import type { Station } from '../types/radiation';
import { RadiationMap } from '../components/RadiationMap';
import { RadiationGauge } from '../components/RadiationGauge';
import { Radio, MapPin, Calendar, ExternalLink, ShieldCheck, Users } from 'lucide-react';

interface MapPageProps {
  stations: Station[];
  selectedStationId?: number | null;
  onSelectStation: (stationId: number) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onLocateMe: () => void;
  isLocating?: boolean;
}

export const MapPage: React.FC<MapPageProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  userCoords,
  onLocateMe,
  isLocating,
}) => {
  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Map Container */}
      <div className="h-[60vh] md:h-[68vh] w-full">
        <RadiationMap
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={onSelectStation}
          userCoords={userCoords}
          onLocateMe={onLocateMe}
          isLocating={isLocating}
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
                    {new Date(selectedStation.latest_measurement.measured_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                <span>Source : {selectedStation.source_name || selectedStation.source_code || 'ASNR-IRSN'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selectedStation.latest_measurement && (
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-500">
                    {selectedStation.measurement_type === 'ATMOSPHERIC_AEROSOLS'
                      ? 'Concentration volumique'
                      : selectedStation.measurement_type === 'WATER_RADIOACTIVITY'
                      ? "Activité volumique eau"
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
                </div>
              )}

              <button
                onClick={() => onSelectStation(selectedStation.id)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow"
              >
                <span>Détails & Graphique</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
