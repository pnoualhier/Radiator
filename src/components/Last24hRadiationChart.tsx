import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import type { Measurement } from '../types/radiation';
import { safeFormatTime, safeFormatDate, safeFormatNumber } from '../utils/dateUtils';
import { Clock, TrendingUp, TrendingDown, Minus, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface Last24hRadiationChartProps {
  measurements: Measurement[];
  unit?: string;
  sourceCode?: string;
  measurementType?: string;
}

export const Last24hRadiationChart: React.FC<Last24hRadiationChartProps> = ({
  measurements,
  unit = 'nSv/h',
  sourceCode,
  measurementType,
}) => {
  // Extract and filter data strictly for the last 24 hours
  const { chartData, stats, latestPoint, baselineValue } = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return { chartData: [], stats: null, latestPoint: null, baselineValue: 100 };
    }

    // Chronological order
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );

    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const latestTimestamp = new Date(sorted[sorted.length - 1].measured_at).getTime();

    // Use latest timestamp as anchor if dataset is historical, otherwise current time
    const anchorTime = isNaN(latestTimestamp) ? now : Math.max(now, latestTimestamp);
    const windowStart = anchorTime - twentyFourHoursMs;

    // Filter points within 24h window
    let filtered = sorted.filter(m => {
      const t = new Date(m.measured_at).getTime();
      return !isNaN(t) && t >= windowStart;
    });

    // If filtered slice has too few points, take the last 24 entries
    if (filtered.length < 4) {
      filtered = sorted.slice(-24);
    }

    const values = filtered.map(m => m.value).filter(v => v !== undefined && !isNaN(v));
    const count = values.length;

    let min = 0;
    let max = 0;
    let avg = 0;
    let latest = values.length > 0 ? values[values.length - 1] : 0;
    let first = values.length > 0 ? values[0] : 0;

    if (count > 0) {
      min = Math.min(...values);
      max = Math.max(...values);
      avg = values.reduce((sum, v) => sum + v, 0) / count;
    }

    const deltaPercent = first > 0 ? ((latest - first) / first) * 100 : 0;

    const formattedData = filtered.map(m => {
      const d = new Date(m.measured_at);
      const validTime = isNaN(d.getTime()) ? 0 : d.getTime();

      // Format X-axis label as HH:mm
      const hourMinute = safeFormatTime(m.measured_at, { hour: '2-digit', minute: '2-digit' }, '00:00');
      const fullDateTime = safeFormatDate(m.measured_at, {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        timestamp: validTime,
        hourMinute,
        fullDateTime,
        value: m.value,
        quality: m.quality_status || 'VALID',
        diffFromAvg: avg > 0 ? m.value - avg : 0,
      };
    });

    return {
      chartData: formattedData,
      stats: {
        count,
        min,
        max,
        avg,
        latest,
        deltaPercent,
      },
      latestPoint: filtered[filtered.length - 1] || null,
      baselineValue: 100, // natural average baseline ~100 nSv/h for gamma
    };
  }, [measurements]);

  const isDoseRate = !measurementType || measurementType === 'AMBIENT_GAMMA_DOSE_RATE';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-white">
                Évolution des mesures sur les dernières 24h
              </h3>
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
                Recharts • 24 Heures
              </span>
              <HelpTooltip
                title="Profil chronologique 24h (Recharts)"
                position="bottom"
                align="start"
                content="Courbe continue des 24 dernières heures. La ligne de référence en pointillés figure le bruit de fond moyen de la station. Des fluctuations modérées (+-10%) sont habituelles et causées par la météo, la pression atmosphérique ou le lessivage par la pluie."
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Profil continu du débit sur 24 heures glissantes • Unité : <span className="font-mono text-amber-300 font-semibold">{unit}</span>
            </p>
          </div>
        </div>

        {/* 24h Trend badge */}
        {stats && (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-mono">
            {Math.abs(stats.deltaPercent) < 3 ? (
              <Minus className="w-3.5 h-3.5 text-emerald-400" />
            ) : stats.deltaPercent > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="text-slate-400">Tendance 24h :</span>
            <span
              className={`font-bold ${
                Math.abs(stats.deltaPercent) < 3
                  ? 'text-emerald-400'
                  : stats.deltaPercent > 0
                  ? 'text-amber-300'
                  : 'text-sky-300'
              }`}
            >
              {stats.deltaPercent > 0 ? '+' : ''}
              {stats.deltaPercent.toFixed(1)}% (
              {Math.abs(stats.deltaPercent) < 3 ? 'Stable' : 'Fluctuation'})
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats Bar */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-left">
            <div className="text-[10px] font-mono uppercase text-slate-500">Dernier relevé 24h</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {safeFormatNumber(stats.latest, stats.latest < 1 ? 2 : 1)}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{unit}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400 font-mono">
              à {safeFormatTime(latestPoint?.measured_at, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-left">
            <div className="text-[10px] font-mono uppercase text-slate-500">Minimum 24h</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-sky-400">
                {safeFormatNumber(stats.min, stats.min < 1 ? 2 : 1)}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{unit}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-sky-400/80 font-mono">Creux journalier</div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-left">
            <div className="text-[10px] font-mono uppercase text-slate-500">Moyenne 24h</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {safeFormatNumber(stats.avg, stats.avg < 1 ? 2 : 1)}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{unit}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-emerald-400/80 font-mono">Niveau de référence</div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-left">
            <div className="text-[10px] font-mono uppercase text-slate-500">Pic maximal 24h</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-amber-400">
                {safeFormatNumber(stats.max, stats.max < 1 ? 2 : 1)}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{unit}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-amber-400/80 font-mono">Maximum atteint</div>
          </div>
        </div>
      )}

      {/* Main Recharts Container */}
      <div className="h-64 w-full pt-1">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 font-mono">
            <Activity className="w-6 h-6 mb-2 text-slate-600 animate-pulse" />
            <span>Aucune mesure collectée sur les dernières 24 heures</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient24h" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="hourMinute"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                minTickGap={20}
                tickLine={false}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                domain={['auto', 'auto']}
                unit={` ${unit}`}
                tickLine={false}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px] text-slate-400">
                          <span>{data.fullDateTime}</span>
                          <span className="rounded bg-emerald-950 px-1 text-[10px] text-emerald-400">
                            {data.quality}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Mesure :</span>
                          <span className="font-bold text-amber-300">
                            {data.value != null ? `${Number(data.value).toFixed(1)} ${unit}` : '—'}
                          </span>
                        </div>
                        {stats && stats.avg > 0 && (
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Écart moyenne :</span>
                            <span
                              className={`font-semibold ${
                                data.diffFromAvg > 0
                                  ? 'text-amber-400'
                                  : data.diffFromAvg < 0
                                  ? 'text-sky-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {data.diffFromAvg > 0 ? '+' : ''}
                              {data.diffFromAvg.toFixed(1)} {unit}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* 24h Average Reference Line */}
              {stats && stats.avg > 0 && (
                <ReferenceLine
                  y={stats.avg}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: `Moy 24h: ${stats.avg.toFixed(1)}`,
                    fill: '#10b981',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}

              {/* Natural Baseline Guide for dose rate */}
              {isDoseRate && (
                <ReferenceLine
                  y={baselineValue}
                  stroke="#38bdf8"
                  strokeDasharray="2 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `Fond nat: ~100 nSv/h`,
                    fill: '#38bdf8',
                    fontSize: 9,
                    position: 'insideBottomRight',
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#f59e0b', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#fbbf24', stroke: '#020617', strokeWidth: 2 }}
                fillOpacity={1}
                fill="url(#gradient24h)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Scientific baseline contextual footnote */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Fond géologique naturel de référence : <strong>70 à 130 nSv/h</strong> en métropole</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Seuil d'alerte réglementaire d'État : <strong>&gt; 200 nSv/h</strong></span>
        </div>
      </div>
    </div>
  );
};
