import React, { useEffect, useState } from 'react';
import type { Source, SourceHealth } from '../types/radiation';
import { ApiService } from '../services/api';
import { Database, ShieldCheck, Users, ExternalLink, RefreshCw, Key, CheckCircle, Clock } from 'lucide-react';
import { SyncAdminModal } from '../components/SyncAdminModal';

export const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [healthList, setHealthList] = useState<SourceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sourcesRes, healthRes] = await Promise.all([
        ApiService.getSources(),
        ApiService.getSourcesHealth(),
      ]);
      setSources(sourcesRes.data);
      setHealthList(healthRes);
    } catch (err) {
      console.error('Failed to load sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" />
            SOURCES ET RÉSEAUX RADIOLOGIQUES
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Transparence sur les réseaux télémétriques, licences de réutilisation et statut des connecteurs.
          </p>
        </div>

        <button
          onClick={() => setIsAdminModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition shadow-sm w-fit"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>Synchronisation manuelle (Admin)</span>
        </button>
      </div>

      {/* 3 Pillars Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-3.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>🟢 Pôle Institutionnel</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            <strong>Téléray (ASNR / IRSN)</strong> : Réseau national officiel de référence de l'État français. Balises fixes permanentes sous assurance qualité certifiée.
          </p>
        </div>

        <div className="rounded-xl border border-purple-800/60 bg-purple-950/20 p-3.5">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>🟣 Pôle Participatif</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            <strong>OpenRadiation</strong> : Sciences participatives citoyennes (IRSN, Sorbonne, ANCCLI, FabLabs). Capteurs mobiles et fixes (R-Kit, bGeigie).
          </p>
        </div>

        <div className="rounded-xl border border-sky-800/60 bg-sky-950/20 p-3.5">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>🔵 Pôle International</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            <strong>EURDEP (JRC UE) & Safecast</strong> : Surveillance transfrontalière aux frontières françaises et réseau mondial de capteurs ouverts.
          </p>
        </div>
      </div>

      {/* Focus OpenRadiation Showcase */}
      <div className="rounded-2xl border border-purple-700/60 bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-purple-950/20 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-800/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>FOCUS : OPENRADIATION & LA MESURE CITOYENNE</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Temps Réel
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Projet collaboratif initié par l'IRSN, Sorbonne Université, l'ANCCLI et les FabLabs pour démocratiser la radioprotection.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://openradiation.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
            >
              <span>Portail OpenRadiation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://openradiation.org/fr/data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <span>Téléchargement Quotidien (Open Data)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://openradiation.org/fr/content/api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <span>API REST</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-purple-400 font-mono font-bold block">1. Données Fournies Réellement</span>
            <p className="text-slate-300 text-[11px]">
              Débit de dose natif en <strong>µSv/h</strong> (normalisé en <strong>nSv/h</strong> par notre moteur), horodatage à la seconde, coordonnées GPS précises et altitude.
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-purple-400 font-mono font-bold block">2. Contexte & Capteurs</span>
            <p className="text-slate-300 text-[11px]">
              Identifiant UUID unique par mesure, type d'appareil (R-Kit, bGeigie), milieu (au sol, intérieur, vol avion) et qualification des atypicités.
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-purple-400 font-mono font-bold block">3. Open Data & Transparence</span>
            <p className="text-slate-300 text-[11px]">
              Toutes les données sont sous licence libre ODbL, avec réplication en direct dans l'application toutes les 10 minutes et dump journalier téléchargeable.
            </p>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map(source => {
          const health = healthList.find(h => h.code === source.code);
          const isAct = source.is_active;

          return (
            <div
              key={source.id}
              className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                isAct
                  ? 'border-slate-800 bg-slate-900/70'
                  : 'border-slate-800/40 bg-slate-950/40 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white font-mono">
                      {source.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                      ({source.code})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {source.is_official ? (
                      <span className="flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                        <ShieldCheck className="w-3 h-3" /> Officiel
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-purple-950/80 border border-purple-800 text-purple-400 px-2 py-0.5 text-[10px] font-semibold">
                        <Users className="w-3 h-3" /> Citoyen
                      </span>
                    )}

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                        isAct
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isAct ? 'Actif' : 'Prêt (Inactif)'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] uppercase tracking-wider block font-mono">
                      Organisme gestionnaire
                    </span>
                    <span className="text-slate-200 font-medium">{source.organization}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] uppercase tracking-wider block font-mono">
                      Licence de réutilisation
                    </span>
                    <span className="text-slate-300 font-mono">{source.license || 'Non spécifiée'}</span>
                  </div>

                  {health && (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Mesures enregistrées :</span>
                        <span className="text-white font-bold">{health.records_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Dernière synchro :</span>
                        <span className="text-slate-300">
                          {health.last_sync_at
                            ? new Date(health.last_sync_at).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Initiale'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {source.api_url && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <a
                    href={source.api_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>Portail officiel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SyncAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSyncComplete={loadData}
      />
    </div>
  );
};
