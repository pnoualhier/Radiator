import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { Station } from '../types/radiation';
import { Navigation2, Layers, ShieldCheck, Users, ExternalLink, Calendar, Radio, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface RadiationMapProps {
  stations: Station[];
  selectedStationId?: number | null;
  onSelectStation?: (stationId: number) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onLocateMe?: () => void;
  isLocating?: boolean;
}

// Marker icon generator using clean SVG
function createMarkerIcon(
  value: number | undefined,
  isOfficial: boolean,
  dataNature?: string,
  isSimulated?: boolean
) {
  let color = '#38bdf8'; // sky (standard)
  let bg = '#0369a1';

  if (value !== undefined) {
    if (value > 300) {
      color = '#f59e0b'; // amber
      bg = '#b45309';
    } else if (value > 180) {
      color = '#10b981'; // emerald
      bg = '#047857';
    } else if (value > 100) {
      color = '#0284c7'; // blue
      bg = '#0369a1';
    }
  }

  const isDemo = isSimulated || dataNature === 'DEMO';
  const border = isDemo
    ? 'border: 2px dashed #f59e0b;'
    : isOfficial
    ? 'border: 2px solid white;'
    : 'border: 2px dashed #a855f7;';
  const valText = value !== undefined ? Math.round(value) : '?';
  const demoBadge = isDemo
    ? `<span style="position: absolute; top: -5px; right: -5px; background: #f59e0b; color: #000; font-size: 8px; font-weight: bold; width: 13px; height: 13px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #0f172a;">D</span>`
    : '';

  return L.divIcon({
    className: 'custom-radiation-marker',
    html: `
      <div style="
        position: relative;
        background: ${bg};
        color: #ffffff;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        ${border}
      ">
        ${valText}
        ${demoBadge}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

// Helper component to center map when selected station or user position changes
function MapRecenter({ coords, zoom }: { coords?: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, zoom || map.getZoom(), { animate: true });
    }
  }, [coords, zoom, map]);
  return null;
}

export const RadiationMap: React.FC<RadiationMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  userCoords,
  onLocateMe,
  isLocating,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'OFFICIAL' | 'CITIZEN'>('ALL');

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      if (filterType === 'OFFICIAL') return s.is_official;
      if (filterType === 'CITIZEN') return !s.is_official;
      return true;
    });
  }, [stations, filterType]);

  const targetCoords = useMemo<[number, number] | null>(() => {
    if (selectedStationId) {
      const s = stations.find(st => st.id === selectedStationId);
      if (s) return [s.latitude, s.longitude];
    }
    if (userCoords) {
      return [userCoords.latitude, userCoords.longitude];
    }
    return null;
  }, [selectedStationId, userCoords, stations]);

  // Metropolitan France center
  const defaultCenter: [number, number] = [46.603354, 1.888334];
  const defaultZoom = 6;

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full z-10"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {targetCoords && <MapRecenter coords={targetCoords} zoom={9} />}

        {/* User GPS position marker */}
        {userCoords && (
          <CircleMarker
            center={[userCoords.latitude, userCoords.longitude]}
            radius={8}
            pathOptions={{
              color: '#38bdf8',
              fillColor: '#0284c7',
              fillOpacity: 0.9,
              weight: 3,
            }}
          >
            <Popup>
              <div className="text-xs font-sans text-slate-900 p-1">
                <strong>📍 Votre position estimée</strong>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* Stations markers */}
        {filteredStations.map(station => {
          const latest = station.latest_measurement;
          const val = latest?.value;
          const isDemo = station.is_simulated || station.data_nature === 'DEMO' || latest?.is_simulated || latest?.data_nature === 'DEMO';
          const icon = createMarkerIcon(val, station.is_official, station.data_nature || latest?.data_nature, isDemo);

          const formattedTime = latest?.measured_at
            ? new Date(latest.measured_at).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'En attente';

          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={icon}
            >
              <Popup className="radiation-popup">
                <div className="p-1 min-w-[220px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 line-clamp-1">
                      {station.name}
                    </span>
                    {station.is_official ? (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Téléray
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                        Citoyen
                      </span>
                    )}
                  </div>

                  {/* Provenance Banner in Popup */}
                  {isDemo ? (
                    <div className="mb-2 px-2 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Mode Démo :</strong> Donnée simulée de référence</span>
                    </div>
                  ) : latest?.data_nature === 'CACHED' ? (
                    <div className="mb-2 px-2 py-1 rounded bg-sky-50 border border-sky-300 text-sky-900 text-[10px] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span><strong>Donnée réelle archivée</strong></span>
                    </div>
                  ) : (
                    <div className="mb-2 px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Donnée réelle en direct</strong></span>
                    </div>
                  )}

                  <div className="my-2 bg-slate-50 p-2 rounded border border-slate-100 text-center">
                    <div className="text-[11px] text-slate-500 font-medium">Débit de dose mesuré</div>
                    <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                      {val !== undefined ? val.toFixed(1) : '—'}{' '}
                      <span className="text-xs font-normal text-slate-600">nSv/h</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-slate-400" />
                      <span>Source : {station.source_name || station.source_code || 'Téléray / IRSN'}</span>
                    </div>
                    {station.commune && (
                      <div className="text-slate-500">
                        Commune : {station.commune} ({station.department_code || ''})
                      </div>
                    )}
                  </div>

                  {onSelectStation && (
                    <button
                      onClick={() => onSelectStation(station.id)}
                      className="mt-3 w-full flex items-center justify-center gap-1 rounded bg-slate-900 text-white py-1.5 text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      <span>Voir la station</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        {/* Geolocation Button */}
        {onLocateMe && (
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md transition disabled:opacity-50"
            title="Centrer sur ma position"
          >
            <Navigation2 className={`w-3.5 h-3.5 text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>Ma position</span>
          </button>
        )}

        {/* Source Filter Toggle */}
        <div className="flex rounded-xl bg-slate-900/90 border border-slate-700/80 p-0.5 shadow-lg backdrop-blur-md text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg transition ${
              filterType === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Toutes ({stations.length})
          </button>
          <button
            onClick={() => setFilterType('OFFICIAL')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              filterType === 'OFFICIAL'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Officielles</span>
          </button>
          <button
            onClick={() => setFilterType('CITIZEN')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              filterType === 'CITIZEN'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Citoyennes</span>
          </button>
        </div>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-[11px] font-mono text-slate-300 shadow-md backdrop-blur-md">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span>&lt;100 nSv/h</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>100-180 (Granit)</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>180-300+</span>
        </span>
      </div>
    </div>
  );
};
