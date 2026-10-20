/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Station, AuditTimestamps } from './types/radiation';
import { ApiService, type ServerErrorInfo } from './services/api';
import { safeFormatDateTime } from './utils/dateUtils';
import { useGeolocation } from './hooks/useGeolocation';
import { Header } from './components/Header';
import { Navigation, type NavTab } from './components/Navigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflineCenterModal } from './components/OfflineCenterModal';
import { SearchModal } from './components/SearchModal';
import { SyncAdminModal } from './components/SyncAdminModal';
import { HamburgerMenu } from './components/HamburgerMenu';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { LegalDisclaimerModal } from './components/LegalDisclaimerModal';
import { ContextualTour } from './components/ContextualTour';

// Pages
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { StationsListPage } from './pages/StationsListPage';
import { StationDetailPage } from './pages/StationDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { SourcesPage } from './pages/SourcesPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { MeasurementTypesPage } from './pages/MeasurementTypesPage';
import { NetworkHealthPage } from './pages/NetworkHealthPage';
import { CompareStationsPage } from './pages/CompareStationsPage';
import { TimelinePage } from './pages/TimelinePage';
import type { GeoZone } from './utils/geoSearch';
import { useFavorites } from './hooks/useFavorites';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [compareStationIds, setCompareStationIds] = useState<number[]>([1, 7, 8, 11]);
  const [activeMapZone, setActiveMapZone] = useState<GeoZone | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isCached, setIsCached] = useState(false);
  const [auditTimestamps, setAuditTimestamps] = useState<AuditTimestamps | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<ServerErrorInfo | null>(null);
  const [isCacheEmpty, setIsCacheEmpty] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    console.log('[RadioFrance:App] 🌟 Composant App monté avec succès dans le DOM.');
  }, []);

  // Favorites Hook (IndexedDB persistence + Fast Startup Refresh)
  const {
    favoriteIds,
    favoritesData,
    isFavorite,
    toggleFavorite,
    fastRefreshFavorites,
    isFastRefreshing: isFastRefreshingFavorites,
    fastRefreshDuration,
    lastRefreshedAt: lastFavoritesRefresh,
  } = useFavorites();

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminSyncOpen, setIsAdminSyncOpen] = useState(false);
  const [isOfflineCenterOpen, setIsOfflineCenterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('radiation_france_disclaimer_accepted') !== 'true';
    } catch {
      return false;
    }
  });

  // Geolocation
  const { latitude, longitude, loading: isLocating, requestPosition } = useGeolocation();

  // Load stations
  const loadStations = useCallback(async (userLat?: number | null, userLon?: number | null, demoOverride?: boolean) => {
    try {
      const activeDemo = demoOverride !== undefined ? demoOverride : isDemoMode;
      console.log(`[RadioFrance:App] 📡 Récupération des stations (${userLat ? 'avec GPS' : 'national'}, mode: ${activeDemo ? 'DÉMO' : 'RÉEL'})...`);
      const params: any = { demo: activeDemo };
      if (userLat != null && userLon != null) {
        params.lat = userLat;
        params.lon = userLon;
      }
      const res = await ApiService.getStations(params);
      console.log(`[RadioFrance:App] ✅ ${res.data?.length ?? 0} balises chargées. Mode cache: ${res.isCached ? 'OUI (Dexie)' : 'NON (Flux direct)'}`);
      setStations(res.data);
      setLastUpdated(res.timestamp);
      setIsCached(res.isCached);
      if (res.timestamps) {
        setAuditTimestamps(res.timestamps);
      }
      if (res.serverError) {
        setServerError(res.serverError);
      } else {
        setServerError(null);
      }
      setIsCacheEmpty(Boolean(res.isCacheEmpty));
      setInitError(null);
    } catch (err: any) {
      console.error('[RadioFrance:App] ⚠️ Exception lors de la récupération des stations:', err);
      setInitError(err?.message || 'Impossible de joindre le flux de surveillance radiologique.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isDemoMode]);

  // Initial load
  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // When GPS updates, reload stations with distance
  useEffect(() => {
    if (latitude != null && longitude != null) {
      loadStations(latitude, longitude);
    }
  }, [latitude, longitude, loadStations]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStations(latitude, longitude);
  };

  const handleToggleDemoMode = async () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    setIsRefreshing(true);
    await loadStations(latitude, longitude, next);
  };

  // Find nearest station if user coordinates are known
  const nearestStation = useMemo(() => {
    if (stations.length === 0) return null;
    if (latitude != null && longitude != null) {
      const sorted = [...stations].sort(
        (a, b) => (a.distance_km ?? 999999) - (b.distance_km ?? 999999)
      );
      return sorted[0];
    }
    // Default highlight first benchmark station (Paris or Limoges)
    return stations[0];
  }, [stations, latitude, longitude]);

  const handleSelectStation = (stationId: number) => {
    setSelectedStationId(stationId);
  };

  const handleBackFromDetail = () => {
    setSelectedStationId(null);
  };

  const handleTabChange = (tab: NavTab) => {
    setSelectedStationId(null);
    setCurrentTab(tab);
  };

  const handleOpenCompare = (stationId?: number) => {
    if (stationId && !compareStationIds.includes(stationId)) {
      setCompareStationIds(prev => [stationId, ...prev.slice(0, 3)]);
    }
    setSelectedStationId(null);
    setCurrentTab('compare');
  };

  const handleMeasureZone = (zone: GeoZone) => {
    setActiveMapZone(zone);
    setSelectedStationId(null);
    setCurrentTab('map');
    setIsSearchOpen(false);
  };

  const handleClearActiveZone = () => {
    setActiveMapZone(null);
  };

  const userCoords = useMemo(() => {
    if (latitude != null && longitude != null) {
      return { latitude, longitude };
    }
    return null;
  }, [latitude, longitude]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdminSync={() => setIsAdminSyncOpen(true)}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onNavigateToHealth={() => handleTabChange('health')}
        onOpenOfflineCenter={() => setIsOfflineCenterOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />

      {/* Main Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 pt-4">
        {/* Explicit Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-4 rounded-2xl border border-purple-500/50 bg-purple-950/40 p-4 text-xs font-mono text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl backdrop-blur-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">🧪</span>
              <div className="space-y-0.5">
                <div className="font-bold text-purple-300 uppercase tracking-wide text-[11px]">
                  Mode Démonstration Actif (Données d'étalonnage pour tests)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Toutes les balises sont des fixtures d'essai clairement identifiées <strong>DEMO</strong>. Aucune valeur simulée n'est présentée comme une télémesure officielle ASNR/Téléray en direct.
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleDemoMode}
              className="self-start sm:self-auto shrink-0 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/60 text-purple-200 hover:text-white font-bold transition text-[11px]"
            >
              Revenir au mode Données Réelles
            </button>
          </div>
        )}

        {/* Explicit Server Error / Degradation Banner (Requirement: Ne pas remplacer une erreur serveur par du cache sans avertissement explicite) */}
        {serverError && (
          <div className="mb-4 rounded-2xl border border-amber-500/60 bg-amber-950/40 p-4 text-xs font-mono text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl backdrop-blur-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">⚠️</span>
              <div className="space-y-0.5">
                <div className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                  Avertissement d'incident serveur (HTTP {serverError.status} {serverError.statusText})
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Le serveur central a rencontré une anomalie sur <code>{serverError.endpoint}</code>. En application des règles de sûreté, aucune fausse donnée n'a été injectée : l'application affiche votre cache local archivé à <strong>{auditTimestamps?.cache_timestamp ? safeFormatDateTime(auditTimestamps.cache_timestamp) : 'précédemment'}</strong> (date réelle de la mesure : <strong>{auditTimestamps?.data_timestamp ? safeFormatDateTime(auditTimestamps.data_timestamp) : 'Inconnue'}</strong>).
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRefresh()}
              className="self-start sm:self-auto shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 hover:text-white font-bold transition text-[11px]"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty Cache Notice when offline or in error */}
        {isCacheEmpty && (serverError || initError) && (
          <div className="mb-4 rounded-2xl border border-sky-500/40 bg-sky-950/30 p-4 text-xs font-mono text-sky-200 flex items-start gap-2.5 shadow-lg">
            <span className="text-lg">ℹ️</span>
            <div>
              <span className="font-bold text-sky-300">Cache local vide : </span>
              <span>Aucune mesure n'a encore été mise en cache sur cet appareil. Une première synchronisation avec le réseau est nécessaire pour peupler la base locale IndexedDB.</span>
            </div>
          </div>
        )}

        {initError && !serverError && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs font-mono text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-bold text-red-300">Information système : </span>
                <span>{initError}</span>
              </div>
            </div>
            <button
              onClick={() => handleRefresh()}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 hover:text-white font-bold transition text-[11px]"
            >
              Réessayer la synchronisation
            </button>
          </div>
        )}

        {selectedStationId != null ? (
          <StationDetailPage
            stationId={selectedStationId}
            onBack={handleBackFromDetail}
            onCompare={handleOpenCompare}
            isFavorite={isFavorite(selectedStationId)}
            onToggleFavorite={toggleFavorite}
            onNavigateToMethodology={() => handleTabChange('info')}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                stations={stations}
                nearestStation={nearestStation}
                onTabChange={handleTabChange}
                onSelectStation={handleSelectStation}
                onRequestGeolocation={requestPosition}
                isLocating={isLocating}
                lastUpdated={lastUpdated}
                isCached={isCached}
                auditTimestamps={auditTimestamps}
                favoriteIds={favoriteIds}
                favoritesData={favoritesData}
                onToggleFavorite={toggleFavorite}
                onFastRefreshFavorites={fastRefreshFavorites}
                isFastRefreshingFavorites={isFastRefreshingFavorites}
                fastRefreshDuration={fastRefreshDuration}
                lastFavoritesRefresh={lastFavoritesRefresh}
                onOpenOfflineCenter={() => setIsOfflineCenterOpen(true)}
              />
            )}

            {currentTab === 'map' && (
              <MapPage
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={handleSelectStation}
                userCoords={userCoords}
                onLocateMe={requestPosition}
                isLocating={isLocating}
                activeZone={activeMapZone}
                onClearActiveZone={handleClearActiveZone}
              />
            )}

            {currentTab === 'stations' && (
              <StationsListPage
                stations={stations}
                onSelectStation={handleSelectStation}
                onCompareStation={handleOpenCompare}
                userCoords={userCoords}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            )}

            {currentTab === 'compare' && (
              <CompareStationsPage
                stations={stations}
                onSelectStation={handleSelectStation}
                initialStationIds={compareStationIds}
              />
            )}

            {currentTab === 'timeline' && <TimelinePage />}

            {currentTab === 'health' && (
              <NetworkHealthPage
                onNavigateToTab={handleTabChange}
                onSelectStation={handleSelectStation}
              />
            )}

            {currentTab === 'types' && (
              <MeasurementTypesPage
                stations={stations}
                onTabChange={handleTabChange}
                onSelectStation={handleSelectStation}
              />
            )}

            {currentTab === 'alerts' && <AlertsPage />}

            {currentTab === 'sources' && <SourcesPage />}

            {currentTab === 'info' && <MethodologyPage />}
          </>
        )}
      </main>

      {/* Offline Status Badge */}
      <OfflineIndicator
        lastSyncTimestamp={lastUpdated}
        timestamps={auditTimestamps}
        onOpenCenter={() => setIsOfflineCenterOpen(true)}
      />

      {/* Dedicated Offline Information Center Modal */}
      <OfflineCenterModal
        isOpen={isOfflineCenterOpen}
        onClose={() => setIsOfflineCenterOpen(false)}
        lastSyncTimestamp={lastUpdated}
        auditTimestamps={auditTimestamps}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onNavigateToTab={(tab) => {
          setCurrentTab(tab as any);
          setIsOfflineCenterOpen(false);
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        stations={stations}
        onSelectStation={handleSelectStation}
        onMeasureZone={handleMeasureZone}
      />

      {/* Admin Manual Sync Modal */}
      <SyncAdminModal
        isOpen={isAdminSyncOpen}
        onClose={() => setIsAdminSyncOpen(false)}
        onSyncComplete={handleRefresh}
      />

      {/* Categorized Hamburger Navigation Menu */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenOfflineCenter={() => setIsOfflineCenterOpen(true)}
      />

      {/* System Settings & Update Management Modal */}
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      {/* Legal Mentions & Disclaimer Modal */}
      <LegalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* Contextual Tour & Onboarding */}
      <ContextualTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToTab={(tab) => handleTabChange(tab as NavTab)}
      />
    </div>
  );
}
