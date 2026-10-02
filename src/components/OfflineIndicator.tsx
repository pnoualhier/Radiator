import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Clock } from 'lucide-react';

interface OfflineIndicatorProps {
  lastSyncTimestamp?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lastSyncTimestamp }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const formattedDate = lastSyncTimestamp
    ? new Date(lastSyncTimestamp).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Données en cache local';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 flex items-center gap-3 rounded-xl bg-amber-950/95 border border-amber-600/60 p-3 shadow-2xl backdrop-blur-md text-amber-200 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-600/30 text-amber-400">
        <WifiOff className="w-4 h-4 animate-pulse" />
      </div>
      <div className="text-xs">
        <div className="font-semibold text-amber-300 uppercase tracking-wider text-[11px]">
          Mode hors ligne
        </div>
        <div className="text-amber-200/80 flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3 text-amber-400/80" />
          <span>Dernières données disponibles : {formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
