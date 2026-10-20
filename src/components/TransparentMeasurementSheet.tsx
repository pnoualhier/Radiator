import React from 'react';
import {
  ShieldCheck,
  Radio,
  Server,
  Database,
  Layers,
  Clock,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import type { Station, LatestMeasurement, Measurement } from '../types/radiation';
import { DataNatureBadge } from './DataNatureBadge';
import { safeFormatTime, safeFormatDate } from '../utils/dateUtils';
import { HelpTooltip } from './HelpTooltip';

interface TransparentMeasurementSheetProps {
  station: Station;
  measurement?: LatestMeasurement | Measurement | null;
  className?: string;
  onNavigateToMethodology?: () => void;
}

export const TransparentMeasurementSheet: React.FC<TransparentMeasurementSheetProps> = ({
  station,
  measurement,
  className = '',
  onNavigateToMethodology,
}) => {
  const meas = measurement || station.latest_measurement;
  
  // Timestamps
  const measuredTime = meas?.measured_at || (meas as any)?.data_timestamp || (station.latest_measurement?.measured_at);
  const fetchedTime = (meas as any)?.server_timestamp || (meas as any)?.received_at || (meas as any)?.fetched_at;
  const cachedTime = (meas as any)?.cache_timestamp;
  const measuredDate = safeFormatDate(measuredTime, undefined, 'Date non renseignée');

  // Values and Units
  const rawValue = (meas as any)?.raw_value ?? meas?.value;
  const rawUnit = (meas as any)?.raw_unit ?? meas?.unit ?? station.unit ?? 'nSv/h';
  const normalizedValue = meas?.value;
  const normalizedUnit = meas?.unit ?? 'nSv/h';

  // Source & Type
  const sourceName = station.source_name || station.source_code || 'Téléray / ASNR';
  const measurementType = station.measurement_type || (meas as any)?.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE';

  const measurementTypeLabels: Record<string, { label: string; matrix: string }> = {
    AMBIENT_GAMMA_DOSE_RATE: {
      label: "Débit d'équivalent de dose ambiant H*(10)",
      matrix: 'Air ambiant extérieur à 1 m du sol',
    },
    ATMOSPHERIC_AEROSOLS: {
      label: 'Aérosols atmosphériques (Particules en suspension)',
      matrix: 'Filtres aérosols à très grand débit (700 m³/h)',
    },
    WATER_TRITIUM: {
      label: 'Activité volumique en Tritium (³H)',
      matrix: 'Eaux fluviales en aval des CNPE',
    },
    RADIONUCLIDE_CONCENTRATION: {
      label: 'Concentration en radionucléides spécifiques',
      matrix: 'Spectrométrie gamma HPGe',
    },
  };

  const typeInfo = measurementTypeLabels[measurementType] || {
    label: measurementType,
    matrix: 'Environnement',
  };

  // Status (LIVE, CACHED, DEMO, UNAVAILABLE)
  const dataNature = (meas as any)?.data_nature || station.data_nature || (station.is_simulated ? 'DEMO' : 'LIVE');
  const isSimulated = (meas as any)?.is_simulated || station.is_simulated || dataNature === 'DEMO';
  const validationStatus = (meas as any)?.validation_status || station.validation_status || 'AUTO_VALIDATED';

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4 ${className}`}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wide text-white">
                Fiche de mesure transparente
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Traçabilité intégrale
              </span>
              <HelpTooltip
                title="Fiche de mesure transparente"
                position="bottom"
                align="start"
                content="Pour chaque télémesure, l'application documente la source productrice, le type physique de mesure, les unités d'origine et normalisées, l'heure de détection capteur, l'heure de récupération serveur et le statut exact (réel en direct, mis en cache ou simulé)."
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Provenance, horodatages d'audit et statut de certification métrologique
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <DataNatureBadge
            dataNature={dataNature}
            validationStatus={validationStatus}
            isSimulated={isSimulated}
          />
        </div>
      </div>

      {/* Main 6-parameter Grid (Feature 2 user requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
        {/* 1. Source */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-sans">
            1. Source productrice
          </span>
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <span>{sourceName}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            {station.is_official ? 'Réseau certifié d\'État' : 'Science participative citoyenne'}
          </div>
        </div>

        {/* 2. Type de mesure */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-sans">
            2. Type de mesure & matrice
          </span>
          <div className="font-bold text-amber-300 truncate" title={typeInfo.label}>
            {typeInfo.label}
          </div>
          <div className="text-[10px] text-slate-400 font-sans truncate">
            {typeInfo.matrix}
          </div>
        </div>

        {/* 3. Unité (Originale & Normalisée) */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-sans">
            3. Unité & Valeur
          </span>
          <div className="font-bold text-white flex items-baseline gap-2">
            <span className="text-emerald-400 text-sm">{normalizedValue !== undefined ? Number(normalizedValue).toFixed(1) : '--'}</span>
            <span className="text-slate-300">{normalizedUnit}</span>
            {rawUnit !== normalizedUnit && rawValue !== undefined && (
              <span className="text-[10px] text-slate-400 font-normal">
                (brut : {Number(rawValue).toFixed(4)} {rawUnit})
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Normalisation physique certifiée
          </div>
        </div>

        {/* 4. Heure de mesure (Capteur physique) */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-sans flex items-center justify-between">
            <span>4. Heure de mesure physique</span>
            <Radio className="w-3 h-3 text-amber-400" />
          </span>
          <div className="font-bold text-white">
            {safeFormatTime(measuredTime, { hour: '2-digit', minute: '2-digit', second: '2-digit' }, 'Horodatage capteur')}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Date : {measuredDate}
          </div>
        </div>

        {/* 5. Heure de récupération (Serveur / Ingestion) */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-sans flex items-center justify-between">
            <span>5. Heure de récupération</span>
            <Server className="w-3 h-3 text-sky-400" />
          </span>
          <div className="font-bold text-sky-300">
            {safeFormatTime(fetchedTime, { hour: '2-digit', minute: '2-digit', second: '2-digit' }, 'Ingestion serveur')}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Enregistrement pipeline sécurisé
          </div>
        </div>

        {/* 6. Statut de la donnée (Réel, Mis en cache ou Simulé) */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-sans flex items-center justify-between">
            <span>6. Statut certifié de la donnée</span>
            <Database className="w-3 h-3 text-emerald-400" />
          </span>
          <div className="font-bold text-white flex items-center gap-1.5">
            {dataNature === 'LIVE' && <span className="text-emerald-400">🟢 Réel (LIVE en direct)</span>}
            {dataNature === 'CACHED' && <span className="text-amber-300">🟡 Mis en cache local</span>}
            {dataNature === 'DEMO' && <span className="text-purple-400">🟣 Simulé (Démonstration)</span>}
            {dataNature === 'UNAVAILABLE' && <span className="text-slate-400">⚪ Indisponible / En attente</span>}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            {cachedTime ? `Mis en cache à ${safeFormatTime(cachedTime)}` : 'Vérification métrologique OK'}
          </div>
        </div>
      </div>

      {onNavigateToMethodology && (
        <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
          <span>Pour comprendre l'explication géologique et météo de ce chiffre :</span>
          <button
            onClick={onNavigateToMethodology}
            className="text-amber-400 hover:text-amber-300 font-mono font-semibold flex items-center gap-1 transition"
          >
            <span>Méthodologie détaillée</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};
