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
