import React from 'react';
import type { Station } from '../types/radiation';
import type { FavoriteItemData } from '../hooks/useFavorites';
import {
  Star,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';

interface FavoriteStationsSectionProps {
  favoriteIds: number[];
  favoritesData: Record<number, FavoriteItemData>;
  stations: Station[];
  onSelectStation: (stationId: number) => void;
  onToggleFavorite: (stationId: number) => void;
  onFastRefresh: () => void;
  isFastRefreshing: boolean;
  fastRefreshDuration: number | null;
  lastRefreshedAt: Date | null;
}

export const FavoriteStationsSection: React.FC<FavoriteStationsSectionProps> = ({
  favoriteIds,
  favoritesData,
  stations,
  onSelectStation,
  onToggleFavorite,
  onFastRefresh,
  isFastRefreshing,
  fastRefreshDuration,
  lastRefreshedAt,
}) => {
  if (favoriteIds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center space-y-2">
        <Star className="w-8 h-8 text-amber-500/40 mx-auto" />
        <h3 className="text-sm font-bold text-white font-mono">
          MES STATIONS (FAVORIS)
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Aucune station favorite. Cliquez sur l'étoile ⭐ sur n'importe quelle balise pour l'ajouter à vos stations surveillées en priorité.
        </p>
        <button
          onClick={() => {
            onToggleFavorite(1);
            onToggleFavorite(7);
            onToggleFavorite(8);
          }}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rétablir le trio de référence (Paris • Limoges • Brest)</span>
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono tracking-wide flex items-center gap-2">
              <span>MES STATIONS SURVEILLÉES</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                {favoriteIds.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Synchronisation prioritaire ultra-rapide au démarrage de la PWA
            </p>
          </div>
        </div>

        {/* Priority Refresh Status Badge & Manual Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {fastRefreshDuration !== null && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Priorité : {fastRefreshDuration} ms</span>
            </span>
          )}

          <button
            onClick={onFastRefresh}
            disabled={isFastRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition"
            title="Actualiser immédiatement mes stations favorites"
          >
            <RefreshCw className={`w-3 h-3 text-amber-400 ${isFastRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-[11px]">{isFastRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Favorite Station Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favoriteIds.map(stId => {
          const favData = favoritesData[stId];
          const station = stations.find(s => s.id === stId);

          const title = favData?.commune || station?.commune || favData?.station_name || station?.name || `Station #${stId}`;
          const dept = favData?.department_code || station?.department_code;
          const value = favData?.measurement?.value ?? station?.latest_measurement?.value ?? 0;
          const unit = favData?.measurement?.unit || station?.latest_measurement?.unit || 'nSv/h';
          const avg24 = favData?.avg_24h ?? value;
          const trend = favData?.trend || 'STABLE';
          const ageMinutes = favData?.measurement?.age_minutes ?? (station?.latest_measurement?.measured_at ? Math.max(1, Math.round((Date.now() - new Date(station.latest_measurement.measured_at).getTime()) / 60000)) : 5);
          const isOfficial = favData?.is_official ?? station?.is_official ?? true;

          return (
            <div
              key={stId}
              onClick={() => onSelectStation(stId)}
              className="group rounded-2xl border border-slate-800 hover:border-amber-500/50 bg-slate-900/80 hover:bg-slate-900 p-4 shadow-lg transition cursor-pointer flex flex-col justify-between space-y-3"
            >
              {/* Top row: Star icon toggle & title */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white group-hover:text-amber-300 transition font-mono">
                      {title}
                    </span>
                    {dept && (
                      <span className="text-xs text-slate-400 font-mono">
                        ({dept})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{isOfficial ? 'Téléray / ASNR' : 'Capteur Citoyen'}</span>
                  </div>
                </div>

                {/* Star toggle button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(stId);
                  }}
                  className="p-1 rounded-lg text-amber-400 hover:bg-slate-800 transition shrink-0"
                  title="Retirer des favoris"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </button>
              </div>

              {/* Middle row: Large dose rate metric & 24h average */}
              <div className="flex items-end justify-between border-t border-slate-800/80 pt-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Débit mesuré</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white font-mono group-hover:text-amber-400 transition">
                      {value.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {unit}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Moyenne 24 h</span>
                  <div className="flex items-center justify-end gap-1 font-mono text-xs font-semibold text-slate-300">
                    {trend === 'RISING' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    ) : trend === 'FALLING' ? (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{avg24.toFixed(1)} {unit}</span>
                  </div>
                </div>
              </div>

              {/* Bottom footer: Freshness & details link */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>il y a {ageMinutes} min</span>
                </span>
                <span className="flex items-center gap-0.5 text-amber-400 group-hover:translate-x-0.5 transition font-semibold">
                  <span>Détails</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
