import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import type { Station } from '../types/radiation';
import {
  Navigation2,
  Filter,
  CheckSquare,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  AlertTriangle,
  Info,
  Sliders,
  Eye,
  MapPin,
  TrendingUp,
  X,
  Compass,
} from 'lucide-react';
import {
  generateHeatmapDataUrl,
  interpolatePointDose,
  FRANCE_INTERPOLATION_BOUNDS,
  type InterpolatedPointResult,
} from '../utils/interpolation';
import { safeFormatDateTime } from '../utils/dateUtils';

export interface RadiationMapProps {
  stations: Station[];
  selectedStationId?: number | null;
  onSelectStation?: (stationId: number) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onLocateMe?: () => void;
  isLocating?: boolean;
  observationMode?: string;
  onObservationModeChange?: (mode: string) => void;
  radionuclideFilter?: string;
  onRadionuclideFilterChange?: (nuclide: string) => void;
  aerosolUnit?: 'ubqm3' | 'bqm3';
  onAerosolUnitChange?: (unit: 'ubqm3' | 'bqm3') => void;
  focusCoords?: [number, number] | null;
  focusZoom?: number;
}

// Marker Icon Factory
function createMarkerIcon(
  value: number | undefined,
  isOfficial: boolean,
  dataNature?: string,
  isSimulated?: boolean,
  sourceCode?: string,
  measurementType?: string,
  unit?: string,
  isOffline?: boolean,
  isCitizen?: boolean
) {
  let bg = '#0284c7';
  let border = 'border: 2px solid #ffffff;';
  let badgeIcon = '';

  const hasValue = value !== undefined && value > 0 && dataNature !== 'UNAVAILABLE';

  // 1. ● Station Hors Ligne
  if (isOffline) {
    bg = '#334155';
    border = 'border: 2px dashed #94a3b8; opacity: 0.75;';
    badgeIcon = `<span style="position: absolute; top: -4px; right: -4px; background: #64748b; color: #fff; font-size: 7px; width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✕</span>`;
  }
  // 2. ● Station Citoyenne
  else if (isCitizen || sourceCode === 'OPENRADIATION' || sourceCode === 'SAFECAST') {
    bg = '#7e22ce';
    border = 'border: 2px dashed #d8b4fe; box-shadow: 0 0 10px rgba(168,85,247,0.4);';
    badgeIcon = `<span style="position: absolute; top: -5px; right: -5px; background: #a855f7; color: #fff; font-size: 8px; width: 13px; height: 13px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #0f172a;" title="Capteur citoyen">🟣</span>`;
  }
  // 3. ● Station Officielle (Téléray, OPERA-Air, HydroTéléray)
  else if (isOfficial || sourceCode === 'TELERAY' || sourceCode === 'OPERA_AIR' || sourceCode === 'HYDROTELERAY') {
    if (measurementType === 'ATMOSPHERIC_AEROSOLS') {
      bg = '#0f766e';
      border = 'border: 2.5px solid #2dd4bf; box-shadow: 0 0 8px rgba(45,212,191,0.4);';
      badgeIcon = `<span style="position: absolute; bottom: -4px; right: -4px; background: #0f766e; color: #2dd4bf; font-size: 7px; width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #134e4a;">💨</span>`;
    } else if (measurementType === 'WATER_RADIOACTIVITY') {
      bg = '#0369a1';
      border = 'border: 2.5px solid #38bdf8; box-shadow: 0 0 8px rgba(56,189,248,0.4);';
      badgeIcon = `<span style="position: absolute; bottom: -4px; right: -4px; background: #0369a1; color: #38bdf8; font-size: 7px; width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #075985;">💧</span>`;
    } else {
      if (hasValue && value > 180) {
        bg = '#b45309';
        border = 'border: 2.5px solid #fbbf24; box-shadow: 0 0 8px rgba(245,158,11,0.5);';
      } else if (hasValue && value > 120) {
        bg = '#047857';
        border = 'border: 2.5px solid #34d399; box-shadow: 0 0 8px rgba(16,185,129,0.5);';
      } else {
        bg = '#0284c7';
        border = 'border: 2.5px solid #38bdf8; box-shadow: 0 0 8px rgba(56,189,248,0.5);';
      }
      badgeIcon = `<span style="position: absolute; top: -5px; right: -5px; background: #10b981; color: #fff; font-size: 7px; width: 13px; height: 13px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #0f172a;" title="Institutionnel Téléray">🟢</span>`;
    }
  }
  // 4. ● Station normale
  else {
    bg = '#0284c7';
    border = 'border: 2px solid #ffffff;';
  }

  let valText = '—';
  if (hasValue && !isOffline) {
    if (measurementType === 'ATMOSPHERIC_AEROSOLS') {
      valText = value < 1 ? value.toFixed(1) : Math.round(value).toString();
    } else if (measurementType === 'WATER_RADIOACTIVITY') {
      valText = value.toFixed(1);
    } else {
      valText = Math.round(value).toString();
    }
  }

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
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
        ${border}
      ">
        ${valText}
        ${badgeIcon}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

// Cluster Icon Factory
function createClusterIcon(count: number, avgDose: number | null) {
  let colorClass = 'bg-sky-600/95 border-sky-300';
  if (avgDose && avgDose > 130) {
    colorClass = 'bg-amber-600/95 border-amber-300';
  } else if (avgDose && avgDose > 90) {
    colorClass = 'bg-emerald-600/95 border-emerald-300';
  }

  return L.divIcon({
    className: 'radiation-cluster-marker',
    html: `
      <div style="
        position: relative;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        cursor: pointer;
      " class="${colorClass} border-2 text-white font-mono backdrop-blur-md">
        <span style="font-size: 13px; font-weight: 800; line-height: 1;">${count}</span>
        ${avgDose ? `<span style="font-size: 8px; opacity: 0.9; line-height: 1; margin-top: 1px;">${avgDose}</span>` : ''}
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

// Map recentering helper
function MapRecenter({ coords, zoom }: { coords?: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, zoom || map.getZoom(), { animate: true });
    }
  }, [coords, zoom, map]);
  return null;
}

// Map click sampling handler for Heatmap estimation
function MapSamplingHandler({
  onSample,
  active,
}: {
  onSample: (lat: number, lon: number) => void;
  active: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    const clickHandler = (e: L.LeafletMouseEvent) => {
      onSample(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', clickHandler);
    return () => {
      map.off('click', clickHandler);
    };
  }, [map, onSample, active]);
  return null;
}

// Cluster and Marker Rendering Component
function StationsRenderLayer({
  stations,
  onSelectStation,
  aerosolUnit,
  useClustering,
  visible,
}: {
  stations: Station[];
  onSelectStation?: (id: number) => void;
  aerosolUnit?: 'ubqm3' | 'bqm3';
  useClustering: boolean;
  visible: boolean;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(() => map.getZoom());

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  const { clusters, individualStations } = useMemo(() => {
    if (!visible) return { clusters: [], individualStations: [] };
    if (!useClustering || zoom >= 10) {
      return { clusters: [], individualStations: stations };
    }

    const cellSize = zoom <= 6 ? 1.4 : zoom === 7 ? 0.9 : zoom === 8 ? 0.5 : 0.3;
    const grid = new Map<string, Station[]>();

    stations.forEach(s => {
      const key = `${Math.round(s.latitude / cellSize)}_${Math.round(s.longitude / cellSize)}`;
      const existing = grid.get(key) || [];
      existing.push(s);
      grid.set(key, existing);
    });

    const cls: Array<{
      id: string;
      center: [number, number];
      stations: Station[];
      count: number;
      avgDose: number | null;
    }> = [];
    const ind: Station[] = [];

    grid.forEach((stList, key) => {
      if (stList.length === 1) {
        ind.push(stList[0]);
      } else {
        const avgLat = stList.reduce((acc, s) => acc + s.latitude, 0) / stList.length;
        const avgLon = stList.reduce((acc, s) => acc + s.longitude, 0) / stList.length;

        const vals = stList
          .map(s => s.latest_measurement?.value)
          .filter((v): v is number => typeof v === 'number' && v > 0);
        const avgDose = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;

        cls.push({
          id: `cluster-${key}`,
          center: [avgLat, avgLon],
          stations: stList,
          count: stList.length,
          avgDose,
        });
      }
    });

    return { clusters: cls, individualStations: ind };
  }, [stations, zoom, useClustering, visible]);

  if (!visible) return null;

  return (
    <>
      {/* 1. Cluster Markers */}
      {clusters.map(c => {
        const icon = createClusterIcon(c.count, c.avgDose);

        return (
          <Marker
            key={c.id}
            position={c.center}
            icon={icon}
            eventHandlers={{
              click: () => {
                map.setView(c.center, Math.min(12, zoom + 2), { animate: true });
              },
            }}
          >
            <Popup maxWidth={280}>
              <div className="text-slate-900 font-sans p-1 space-y-2">
                <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <div className="font-bold text-xs">
                    Regroupement ({c.count} balises)
                  </div>
                  {c.avgDose && (
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                      Moy: {c.avgDose} nSv/h
                    </span>
                  )}
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100 text-[11px]">
                  {c.stations.map(st => (
                    <div key={st.id} className="pt-1 flex items-center justify-between">
                      <span className="truncate max-w-[170px] font-medium text-slate-800">
                        {st.commune || st.name}
                      </span>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        {st.latest_measurement ? `${st.latest_measurement.value.toFixed(1)} nSv/h` : '—'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => map.setView(c.center, Math.min(12, zoom + 2), { animate: true })}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <span>Zoomer pour dégroupé</span> →
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* 2. Individual Station Markers */}
      {individualStations.map(station => {
        const latest = station.latest_measurement;
        const val = latest?.value;
        const isDemo = station.is_simulated || station.data_nature === 'DEMO' || latest?.is_simulated || latest?.data_nature === 'DEMO';
        const measType = station.measurement_type || latest?.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE';
        const unit = latest?.unit || station.latest_measurement?.unit || (measType === 'ATMOSPHERIC_AEROSOLS' ? 'µBq/m³' : measType === 'WATER_RADIOACTIVITY' ? 'Bq/L' : 'nSv/h');

        const isOffline = station.is_active === false || latest?.quality_status === 'MISSING' || latest?.quality_status === 'STALE';
        const isCitizen = station.source_code === 'OPENRADIATION' || station.source_code === 'SAFECAST' || !station.is_official;
        const isOfficial = Boolean(station.is_official);

        const icon = createMarkerIcon(
          val,
          isOfficial,
          station.data_nature || latest?.data_nature,
          isDemo,
          station.source_code,
          measType,
          unit,
          isOffline,
          isCitizen
        );

        let displayVal = '—';
        if (val !== undefined && !isOffline) {
          if (measType === 'ATMOSPHERIC_AEROSOLS') {
            displayVal = aerosolUnit === 'bqm3' ? (val * 1e-6).toExponential(2) + ' Bq/m³' : `${val.toFixed(2)} µBq/m³`;
          } else if (measType === 'WATER_RADIOACTIVITY') {
            displayVal = `${val.toFixed(1)} Bq/L`;
          } else {
            displayVal = `${val.toFixed(1)} nSv/h`;
          }
        }

        const formattedDate = safeFormatDateTime(latest?.measured_at, 'Donnée archivée');

        return (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={icon}
          >
            <Popup maxWidth={280}>
              <div className="text-slate-900 font-sans p-1 space-y-2">
                <div>
                  <div className="font-bold text-xs text-slate-900 leading-tight">
                    {station.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    📍 {station.commune || 'Localisation fixe'}{station.department_code ? ` (${station.department_code})` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {isCitizen ? (
                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.5 rounded">
                      🟣 Capteur Citoyen ({station.source_name || station.source_code})
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded">
                      🟢 Institutionnel (ASNR / Téléray)
                    </span>
                  )}
                  {isOffline ? (
                    <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-300 px-1 py-0.5 rounded">
                      Hors ligne / Ancien
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.5 rounded">
                      Mesure active
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">
                    Débit mesuré
                  </div>
                  <div className="text-lg font-mono font-extrabold text-slate-900">
                    {displayVal}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    🕒 {formattedDate}
                  </div>
                </div>

                {onSelectStation && (
                  <button
                    onClick={() => onSelectStation(station.id)}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition shadow"
                  >
                    <span>Voir la station & historique</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export const RadiationMap: React.FC<RadiationMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  userCoords,
  onLocateMe,
  isLocating,
  observationMode,
  onObservationModeChange,
  radionuclideFilter,
  onRadionuclideFilterChange,
  aerosolUnit = 'ubqm3',
  onAerosolUnitChange,
  focusCoords,
  focusZoom,
}) => {
  // ─── 1. View Mode (Real Sensors vs Statistical Distribution vs Combined) ──
  // User Requirement:
  // "Stations : mesures réelles"
  // "Carte de distribution : visualisation statistique/interpolation explicitement indiquée comme telle"
  const [viewMode, setViewMode] = useState<'STATIONS' | 'DISTRIBUTION' | 'COMBINED'>('COMBINED');
  const [distributionOpacity, setDistributionOpacity] = useState<number>(0.55);
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);

  // Click point sampling on heatmap
  const [sampledPoint, setSampledPoint] = useState<{
    lat: number;
    lon: number;
    result: InterpolatedPointResult | null;
  } | null>(null);

  // ─── 2. Filter States (User Specifications) ───────────────────────────────
  // Filtres Sources : ☑ Téléray, ☐ OpenRadiation, ☐ Safecast, ☐ EURDEP
  const [sourcesFilter, setSourcesFilter] = useState<{
    teleray: boolean;
    openradiation: boolean;
    safecast: boolean;
    eurdep: boolean;
  }>({
    teleray: true,
    openradiation: false,
    safecast: false,
    eurdep: false,
  });

  // Statut Stations : ☑ Stations actives, ☐ Stations anciennes
  const [statusFilter, setStatusFilter] = useState<{
    active: boolean;
    ancienne: boolean;
  }>({
    active: true,
    ancienne: false,
  });

  // Type de mesure : Gamma, Aérosols, Eau, Spectrométrie
  const [measTypeFilter, setMeasTypeFilter] = useState<'ALL' | 'GAMMA' | 'AEROSOLS' | 'WATER' | 'SPECTROMETRY'>('ALL');

  // Période : Dernière heure, 24 h, 7 jours
  const [timePeriodFilter, setTimePeriodFilter] = useState<'1h' | '24h' | '7d'>('24h');

  // Affichage : ● station, ● station hors ligne, ● station citoyenne, ● station officielle
  const [displayStyleFilter, setDisplayStyleFilter] = useState<'ALL' | 'ACTIVE' | 'OFFLINE' | 'CITIZEN' | 'OFFICIAL'>('ALL');

  // Clustering toggle
  const [useClustering, setUseClustering] = useState<boolean>(true);

  // Filter drawer UI collapse state
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const toggleSource = (key: keyof typeof sourcesFilter) => {
    setSourcesFilter(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleStatus = (key: keyof typeof statusFilter) => {
    setStatusFilter(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetFilters = () => {
    setSourcesFilter({
      teleray: true,
      openradiation: false,
      safecast: false,
      eurdep: false,
    });
    setStatusFilter({
      active: true,
      ancienne: false,
    });
    setMeasTypeFilter('ALL');
    setTimePeriodFilter('24h');
    setDisplayStyleFilter('ALL');
  };

  // ─── Filter Stations ──────────────────────────────────────────────────────
  const filteredStations = useMemo(() => {
    const now = Date.now();

    return stations.filter(s => {
      // 1. Source Filter (Téléray / OpenRadiation / Safecast / EURDEP)
      const isTelerayNetwork = s.source_code === 'TELERAY' || s.source_code === 'OPERA_AIR' || s.source_code === 'HYDROTELERAY';
      const isOpenRad = s.source_code === 'OPENRADIATION';
      const isSafe = s.source_code === 'SAFECAST';
      const isEurdep = s.source_code === 'EURDEP';

      const sourceMatches =
        (sourcesFilter.teleray && isTelerayNetwork) ||
        (sourcesFilter.openradiation && isOpenRad) ||
        (sourcesFilter.safecast && isSafe) ||
        (sourcesFilter.eurdep && isEurdep);

      if (!sourceMatches) return false;

      // 2. Activity / Age Filter (Active vs Ancienne)
      const measuredAtTime = s.latest_measurement?.measured_at
        ? new Date(s.latest_measurement.measured_at).getTime()
        : 0;
      const ageMs = now - measuredAtTime;
      const isAncienne =
        s.is_active === false ||
        s.latest_measurement?.quality_status === 'STALE' ||
        s.latest_measurement?.quality_status === 'MISSING' ||
        ageMs > 86400000;

      const statusMatches =
        (statusFilter.active && !isAncienne) ||
        (statusFilter.ancienne && isAncienne);

      if (!statusMatches) return false;

      // 3. Measurement Type (Gamma / Aérosols / Eau / Spectrométrie)
      if (measTypeFilter === 'GAMMA') {
        const isGamma = !s.measurement_type || s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE';
        if (!isGamma) return false;
      } else if (measTypeFilter === 'AEROSOLS') {
        const isAerosol = s.measurement_type === 'ATMOSPHERIC_AEROSOLS' || s.source_code === 'OPERA_AIR';
        if (!isAerosol) return false;
      } else if (measTypeFilter === 'WATER') {
        const isWater = s.measurement_type === 'WATER_RADIOACTIVITY' || s.source_code === 'HYDROTELERAY';
        if (!isWater) return false;
      } else if (measTypeFilter === 'SPECTROMETRY') {
        const isSpectro = s.measurement_type === 'GAMMA_SPECTROMETRY' || Boolean(s.radionuclide_focus);
        if (!isSpectro) return false;
      }

      // 4. Période (1 heure, 24 h, 7 jours)
      if (timePeriodFilter === '1h') {
        if (ageMs > 3600000) return false;
      } else if (timePeriodFilter === '24h') {
        if (ageMs > 86400000) return false;
      } else if (timePeriodFilter === '7d') {
        if (ageMs > 604800000) return false;
      }

      // 5. Affichage Style Filter (● station, ● station hors ligne, ● station citoyenne, ● station officielle)
      if (displayStyleFilter === 'ACTIVE') {
        if (isAncienne) return false;
      } else if (displayStyleFilter === 'OFFLINE') {
        if (!isAncienne) return false;
      } else if (displayStyleFilter === 'CITIZEN') {
        if (s.is_official) return false;
      } else if (displayStyleFilter === 'OFFICIAL') {
        if (!s.is_official) return false;
      }

      return true;
    });
  }, [stations, sourcesFilter, statusFilter, measTypeFilter, timePeriodFilter, displayStyleFilter]);

  // ─── Generate Heatmap Raster Data URL via IDW interpolation ──────────────
  const heatmapDataUrl = useMemo(() => {
    // Generate only if distribution layer is shown
    if (viewMode === 'STATIONS') return null;
    return generateHeatmapDataUrl(stations, FRANCE_INTERPOLATION_BOUNDS, 250, 250);
  }, [stations, viewMode]);

  // Handle map click to sample the statistical model
  const handleMapSampleClick = useCallback((lat: number, lon: number) => {
    if (viewMode === 'STATIONS') return;
    const result = interpolatePointDose(lat, lon, stations);
    setSampledPoint({ lat, lon, result });
  }, [stations, viewMode]);

  const targetCoords = useMemo<[number, number] | null>(() => {
    if (focusCoords) {
      return focusCoords;
    }
    if (selectedStationId) {
      const s = stations.find(st => st.id === selectedStationId);
      if (s) return [s.latitude, s.longitude];
    }
    if (userCoords) {
      return [userCoords.latitude, userCoords.longitude];
    }
    return null;
  }, [focusCoords, selectedStationId, userCoords, stations]);

  const defaultCenter: [number, number] = [46.603354, 1.888334];
  const defaultZoom = 6;

  const sourceCounts = useMemo(() => {
    return {
      teleray: stations.filter(s => s.source_code === 'TELERAY' || s.source_code === 'OPERA_AIR' || s.source_code === 'HYDROTELERAY').length,
      openradiation: stations.filter(s => s.source_code === 'OPENRADIATION').length,
      safecast: stations.filter(s => s.source_code === 'SAFECAST').length,
      eurdep: stations.filter(s => s.source_code === 'EURDEP').length,
    };
  }, [stations]);

  const franceBounds: L.LatLngBoundsExpression = [
    [FRANCE_INTERPOLATION_BOUNDS.south, FRANCE_INTERPOLATION_BOUNDS.west],
    [FRANCE_INTERPOLATION_BOUNDS.north, FRANCE_INTERPOLATION_BOUNDS.east],
  ];

  const showStations = viewMode === 'STATIONS' || viewMode === 'COMBINED';
  const showDistribution = viewMode === 'DISTRIBUTION' || viewMode === 'COMBINED';

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col">
      {/* ─── Top Precaution Warning Banner (CRITICAL USER REQUIREMENT) ─── */}
      {showDistribution && (
        <div className="z-30 bg-amber-950/90 border-b border-amber-600/70 px-4 py-2 text-amber-200 text-xs font-mono shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <div className="leading-tight">
              <strong className="text-amber-300 uppercase tracking-wider text-[11px] font-bold">
                PRÉCAUTION MÉTHODOLOGIQUE :
              </strong>{' '}
              <span className="text-slate-200">
                Cette distribution surfacique est une <strong>interpolation géostatistique (IDW)</strong>. Elle ne constitue pas une mesure physique continue : <strong>seules les balises ponctuelles font foi</strong>.
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowMethodologyModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition shrink-0"
          >
            <Info className="w-3 h-3" />
            <span>Comprendre l'interpolation</span>
          </button>
        </div>
      )}

      {/* Map Viewport */}
      <div className="relative flex-1 w-full h-full min-h-[420px]">
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

          {targetCoords && (
            <MapRecenter
              coords={targetCoords}
              zoom={focusZoom || (focusCoords ? 10 : selectedStationId ? 11 : 9)}
            />
          )}

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

          {/* 🌡️ Statistical Heatmap Raster Layer (ImageOverlay) */}
          {showDistribution && heatmapDataUrl && (
            <ImageOverlay
              url={heatmapDataUrl}
              bounds={franceBounds}
              opacity={distributionOpacity}
              zIndex={12}
            />
          )}

          {/* Click Handler to sample the statistical model */}
          <MapSamplingHandler
            onSample={handleMapSampleClick}
            active={showDistribution}
          />

          {/* Sampled Point Marker on Heatmap click */}
          {sampledPoint && sampledPoint.result && (
            <CircleMarker
              center={[sampledPoint.lat, sampledPoint.lon]}
              radius={7}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#b45309',
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup maxWidth={280}>
                <div className="text-slate-900 font-sans p-1 space-y-2">
                  <div className="border-b border-amber-200 pb-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">
                      📍 Estimation statistique interpolée
                    </span>
                    <span className="text-xs text-slate-500">
                      Coordonnées : {sampledPoint.lat.toFixed(3)}° N, {sampledPoint.lon.toFixed(3)}° E
                    </span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 font-mono">
                    <div className="text-[10px] uppercase text-amber-800 font-semibold">
                      Débit estimé par le modèle
                    </div>
                    <div className="text-xl font-extrabold text-amber-950">
                      ~{sampledPoint.result.estimatedDose} nSv/h
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">
                      Indice de confiance : {sampledPoint.result.confidencePercent}%
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>
                      Balise physique de référence :{' '}
                      <strong>{sampledPoint.result.nearestStationName}</strong>
                    </div>
                    <div>
                      Distance : <strong>{sampledPoint.result.distanceKm} km</strong> • Valeur réelle :{' '}
                      <strong>{sampledPoint.result.nearestStationDose.toFixed(1)} nSv/h</strong>
                    </div>
                  </div>

                  <div className="text-[10px] italic text-slate-500 border-t border-slate-100 pt-1">
                    ⚠️ Valeur calculée par interpolation (IDW). Ne constitue pas une télémesure physique au sol.
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )}

          {/* 📍 Physical Stations Layer with Dynamic Clustering */}
          <StationsRenderLayer
            stations={filteredStations}
            onSelectStation={onSelectStation}
            aerosolUnit={aerosolUnit}
            useClustering={useClustering}
            visible={showStations}
          />
        </MapContainer>

        {/* ─── Top-Left: Mode Selector Switcher (User Specification) ─── */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-none">
          {/* Main 3-Way Mode Switcher: Stations Réelles vs Distribution Statistique vs Combiné */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-mono">
            <button
              onClick={() => setViewMode('STATIONS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'STATIONS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Afficher uniquement les balises physiques réelles"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Stations réelles</span>
            </button>

            <button
              onClick={() => setViewMode('DISTRIBUTION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'DISTRIBUTION'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Afficher uniquement la carte de distribution interpolée"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Carte distribution</span>
            </button>

            <button
              onClick={() => setViewMode('COMBINED')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'COMBINED'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Superposer balises réelles et distribution statistique"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vue combinée</span>
              <span className="sm:hidden">Combiné</span>
            </button>
          </div>

          {/* Opacity slider when distribution heatmap is active */}
          {showDistribution && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-[11px] font-mono text-slate-300 self-start">
              <span>Opacité :</span>
              <input
                type="range"
                min="0.2"
                max="0.85"
                step="0.05"
                value={distributionOpacity}
                onChange={e => setDistributionOpacity(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
              <span className="font-bold text-amber-300">{Math.round(distributionOpacity * 100)}%</span>
            </div>
          )}
        </div>

        {/* ─── Top-Right: Filters & Controls Drawer ─── */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)] sm:max-w-md">
          <div className="flex items-center gap-2">
            {onLocateMe && (
              <button
                onClick={onLocateMe}
                disabled={isLocating}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 text-xs font-mono font-medium text-white shadow-lg backdrop-blur-md transition disabled:opacity-50"
                title="Centrer sur ma position"
              >
                <Navigation2 className={`w-3.5 h-3.5 text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Ma position</span>
              </button>
            )}

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 text-xs font-mono font-semibold text-white shadow-xl backdrop-blur-md transition group"
            >
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300">Filtres</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {filteredStations.length}/{stations.length}
              </span>
              {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>

          {/* Expanded Interactive Filter Drawer */}
          {isFilterOpen && (
            <div className="w-full rounded-2xl bg-slate-900/95 border border-slate-700/80 p-4 shadow-2xl backdrop-blur-md text-xs font-mono space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150">
              {/* Header with Reset */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>FILTRES GÉOGRAPHIQUES & RÉSEAUX</span>
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline transition"
                  title="Rétablir les filtres par défaut"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              </div>

              {/* 1. FILTRES SOURCES (User Request: ☑ Téléray, ☐ OpenRadiation, ☐ Safecast, ☐ EURDEP) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  1. Filtres par réseau / source
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSource('teleray')}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      sourcesFilter.teleray
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sourcesFilter.teleray ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <div className="truncate">
                      <span className="font-bold">Téléray</span>
                      <span className="text-[9px] block text-slate-400">({sourceCounts.teleray} balises)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSource('openradiation')}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      sourcesFilter.openradiation
                        ? 'bg-purple-950/60 border-purple-500/80 text-purple-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sourcesFilter.openradiation ? <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <div className="truncate">
                      <span className="font-bold">OpenRadiation</span>
                      <span className="text-[9px] block text-slate-400">({sourceCounts.openradiation} citoyennes)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSource('safecast')}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      sourcesFilter.safecast
                        ? 'bg-sky-950/60 border-sky-500/80 text-sky-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sourcesFilter.safecast ? <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <div className="truncate">
                      <span className="font-bold">Safecast</span>
                      <span className="text-[9px] block text-slate-400">({sourceCounts.safecast} capteurs)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSource('eurdep')}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      sourcesFilter.eurdep
                        ? 'bg-blue-950/60 border-blue-500/80 text-blue-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sourcesFilter.eurdep ? <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <div className="truncate">
                      <span className="font-bold">EURDEP</span>
                      <span className="text-[9px] block text-slate-400">({sourceCounts.eurdep} Europe)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. STATUT DES STATIONS (User Request: ☑ Stations actives, ☐ Stations anciennes) */}
              <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  2. Statut des stations
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus('active')}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      statusFilter.active
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {statusFilter.active ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <div>
                      <span className="font-bold">Stations actives</span>
                      <span className="text-[9px] block text-slate-400">Données en direct</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus('ancienne')}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      statusFilter.ancienne
                        ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {statusFilter.ancienne ? <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <div>
                      <span className="font-bold">Stations anciennes</span>
                      <span className="text-[9px] block text-slate-400">Données archivées</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. TYPE DE MESURE (User Request: Gamma, Aérosols, Eau, Spectrométrie) */}
              <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  3. Type de mesure
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'ALL', label: 'Tous' },
                    { id: 'GAMMA', label: 'Gamma' },
                    { id: 'AEROSOLS', label: 'Aérosols' },
                    { id: 'WATER', label: 'Eau' },
                    { id: 'SPECTROMETRY', label: 'Spectrométrie' },
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setMeasTypeFilter(type.id as any)}
                      className={`px-2 py-1.5 rounded-xl border text-center transition ${
                        measTypeFilter === type.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. PÉRIODE (User Request: Dernière heure, 24 h, 7 jours) */}
              <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  4. Période
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: '1h', label: 'Dernière heure' },
                    { id: '24h', label: '24 h' },
                    { id: '7d', label: '7 jours' },
                  ].map(period => (
                    <button
                      key={period.id}
                      onClick={() => setTimePeriodFilter(period.id as any)}
                      className={`px-2 py-1.5 rounded-xl border text-center transition ${
                        timePeriodFilter === period.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. AFFICHAGE & LÉGENDE INTERACTIVE */}
              <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>5. Affichage & Légende</span>
                  {displayStyleFilter !== 'ALL' && (
                    <button
                      onClick={() => setDisplayStyleFilter('ALL')}
                      className="text-[9px] text-amber-400 hover:underline"
                    >
                      Tout afficher
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDisplayStyleFilter(displayStyleFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl border text-left transition ${
                      displayStyleFilter === 'ACTIVE'
                        ? 'bg-slate-800 border-sky-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Afficher uniquement les stations actives"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-white shrink-0" />
                    <span>● station</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisplayStyleFilter(displayStyleFilter === 'OFFLINE' ? 'ALL' : 'OFFLINE')}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl border text-left transition ${
                      displayStyleFilter === 'OFFLINE'
                        ? 'bg-slate-800 border-slate-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Afficher uniquement les stations hors ligne"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-dashed border-slate-300 shrink-0" />
                    <span>● station hors ligne</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisplayStyleFilter(displayStyleFilter === 'CITIZEN' ? 'ALL' : 'CITIZEN')}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl border text-left transition ${
                      displayStyleFilter === 'CITIZEN'
                        ? 'bg-slate-800 border-purple-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Afficher uniquement les stations citoyennes"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-dashed border-purple-300 shrink-0" />
                    <span>● station citoyenne</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisplayStyleFilter(displayStyleFilter === 'OFFICIAL' ? 'ALL' : 'OFFICIAL')}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl border text-left transition ${
                      displayStyleFilter === 'OFFICIAL'
                        ? 'bg-slate-800 border-emerald-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Afficher uniquement les stations officielles"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300 shrink-0" />
                    <span>● station officielle</span>
                  </button>
                </div>
              </div>

              {/* 6. CLUSTERING TOGGLE (Regroupement) */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Regroupement (Clustering)
                </span>
                <button
                  type="button"
                  onClick={() => setUseClustering(!useClustering)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    useClustering
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {useClustering ? '✓ Activé' : 'Désactivé'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Bottom-Left: Heatmap Gradient & Legend Bar ─── */}
        <div className="absolute bottom-3 left-3 z-20 hidden md:flex flex-col gap-1.5 max-w-md">
          {showDistribution && (
            <div className="rounded-xl bg-slate-900/95 border border-slate-800 px-3 py-2 text-[10px] font-mono shadow-xl backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>ÉCHELLE DE DISTRIBUTION (IDW)</span>
                <span className="text-[9px] text-amber-400 font-normal">Modèle estimé</span>
              </div>
              {/* Continuous color bar */}
              <div className="h-2.5 w-full rounded-md bg-gradient-to-r from-sky-500 via-teal-400 via-emerald-500 via-amber-400 to-red-500 shadow-inner" />
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>&lt; 75 nSv/h</span>
                <span>95 nSv/h</span>
                <span>120 nSv/h</span>
                <span>&gt; 150 nSv/h</span>
              </div>
            </div>
          )}

          {/* Quick markers count */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900/95 border border-slate-800 px-3 py-1.5 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300" />
              <span>● Officielle (Téléray)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-dashed border-purple-300" />
              <span>● Citoyenne</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">
              {filteredStations.length} balise{filteredStations.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Methodology Modal (Scientific & Regulatory Rigor) ─── */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 font-mono text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>MÉTHODOLOGIE : CARTE DE DISTRIBUTION VS MESURES RÉELLES</span>
              </div>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 space-y-1">
                <h4 className="font-bold text-amber-300">
                  1. Règle fondamentale de rigueur radiologique
                </h4>
                <p>
                  Une carte de distribution spatiale issue d'une interpolation mathématique <strong>n'est pas une mesure physique au sol</strong>. Seules les balises du réseau Téléray (ASNR/IRSN) et les capteurs étalonnés constituent des mesures de référence certifiées.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>2. Fonctionnement de l'interpolation (IDW)</span>
                </h4>
                <p>
                  L'algorithme utilisé est la <em>Pondération Inverse de la Distance</em> (Inverse Distance Weighting - IDW). Pour chaque point géographique, le débit de dose est estimé par combinaison pondérée des balises environnantes : plus une balise est proche, plus son influence est forte. Au-delà d'un rayon de 160 km, la surface s'estompe pour ne pas extrapoler à l'aveugle.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>3. Origine des contrastes géologiques observés</span>
                </h4>
                <p>
                  La carte met fidèlement en évidence les contrastes naturels du territoire métropolitain :
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                  <li><strong>Plaines sédimentaires calcaires</strong> (Bassin parisien, Aquitaine) : 70 à 90 nSv/h.</li>
                  <li><strong>Socles granitiques hercyniens anciens</strong> (Limousin, Bretagne, Corse) : 120 à 160 nSv/h (radioactivité naturelle du sol).</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                💡 <strong>Astuce :</strong> En mode <em>Carte distribution</em> ou <em>Vue combinée</em>, cliquez n'importe où sur la carte pour obtenir l'estimation géostatistique ponctuelle ainsi que l'indice de confiance du modèle.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
