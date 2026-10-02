/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Station } from './types/radiation';
import { ApiService } from './services/api';
import { useGeolocation } from './hooks/useGeolocation';
import { Header } from './components/Header';
import { Navigation, type NavTab } from './components/Navigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SearchModal } from './components/SearchModal';
import { SyncAdminModal } from './components/SyncAdminModal';

// Pages
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { StationsListPage } from './pages/StationsListPage';
import { StationDetailPage } from './pages/StationDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { SourcesPage } from './pages/SourcesPage';
import { InfoPage } from './pages/InfoPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isCached, setIsCached] = useState(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminSyncOpen, setIsAdminSyncOpen] = useState(false);

  // Geolocation
  const { latitude, longitude, loading: isLocating, requestPosition } = useGeolocation();

  // Load stations
  const loadStations = useCallback(async (userLat?: number | null, userLon?: number | null) => {
    try {
      const params: any = {};
      if (userLat != null && userLon != null) {
        params.lat = userLat;
        params.lon = userLon;
      }
      const res = await ApiService.getStations(params);
      setStations(res.data);
      setLastUpdated(res.timestamp);
      setIsCached(res.isCached);
    } catch (err) {
      console.error('Error fetching stations:', err);
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
      />

      {/* Main Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 pt-4">
        {selectedStationId != null ? (
          <StationDetailPage
            stationId={selectedStationId}
            onBack={handleBackFromDetail}
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
              />
            )}

            {currentTab === 'stations' && (
              <StationsListPage
                stations={stations}
                onSelectStation={handleSelectStation}
                userCoords={userCoords}
              />
            )}

            {currentTab === 'alerts' && <AlertsPage />}

            {currentTab === 'sources' && <SourcesPage />}

            {currentTab === 'info' && <InfoPage />}
          </>
        )}
      </main>

      {/* Offline Status Badge */}
      <OfflineIndicator lastSyncTimestamp={lastUpdated} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        stations={stations}
        onSelectStation={handleSelectStation}
      />

      {/* Admin Manual Sync Modal */}
      <SyncAdminModal
        isOpen={isAdminSyncOpen}
        onClose={() => setIsAdminSyncOpen(false)}
        onSyncComplete={handleRefresh}
      />
    </div>
  );
}
