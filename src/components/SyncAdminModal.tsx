import React, { useState } from 'react';
import { RefreshCw, Key, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';
import { ApiService } from '../services/api';

interface SyncAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const SyncAdminModal: React.FC<SyncAdminModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [adminKey, setAdminKey] = useState('');
  const [sourceCode, setSourceCode] = useState('TELERAY');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await ApiService.triggerSync(sourceCode, adminKey.trim());
      setResult({
        success: true,
        message: `Synchronisation ${sourceCode} réussie ! (${res.message || 'Succès'})`,
      });
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Échec de synchronisation. Vérifiez la clé administrateur.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Administration — Synchronisation</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSync} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Réseau source
            </label>
            <select
              value={sourceCode}
              onChange={e => setSourceCode(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="TELERAY">Téléray / ASNR-IRSN (Actif)</option>
              <option value="EURDEP">EURDEP (Europe)</option>
              <option value="OPENRADIATION">OpenRadiation (Citoyen)</option>
              <option value="SAFECAST">Safecast (Mondial)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Clé d'administration (ADMIN_API_KEY)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="Entrez votre clé secrète..."
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              En développement, la clé par défaut est <code>dev-secret-key-change-in-production</code>.
            </p>
          </div>

          {result && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                result.success
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/60 border border-red-800 text-red-300'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-800 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Synchronisation...' : 'Lancer la synchro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
