import React, { useEffect, useState, useCallback } from 'react';
import type { OfficialAlert } from '../types/radiation';
import { ApiService } from '../services/api';
import { safeFormatDateTime } from '../utils/dateUtils';
import { HelpTooltip } from '../components/HelpTooltip';
import {
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Info,
  Server,
  Cpu,
  Layers,
  FileCheck2,
  Radio,
  Lock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<OfficialAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncReport, setSyncReport] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [connectorStatus, setConnectorStatus] = useState<any>(null);

  const loadAlerts = useCallback(async () => {
    try {
      const [alertsRes, statusRes] = await Promise.all([
        ApiService.getAlerts({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
        ApiService.getAlertConnectorStatus(),
      ]);
      setAlerts(alertsRes.data);
      setConnectorStatus(statusRes);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const report = await ApiService.syncAlerts();
      setSyncReport(report);
      await loadAlerts();
    } catch (err) {
      console.error('Manual alert sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                CANAL INSTITUTIONNEL CERTIFIÉ (ASNR • IRSN • ECURIE)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2.5">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
              <span>ALERTES & AVIS OFFICIELS DE RADIOPROTECTION</span>
              <HelpTooltip
                title="Canal institutionnel certifié"
                position="bottom"
                align="start"
                content="Registre officiel des déclarations de sûreté radiologique de l'État. Seules les autorités publiques habilitées (ASNR, IRSN, Sécurité Civile, Préfectures) peuvent qualifier un événement significatif. Chaque alerte est classée selon l'échelle internationale INES (niveaux 0 à 7) avec consignes vérifiées aux populations."
              />
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Diffusion certifiée des alertes nationales, avis d'incidents (échelle internationale INES) et bulletins de surveillance Téléray émis par les autorités publiques d'État compétentes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 text-xs font-mono transition shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Interrogation des flux...' : 'Vérifier les registres officiels'}</span>
            </button>
          </div>
        </div>

        {/* Supervision Connector Status Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Connecteur officiel :</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {connectorStatus?.status || 'OPÉRATIONNEL'}
              </span>
              <HelpTooltip
                title="Supervision du flux officiel d'alertes"
                position="bottom"
                align="end"
                content="Liaison directe avec les registres d'incidents de l'ASNR et de l'IRSN. Vérifie l'authenticité numérique des communiqués et la conformité à l'échelle internationale INES."
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span className="text-slate-400">Alertes actives en France :</span>
            </div>
            <span className={`font-bold ${activeAlertsCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {activeAlertsCount} alerte{activeAlertsCount > 1 ? 's' : ''} en cours
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Certification source :</span>
            </div>
            <span className="font-bold text-amber-300">
              Sceau SHA-256 Anti-Altération
            </span>
          </div>
        </div>
      </div>

      {/* 🏛️ Crucial Methodology & Guarantee Card: Une alerte officielle ≠ une valeur élevée Radiator */}
      <div className="rounded-2xl border border-amber-600/50 bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950 p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-sm md:text-base font-bold text-white font-mono uppercase tracking-wide">
                Principe méthodologique régalien : Une alerte officielle ≠ une valeur élevée détectée par Radiator
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Le réseau <strong>Téléray</strong> possède ses propres mécanismes d'analyse institutionnelle et de qualification métrologique. Radiator applique un principe de radioprotection strict : <strong>l'application s'interdit formellement de générer des alertes autonomes ou algorithmiques</strong> basées sur un simple seuil chiffré.
              </p>
            </div>
          </div>
          <HelpTooltip
            title="Doctrine de certification régalienne"
            position="top"
            align="end"
            content="Garantie anti-panique : seuls les arrêtés, communiqués et avis validés par l'Autorité de Sûreté Nucléaire et de Radioprotection (ASNR / IRSN) ont le statut d'alerte. Une hausse locale causée par la pluie ou un sol granitique ne doit jamais être qualifiée arbitrairement d'anomalie."
          />
        </div>

        {/* Pipeline Diagram (Exact User Request) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[11px] font-mono uppercase font-bold text-amber-400 mb-2">
            Architecture d'ingestion et de certification d'alerte :
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold">
              OfficialAlertConnector
            </span>
            <span className="text-amber-400">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold">
              Source officielle (ASNR / IRSN)
            </span>
            <span className="text-amber-400">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold">
              Parser (Échelle INES)
            </span>
            <span className="text-amber-400">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-300 font-bold">
              Validation anti-synthétique
            </span>
            <span className="text-amber-400">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 font-bold">
              OfficialAlert
            </span>
            <span className="text-amber-400">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold">
              API
            </span>
            <span className="text-amber-400">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300 font-bold">
              PWA
            </span>
          </div>
        </div>

        {/* Scientific Educational Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">🌧️ Le phénomène naturel du lessivage de radon</span>
            <p className="text-slate-400">
              Lors d'un orage ou d'une averse soutenue, la pluie entraîne vers le sol les descendants solides du radon-222 naturel (Plomb-214, Bismuth-214). Une balise Téléray peut ainsi monter brièvement de +30 à +80 nSv/h sans aucun rejet artificiel.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">⚛️ Qualification par spectrométrie d'État</span>
            <p className="text-slate-400">
              Seuls les spectromètres gamma des laboratoires de l'IRSN et les cellules d'expertise de l'ASNR sont en capacité de trancher l'identité isotopique exacte d'un phénomène. L'application relaie ainsi uniquement la voix officielle de l'autorité publique.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {[
            { id: 'ALL', label: 'Tous les bulletins' },
            { id: 'ACTIVE', label: `En cours (${activeAlertsCount})` },
            { id: 'RESOLVED', label: 'Résolus' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                statusFilter === t.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-amber-500 transition"
          >
            <option value="ALL">Toutes catégories</option>
            <option value="SURVEILLANCE_TELERAY">Bulletins Téléray</option>
            <option value="PHENOMENE_METEO_RADON">Météo & Radon</option>
            <option value="INCIDENT_EXPLOITATION">Incidents d'exploitation (INES)</option>
            <option value="EXERCICE_PPI">Exercices PPI</option>
          </select>
          <HelpTooltip
            title="Classification des bulletins d'alerte"
            position="bottom"
            align="end"
            content="Catégories officielles d'information du public : Bulletins périodiques Téléray de surveillance nationale, Événements météorologiques (lessivage du radon naturel), Incidents déclarés à l'échelle INES (niveaux 1 à 7) ou Exercices de sécurité civile PPI en conditions réelles."
          />
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-400" />
          <div>Interrogation du connecteur d'alertes officielles...</div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white font-mono">
              Aucune alerte officielle enregistrée
            </h2>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed font-sans">
              Aucun avis d'incident radiologique, anomalie INES ou bulletin d'alerte n'a été publié par les autorités publiques d'État compétentes (ASNR, IRSN, Préfectures, Système ECURIE) pour les critères sélectionnés.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 max-w-lg text-left space-y-1 font-mono">
            <span className="text-amber-400 font-bold block">⚠️ Précision méthodologique de sûreté :</span>
            <span>
              L'absence de résultat dans le registre confirme uniquement qu'aucune alerte institutionnelle n'a été diffusée. Elle ne doit jamais être interprétée comme une validation algorithmique autonome par Radiator.
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => {
            const isResolved = alert.status === 'RESOLVED';
            const ines = alert.ines_level;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 shadow-xl space-y-4 transition ${
                  isResolved
                    ? 'border-slate-800 bg-slate-900/70'
                    : alert.severity === 'WARNING' || alert.severity === 'CRITICAL'
                    ? 'border-red-600/60 bg-red-950/20'
                    : 'border-amber-600/40 bg-amber-950/20'
                }`}
              >
                {/* Header row: Severity, INES scale, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Severity */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      alert.severity === 'CRITICAL' || alert.severity === 'WARNING'
                        ? 'bg-red-950 border-red-700 text-red-300'
                        : alert.severity === 'NOTICE'
                        ? 'bg-amber-950 border-amber-700 text-amber-300'
                        : 'bg-sky-950 border-sky-700 text-sky-300'
                    }`}>
                      {alert.severity === 'NOTICE' ? 'Avis officiel' : alert.severity}
                    </span>

                    {/* INES Scale Badge if applicable */}
                    {ines !== undefined && (
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        ines === 0
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : ines === 1
                          ? 'bg-amber-950 border-amber-700 text-amber-300'
                          : 'bg-red-950 border-red-700 text-red-300'
                      }`}>
                        Échelle INES : Niveau {ines} {ines === 0 ? '(Écart)' : ines === 1 ? '(Anomalie)' : `(Incident)`}
                      </span>
                    )}

                    {/* Status badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      isResolved
                        ? 'bg-slate-800 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {isResolved ? '✓ Résolu' : '● Actif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Publié le {safeFormatDateTime(alert.published_at)}</span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white font-mono leading-snug">
                    {alert.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-amber-400/90 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Émis par : {alert.source_authority || alert.source_name || 'ASNR'}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Réf : {alert.external_id}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
                  {alert.description}
                </p>

                {/* Public Recommendations / Instructions */}
                {alert.instructions && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Consignes officielles aux populations :
                    </span>
                    <p className="text-xs text-slate-300">
                      {alert.instructions}
                    </p>
                  </div>
                )}

                {/* Footer metadata & Links */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-3">
                    {alert.affected_area && (
                      <span className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Zone : {alert.affected_area}</span>
                      </span>
                    )}

                    {alert.verification_seal && (
                      <span className="flex items-center gap-1 text-emerald-400/90 font-mono text-[10px]">
                        <FileCheck2 className="w-3 h-3" />
                        <span>{alert.verification_seal}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(alert.source_code === 'ASNR' || alert.source_code === 'IRSN_TELERAY') && (
                      <a
                        href="https://teleray.asnr.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 px-2.5 py-1.5 text-emerald-300 hover:text-white font-mono text-xs font-semibold transition"
                        title="Consulter le portail national officiel Téléray (ASNR)"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Portail Téléray en direct</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {alert.official_url && (
                      <a
                        href={alert.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-amber-300 hover:text-white font-mono text-xs font-semibold transition"
                        title={`Consulter le document source officiel : ${alert.official_url}`}
                      >
                        <span>Consulter le communiqué officiel</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
