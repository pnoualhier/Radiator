import React, { useEffect, useState } from 'react';
import type { StationDetail, Measurement, StationStatistics } from '../types/radiation';
import { ApiService } from '../services/api';
import { RadiationChart } from '../components/RadiationChart';
import { RadiationGauge } from '../components/RadiationGauge';
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
} from 'lucide-react';

interface StationDetailPageProps {
  stationId: number;
  onBack: () => void;
}

export const StationDetailPage: React.FC<StationDetailPageProps> = ({
  stationId,
  onBack,
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
              {station.is_official ? (
                <span className="flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-0.5 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Téléray / ASNR
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded bg-purple-950/80 border border-purple-800 text-purple-400 px-2 py-0.5 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5" /> Réseau Citoyen
                </span>
              )}
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
        </div>
      </div>

      {/* Main Gauge and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <RadiationGauge
            value={val}
            unit={latest?.unit || 'nSv/h'}
            isOfficial={station.is_official}
          />
        </div>

        {/* Technical Metadata Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs flex flex-col justify-between text-xs space-y-2">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-500">Horodatage de la mesure</span>
            <div className="font-mono text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {latest?.measured_at
                ? new Date(latest.measured_at).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Non communiqué'}
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
        </div>
      </div>

      {/* Historical Time-Series Chart */}
      <RadiationChart
        measurements={measurements}
        statistics={statistics}
        unit={latest?.unit || 'nSv/h'}
        onPeriodChange={handlePeriodChange}
      />

      {/* Recent Measurements Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xs">
        <h3 className="text-sm font-semibold text-white mb-3">Derniers enregistrements vérifiés</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="pb-2">Date & Heure</th>
                <th className="pb-2">Valeur (nSv/h)</th>
                <th className="pb-2">Équivalent µSv/h</th>
                <th className="pb-2">Qualité</th>
                <th className="pb-2">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {measurements.slice(-10).reverse().map(m => (
                <tr key={m.id} className="text-slate-300">
                  <td className="py-2 text-slate-400">
                    {new Date(m.measured_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2 font-bold text-amber-300">
                    {m.value.toFixed(1)} {m.unit}
                  </td>
                  <td className="py-2 text-slate-400">
                    {(m.value / 1000).toFixed(3)} µSv/h
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
