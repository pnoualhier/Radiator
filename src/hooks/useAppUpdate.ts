import { useState, useEffect, useCallback } from 'react';

export interface AppUpdateState {
  appVersion: string;
  releaseDate: string;
  buildCommit: string;
  lastCheckedAt: string | null;
  isChecking: boolean;
  updateAvailable: boolean;
  autoUpdateEnabled: boolean;
  lastUpdateInstalledAt: string | null;
  autoCheckIntervalMinutes: number;
}

const STORAGE_KEY_AUTO_UPDATE = 'radiation_france_auto_update';
const STORAGE_KEY_LAST_CHECK = 'radiation_france_last_check';
const APP_VERSION = '1.4.2';
const APP_RELEASE_DATE = '12 Octobre 2026';
const BUILD_COMMIT = 'rf-2026.10.12-prod';

export function useAppUpdate() {
  const [appVersion] = useState<string>(APP_VERSION);
  const [releaseDate] = useState<string>(APP_RELEASE_DATE);
  const [buildCommit] = useState<string>(BUILD_COMMIT);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Application à jour');
  
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_CHECK) || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  });

  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTO_UPDATE);
      return stored !== null ? stored === 'true' : true; // Enabled by default
    } catch {
      return true;
    }
  });

  // Toggle auto update in localStorage
  const toggleAutoUpdate = useCallback(() => {
    setAutoUpdateEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_AUTO_UPDATE, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Check for updates
  const checkForUpdate = useCallback(async (manual: boolean = false): Promise<boolean> => {
    setIsChecking(true);
    setStatusMessage('Vérification des mises à jour sur le serveur...');
    const now = new Date().toISOString();
    setLastCheckedAt(now);
    try {
      localStorage.setItem(STORAGE_KEY_LAST_CHECK, now);
    } catch {
      // ignore
    }

    try {
      // 1. Check Service Worker registration update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          if (registration.waiting) {
            setUpdateAvailable(true);
            setStatusMessage('Une nouvelle version est disponible et prête à être installée.');
            setIsChecking(false);
            return true;
          }
        }
      }

      // 2. Query health / version endpoint with anti-cache query
      const res = await fetch(`/api/v1/health?_t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        // Compare versions if provided
        if (data.version && data.version !== APP_VERSION) {
          setUpdateAvailable(true);
          setStatusMessage(`Nouvelle version ${data.version} disponible !`);
          setIsChecking(false);
          return true;
        }
      }

      // If manual check, provide clear confirmation
      if (manual) {
        setStatusMessage('Votre application dispose de la version la plus récente.');
      } else {
        setStatusMessage('Application à jour');
      }
      setUpdateAvailable(false);
      return false;
    } catch (err) {
      console.warn('[RadioFrance:Update] Erreur de vérification réseau:', err);
      setStatusMessage('Vérification réseau terminée (mode hors ligne)');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Force update: purge caches, unregister SW, and reload fresh
  const forceUpdate = useCallback(async () => {
    setIsChecking(true);
    setStatusMessage('Purge des caches et réinstallation forcée...');

    try {
      // Clear CacheStorage
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      // Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      // Save last check timestamp
      try {
        localStorage.setItem(STORAGE_KEY_LAST_CHECK, new Date().toISOString());
      } catch {
        // ignore
      }

      // Hard reload
      window.location.reload();
    } catch (err) {
      console.error('[RadioFrance:Update] Échec de la mise à jour forcée:', err);
      window.location.reload();
    }
  }, []);

  // Background Auto-Update Listener & Periodic Timer
  useEffect(() => {
    // Initial check after 5 seconds of launch
    const initialTimer = setTimeout(() => {
      checkForUpdate(false);
    }, 5000);

    // Periodic check every 15 minutes if autoUpdateEnabled
    const intervalMinutes = 15;
    const intervalMs = intervalMinutes * 60 * 1000;

    const intervalTimer = setInterval(async () => {
      if (autoUpdateEnabled) {
        console.log('[RadioFrance:AutoUpdate] 🔄 Vérification automatique en arrière-plan...');
        const hasUpdate = await checkForUpdate(false);
        if (hasUpdate) {
          console.log('[RadioFrance:AutoUpdate] 🚀 Mise à jour détectée, installation automatique en arrière-plan...');
          // Auto-install: trigger force update after gentle timeout
          setTimeout(() => {
            forceUpdate();
          }, 3000);
        }
      }
    }, intervalMs);

    // Listen to ServiceWorker updatefound
    const handleSWUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg && reg.waiting && autoUpdateEnabled) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        });
      }
    };

    window.addEventListener('swUpdated', handleSWUpdate);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      window.removeEventListener('swUpdated', handleSWUpdate);
    };
  }, [autoUpdateEnabled, checkForUpdate, forceUpdate]);

  return {
    appVersion,
    releaseDate,
    buildCommit,
    lastCheckedAt,
    isChecking,
    updateAvailable,
    statusMessage,
    autoUpdateEnabled,
    toggleAutoUpdate,
    checkForUpdate: () => checkForUpdate(true),
    forceUpdate,
  };
}
