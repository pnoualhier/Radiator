import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X, Check, Calendar, Database, ShieldCheck } from 'lucide-react';
import type { Station, Measurement } from '../types/radiation';
import { safeFormatDateTime, safeFormatTime } from '../utils/dateUtils';
import { HelpTooltip } from './HelpTooltip';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station;
  measurements: Measurement[];
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  station,
  measurements,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter measurements according to the selected period
  const now = Date.now();
  const filteredMeasurements = measurements.filter(m => {
    if (selectedPeriod === 'all') return true;
    const mDate = new Date(m.measured_at || m.data_timestamp || (m as any).created_at).getTime();
    if (isNaN(mDate)) return true;
    const diffHours = (now - mDate) / (1000 * 60 * 60);
    if (selectedPeriod === '24h') return diffHours <= 24;
    if (selectedPeriod === '7d') return diffHours <= 168;
    if (selectedPeriod === '30d') return diffHours <= 720;
    return true;
  });

  const generateCSV = () => {
    setIsExporting(true);
    setExportedFormat('CSV');

    const headers = [
      'station_id',
      'station_code',
      'station_name',
      'commune',
      'departement',
      'latitude',
      'longitude',
      'source_code',
      'source_name',
      'license',
      'attribution',
      'measurement_type',
      'measured_at_iso',
      'measured_at_local',
      'fetched_at_iso',
      'fetched_at_local',
      'raw_value',
      'raw_unit',
      'normalized_value_nsvh',
      'normalized_unit',
      'data_nature',
      'quality_status',
      'validation_status',
    ];

    const rows = filteredMeasurements.map(m => {
      const measuredIso = m.measured_at || m.data_timestamp || '';
      const measuredLocal = measuredIso ? safeFormatDateTime(measuredIso) : '';
      const fetchedIso = m.server_timestamp || m.received_at || '';
      const fetchedLocal = fetchedIso ? safeFormatDateTime(fetchedIso) : '';
      const rawVal = m.raw_value ?? m.value;
      const rawUn = m.raw_unit ?? m.unit ?? station.unit ?? 'nSv/h';
      const normVal = m.value;
      const normUn = m.unit ?? 'nSv/h';
      const dataNat = m.data_nature || station.data_nature || (station.is_simulated ? 'DEMO' : 'LIVE');

      return [
        station.id,
        `"${station.external_id || station.id}"`,
        `"${(station.name || '').replace(/"/g, '""')}"`,
        `"${(station.commune || '').replace(/"/g, '""')}"`,
        `"${station.department_code || ''}"`,
        station.latitude,
        station.longitude,
        `"${station.source_code || ''}"`,
        `"${(station.source_name || station.source_code || '').replace(/"/g, '""')}"`,
        `"${(station.source_code === 'TELERAY' ? 'Licence Ouverte v2.0 (Etalab)' : station.source_code === 'OPENRADIATION' ? 'ODbL v1.0' : station.source_code === 'SAFECAST' ? 'CC0 1.0 Universal' : 'Open Data').replace(/"/g, '""')}"`,
        `"${(station.source_code === 'TELERAY' ? 'Source : ASNR - Réseau Téléray' : 'Données ouvertes issues du réseau de surveillance').replace(/"/g, '""')}"`,
        `"${station.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE'}"`,
        `"${measuredIso}"`,
        `"${measuredLocal}"`,
        `"${fetchedIso}"`,
        `"${fetchedLocal}"`,
        rawVal,
        `"${rawUn}"`,
        normVal,
        `"${normUn}"`,
        `"${dataNat}"`,
        `"${m.quality_status || 'VALID'}"`,
        `"${m.validation_status || 'AUTO_VALIDATED'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (station.name || 'station').toLowerCase().replace(/[^a-z0-9]/gi, '_');
    link.href = url;
    link.download = `radiation_fr_${safeName}_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
    }, 800);
  };

  const generateJSON = () => {
    setIsExporting(true);
    setExportedFormat('JSON');

    const exportPayload = {
      metadata: {
        export_title: 'Radiation France — Export d\'historique métrologique',
        exported_at: new Date().toISOString(),
        exported_at_local: safeFormatDateTime(new Date().toISOString()),
        selected_period: selectedPeriod,
        records_count: filteredMeasurements.length,
        generator: 'Radiation France PWA (https://github.com/pnoualhier/Radiator)',
        data_integrity: 'Conforme aux spécifications métrologiques d\'Open Data et de traçabilité',
      },
      station: {
        id: station.id,
        external_id: station.external_id,
        name: station.name,
        commune: station.commune,
        department_code: station.department_code,
        region_code: station.region_code,
        latitude: station.latitude,
        longitude: station.longitude,
        altitude_m: station.altitude,
        station_type: station.station_type,
        is_official: station.is_official,
        source_code: station.source_code,
        source_name: station.source_name,
        license: station.source_code === 'TELERAY' ? 'Licence Ouverte v2.0 (Etalab)' : station.source_code === 'OPENRADIATION' ? 'ODbL v1.0' : 'CC0 1.0 Universal',
        attribution: station.source_code === 'TELERAY' ? 'Source : ASNR - Réseau Téléray' : 'Données ouvertes du réseau métrologique',
        measurement_type: station.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE',
        nominal_unit: station.unit || 'nSv/h',
      },
      measurements: filteredMeasurements.map(m => ({
        id: m.id,
        measured_at_utc: m.measured_at || m.data_timestamp,
        measured_at_local: safeFormatDateTime(m.measured_at || m.data_timestamp),
        fetched_at_utc: m.server_timestamp || m.received_at,
        fetched_at_local: safeFormatDateTime(m.server_timestamp || m.received_at),
        raw_value: m.raw_value ?? m.value,
        raw_unit: m.raw_unit ?? m.unit ?? station.unit ?? 'nSv/h',
        normalized_value_nsvh: m.value,
        normalized_unit: m.unit ?? 'nSv/h',
        data_nature: m.data_nature || station.data_nature || (station.is_simulated ? 'DEMO' : 'LIVE'),
        quality_status: m.quality_status || 'VALID',
        validation_status: m.validation_status || 'AUTO_VALIDATED',
      })),
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (station.name || 'station').toLowerCase().replace(/[^a-z0-9]/gi, '_');
    link.href = url;
    link.download = `radiation_fr_${safeName}_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-100 font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Exportation de l'Historique
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                {station.name} ({station.commune || station.department_code})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Period Selector */}
        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
            1. Sélectionner la période temporelle
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '24h', label: '24 heures' },
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: 'all', label: 'Tout' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id as any)}
                className={`py-2 px-3 rounded-xl border text-center transition font-semibold ${
                  selectedPeriod === p.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Enregistrements inclus :</span>
            <span className="text-amber-300 font-bold">{filteredMeasurements.length} mesures</span>
          </div>
        </div>

        {/* Metadata Preview */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1.5 text-[11px]">
          <div className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Métadonnées de provenance intégrées à l'export</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>• Source : <span className="text-white font-semibold">{station.source_code || 'TELERAY'}</span></div>
            <div>• Type : <span className="text-white font-semibold">{station.measurement_type || 'GAMMA'}</span></div>
            <div>• Unités : <span className="text-white font-semibold">Brute & Normalisée (nSv/h)</span></div>
            <div>• Horodatages : <span className="text-white font-semibold">Mesure (UTC/locale) + Ingestion</span></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
            2. Choisir le format de téléchargement
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={generateCSV}
              disabled={isExporting || filteredMeasurements.length === 0}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Télécharger CSV</span>
            </button>

            <button
              onClick={generateJSON}
              disabled={isExporting || filteredMeasurements.length === 0}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition shadow"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Télécharger JSON</span>
            </button>
          </div>

          {exportedFormat && (
            <div className="text-center text-[11px] text-emerald-400 font-sans pt-1">
              ✓ Fichier {exportedFormat} généré avec succès. Téléchargement déclenché.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
