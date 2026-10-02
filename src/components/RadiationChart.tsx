import React, { useState } from 'react';
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
import type { Measurement, StationStatistics } from '../types/radiation';

interface RadiationChartProps {
  measurements: Measurement[];
  statistics?: StationStatistics | null;
  unit?: string;
  onPeriodChange?: (hours: number) => void;
}

export const RadiationChart: React.FC<RadiationChartProps> = ({
  measurements,
  statistics,
  unit = 'nSv/h',
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(168); // 7 days default

  const handlePeriodClick = (hours: number) => {
    setSelectedPeriod(hours);
    if (onPeriodChange) onPeriodChange(hours);
  };

  // Format data points for Recharts
  const chartData = measurements.map(m => {
    const d = new Date(m.measured_at);
    return {
      timestamp: d.getTime(),
      formattedTime: d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
      }),
      value: m.value,
      quality: m.quality_status,
    };
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Évolution chronologique du débit de dose</h3>
          <p className="text-xs text-slate-400">
            Unité de référence : <span className="font-mono text-amber-400 font-semibold">{unit}</span>
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 text-xs font-medium">
          <button
            onClick={() => handlePeriodClick(24)}
            className={`rounded-md px-2.5 py-1 transition ${
              selectedPeriod === 24
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            24 h
          </button>
          <button
            onClick={() => handlePeriodClick(168)}
            className={`rounded-md px-2.5 py-1 transition ${
              selectedPeriod === 168
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => handlePeriodClick(720)}
            className={`rounded-md px-2.5 py-1 transition ${
              selectedPeriod === 720
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            30 jours
          </button>
        </div>
      </div>

      {/* Numerical statistics bar */}
      {statistics && statistics.count > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
          <div>
            <div className="text-slate-400 text-[11px]">Minimum</div>
            <div className="font-mono font-bold text-sky-400 text-sm mt-0.5">
              {statistics.minimum?.toFixed(1) ?? '—'} <span className="text-[10px] font-normal">{unit}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Moyenne</div>
            <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
              {statistics.average?.toFixed(1) ?? '—'} <span className="text-[10px] font-normal">{unit}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Médiane</div>
            <div className="font-mono font-bold text-slate-200 text-sm mt-0.5">
              {statistics.median?.toFixed(1) ?? '—'} <span className="text-[10px] font-normal">{unit}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Maximum</div>
            <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">
              {statistics.maximum?.toFixed(1) ?? '—'} <span className="text-[10px] font-normal">{unit}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart container */}
      <div className="mt-4 h-60 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Aucune mesure enregistrée sur cette période
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="radiationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="formattedTime"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                minTickGap={25}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                domain={['auto', 'auto']}
                unit={` ${unit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(val: any) => [
                  val != null ? `${Number(val).toFixed(1)} ${unit}` : '—',
                  'Débit de dose',
                ]}
                labelFormatter={(label) => `Mesure : ${label}`}
              />
              {statistics?.average && (
                <ReferenceLine
                  y={statistics.average}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: `Moy: ${statistics.average.toFixed(1)}`,
                    fill: '#10b981',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#radiationGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
