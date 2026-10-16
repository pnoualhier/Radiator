import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Station, StationsCompareResponse, ComparedStationItem } from '../types/radiation';
import { ApiService } from '../services/api';
import { HelpTooltip } from '../components/HelpTooltip';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  X,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface CompareStationsPageProps {
  stations: Station[];
  onSelectStation?: (stationId: number) => void;
  initialStationIds?: number[];
}

export const CompareStationsPage: React.FC<CompareStationsPageProps> = ({
  stations,
  onSelectStation,
  initialStationIds = [1, 7, 8, 11], // Paris, Limoges, Brest, Lyon
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialStationIds);
  const [periodHours, setPeriodHours] = useState<number>(168); // 7 days
  const [data, setData] = useState<StationsCompareResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hiddenLines, setHiddenLines] = useState<Record<number, boolean>>({});
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadComparison = useCallback(async (ids: number[], hours: number) => {
    setLoading(true);
    try {
      const res = await ApiService.compareStations(ids, hours);
      setData(res);
    } catch (err) {
      console.error('Failed to load station comparison:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComparison(selectedIds, periodHours);
  }, [selectedIds, periodHours, loadComparison]);

  const handlePeriodChange = (hours: number) => {
    setPeriodHours(hours);
  };

  const handleRemoveStation = (id: number) => {
    if (selectedIds.length <= 2) return; // Keep at least 2 for comparison
    setSelectedIds(selectedIds.filter(sId => sId !== id));
  };

  const handleAddStation = (id: number) => {
    if (selectedIds.includes(id) || selectedIds.length >= 6) return;
    setSelectedIds([...selectedIds, id]);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleApplyPreset = (ids: number[]) => {
    setSelectedIds(ids);
  };

  const toggleLineVisibility = (stationId: number) => {
    setHiddenLines(prev => ({
      ...prev,
      [stationId]: !prev[stationId],
    }));
  };

  // Filter available stations for the addition modal/dropdown
  const availableToAdd = useMemo(() => {
    return stations
      .filter(s => !selectedIds.includes(s.id))
      .filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.commune && s.commune.toLowerCase().includes(q)) ||
          (s.department_code && s.department_code.toLowerCase().includes(q))
        );
      })
      .slice(0, 10);
  }, [stations, selectedIds, searchQuery]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded-full">
                <GitCompare className="w-3.5 h-3.5 text-amber-400" />
                COMPARATEUR MULTI-STATIONS PÉDAGOGIQUE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2.5">
              <span>COMPARAISON & CONTRASTES GÉOLOGIQUES</span>
              <HelpTooltip
                title="Comparateur territorial géologique"
                position="bottom"
                align="start"
                content="Permet d'aligner temporellement jusqu'à 6 stations de régions différentes pour comprendre pourquoi deux localités françaises affichent des valeurs normales distinctes. La nature du socle géologique (granite vs calcaire) et l'altitude expliquent 95% des écarts territoriaux observés."
              />
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Superposez en temps réel les mesures et métriques de plusieurs balises gamma pour visualiser l'impact de la géologie naturelle (granite vs calcaire) et les variations métrologiques du territoire.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleApplyPreset([1, 7, 8, 11])}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition ${
                selectedIds.join(',') === '1,7,8,11'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              🇫🇷 Paris • Limoges • Brest • Lyon
            </button>
            <button
              onClick={() => handleApplyPreset([7, 8, 15])}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
            >
              🪨 Socles granitiques
            </button>
            <button
              onClick={() => handleApplyPreset([1, 9, 10, 13])}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
            >
              🏛️ Plaines sédimentaires
            </button>
            <HelpTooltip
              title="Préréglages de comparaison"
              position="bottom"
              align="end"
              content="Sélections préconfigurées pour comparer directement les extrêmes naturels : trio national de référence, socles granitiques anciens (Limousin, Bretagne, Vosges ~120-150 nSv/h) vs plaines sédimentaires calcaires (Bassin parisien, Aquitaine ~70-90 nSv/h)."
            />
          </div>
        </div>

        {/* Selected Stations Chips & Add Button */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-400 font-semibold mr-1">Balises comparées :</span>
          {data?.stations.map(item => {
            const isHidden = hiddenLines[item.station.id];
            return (
              <div
                key={item.station.id}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border bg-slate-900/90 text-xs font-mono transition"
                style={{ borderColor: item.station.color }}
              >
                <button
                  onClick={() => toggleLineVisibility(item.station.id)}
                  className="flex items-center gap-1.5 hover:opacity-80"
                  title="Cliquer pour afficher/masquer la courbe"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: isHidden ? '#64748b' : item.station.color,
                      opacity: isHidden ? 0.4 : 1,
                    }}
                  />
                  <span className={`font-bold ${isHidden ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.station.commune || item.station.name}
                  </span>
                </button>

                <span className="text-[10px] text-slate-400 font-sans">
                  ({item.latest_measurement.value} nSv/h)
                </span>

                {selectedIds.length > 2 && (
                  <button
                    onClick={() => handleRemoveStation(item.station.id)}
                    className="text-slate-500 hover:text-red-400 transition ml-1 p-0.5 rounded"
                    title="Retirer de la comparaison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {selectedIds.length < 6 && (
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-400/80 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-amber-300 text-xs font-mono font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une station</span>
              </button>

              {/* Autocomplete Dropdown */}
              {isSearchOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md z-30 space-y-2">
                  <div className="text-[11px] font-mono font-semibold text-slate-400">
                    Rechercher une balise à comparer :
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Nom, commune, département..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 no-scrollbar">
                    {availableToAdd.map(st => (
                      <button
                        key={st.id}
                        onClick={() => handleAddStation(st.id)}
                        className="w-full text-left py-2 px-2 hover:bg-slate-800 rounded-lg text-xs font-mono transition flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{st.name}</div>
                          <div className="text-[10px] text-slate-400">{st.commune} ({st.department_code})</div>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 📈 Multi-Curve Comparative Chart (User Request) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>Graphique multi-courbes synchronisé</span>
              <HelpTooltip
                title="Superposition multi-courbes synchronisée"
                position="bottom"
                align="start"
                content="Trace sur un même axe temporel les débits de dose de chaque balise sélectionnée. Permet de comparer la régularité du fond naturel et de vérifier si une hausse ponctuelle est locale (ex: pluie isolée) ou généralisée."
              />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Superposition continue du débit de dose ambiant (nSv/h)
            </p>
          </div>

          {/* Period selector */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
            {[
              { hours: 24, label: '24 h' },
              { hours: 48, label: '48 h' },
              { hours: 168, label: '7 jours' },
              { hours: 720, label: '30 jours' },
            ].map(p => (
              <button
                key={p.hours}
                onClick={() => handlePeriodChange(p.hours)}
                className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                  periodHours === p.hours
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        {loading ? (
          <div className="h-72 sm:h-96 flex flex-col items-center justify-center text-slate-500 font-mono text-xs space-y-2">
            <Activity className="w-6 h-6 animate-spin text-amber-400" />
            <span>Alignement chronologique des séries multi-balises...</span>
          </div>
        ) : (
          <div className="h-72 sm:h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortTime"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  unit=" nSv/h"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pointData = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-2">
                        <div className="text-[11px] text-slate-400 border-b border-slate-800/80 pb-1 font-semibold flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{pointData.formattedTime || label}</span>
                        </div>
                        <div className="space-y-1.5">
                          {data?.stations.map(item => {
                            const val = pointData[`station_${item.station.id}`];
                            if (val === undefined) return null;
                            return (
                              <div key={item.station.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: item.station.color }}
                                  />
                                  <span className="font-semibold text-slate-200">
                                    {item.station.commune || item.station.name} :
                                  </span>
                                </div>
                                <span className="font-bold text-white font-mono">
                                  {val} nSv/h
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  content={() => (
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono pb-2">
                      {data?.stations.map(item => {
                        const isHidden = hiddenLines[item.station.id];
                        return (
                          <button
                            key={item.station.id}
                            onClick={() => toggleLineVisibility(item.station.id)}
                            className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: isHidden ? '#64748b' : item.station.color,
                                opacity: isHidden ? 0.3 : 1,
                              }}
                            />
                            <span className={isHidden ? 'line-through text-slate-500' : 'text-slate-300 font-semibold'}>
                              {item.station.commune || item.station.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />

                {data?.stations.map(item => {
                  if (hiddenLines[item.station.id]) return null;
                  return (
                    <Line
                      key={item.station.id}
                      type="monotone"
                      dataKey={`station_${item.station.id}`}
                      name={item.station.commune || item.station.name}
                      stroke={item.station.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 1 }}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📊 Comprehensive Comparison Table (User Specified Metrics) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <span>Tableau comparatif des métriques clés</span>
            <HelpTooltip
              title="Tableau des indicateurs statistiques"
              position="bottom"
              align="start"
              content="Matrice comparative détaillée : dernière valeur instantanée, moyennes glissantes 24h et 7j, extremums (minimum/maximum), valeur médiane, écart d'évolution en pourcentage et fraîcheur temporelle de la donnée télémétrique."
            />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dernière mesure, moyennes glissantes 24h & 7j, extremums, médiane, évolution et fraîcheur
          </p>
        </div>

        {/* Responsive Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="pb-3 font-semibold">Balise & Géologie</th>
                <th className="pb-3 font-semibold text-right">Dernière mesure</th>
                <th className="pb-3 font-semibold text-right">Moyenne 24 h</th>
                <th className="pb-3 font-semibold text-right">Moyenne 7 jours</th>
                <th className="pb-3 font-semibold text-right hidden sm:table-cell">Minimum</th>
                <th className="pb-3 font-semibold text-right hidden sm:table-cell">Maximum</th>
                <th className="pb-3 font-semibold text-right">Médiane</th>
                <th className="pb-3 font-semibold text-right">Évolution</th>
                <th className="pb-3 font-semibold text-right">Âge dernière donnée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.stations.map(item => {
                const isPositive = item.evolution.delta > 0;
                const isNeutral = item.evolution.delta === 0;

                return (
                  <tr key={item.station.id} className="hover:bg-slate-800/40 transition">
                    {/* Station Name & Geological Info */}
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.station.color }}
                        />
                        <div>
                          <div className="font-bold text-white text-sm">
                            {item.station.name}
                          </div>
                          <div className="text-[10px] text-amber-400 font-sans mt-0.5">
                            {item.station.geology_label}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dernière mesure */}
                    <td className="py-3.5 px-2 text-right">
                      <div className="font-bold text-white text-sm">
                        {item.latest_measurement.value} <span className="text-[11px] font-normal text-slate-400">{item.latest_measurement.unit}</span>
                      </div>
                      <div className="text-[10px] font-sans flex items-center justify-end gap-1 text-emerald-400 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Valide</span>
                      </div>
                    </td>

                    {/* Moyenne 24 h */}
                    <td className="py-3.5 px-2 text-right">
                      <span className="font-bold text-slate-200">
                        {item.avg_24h} nSv/h
                      </span>
                    </td>

                    {/* Moyenne 7 jours */}
                    <td className="py-3.5 px-2 text-right">
                      <span className="font-bold text-slate-200">
                        {item.avg_7d} nSv/h
                      </span>
                    </td>

                    {/* Minimum */}
                    <td className="py-3.5 px-2 text-right hidden sm:table-cell">
                      <span className="text-slate-300">
                        {item.minimum} nSv/h
                      </span>
                    </td>

                    {/* Maximum */}
                    <td className="py-3.5 px-2 text-right hidden sm:table-cell">
                      <span className="text-slate-300">
                        {item.maximum} nSv/h
                      </span>
                    </td>

                    {/* Médiane */}
                    <td className="py-3.5 px-2 text-right">
                      <span className="font-bold text-amber-300">
                        {item.median} nSv/h
                      </span>
                    </td>

                    {/* Évolution */}
                    <td className="py-3.5 px-2 text-right">
                      <div className={`inline-flex items-center gap-1 font-bold ${
                        isNeutral ? 'text-slate-400' : isPositive ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isNeutral ? (
                          <Minus className="w-3.5 h-3.5" />
                        ) : isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>{item.evolution.delta > 0 ? `+${item.evolution.delta}` : item.evolution.delta}</span>
                        <span className="text-[10px] font-normal">({item.evolution.delta_percent}%)</span>
                      </div>
                    </td>

                    {/* Âge de la dernière donnée */}
                    <td className="py-3.5 pl-2 text-right">
                      <span className="text-slate-300 flex items-center justify-end gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.age_display}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🎓 Pedagogical Geological Insights Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Comprendre les écarts métrologiques observés</span>
          </div>
          <HelpTooltip
            title="Analyse physique des contrastes territoriaux"
            position="top"
            align="end"
            content="Synthèse pédagogique rédigée selon les principes de l'ASNR : décrypte les causes naturelles des contrastes régionaux, notamment la composition isotopique des granites hercyniens (uranium, thorium, potassium-40) face aux roches sédimentaires carbonatées."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 font-mono block">
              1. Pourquoi Limoges (~142 nSv/h) est 65% plus élevé que Paris (~85 nSv/h) ?
            </span>
            <p className="text-slate-300">
              Le sous-sol de Limoges et du Limousin fait partie intégrante du <strong>socle hercynien ancien</strong> constitué de granites et roches cristallines naturellement riches en isotopes d'uranium-238, thorium-232 et potassium-40. À l'inverse, Paris repose sur les épaisses couches sédimentaires calcaires et argileuses du Bassin Parisien, beaucoup moins radioactives.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 font-mono block">
              2. La stabilité temporelle du bruit de fond
            </span>
            <p className="text-slate-300">
              Observez les moyennes 24h et 7 jours : elles sont extrêmement régulières. Cette stabilité prouve que ces niveaux mesurés ne proviennent pas d'une source industrielle intermittente, mais de l'irradiation tellurique naturelle continue émise par la croûte terrestre depuis des centaines de millions d'années.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
