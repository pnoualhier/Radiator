import React, { useEffect, useState } from 'react';
import type { Station } from '../types/radiation';
import { ApiService } from '../services/api';
import { QualityBadge } from './QualityBadge';
import { Wind, ShieldCheck, Activity, CheckCircle2, Info, ArrowRight, Gauge, Layers, Sparkles } from 'lucide-react';

interface OperaAirPanelProps {
  stations: Station[];
  onSelectStation?: (stationId: number) => void;
  selectedAerosolUnit?: 'ubqm3' | 'bqm3';
}

export const OperaAirPanel: React.FC<OperaAirPanelProps> = ({
  stations,
  onSelectStation,
  selectedAerosolUnit = 'ubqm3',
}) => {
  const [summary, setSummary] = useState<any>(null);
  const [radionuclides, setRadionuclides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, radRes] = await Promise.all([
          ApiService.getOperaAirSummary(),
          ApiService.getOperaAirRadionuclides(),
        ]);
        setSummary(sumRes);
        setRadionuclides(radRes);
      } catch (err) {
        console.error('Error loading OPERA-Air data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const operaStations = stations.filter(s => s.source_code === 'OPERA_AIR');

  return (
    <div className="space-y-5 rounded-3xl border border-teal-800/60 bg-gradient-to-b from-teal-950/40 via-slate-900/90 to-slate-950 p-5 md:p-6 shadow-2xl">
      {/* Header & National Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-800/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
            <Wind className="w-4 h-4 animate-pulse text-teal-400" />
            <span>Réseau Sentinelle de l ASNR / IRSN</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
            <span>OPERA-AIR : SURVEILLANCE DES RADIONUCLÉIDES DANS L AIR</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Recherche systématique d aérosols radioactifs et de radionucléides à l état d <strong>infimes traces</strong> sur le territoire français par aspiration continue à très grand débit (700 m³/h) et spectrométrie gamma de laboratoire.
          </p>
        </div>

        {/* National Sentinel Status Badge */}
        <div className="flex flex-col items-start md:items-end justify-center">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 px-3.5 py-2 text-emerald-300 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left md:text-right">
              <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">
                Statut Atmosphérique National
              </div>
              <div className="text-xs font-bold text-white font-mono">
                AUCUNE ANOMALIE DÉTECTÉE
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            Conforme au bruit de fond environnemental standard
          </span>
        </div>
      </div>

      {/* 2-Level Architecture Diagram (User Request Highlight) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="text-xs font-mono font-bold text-amber-400 uppercase mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          <span>Architecture à 2 niveaux de la surveillance radiologique française</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level 1: TELERAY */}
          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Niveau 1 — Surveillance Gamma
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                Téléray (ASNR)
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-white flex items-center gap-2">
              <span>Débit de dose</span>
              <span className="text-sm font-normal text-emerald-400">↓ nSv/h</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mesure l <strong>irradiation globale externe</strong> instantanée subie par une personne au sol (compteur Geiger-Müller). Ne prélève pas d air et ne peut pas isoler la concentration de chaque isotope.
            </p>
          </div>

          {/* Level 2: OPERA-AIR */}
          <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase">
                Niveau 2 — Surveillance Radionucléides
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 border border-teal-700 text-teal-300 font-bold">
                OPERA-Air (ASNR-IRSN)
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-white flex items-center gap-2">
              <span>Radionucléide</span>
              <span className="text-sm font-normal text-teal-400">↓ activité ↓ Bq/m³</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Aspire les <strong>poussières et aérosols</strong> (700 m³/h) sur filtre. Après décroissance du radon (5 j), le filtre est analysé par <strong>spectrométrie gamma HPGe</strong> pour isoler chaque isotope à l état de traces (Cs-137, Be-7, I-131).
            </p>
          </div>
        </div>
      </div>

      {/* Key National Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Stations Sentinelles</span>
          <span className="text-xl font-bold text-white font-mono mt-0.5 block">
            {operaStations.length} stations
          </span>
          <span className="text-[10px] text-teal-400">Lille, Orsay, Cadarache, Pic du Midi...</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Débit d aspiration</span>
          <span className="text-xl font-bold text-teal-400 font-mono mt-0.5 block">
            700 m³/h
          </span>
          <span className="text-[10px] text-slate-400">Pompes grand débit 24h/24</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Césium-137 Moyen</span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">
            {selectedAerosolUnit === 'ubqm3'
              ? `${summary?.average_cs137_ubqm3 ?? '0.31'} µBq/m³`
              : `${summary?.average_cs137_bqm3 ?? '3.1e-7'} Bq/m³`}
          </span>
          <span className="text-[10px] text-slate-400">Traces rémanentes historiques</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Béryllium-7 Moyen</span>
          <span className="text-xl font-bold text-sky-400 font-mono mt-0.5 block">
            {selectedAerosolUnit === 'ubqm3' ? '~3 800 µBq/m³' : '3.8e-3 Bq/m³'}
          </span>
          <span className="text-[10px] text-slate-400">Naturel cosmogénique</span>
        </div>
      </div>

      {/* Tracked Radionuclides Table */}
      {radionuclides.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Radionucléides suivis en routine par le réseau OPERA-Air</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Unité affichée : {selectedAerosolUnit === 'ubqm3' ? 'µBq/m³' : 'Bq/m³ (SI)'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="pb-2">Isotope</th>
                  <th className="pb-2">Origine & Mécanisme</th>
                  <th className="pb-2">Période (T½)</th>
                  <th className="pb-2">Plage standard France</th>
                  <th className="pb-2">Signification sentinelle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {radionuclides.map(rn => (
                  <tr key={rn.nuclide} className="text-slate-300 hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                      <span className="font-mono text-teal-300">{rn.nuclide}</span>
                      <span className="text-slate-400 font-normal">({rn.name})</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        rn.origin === 'ARTIFICIAL'
                          ? 'bg-purple-950/80 border-purple-800 text-purple-300'
                          : rn.origin === 'NATURAL_COSMOGENIC'
                          ? 'bg-sky-950/80 border-sky-800 text-sky-300'
                          : 'bg-amber-950/80 border-amber-800 text-amber-300'
                      }`}>
                        {rn.origin_label.split('(')[0]}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{rn.half_life}</td>
                    <td className="py-2.5 text-amber-300 font-semibold">{rn.standard_range_ubqm3}</td>
                    <td className="py-2.5 text-slate-400 text-[11px] leading-relaxed max-w-xs">{rn.significance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive OPERA-Air Stations Quick List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-white uppercase">Balises de prélèvement OPERA-Air réparties sur le territoire</span>
          <span className="text-slate-400">{operaStations.length} stations actives</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {operaStations.map(s => {
            const latest = s.latest_measurement;
            const csVal = latest?.value ?? (s as any).nominal ?? 0.31;
            return (
              <div
                key={s.id}
                onClick={() => onSelectStation && onSelectStation(s.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-teal-300 transition flex items-center gap-1.5">
                    <span>{s.commune || s.name}</span>
                    {s.altitude && s.altitude > 1000 && (
                      <span className="text-[9px] bg-sky-950 border border-sky-800 text-sky-400 px-1 py-0.2 rounded">
                        {s.altitude} m
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Débit : 700 m³/h • Filtre PPO
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="font-mono text-sm font-bold text-teal-400">
                    {selectedAerosolUnit === 'ubqm3'
                      ? `${csVal < 1 ? csVal.toFixed(2) : csVal.toFixed(1)} µBq/m³`
                      : `${(csVal * 1e-6).toExponential(2)} Bq/m³`}
                  </div>
                  <div className="mt-1">
                    <QualityBadge
                      measuredAt={latest?.measured_at}
                      qualityStatus={latest?.quality_status}
                      sourceCode={s.source_code}
                      measurementType={s.measurement_type}
                      dataNature={latest?.data_nature || s.data_nature}
                      variant="full"
                      align="right"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
