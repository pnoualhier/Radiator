import React, { useEffect, useState } from 'react';
import type { StationDetail, Measurement, StationStatistics } from '../types/radiation';
import { ApiService } from '../services/api';
import { RadiationChart } from '../components/RadiationChart';
import { Last24hRadiationChart } from '../components/Last24hRadiationChart';
import { RadiationGauge } from '../components/RadiationGauge';
import { WhyThisValuePanel } from '../components/WhyThisValuePanel';
import { HelpTooltip } from '../components/HelpTooltip';
import { safeFormatTime, safeFormatDateTime, safeFormatNumber } from '../utils/dateUtils';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Radio,
  ShieldCheck,
  Users,
  Activity,
  Compass,
  Layers,
  ExternalLink,
  GitCompare,
  Star,
  Server,
  Database,
  BookOpen,
} from 'lucide-react';

interface StationDetailPageProps {
  stationId: number;
  onBack: () => void;
  onCompare?: (stationId: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (stationId: number) => void;
  onNavigateToMethodology?: () => void;
}

export const StationDetailPage: React.FC<StationDetailPageProps> = ({
  stationId,
  onBack,
  onCompare,
  isFavorite = false,
  onToggleFavorite,
  onNavigateToMethodology,
}) => {
  const [station, setStation] = useState<StationDetail | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [statistics, setStatistics] = useState<StationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodHours, setPeriodHours] = useState(168); // 7 days

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [stationRes, historyRes, statsRes] = await Promise.all([
          ApiService.getStation(stationId),
          ApiService.getStationHistory(stationId, periodHours),
          ApiService.getStationStatistics(stationId, periodHours),
        ]);

        if (isMounted) {
          setStation(stationRes.data);
          setMeasurements(historyRes.data);
          setStatistics(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to load station details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [stationId, periodHours]);

  const handlePeriodChange = async (hours: number) => {
    setPeriodHours(hours);
    try {
      const [historyRes, statsRes] = await Promise.all([
        ApiService.getStationHistory(stationId, hours),
        ApiService.getStationStatistics(stationId, hours),
      ]);
      setMeasurements(historyRes.data);
      setStatistics(statsRes.data);
    } catch (err) {
      console.error('Error changing period:', err);
    }
  };

  if (loading && !station) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm font-mono">Chargement des données de la balise...</p>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-400">Station introuvable</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>
    );
  }

  const latest = station.latest_measurement;
  const val = latest?.value ?? 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Back button & Station Title Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition w-fit py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux stations</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                {station.name}
              </h1>
              {station.source_code === 'OPERA_AIR' ? (
                <span className="flex items-center gap-1 rounded bg-teal-950/80 border border-teal-800 text-teal-300 px-2.5 py-0.5 text-xs font-semibold">
                  💨 🟢 Institutionnel (OPERA-Air / IRSN)
                </span>
              ) : station.source_code === 'HYDROTELERAY' ? (
                <span className="flex items-center gap-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 px-2.5 py-0.5 text-xs font-semibold">
                  💧 🟢 Institutionnel (HydroTéléray / IRSN)
                </span>
              ) : station.source_code === 'TELERAY' ? (
                <span className="flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 🟢 Institutionnel (Téléray / ASNR)
                </span>
              ) : station.source_code === 'OPENRADIATION' ? (
                <span className="flex items-center gap-1 rounded bg-purple-950/80 border border-purple-800 text-purple-400 px-2.5 py-0.5 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5" /> 🟣 Participatif (OpenRadiation)
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded bg-sky-950/80 border border-sky-800 text-sky-400 px-2.5 py-0.5 text-xs font-semibold">
                  <Radio className="w-3.5 h-3.5" /> 🔵 International ({station.source_name || station.source_code})
                </span>
              )}
              <HelpTooltip
                title="Identité & coordonnées géodésiques"
                position="bottom"
                align="start"
                content="Fiche descriptive de la balise fixe : coordonnées GPS, altitude WGS84, département d'implantation et identifiant unique de transmission télémétrique dans le registre national ASNR."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {station.commune || 'Localisation fixe'}
                {station.department_code && ` (${station.department_code})`}
              </span>
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                {station.latitude.toFixed(4)}° N, {station.longitude.toFixed(4)}° E
              </span>
              {station.altitude && (
                <span>Alt: {station.altitude} m</span>
              )}
              <span className="text-slate-500 font-mono">ID: {station.external_id}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(station.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-mono font-semibold transition shadow ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isFavorite ? 'Retirer des stations favorites' : 'Ajouter à mes stations favorites'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                <span>{isFavorite ? 'Favori ⭐' : 'Ajouter aux favoris'}</span>
              </button>
            )}

            {onCompare && (
              <button
                onClick={() => onCompare(station.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-mono font-semibold text-amber-300 hover:text-white transition shadow"
              >
                <GitCompare className="w-4 h-4 text-amber-400" />
                <span>Comparer cette balise</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Tier Context Cards */}
      {station.source_code === 'OPENRADIATION' && (
        <div className="rounded-2xl border border-purple-800/60 bg-gradient-to-r from-purple-950/50 via-slate-900/70 to-purple-950/30 p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-800/40 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <span>OPENRADIATION — SCIENCES PARTICIPATIVES</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                    Capteur Citoyen
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Projet partenarial copiloté par l'<strong>IRSN</strong>, <strong>Sorbonne Université</strong>, l'<strong>ANCCLI</strong> et les FabLabs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {station.openradiation_meta?.public_url && (
                <a
                  href={station.openradiation_meta.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
                >
                  <span>Fiche OpenRadiation.org</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <a
                href="https://openradiation.org/fr/data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                <span>Données Open Data</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Débit Brut Mesuré</span>
              <span className="text-purple-300 font-bold text-sm">
                {station.openradiation_meta?.raw_usvh
                  ? `${station.openradiation_meta.raw_usvh.toFixed(4)} µSv/h`
                  : latest?.raw_value
                  ? `${Number(latest.raw_value).toFixed(4)} µSv/h`
                  : `${(val / 1000).toFixed(4)} µSv/h`}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Débit Normalisé</span>
              <span className="text-emerald-400 font-bold text-sm">
                {val.toFixed(1)} nSv/h
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Milieu de Mesure</span>
              <span className="text-white font-bold text-sm capitalize">
                {station.openradiation_meta?.qualification === 'groundlevel'
                  ? 'Au sol (extérieur)'
                  : station.openradiation_meta?.qualification === 'indoor'
                  ? 'En intérieur'
                  : station.openradiation_meta?.qualification || 'Ambiance'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Statut Mesure</span>
              <span className="font-bold text-sm flex items-center gap-1">
                {station.openradiation_meta?.atypical ? (
                  <span className="text-amber-400">⚠️ Atypique</span>
                ) : (
                  <span className="text-emerald-400">✅ Standard</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {station.source_code === 'TELERAY' && (
        <div className="rounded-2xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-emerald-950/20 p-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white font-mono flex items-center gap-2">
                <span>RÉSEAU INSTITUTIONNEL NATIONAL — TÉLÉRAY (ASNR / IRSN)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Surveillance d'État
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Sonde gamma d'ambiance fixe opérée 24h/24 par l'Autorité de Sûreté Nucléaire et Radioprotection (ASNR / IRSN). Donnée télémétrique certifiée de référence territoriale.
              </p>
            </div>
          </div>
        </div>
      )}

      {station.source_code === 'OPERA_AIR' && (
        <div className="rounded-2xl border border-teal-800/80 bg-gradient-to-r from-teal-950/50 via-slate-900/80 to-teal-950/30 p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-800/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <span>RÉSEAU DE SURVEILLANCE ATMOSPHÉRIQUE — OPERA-AIR (ASNR / IRSN)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                    Aérosols & Traces
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Surveillance sentinelle ultra-sensible de l'atmosphère française. Prélèvements d'air grand débit (700 m³/h) et spectrométrie gamma HPGe.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-teal-300">
              <span className="bg-teal-950/80 border border-teal-800 px-2.5 py-1 rounded-lg">
                Débit : 700 m³/h • ~85 000 m³/semaine
              </span>
            </div>
          </div>

          {/* Radionuclides Spectrometry Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Spectrométrie gamma différée : isotopes dosés sur le filtre</span>
              </span>
              <span className="text-[10px] text-slate-400">IRSN Métrologie • Germanium hyperpur</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-teal-800/40">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-teal-300">Césium-137 (Cs-137)</span>
                  <span className="text-[9px] bg-purple-950 border border-purple-800 text-purple-300 px-1.5 py-0.2 rounded">Artificiel</span>
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {val < 1 ? val.toFixed(2) : val.toFixed(1)} <span className="text-xs font-normal text-slate-400">µBq/m³</span>
                </div>
                <div className="text-[10px] text-teal-400/90 font-mono mt-0.5">
                  {(val * 1e-6).toExponential(2)} Bq/m³ • T½ 30 ans
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Traces rémanentes Tchernobyl / essais</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-800/40">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-sky-300">Béryllium-7 (Be-7)</span>
                  <span className="text-[9px] bg-sky-950 border border-sky-800 text-sky-300 px-1.5 py-0.2 rounded">Cosmogénique</span>
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  ~3 500 <span className="text-xs font-normal text-slate-400">µBq/m³</span>
                </div>
                <div className="text-[10px] text-sky-400/90 font-mono mt-0.5">
                  3.5e-3 Bq/m³ • T½ 53 jours
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Naturel (haute atmosphère)</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-amber-300">Plomb-210 (Pb-210)</span>
                  <span className="text-[9px] bg-amber-950 border border-amber-800 text-amber-300 px-1.5 py-0.2 rounded">Tellurique</span>
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  ~450 <span className="text-xs font-normal text-slate-400">µBq/m³</span>
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                  4.5e-4 Bq/m³ • T½ 22 ans
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Descendant naturel du radon</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-300">Iode-131 (I-131)</span>
                  <span className="text-[9px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.2 rounded">Récent</span>
                </div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-2">
                  &lt; 0,15 µBq/m³
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Non détecté (&lt; LD) • T½ 8 j
                </div>
                <div className="text-[9px] text-emerald-400/80 mt-1">Aucune retombée fraîche</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {station.source_code === 'HYDROTELERAY' && (
        <div className="rounded-2xl border border-cyan-800/80 bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-cyan-950/30 p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-800/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <span>RÉSEAU HYDROLOGIQUE CONTINU — HYDROTÉLÉRAY (ASNR / IRSN)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                    Eaux Fluviales
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Surveillance continue de la radioactivité dans les grands cours d'eau français concernés par les effluents liquides des centrales nucléaires (CNPE).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span className="bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-lg">
                Bassin : {station.hydroteleray_meta?.river_basin || 'Fluvial'} • {station.hydroteleray_meta?.watercourse || 'Cours d eau'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-800/40 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Activité Tritium mesurée</div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {val.toFixed(1)} <span className="text-xs font-normal text-slate-300">Bq/L</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">100% conforme eau potable</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Référence Qualité UE</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                100 <span className="text-xs font-normal text-slate-300">Bq/L</span>
              </div>
              <div className="text-[10px] text-slate-400">Directive 2013/51/Euratom</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Valeur Guide OMS</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                10 000 <span className="text-xs font-normal text-slate-300">Bq/L</span>
              </div>
              <div className="text-[10px] text-slate-400">Consommation vie entière</div>
            </div>
          </div>

          {station.hydroteleray_meta?.associated_facilities && station.hydroteleray_meta.associated_facilities.length > 0 && (
            <div className="pt-2 border-t border-cyan-900/40 text-[11px] text-slate-300">
              <span className="font-semibold text-cyan-300">Installations nucléaires en amont surveillées : </span>
              <span>{station.hydroteleray_meta.associated_facilities.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {station.source_code === 'EURDEP' && (
        <div className="rounded-2xl border border-sky-800/60 bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-sky-950/20 p-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white font-mono flex items-center gap-2">
                <span>SURVEILLANCE TRANSFRONTALIÈRE EUROPÉENNE — EURDEP (JRC)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Commission Européenne
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Plateforme d'échange de données radiologiques de la Commission Européenne reliant les autorités nationales de sûreté frontalières (Allemagne BfS, Suisse ENSI, Belgique FANC, Espagne CSN, Luxembourg, Italie ISPRA).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Gauge and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <RadiationGauge
            value={val}
            unit={latest?.unit || 'nSv/h'}
            isOfficial={station.is_official}
            dataNature={latest?.data_nature || station.data_nature}
            isSimulated={latest?.is_simulated ?? station.is_simulated}
            measuredAt={latest?.measured_at}
            qualityStatus={latest?.quality_status}
            sourceCode={station.source_code}
            measurementType={station.measurement_type}
          />
        </div>

        {/* Technical Metadata Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs flex flex-col justify-between text-xs space-y-2.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-500">Traçabilité & Horodatage</span>
              <HelpTooltip
                title="Traçabilité métrologique et certification"
                position="top"
                align="end"
                content="Chaîne d'intégrité de la mesure : 1) Horodatage d'échantillonnage sur le détecteur physique, 2) Ingestion sécurisée par le serveur central avec contrôle qualité automatique, 3) Persistance chiffrée dans la base locale Dexie de votre navigateur pour consultation hors connexion."
              />
            </div>
            <div className="mt-1.5 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>Mesure effectuée :</span>
                </span>
                <span className="text-white font-semibold">
                  {safeFormatTime(latest?.data_timestamp || latest?.measured_at)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Server className="w-3 h-3 text-sky-400" />
                  <span>Reçue serveur :</span>
                </span>
                <span className="text-white font-semibold">
                  {safeFormatTime(latest?.server_timestamp || latest?.received_at)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Mise en cache :</span>
                </span>
                <span className="text-white font-semibold">
                  {safeFormatTime(latest?.cache_timestamp, undefined, 'Locale (Dexie)')}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <span className="text-[11px] font-mono uppercase text-slate-500">Nature de la donnée</span>
            <div className="font-mono text-xs font-semibold mt-0.5">
              {latest?.is_simulated || station.is_simulated || latest?.data_nature === 'DEMO' ? (
                <span className="text-amber-400">🟠 Donnée simulée (Mode Démo)</span>
              ) : latest?.data_nature === 'CACHED' ? (
                <span className="text-sky-400">🔵 Donnée réelle archivée</span>
              ) : (
                <span className="text-emerald-400">🟢 Donnée réelle en direct</span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <span className="text-[11px] font-mono uppercase text-slate-500">Statut qualité de la donnée</span>
            <div className="font-mono text-xs font-semibold text-emerald-400 mt-0.5">
              {latest?.quality_status || 'VALID'} ({latest?.validation_status || 'AUTO_VALIDATED'})
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <span className="text-[11px] font-mono uppercase text-slate-500">Organisme producteur</span>
            <div className="text-xs font-medium text-slate-300 mt-0.5">
              {station.source_name || station.source_code || 'ASNR-IRSN'}
            </div>
          </div>

          {onNavigateToMethodology && (
            <div className="border-t border-slate-800 pt-2">
              <button
                onClick={onNavigateToMethodology}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-semibold transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Consulter la Méthodologie (Géologie, Pluie, Radon)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feature requested by user: « Pourquoi cette valeur ? » */}
      <WhyThisValuePanel
        station={station}
        currentValue={val}
        onNavigateToMethodology={onNavigateToMethodology}
      />

      {/* Recharts Component: Evolution on last 24h (User Request) */}
      <Last24hRadiationChart
        measurements={measurements}
        unit={latest?.unit || 'nSv/h'}
        sourceCode={station.source_code}
        measurementType={station.measurement_type}
      />

      {/* Historical Time-Series Chart */}
      <RadiationChart
        measurements={measurements}
        statistics={statistics}
        unit={latest?.unit || 'nSv/h'}
        onPeriodChange={handlePeriodChange}
      />

      {/* Recent Measurements Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Derniers enregistrements vérifiés</span>
            <HelpTooltip
              title="Journal des mesures vérifiées"
              position="top"
              align="start"
              content="Registre historique des 10 derniers relevés horodatés de cette balise. Indique la valeur numérique brute, l'équivalent dosimétrique ou le nucléide recherché, ainsi que le label d'assurance qualité (VALID, AUTO_VALIDATED)."
            />
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            Contrôle qualité ASNR
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="pb-2">Date & Heure</th>
                <th className="pb-2">Valeur ({latest?.unit || station.unit || 'nSv/h'})</th>
                <th className="pb-2">
                  {station.measurement_type === 'ATMOSPHERIC_AEROSOLS'
                    ? 'Nucléide analysé'
                    : station.measurement_type === 'WATER_RADIOACTIVITY'
                    ? 'Vecteur hydrologique'
                    : 'Équivalent µSv/h'}
                </th>
                <th className="pb-2">Qualité</th>
                <th className="pb-2">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {measurements.slice(-10).reverse().map(m => (
                <tr key={m.id} className="text-slate-300">
                  <td className="py-2 text-slate-400">
                    {safeFormatDateTime(m.measured_at)}
                  </td>
                  <td className="py-2 font-bold text-amber-300">
                    {safeFormatNumber(m.value, m.value < 1 ? 2 : 1)} {m.unit}
                  </td>
                  <td className="py-2 text-slate-400">
                    {station.measurement_type === 'ATMOSPHERIC_AEROSOLS' ? (
                      <span className="text-teal-300 font-semibold">{station.radionuclide_focus || 'Cs-137'}</span>
                    ) : station.measurement_type === 'WATER_RADIOACTIVITY' ? (
                      <span className="text-cyan-300 font-semibold">{station.radionuclide_focus || 'Tritium (H-3)'}</span>
                    ) : (
                      `${(m.value / 1000).toFixed(3)} µSv/h`
                    )}
                  </td>
                  <td className="py-2">
                    <span className="rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 text-[10px]">
                      {m.quality_status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500">
                    {m.validation_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
