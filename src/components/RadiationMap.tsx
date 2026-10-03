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
  isSimulated?: boolean,
  sourceCode?: string,
  measurementType?: string,
  unit?: string
) {
  let color = '#38bdf8'; // sky (standard)
  let bg = '#0369a1';

  const hasValue = value !== undefined && value > 0 && dataNature !== 'UNAVAILABLE';

  if (measurementType === 'ATMOSPHERIC_AEROSOLS') {
    bg = '#0f766e'; // teal-700 for aerosols
    color = '#2dd4bf';
  } else if (measurementType === 'WATER_RADIOACTIVITY') {
    bg = '#0284c7'; // cyan/sky for water
    color = '#38bdf8';
  } else if (hasValue) {
    if (value > 300) {
      color = '#f59e0b'; // amber
      bg = '#b45309';
    } else if (value > 180) {
      color = '#10b981'; // emerald
      bg = '#047857';
    } else if (value > 100) {
      color = '#0284c7'; // blue
      bg = '#0369a1';
    } else {
      color = '#0ea5e9'; // sky
      bg = '#0284c7';
    }
  } else {
    color = '#94a3b8';
    bg = '#334155'; // slate-700 when unavailable
  }

  const isDemo = isSimulated || dataNature === 'DEMO';
  let border = 'border: 2px solid white;';
  if (isDemo) {
    border = 'border: 2px dashed #f59e0b;';
  } else if (measurementType === 'ATMOSPHERIC_AEROSOLS') {
    border = 'border: 2.5px solid #2dd4bf;'; // 💨 Aérosols (Teal)
  } else if (measurementType === 'WATER_RADIOACTIVITY') {
    border = 'border: 2.5px solid #38bdf8;'; // 💧 Eau (Cyan)
  } else if (sourceCode === 'TELERAY') {
    border = 'border: 2.5px solid #10b981;'; // 🟢 Institutionnel (Vert Émeraude)
  } else if (sourceCode === 'OPENRADIATION') {
    border = 'border: 2.5px solid #a855f7;'; // 🟣 Participatif (Violet)
  } else if (sourceCode === 'EURDEP' || sourceCode === 'SAFECAST') {
    border = 'border: 2.5px solid #0284c7;'; // 🔵 International (Bleu)
  } else if (isOfficial) {
    border = 'border: 2px solid #10b981;';
  } else {
    border = 'border: 2px dashed #a855f7;';
  }

  let valText = '—';
  if (hasValue) {
    if (measurementType === 'ATMOSPHERIC_AEROSOLS') {
      valText = value < 1 ? value.toFixed(2) : value.toFixed(1);
    } else if (measurementType === 'WATER_RADIOACTIVITY') {
      valText = value.toFixed(1);
    } else {
      valText = Math.round(value).toString();
    }
  }

  const demoBadge = isDemo
    ? `<span style="position: absolute; top: -5px; right: -5px; background: #f59e0b; color: #000; font-size: 8px; font-weight: bold; width: 13px; height: 13px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #0f172a;">D</span>`
    : '';

  const typeIconBadge = measurementType === 'ATMOSPHERIC_AEROSOLS'
    ? `<span style="position: absolute; bottom: -4px; right: -4px; background: #0f766e; color: #2dd4bf; font-size: 7px; font-weight: bold; width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #134e4a;">💨</span>`
    : measurementType === 'WATER_RADIOACTIVITY'
    ? `<span style="position: absolute; bottom: -4px; right: -4px; background: #0369a1; color: #38bdf8; font-size: 7px; font-weight: bold; width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #075985;">💧</span>`
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
        font-size: 10px;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        ${border}
      ">
        ${valText}
        ${demoBadge}
        ${typeIconBadge}
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
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterMeasurementType, setFilterMeasurementType] = useState<string>('ALL');

  const instCount = useMemo(() => stations.filter(s => s.source_code === 'TELERAY' || s.source_code === 'OPERA_AIR' || s.source_code === 'HYDROTELERAY').length, [stations]);
  const partCount = useMemo(() => stations.filter(s => s.source_code === 'OPENRADIATION').length, [stations]);
  const intlCount = useMemo(() => stations.filter(s => s.source_code === 'EURDEP' || s.source_code === 'SAFECAST').length, [stations]);

  const gammaCount = useMemo(() => stations.filter(s => !s.measurement_type || s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE').length, [stations]);
  const aerosolCount = useMemo(() => stations.filter(s => s.measurement_type === 'ATMOSPHERIC_AEROSOLS').length, [stations]);
  const waterCount = useMemo(() => stations.filter(s => s.measurement_type === 'WATER_RADIOACTIVITY').length, [stations]);

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      // 1. Source / Tier Filter
      if (filterType === 'INSTITUTIONAL' && s.source_code !== 'TELERAY' && s.source_code !== 'OPERA_AIR' && s.source_code !== 'HYDROTELERAY') return false;
      if (filterType === 'PARTICIPATORY' && s.source_code !== 'OPENRADIATION') return false;
      if (filterType === 'INTERNATIONAL' && (s.source_code !== 'EURDEP' && s.source_code !== 'SAFECAST')) return false;
      if (filterType !== 'ALL' && filterType !== 'INSTITUTIONAL' && filterType !== 'PARTICIPATORY' && filterType !== 'INTERNATIONAL' && s.source_code !== filterType) return false;

      // 2. Measurement Type Filter
      if (filterMeasurementType !== 'ALL') {
        const sType = s.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE';
        if (sType !== filterMeasurementType) return false;
      }

      return true;
    });
  }, [stations, filterType, filterMeasurementType]);

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
          const measType = station.measurement_type || latest?.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE';
          const unit = latest?.unit || station.latest_measurement?.unit || (measType === 'ATMOSPHERIC_AEROSOLS' ? 'µBq/m³' : measType === 'WATER_RADIOACTIVITY' ? 'Bq/L' : 'nSv/h');

          const icon = createMarkerIcon(
            val,
            station.is_official,
            station.data_nature || latest?.data_nature,
            isDemo,
            station.source_code,
            measType,
            unit
          );

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
                <div className="p-1 min-w-[230px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 line-clamp-1">
                      {station.name}
                    </span>
                    {station.source_code === 'OPERA_AIR' ? (
                      <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded border border-teal-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        OPERA-Air
                      </span>
                    ) : station.source_code === 'HYDROTELERAY' ? (
                      <span className="text-[10px] font-semibold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        HydroTéléray
                      </span>
                    ) : station.source_code === 'TELERAY' ? (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Téléray
                      </span>
                    ) : station.source_code === 'OPENRADIATION' ? (
                      <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Participatif
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded border border-sky-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        International
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
                      <span><strong>Donnée réelle archivée</strong> ({station.source_code})</span>
                    </div>
                  ) : (
                    <div className="mb-2 px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Donnée réelle en direct</strong></span>
                    </div>
                  )}

                  <div className="my-2 bg-slate-50 p-2 rounded border border-slate-100 text-center">
                    <div className="text-[11px] text-slate-500 font-medium">
                      {measType === 'ATMOSPHERIC_AEROSOLS'
                        ? 'Aérosols atmosphériques (Particules)'
                        : measType === 'WATER_RADIOACTIVITY'
                        ? "Radioactivité dans l'eau"
                        : 'Débit de dose gamma ambiant'}
                    </div>
                    <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                      {val !== undefined && val > 0 && station.data_nature !== 'UNAVAILABLE' ? (
                        <>
                          {val < 1 ? val.toFixed(2) : val.toFixed(1)}{' '}
                          <span className="text-xs font-normal text-slate-600">{unit}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-sans text-sm">Non disponible</span>
                      )}
                    </div>
                  </div>

                  {/* Radionuclide and Matrix context if specified */}
                  {station.radionuclide_focus && (
                    <div className="mb-1.5 px-2 py-1 rounded bg-slate-100 text-[10px] text-slate-700 flex justify-between items-center">
                      <span className="font-semibold text-slate-500">Cible :</span>
                      <span className="font-mono font-bold text-slate-800">{station.radionuclide_focus}</span>
                    </div>
                  )}
                  {station.sample_matrix && (
                    <div className="mb-2 px-2 py-1 rounded bg-slate-100 text-[10px] text-slate-700 flex justify-between items-center">
                      <span className="font-semibold text-slate-500">Matrice :</span>
                      <span className="text-slate-700">{station.sample_matrix}</span>
                    </div>
                  )}

                  {/* OpenRadiation dedicated participatory details */}
                  {station.source_code === 'OPENRADIATION' && (
                    <div className="mb-2 p-2 rounded bg-purple-50 border border-purple-200 text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-purple-900">
                        <span className="font-medium">Mesure brute citoyenne :</span>
                        <span className="font-mono font-bold">
                          {station.openradiation_meta?.raw_usvh
                            ? `${station.openradiation_meta.raw_usvh.toFixed(4)} µSv/h`
                            : latest?.raw_value
                            ? `${Number(latest.raw_value).toFixed(4)} µSv/h`
                            : `${((val || 0) / 1000).toFixed(4)} µSv/h`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Milieu de mesure :</span>
                        <span className="font-medium capitalize text-slate-800">
                          {station.openradiation_meta?.qualification === 'groundlevel'
                            ? 'Au sol (extérieur)'
                            : station.openradiation_meta?.qualification === 'indoor'
                            ? 'En intérieur'
                            : station.openradiation_meta?.qualification || 'Ambiance'}
                        </span>
                      </div>
                      {station.openradiation_meta?.public_url && (
                        <a
                          href={station.openradiation_meta.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center justify-center gap-1 text-purple-700 hover:text-purple-950 font-semibold underline pt-1 border-t border-purple-200/60"
                        >
                          <span>Voir la fiche sur OpenRadiation.org</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-slate-400" />
                      <span>Réseau : {station.source_name || station.source_code}</span>
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

        {/* 3 Pillars Filter Toggle */}
        <div className="flex flex-wrap max-w-xs sm:max-w-none rounded-xl bg-slate-900/95 border border-slate-700/80 p-0.5 shadow-lg backdrop-blur-md text-[11px]">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg transition font-medium ${
              filterType === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Toutes sources ({stations.length})
          </button>

          <button
            onClick={() => setFilterType('INSTITUTIONAL')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              filterType === 'INSTITUTIONAL'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Réseaux officiels d'État (Téléray, OPERA-Air, HydroTéléray)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Institutionnel ({instCount})</span>
          </button>

          <button
            onClick={() => setFilterType('PARTICIPATORY')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              filterType === 'PARTICIPATORY'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Sciences participatives & capteurs citoyens (OpenRadiation)"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Participatif ({partCount})</span>
          </button>

          <button
            onClick={() => setFilterType('INTERNATIONAL')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              filterType === 'INTERNATIONAL'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Surveillance transfrontalière et mondiale (EURDEP / Safecast)"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>International ({intlCount})</span>
          </button>
        </div>

        {/* Measurement Types Filter Toggle */}
        <div className="flex flex-wrap max-w-xs sm:max-w-none rounded-xl bg-slate-900/95 border border-slate-700/80 p-0.5 shadow-lg backdrop-blur-md text-[11px] gap-0.5">
          <button
            onClick={() => setFilterMeasurementType('ALL')}
            className={`px-2.5 py-1 rounded-lg transition font-medium ${
              filterMeasurementType === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous types ({stations.length})
          </button>

          <button
            onClick={() => setFilterMeasurementType('AMBIENT_GAMMA_DOSE_RATE')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              filterMeasurementType === 'AMBIENT_GAMMA_DOSE_RATE'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Débit de dose gamma ambiant (nSv/h - Téléray, OpenRad, EURDEP, Safecast)"
          >
            <span>⚡ Dose gamma ({gammaCount})</span>
          </button>

          <button
            onClick={() => setFilterMeasurementType('ATMOSPHERIC_AEROSOLS')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              filterMeasurementType === 'ATMOSPHERIC_AEROSOLS'
                ? 'bg-teal-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Aérosols atmosphériques sur filtres grand débit (µBq/m³ - OPERA-Air)"
          >
            <span>💨 Aérosols OPERA-Air ({aerosolCount})</span>
          </button>

          <button
            onClick={() => setFilterMeasurementType('WATER_RADIOACTIVITY')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              filterMeasurementType === 'WATER_RADIOACTIVITY'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Radioactivité fluviale en Bq/L (Tritium H-3 - HydroTéléray)"
          >
            <span>💧 Eaux HydroTéléray ({waterCount})</span>
          </button>
        </div>
      </div>

      {/* Multi-Vector Legend Badge */}
      <div className="absolute bottom-3 left-3 z-20 hidden md:flex flex-wrap items-center gap-3 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-[11px] font-mono text-slate-300 shadow-md backdrop-blur-md">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300" />
          <span>Téléray (nSv/h)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 border border-teal-300" />
          <span>💨 OPERA-Air (µBq/m³)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-cyan-300" />
          <span>💧 HydroTéléray (Bq/L)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-purple-300" />
          <span>OpenRadiation</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-sky-300" />
          <span>EURDEP / Safecast</span>
        </span>
      </div>
    </div>
  );
};
