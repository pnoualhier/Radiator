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

export interface PlatformCapabilities {
  platformName: string;
  isIOS: boolean;
  isAndroid: boolean;
  hasServiceWorker: boolean;
  hasPeriodicSync: boolean;
  suspensionNotice: string;
}

export function detectPlatformCapabilities(): PlatformCapabilities {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const hasPeriodicSync = typeof window !== 'undefined' && 'PeriodicSyncManager' in window;

  let platformName = 'Navigateur Web';
  let suspensionNotice = 'Gestion standard de mise en veille.';

  if (isIOS) {
    platformName = 'Apple iOS (WebKit / Safari)';
    suspensionNotice = 'Suspension immédiate en arrière-plan par WebKit iOS. Les vérifications périodiques sont opportunistes et se déclenchent au retour au premier plan (visibilitychange) ou lors de la navigation.';
  } else if (isAndroid) {
    platformName = 'Google Android (Chrome / WebView)';
    suspensionNotice = 'Gestion d économie d énergie système : les minuteries d arrière-plan peuvent être ralenties ou gelées par l OS. Contrôle opportuniste au réveil.';
  } else {
    platformName = 'Ordinateur de bureau (PC / Mac / Linux)';
    suspensionNotice = 'Exécution maintenue avec temporisation réduite dans les onglets inactifs.';
  }

  return {
    platformName,
    isIOS,
    isAndroid,
    hasServiceWorker,
    hasPeriodicSync,
    suspensionNotice,
  };
}

export function useAppUpdate() {
  const [appVersion] = useState<string>(APP_VERSION);
  const [releaseDate] = useState<string>(APP_RELEASE_DATE);
  const [buildCommit] = useState<string>(BUILD_COMMIT);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Application à jour');
  const [platformInfo] = useState<PlatformCapabilities>(() => detectPlatformCapabilities());
  const [isPreservingOfflineData, setIsPreservingOfflineData] = useState<boolean>(true);
  
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
      return stored !== null ? stored === 'true' : true;
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
    setStatusMessage('Vérification opportuniste de la version logicielle...');
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
            setStatusMessage('Nouvelle version prête à être installée (données locales préservées).');
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
        if (data.version && data.version !== APP_VERSION) {
          setUpdateAvailable(true);
          setStatusMessage(`Nouvelle version ${data.version} disponible !`);
          setIsChecking(false);
          return true;
        }
      }

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

  // Mise à jour contrôlée qui CONSERVE STRICTEMENT les données utiles hors ligne (IndexedDB, favoris)
  const controlledUpdate = useCallback(async () => {
    setIsChecking(true);
    setStatusMessage('Application contrôlée de la mise à jour (conservation stricte des données hors ligne)...');

    try {
      // 1. Déclencher le skipWaiting sur le SW en attente si existant
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }

      // 2. Vider UNIQUEMENT les caches d'actifs Web (CacheStorage) pour forcer le téléchargement des JS/CSS neufs
      // ATTENTION : On ne touche PAS à IndexedDB ni à localStorage pour conserver les balises et favoris !
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        // On purge les caches de bundles HTTP uniquement
        await Promise.all(
          cacheNames
            .filter(name => !name.includes('offline-database'))
            .map(name => caches.delete(name))
        );
      }

      // 3. Rechargement propre de la page
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('[RadioFrance:ControlledUpdate] Erreur lors de la mise à jour contrôlée:', err);
      window.location.reload();
    }
  }, []);

  // Force update classique (purge complète de secours)
  const forceUpdate = useCallback(async () => {
    return controlledUpdate();
  }, [controlledUpdate]);

  // Écoute des événements du cycle de vie du navigateur (visibilitychange, online)
  // pour un comportement réel au lieu d'une promesse irréaliste de minuterie en arrière-plan
  useEffect(() => {
    // 1. Initial check after 5 seconds
    const initialTimer = setTimeout(() => {
      checkForUpdate(false);
    }, 5000);

    // 2. Opportunistic check when app is brought back to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoUpdateEnabled) {
        const lastCheckStr = localStorage.getItem(STORAGE_KEY_LAST_CHECK);
        const lastCheckTime = lastCheckStr ? new Date(lastCheckStr).getTime() : 0;
        // Si plus de 15 minutes depuis le dernier check
        if (Date.now() - lastCheckTime > 15 * 60 * 1000) {
          console.log('[RadioFrance:Lifecycle] Réveil de l application au premier plan : vérification de mise à jour...');
          checkForUpdate(false);
        }
      }
    };

    // 3. Check when device regains network connection
    const handleOnline = () => {
      if (autoUpdateEnabled) {
        console.log('[RadioFrance:Lifecycle] Retour de la connexion réseau : vérification de mise à jour...');
        checkForUpdate(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // 4. Timer périodique opportuniste (actif lorsque la page n'est pas suspendue par l'OS)
    const intervalTimer = setInterval(() => {
      if (autoUpdateEnabled && document.visibilityState === 'visible') {
        checkForUpdate(false);
      }
    }, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [autoUpdateEnabled, checkForUpdate]);

  return {
    appVersion,
    releaseDate,
    buildCommit,
    lastCheckedAt,
    isChecking,
    updateAvailable,
    statusMessage,
    autoUpdateEnabled,
    platformInfo,
    isPreservingOfflineData,
    toggleAutoUpdate,
    checkForUpdate: () => checkForUpdate(true),
    controlledUpdate,
    forceUpdate,
  };
}
