import React, { useState, useMemo } from 'react';
import {
  TIMELINE_EVENTS_2026,
  TIMELINE_MONTHS,
  TIMELINE_YEARS,
  type TimelineEvent,
} from '../data/timelineEvents';
import {
  History,
  Calendar,
  Radio,
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  TrendingUp,
  FileText,
  MapPin,
  CheckCircle2,
  Filter,
  Info,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface TimelinePageProps {
  onSelectStationByName?: (stationName: string) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ onSelectStationByName }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OFFICIAL' | 'ENVIRONMENTAL' | 'SPIKES'>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Filter events according to year, month and category
  const filteredEvents = useMemo(() => {
    return TIMELINE_EVENTS_2026.filter(evt => {
      if (evt.year !== selectedYear) return false;
      if (selectedMonth !== 'ALL' && evt.month !== selectedMonth) return false;

      if (activeFilter === 'OFFICIAL') {
        return evt.officialAlert.inesLevel !== 'AUCUN';
      }
      if (activeFilter === 'ENVIRONMENTAL') {
        return evt.environmental.phenomenon === 'ORAGE_RADON_WASHOUT' || evt.environmental.phenomenon === 'POUSSIERE_SAHARIENNE';
      }
      if (activeFilter === 'SPIKES') {
        return evt.teleray.deltaPercent > 20;
      }
      return true;
    });
  }, [selectedYear, selectedMonth, activeFilter]);

  // Recharts monthly trend baseline dataset
  const chartData = useMemo(() => {
    return [
      { month: 'Jan', avgDose: 98, peakDose: 218, eventCount: 1 },
      { month: 'Fév', avgDose: 96, peakDose: 96, eventCount: 1 },
      { month: 'Mars', avgDose: 97, peakDose: 104, eventCount: 1 },
      { month: 'Avril', avgDose: 95, peakDose: 95, eventCount: 1 },
      { month: 'Mai', avgDose: 99, peakDose: 106, eventCount: 1 },
      { month: 'Juin', avgDose: 96, peakDose: 110, eventCount: 1 },
      { month: 'Juil', avgDose: 95, peakDose: 95, eventCount: 0 },
      { month: 'Août', avgDose: 96, peakDose: 97, eventCount: 1 },
      { month: 'Sept', avgDose: 97, peakDose: 97, eventCount: 0 },
      { month: 'Oct', avgDose: 102, peakDose: 242, eventCount: 1 },
    ];
  }, []);

  return (
    <div className="space-y-8 pb-20 md:pb-12 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-mono font-semibold text-amber-400">
              <History className="w-3.5 h-3.5" /> CHRONOLOGIE & ANALYSE HISTORIQUE
            </div>
            <h1 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
              Timeline des Événements
            </h1>
            <p className="mt-2 text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Juxtaposition analytique permanente : <strong>Mesures Téléray</strong> + <strong>Alertes officielles (ASNR / IRSN)</strong> + <strong>Événements environnementaux</strong> pour une traçabilité historique transparente.
            </p>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {TIMELINE_YEARS.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                  selectedYear === year
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Juxtaposition Concept Banner */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 flex items-center gap-3">
            <Radio className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-300">1. Mesure Téléray</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Télémesures & pics enregistrés</div>
            </div>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-rose-300">2. Alertes officielles</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ASNR, IRSN, Sécurité civile, INES</div>
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3.5 flex items-center gap-3">
            <CloudRain className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="font-bold text-sky-300">3. Événements météo</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Radon-washout, Sahara, Crue, Soleil</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2026 Chronological Month Tree Navigation (As Diagrammed by User) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold font-mono text-white">
              Arborescence chronologique {selectedYear}
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {filteredEvents.length} événements répertoriés
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveFilter('OFFICIAL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeFilter === 'OFFICIAL'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Alertes INES / Exercices
            </button>
            <button
              onClick={() => setActiveFilter('ENVIRONMENTAL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeFilter === 'ENVIRONMENTAL'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Washout Radon / Météo
            </button>
            <button
              onClick={() => setActiveFilter('SPIKES')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeFilter === 'SPIKES'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pics Téléray (+20%)
            </button>
          </div>
        </div>

        {/* Tree Branch Diagram (Jan, Fév, Mars, Avril...) */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex items-center gap-2 min-w-full sm:min-w-0 font-mono text-xs">
            <button
              onClick={() => setSelectedMonth('ALL')}
              className={`px-3 py-1.5 rounded-xl border transition ${
                selectedMonth === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {selectedYear} • Année complète
            </button>

            <span className="text-slate-600">│</span>

            {TIMELINE_MONTHS.map(m => {
              const hasEvents = TIMELINE_EVENTS_2026.some(
                e => e.year === selectedYear && e.month === m.num
              );
              const isSelected = selectedMonth === m.num;

              return (
                <button
                  key={m.num}
                  onClick={() => setSelectedMonth(isSelected ? 'ALL' : m.num)}
                  className={`px-3 py-1.5 rounded-xl border transition relative flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                      : hasEvents
                      ? 'bg-slate-950 border-slate-800 text-white hover:bg-slate-800'
                      : 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                  }`}
                  disabled={!hasEvents}
                >
                  <span>{m.short}</span>
                  {hasEvents && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? 'bg-slate-950' : 'bg-amber-400'
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Year Overview Mini-Chart */}
        <div className="pt-2">
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  domain={[70, 260]}
                  unit=" nSv/h"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 font-mono text-xs text-white shadow-xl space-y-1">
                          <div className="font-bold text-amber-400">{d.month} 2026</div>
                          <div className="text-[11px] text-slate-300">
                            Moyenne mensuelle : <strong>{d.avgDose} nSv/h</strong>
                          </div>
                          {d.peakDose > d.avgDose && (
                            <div className="text-[11px] text-amber-300">
                              Pic météo ponctuel : <strong>{d.peakDose} nSv/h</strong>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500">
                            {d.eventCount} événement historique répertorié
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={100}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{ value: 'Fond moyen ~100 nSv/h', fill: '#10b981', fontSize: 9, position: 'insideTopLeft' }}
                />
                <Area
                  type="monotone"
                  dataKey="peakDose"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#timelineGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-right text-[10px] font-mono text-slate-500 mt-1">
            Évolution annuelle du débit de dose métropolitain et pics d'événements 2026
          </div>
        </div>
      </div>

      {/* JUXTAPOSED TIMELINE EVENTS CARDS */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 font-mono text-xs">
            Aucun événement ne correspond à ce filtre pour {selectedYear}.
          </div>
        ) : (
          filteredEvents.map(evt => {
            const isExpanded = expandedEventId === evt.id;

            return (
              <div
                key={evt.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6 shadow-xl space-y-4 hover:border-slate-700 transition"
              >
                {/* Event Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{evt.dateString}</span>
                      </span>

                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>{evt.location} ({evt.departmentCode})</span>
                      </span>

                      {/* Verdict Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          evt.correlationVerdict.statusBadge === 'NATUREL_CONFIRMÉ'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : evt.correlationVerdict.statusBadge === 'EXERCICE_MAÎTRISÉ'
                            ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {evt.correlationVerdict.verdictTitle}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold font-mono text-white mt-2">
                      {evt.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>{isExpanded ? 'Réduire' : 'Analyse complète'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* THE 3 JUXTAPOSED COLUMNS (Core User Requirement) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  
                  {/* COLUMN 1: MESURE TÉLÉRAY */}
                  <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                          <Radio className="w-4 h-4 text-amber-400" />
                          <span>Mesure Téléray</span>
                        </span>
                        <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                          {evt.teleray.validationStatus}
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold font-mono text-white">
                          {evt.teleray.peakValue}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{evt.teleray.unit}</span>
                        {evt.teleray.deltaPercent > 5 && (
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            (+{evt.teleray.deltaPercent.toFixed(1)}%)
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Fond habituel : <strong>{evt.teleray.baselineValue} nSv/h</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-1">
                      <div className="text-slate-500 uppercase">Balises impliquées :</div>
                      <div className="text-slate-300">{evt.teleray.stationsInvolved.join(', ')}</div>
                    </div>
                  </div>

                  {/* COLUMN 2: ALERTES OFFICIELLES (ASNR / IRSN) */}
                  <div className="rounded-xl border border-rose-500/30 bg-slate-950/80 p-4 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-mono font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>Alertes officielles</span>
                        </span>
                        <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                          {evt.officialAlert.authority}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs font-bold font-mono text-white">
                          {evt.officialAlert.title}
                        </div>
                        <div className="text-[11px] font-mono text-amber-300 mt-1">
                          Échelle : <strong>{evt.officialAlert.inesLabel}</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        {evt.officialAlert.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Impact sanitaire nul sur les populations</span>
                    </div>
                  </div>

                  {/* COLUMN 3: ÉVÉNEMENTS ENVIRONNEMENTAUX */}
                  <div className="rounded-xl border border-sky-500/30 bg-slate-950/80 p-4 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-mono font-bold text-sky-300 flex items-center gap-1.5">
                          <span>{evt.environmental.icon}</span>
                          <span>Événement météo</span>
                        </span>
                        <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 px-1.5 py-0.5 rounded">
                          Environnement
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs font-bold font-mono text-white">
                          {evt.environmental.phenomenonLabel}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        {evt.environmental.meteorologicalContext}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                      <span className="text-sky-300">Impact capteurs : </span>
                      <span>{evt.environmental.impactOnMeasurements}</span>
                    </div>
                  </div>

                </div>

                {/* HISTORICAL CORRELATION SYNTHESIS BANNER */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Synthèse de corrélation croisée :</span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {evt.correlationVerdict.isArtificialContamination ? '⚠️ Rejet signalé' : '✅ 0 rejet artificiel'}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {evt.correlationVerdict.verdictExplanation}
                  </p>

                  {/* Deep detailed expansion */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-2 text-slate-400">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <strong className="text-slate-200">Action administrative menée :</strong>
                          <p className="mt-0.5">{evt.officialAlert.actionTaken}</p>
                        </div>
                        <div>
                          <strong className="text-slate-200">Contrôle de conformité métrologique :</strong>
                          <p className="mt-0.5">
                            Données archivées dans le référentiel national Téléray de l'ASNR et transmises au réseau européen EURDEP.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
