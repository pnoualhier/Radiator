import React, { useEffect, useState } from 'react';
import type { OfficialAlert } from '../types/radiation';
import { ApiService } from '../services/api';
import { ShieldCheck, AlertTriangle, ExternalLink, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<OfficialAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await ApiService.getAlerts();
        setAlerts(res.data);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          ALERTES RADIOLOGIQUES OFFICIELLES
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Ce module relaie <strong>strictement et exclusivement</strong> les alertes ou avis d'information diffusés par les autorités publiques officielles compétentes (ASNR / IRSN, Ministère, Préfectures).
        </p>
      </div>

      {/* Disclaimers & Ethics */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Principe de diffusion institutionnelle</span>
        </div>
        <p>
          Conformément aux principes de radioprotection publique, l'application ne génère aucune alerte artificielle à partir de seuils calculés localement. Les variations mesurées au niveau des balises peuvent être causées par des phénomènes naturels bénins (lessivage du radon par de fortes pluies, variations de pression atmosphérique).
        </p>
      </div>

      {/* Alerts List or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          Vérification des registres d'alerte en cours...
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">
            Aucune alerte officielle actuellement disponible.
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-md">
            L'ensemble des réseaux de télémesure en France métropolitaine et Corse enregistre des niveaux radiologiques conformes au fond ambiant environnemental habituel.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="rounded-2xl border border-amber-600/40 bg-amber-950/20 p-5 shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                    {alert.severity}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {alert.title}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(alert.published_at).toLocaleString('fr-FR')}
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {alert.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  {alert.affected_area && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Zone : {alert.affected_area}
                    </span>
                  )}
                  <span>Source : {alert.source_name || 'ASNR'}</span>
                </div>

                {alert.source_url && (
                  <a
                    href={alert.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>Consulter le communiqué officiel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
