/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Station, AuditTimestamps } from './types/radiation';
import { ApiService } from './services/api';
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
  const loadStations = useCallback(async (userLat?: number | null, userLon?: number | null) => {
    try {
      console.log(`[RadioFrance:App] 📡 Récupération des stations (${userLat ? 'avec coordonnées GPS' : 'périmètre national'})...`);
      const params: any = {};
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
      setInitError(null);
    } catch (err: any) {
      console.error('[RadioFrance:App] ⚠️ Exception lors de la récupération des stations:', err);
      setInitError(err?.message || 'Impossible de joindre le flux de surveillance radiologique.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

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
      />

      {/* Main Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 pt-4">
        {initError && (
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
