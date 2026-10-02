import React from 'react';
import type { Station } from '../types/radiation';
import { RadiationGauge } from '../components/RadiationGauge';
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
}) => {
  // National average calculation across available latest measurements
  const stationsWithMeas = stations.filter(s => s.latest_measurement?.value !== undefined);
  const avgNational = stationsWithMeas.length > 0
    ? stationsWithMeas.reduce((acc, s) => acc + (s.latest_measurement?.value || 0), 0) / stationsWithMeas.length
    : 95.0;

  const officialCount = stations.filter(s => s.is_official).length;
  const citizenCount = stations.filter(s => !s.is_official).length;

  const formattedUpdate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Récemment';

  const nearestMeas = nearestStation?.latest_measurement;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
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
              RADIO FRANCE
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-400 max-w-xl">
              Consultez en temps réel les données publiques de surveillance radiologique en France métropolitaine et Corse.
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

        {/* Nearest Station Card or Location Prompt */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-white">
                  {nearestStation ? 'Station la plus proche' : 'Votre station locale'}
                </h2>
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
                      {new Date(nearestMeas.measured_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-500">Dernière mesure</div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-amber-400">
                      {nearestMeas.value.toFixed(1)}{' '}
                      <span className="text-sm font-normal text-slate-400">nSv/h</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectStation(nearestStation.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow"
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

          {/* National Dose Rate Gauge */}
          <div className="flex flex-col justify-between">
            <RadiationGauge
              value={avgNational}
              unit="nSv/h"
              isOfficial={true}
              showContext={false}
              className="h-full flex flex-col justify-center"
            />
          </div>
        </div>

        {/* Quick Action Navigation Grid (Required Section 15 & 46) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onTabChange('map')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <Map className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-white group-hover:text-amber-300 transition">
              Voir la carte
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Explorer les balises sur toute la France
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
              {stations.length} stations enregistrées
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
              Alertes officielles
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Communications des autorités
            </div>
          </button>

          <button
            onClick={() => onTabChange('info')}
            className="group flex flex-col items-start p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition text-left shadow"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-white group-hover:text-emerald-300 transition">
              Comprendre
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Unités nSv/h, normes et rayonnements
            </div>
          </button>
        </div>
      </section>

      {/* Network Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Réseau Institutionnel Téléray</span>
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {officialCount} balises
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Exploité par l'ASNR (IRSN). Balises gamma permanentes de haute précision réparties sur le territoire national.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Layers className="w-4 h-4" />
            <span>Sciences Participatives</span>
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {citizenCount} capteurs
          </div>
          <p className="mt-1 text-xs text-slate-400">
            OpenRadiation & Safecast. Données collaboratives recueillies par des citoyens équipés de dosimètres étalonnés.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Activity className="w-4 h-4" />
            <span>Fond Radiologique Moyen</span>
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {avgNational.toFixed(1)} nSv/h
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Moyenne nationale en direct. Les variations s'expliquent naturellement par la nature géologique des sols (granite vs calcaire).
          </p>
        </div>
      </section>
    </div>
  );
};
