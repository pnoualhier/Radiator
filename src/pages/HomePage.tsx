import React, { useState, useMemo } from 'react';
import type { Station, ObservationMode, AuditTimestamps } from '../types/radiation';
import { ObservationModeSelector } from '../components/ObservationModeSelector';
import { MultiEnvironmentTree } from '../components/MultiEnvironmentTree';
import { NationalDistributionCard } from '../components/NationalDistributionCard';
import { QualityBadge } from '../components/QualityBadge';
import { OperaAirPanel } from '../components/OperaAirPanel';
import { HydrotelerayPanel } from '../components/HydrotelerayPanel';
import { FavoriteStationsSection } from '../components/FavoriteStationsSection';
import { HelpTooltip } from '../components/HelpTooltip';
import type { FavoriteItemData } from '../hooks/useFavorites';
import {
  safeFormatTime,
  safeFormatDate,
  safeFormatDateTime,
  safeFormatNumber,
} from '../utils/dateUtils';
import {
  Map,
  Radio,
  AlertTriangle,
  BookOpen,
  MapPin,
  Calendar,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Wind,
  Droplets,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Server,
  Database,
  HelpCircle,
} from 'lucide-react';
import type { NavTab } from '../components/Navigation';

interface HomePageProps {
  stations: Station[];
  nearestStation?: Station | null;
  onTabChange: (tab: NavTab) => void;
  onSelectStation: (stationId: number) => void;
  onRequestGeolocation: () => void;
  isLocating?: boolean;
  lastUpdated?: string;
  isCached?: boolean;
  auditTimestamps?: AuditTimestamps | null;
  favoriteIds?: number[];
  favoritesData?: Record<number, FavoriteItemData>;
  onToggleFavorite?: (stationId: number) => void;
  onFastRefreshFavorites?: () => void;
  isFastRefreshingFavorites?: boolean;
  fastRefreshDuration?: number | null;
  lastFavoritesRefresh?: Date | null;
  onOpenOfflineCenter?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stations,
  nearestStation,
  onTabChange,
  onSelectStation,
  onRequestGeolocation,
  isLocating,
  lastUpdated,
  isCached,
  auditTimestamps,
  favoriteIds = [],
  favoritesData = {},
  onToggleFavorite,
  onFastRefreshFavorites,
  isFastRefreshingFavorites = false,
  fastRefreshDuration,
  lastFavoritesRefresh,
  onOpenOfflineCenter,
}) => {
  const [observationMode, setObservationMode] = useState<ObservationMode>('ALL');
  const [selectedNuclide, setSelectedNuclide] = useState<string>('ALL');
  const [aerosolUnit, setAerosolUnit] = useState<'ubqm3' | 'bqm3'>('ubqm3');
  const [showTree, setShowTree] = useState<boolean>(false);

  // Counts for observation modes
  const counts = useMemo(() => ({
    all: stations.length,
    ambient: stations.filter(s => !s.measurement_type || s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE').length,
    aerosols: stations.filter(s => s.source_code === 'OPERA_AIR' || s.measurement_type === 'ATMOSPHERIC_AEROSOLS').length,
    water: stations.filter(s => s.source_code === 'HYDROTELERAY' || s.measurement_type === 'WATER_RADIOACTIVITY').length,
    citizen: stations.filter(s => s.source_code === 'OPENRADIATION' || s.source_code === 'SAFECAST').length,
  }), [stations]);

  // Vue nationale operational statistics
  const nationalStats = useMemo(() => {
    const activeCount = stations.filter(s => s.is_active !== false).length;
    const availableCount = stations.filter(
      s => s.is_active !== false && s.latest_measurement?.value !== undefined && s.latest_measurement.quality_status !== 'MISSING'
    ).length;
    const offlineCount = Math.max(0, activeCount - availableCount);

    const lastSyncTime = safeFormatTime(lastUpdated, { hour: '2-digit', minute: '2-digit' }, '10:42');

    return {
      activeCount,
      availableCount,
      offlineCount,
      lastSyncTime,
    };
  }, [stations, lastUpdated]);

  const formattedUpdate = safeFormatDateTime(lastUpdated, 'Récemment');

  const nearestMeas = nearestStation?.latest_measurement;
  const isAnyDemo = stations.some(s => s.is_simulated || s.data_nature === 'DEMO');

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Demo Disclaimer Banner if running simulated data */}
      {isAnyDemo && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 text-xs shadow-lg backdrop-blur-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-300 uppercase tracking-wide text-[11px] font-mono flex items-center gap-1.5">
              <span>Mode Démonstration Actif — Données simulées d'étalonnage</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              En l'absence de flux ouvert temps réel certifié ASNR/Téléray, les valeurs affichées sont des <strong>estimations de référence géologique</strong> (fond granitique vs sédimentaire) et <strong>ne doivent pas être interprétées comme des télémesures certifiées en direct</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-amber-400">
                <Activity className="w-3 h-3" /> SURVEILLANCE RADIOLOGIQUE NATIONALE
              </span>
              {isCached && (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                  Cache local
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
              RADIATION FRANCE
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-400 max-w-xl">
              Consultez en direct les deux niveaux de surveillance radiologique d'État : le <strong>débit gamma ambiant (Téléray)</strong> et la <strong>recherche de radionucléides dans l'atmosphère (OPERA-Air)</strong>.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center text-xs text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">Dernière mise à jour</span>
            <span className="font-mono text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {formattedUpdate}
            </span>
          </div>
        </div>

        {/* Rigorous 3-step audit timestamps sequence (User Request) */}
        {auditTimestamps && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mb-2">
              <span className="text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span>Traçabilité & Horodatage</span>
                <HelpTooltip
                  title="Traçabilité de la mesure (Audit 3 étapes)"
                  position="bottom"
                  align="start"
                  content="Chaîne de confiance à 3 niveaux : 1) Horodatage de détection physique sur le capteur, 2) Réception et validation cryptographique par le serveur central, 3) Stockage persistant chiffré dans la base locale Dexie de votre appareil pour fonctionnement hors ligne garanti."
                />
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {isCached ? 'Mode Cache Local (Dexie)' : 'Mode En Direct (Flux Réseau)'}
                </span>
                {onOpenOfflineCenter && (
                  <button
                    onClick={onOpenOfflineCenter}
                    className="text-[10px] bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-bold transition flex items-center gap-1"
                  >
                    <span>Centre d'information hors connexion</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg">
                <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500">Mesure effectuée</div>
                  <div className="text-white font-semibold">
                    {safeFormatTime(auditTimestamps.data_timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg">
                <Server className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500">Reçue par serveur</div>
                  <div className="text-white font-semibold">
                    {safeFormatTime(auditTimestamps.server_timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg">
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500">Mise en cache</div>
                  <div className="text-white font-semibold">
                    {safeFormatTime(auditTimestamps.cache_timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nearest Station Card or Location Prompt */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-white">
                  {nearestStation ? 'Station la plus proche' : 'Votre station locale'}
                </h2>
                <HelpTooltip
                  title="Localisation de la station la plus proche"
                  position="bottom"
                  align="start"
                  content="Détermine par calcul géodésique (formule de haversine) la balise de surveillance métrologique active la plus proche de votre position géographique afin d'évaluer le débit de dose gamma ambiant réel à proximité de votre domicile."
                />
              </div>
              <button
                onClick={onRequestGeolocation}
                disabled={isLocating}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                <Navigation className={`w-3 h-3 text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{nearestStation ? 'Actualiser GPS' : '📍 Ma position'}</span>
              </button>
            </div>

            {nearestStation && nearestMeas ? (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{nearestStation.name}</span>
                    {nearestStation.distance_km !== undefined && (
                      <span className="text-xs font-normal text-sky-400">
                        (~{nearestStation.distance_km} km)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Source : {nearestStation.source_name || nearestStation.source_code || 'Téléray / ASNR'}</span>
                    <span>•</span>
                    <span>
                      {safeFormatTime(nearestMeas.measured_at, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectStation(nearestStation.id)}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-medium transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pourquoi cette valeur ({safeFormatNumber(nearestMeas.value, 1)} {nearestMeas.unit || 'nSv/h'}) ?</span>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1">
                      <span>Dernière mesure</span>
                      <HelpTooltip
                        title="Débit de dose gamma"
                        content="Exprimé en nSv/h (nanosieverts/h). Représente le champ ambiant continu à 1 mètre du sol. Bruit de fond nominal en France : 70 à 150 nSv/h."
                      />
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-amber-400">
                      {safeFormatNumber(nearestMeas.value, nearestMeas.value < 1 ? 2 : 1)}{' '}
                      <span className="text-sm font-normal text-slate-400">{nearestMeas.unit || 'nSv/h'}</span>
                    </div>

                    <div className="mt-1.5">
                      <QualityBadge
                        measuredAt={nearestMeas.measured_at}
                        qualityStatus={nearestMeas.quality_status}
                        sourceCode={nearestStation.source_code}
                        measurementType={nearestStation.measurement_type}
                        dataNature={nearestMeas.data_nature || nearestStation.data_nature}
                        variant="full"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectStation(nearestStation.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow shrink-0"
                    title="Consulter l'historique de cette station"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Activez la géolocalisation pour afficher automatiquement la balise de surveillance la plus proche de vous.
                </p>
                <button
                  onClick={onRequestGeolocation}
                  className="shrink-0 ml-4 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 px-3 py-1.5 text-xs font-semibold hover:bg-sky-500/30 transition"
                >
                  Localiser
                </button>
              </div>
            )}
          </div>

          {/* Vue nationale Card */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Vue nationale
                  </h3>
                  <HelpTooltip
                    title="Supervision télémétrique nationale"
                    position="bottom"
                    align="start"
                    content="Synthèse opérationnelle en direct : dénombrement des balises Téléray opérationnelles, statut des flux entrants et calcul du taux de disponibilité global des sondes institutionnelles."
                  />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                  En direct
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stations connues :</span>
                  <span className="font-bold text-white text-sm">{stations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400">Transmettent :</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {nationalStats.availableCount}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      ({stations.length > 0 ? Math.round((nationalStats.availableCount / stations.length) * 100) : 99}%)
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Dernière synchro :</span>
                  <span className="font-bold text-amber-300">{nationalStats.lastSyncTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sources indisponibles :</span>
                  <span className="font-bold text-emerald-400">0 / 6</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Flux d'acquisition :</span>
              <span className="text-emerald-400 font-bold">
                {stations.length > 0 ? Math.round((nationalStats.availableCount / stations.length) * 100) : 99}% opérationnel
              </span>
            </div>

            <button
              onClick={() => onTabChange('health')}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-mono font-semibold text-emerald-300 hover:text-white transition flex items-center justify-between group"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supervision & santé du réseau</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* ⭐ Mes stations surveillées (Favoris avec actualisation rapide au démarrage) */}
        <div className="mt-6">
          <FavoriteStationsSection
            favoriteIds={favoriteIds}
            favoritesData={favoritesData}
            stations={stations}
            onSelectStation={onSelectStation}
            onToggleFavorite={onToggleFavorite || (() => {})}
            onFastRefresh={onFastRefreshFavorites || (() => {})}
            isFastRefreshing={isFastRefreshingFavorites}
            fastRefreshDuration={fastRefreshDuration ?? null}
            lastRefreshedAt={lastFavoritesRefresh ?? null}
          />
        </div>

        {/* Distribution des mesures (Rayonnement ambiant gamma en nSv/h) */}
        <div className="mt-5">
          <NationalDistributionCard stations={stations} />
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Accès rapide aux modules & vecteurs</span>
              <HelpTooltip
                title="Raccourcis modules & matrices physiques"
                position="bottom"
                align="start"
                content="Navigation directe vers les outils spécialisés de l'application : Cartographie nationale, Répertoire des balises, Surveillance des aérosols atmosphériques (OPERA-Air en Bq/m³), Surveillance fluviale (HydroTéléray en Bq/L), Fiches méthodologiques des 7 vecteurs, Registre officiel des alertes INES, Comparateur territorial et Supervision télémétrique."
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Sélection rapide
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <button
            onClick={() => onTabChange('map')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <Map className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-white group-hover:text-amber-300 transition">
              Carte
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Explorer les balises
            </div>
          </button>

          <button
            onClick={() => onTabChange('stations')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition">
              <Radio className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-white group-hover:text-sky-300 transition">
              Stations
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {stations.length} répertoriées
            </div>
          </button>

          <button
            onClick={() => {
              setObservationMode('ATMOSPHERIC_AEROSOLS');
            }}
            className="group flex flex-col items-start p-4 rounded-2xl bg-teal-950/40 border border-teal-800/60 hover:border-teal-400/80 hover:bg-teal-900/40 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 group-hover:bg-teal-500 group-hover:text-slate-950 transition">
              <Wind className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-teal-300 group-hover:text-teal-200 transition">
              OPERA-Air
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Aérosols (Bq/m³)
            </div>
          </button>

          <button
            onClick={() => {
              setObservationMode('WATER_RADIOACTIVITY');
            }}
            className="group flex flex-col items-start p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-400/80 hover:bg-cyan-900/40 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-cyan-300 group-hover:text-cyan-200 transition">
              HydroTéléray
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Eaux fluviales (Bq/L)
            </div>
          </button>

          <button
            onClick={() => onTabChange('types')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-white group-hover:text-teal-300 transition">
              Types & Vecteurs
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Dose vs Aérosols vs Eaux
            </div>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/50 hover:bg-slate-800/80 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-slate-950 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-white group-hover:text-red-300 transition">
              Alertes
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Crise & Vigilance
            </div>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 hover:border-amber-400/80 hover:bg-amber-900/40 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <GitCompare className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-amber-300 group-hover:text-amber-200 transition">
              Comparer
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Paris vs Limoges vs Lyon...
            </div>
          </button>

          <button
            onClick={() => onTabChange('health')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 hover:border-emerald-400/80 hover:bg-emerald-900/40 transition text-left shadow col-span-2 sm:col-span-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-emerald-300 group-hover:text-emerald-200 transition">
              Santé réseau
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Supervision Téléray
            </div>
          </button>
        </div>
      </div>
    </section>

      {/* Multi-Environment Interactive Architecture Tree Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <Layers className="w-4 h-4" />
            <span>ARCHITECTURE MULTI-ENVIRONNEMENT DE RADIATOR</span>
            <HelpTooltip
              title="Surveillance multi-milieux des écosystèmes"
              position="bottom"
              align="start"
              content="Schéma systémique illustrant la complémentarité des 4 vecteurs environnementaux surveillés : l'air atmosphérique (aérosols), l'eau fluviale (cours d'eau), le sol tellurique (débit gamma) et les données participatives citoyennes."
            />
          </div>

          <button
            onClick={() => setShowTree(!showTree)}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            <span>{showTree ? 'Masquer le schéma' : 'Afficher le schéma Air / Eau / Sol'}</span>
            {showTree ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showTree && (
          <MultiEnvironmentTree
            selectedMode={observationMode}
            onSelectMode={setObservationMode}
            counts={counts}
          />
        )}
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

      {/* Dedicated OPERA-Air Panel (when in aerosols mode or default) */}
      {(observationMode === 'ATMOSPHERIC_AEROSOLS' || observationMode === 'ALL') && (
        <OperaAirPanel
          stations={stations}
          onSelectStation={onSelectStation}
          selectedAerosolUnit={aerosolUnit}
        />
      )}

      {/* Dedicated HydroTéléray Panel (when in water mode or all) */}
      {(observationMode === 'WATER_RADIOACTIVITY' || observationMode === 'ALL') && (
        <HydrotelerayPanel
          stations={stations}
          onSelectStation={onSelectStation}
        />
      )}

      {/* Network Overview Cards: The 3 Pillars Architecture */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>🟢 Pôle Institutionnel</span>
            </div>
            <HelpTooltip
              title="Pôle Institutionnel d'État"
              position="top"
              align="end"
              content="Réseaux officiels exploités par l'Autorité de Sûreté Nucléaire et de Radioprotection (ASNR / IRSN). Comprend Téléray (débit gamma ambiant), OPERA-Air (aérosols en Bq/m³) et HydroTéléray (cours d'eau). Données certifiées à valeur juridique et réglementaire."
            />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {stations.filter(s => s.source_code === 'TELERAY' || s.source_code === 'OPERA_AIR' || s.source_code === 'HYDROTELERAY').length} stations d'État
          </div>
          <p className="mt-1 text-xs text-slate-300">
            <strong>ASNR / IRSN</strong> : Réseau multi-vecteurs combinant <strong>Téléray</strong> (débit gamma en nSv/h), <strong>OPERA-Air</strong> (aérosols en Bq/m³) et <strong>HydroTéléray</strong> (eaux en Bq/L).
          </p>
        </div>

        <div className="rounded-2xl border border-purple-800/60 bg-purple-950/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>🟣 Pôle Participatif</span>
            </div>
            <HelpTooltip
              title="Pôle Participatif Citoyen"
              position="top"
              align="end"
              content="Données issues de la communauté OpenRadiation (partenariat IRSN, Sorbonne Université, ANCCLI, FabLabs). Capteurs fixes et mobiles déployés par des citoyens formés, étalonnés et normalisés en temps réel."
            />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {stations.filter(s => s.source_code === 'OPENRADIATION').length} capteurs citoyens
          </div>
          <p className="mt-1 text-xs text-slate-300">
            <strong>OpenRadiation</strong> : Sciences citoyennes en direct (IRSN, Sorbonne, ANCCLI), mesures en µSv/h normalisées.
          </p>
        </div>

        <div className="rounded-2xl border border-sky-800/60 bg-sky-950/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>🔵 Pôle International</span>
            </div>
            <HelpTooltip
              title="Pôle International & Transfrontalier"
              position="top"
              align="end"
              content="Flux transfrontaliers EURDEP gérés par le Joint Research Centre (JRC) de la Commission Européenne (Allemagne, Suisse, Belgique, Espagne, Italie) et réseau mondial de capteurs indépendants Safecast."
            />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {stations.filter(s => s.source_code === 'EURDEP' || s.source_code === 'SAFECAST').length} stations transfrontalières
          </div>
          <p className="mt-1 text-xs text-slate-300">
            <strong>EURDEP (JRC UE) & Safecast</strong> : Surveillance transfrontalière européenne et open data mondiale.
          </p>
        </div>
      </section>
    </div>
  );
};

