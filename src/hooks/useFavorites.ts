import { useState, useEffect, useCallback } from 'react';
import { db, type FavoriteStation } from '../offline/db';
import { ApiService } from '../services/api';

export interface FavoriteItemData {
  station_id: number;
  station_name: string;
  commune: string;
  department_code?: string;
  region_code?: string;
  nominal: number;
  is_official: boolean;
  source_code: string;
  source_name?: string;
  measurement: {
    value: number;
    unit: string;
    measured_at: string;
    quality_status: 'VALID' | 'SUSPECT' | 'MISSING' | 'STALE' | 'INVALID';
    age_minutes: number;
  };
  avg_24h: number;
  delta_24h: number;
  trend: 'RISING' | 'FALLING' | 'STABLE';
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([1, 7, 8]); // Paris, Limoges, Brest default
  const [favoritesData, setFavoritesData] = useState<Record<number, FavoriteItemData>>({});
  const [isFastRefreshing, setIsFastRefreshing] = useState<boolean>(false);
  const [fastRefreshDuration, setFastRefreshDuration] = useState<number | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 1. Load favorites from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;

    async function initFavorites() {
      try {
        const stored = await db.favorites.toArray();
        if (stored && stored.length > 0) {
          const ids = stored.map(f => f.id);
          if (isMounted) {
            setFavoriteIds(ids);
          }
        } else {
          // Seed default trio requested: Paris (1), Limoges (7), Brest (8)
          const defaultTrio = [1, 7, 8];
          const now = new Date().toISOString();
          await db.favorites.bulkPut(
            defaultTrio.map(id => ({ id, added_at: now }))
          );
          if (isMounted) {
            setFavoriteIds(defaultTrio);
          }
        }
      } catch (err) {
        console.warn('Failed to read favorites from IndexedDB:', err);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    }

    initFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fast Priority Refresh on Startup or when favoriteIds change
  const fastRefreshFavorites = useCallback(async (idsToRefresh?: number[]) => {
    const ids = idsToRefresh || favoriteIds;
    if (!ids || ids.length === 0) return;

    setIsFastRefreshing(true);
    const start = performance.now();
    try {
      const res = await ApiService.getFavoritesLatest(ids);
      if (res && res.favorites) {
        const map: Record<number, FavoriteItemData> = {};
        res.favorites.forEach(f => {
          map[f.station_id] = f;
        });
        setFavoritesData(prev => ({ ...prev, ...map }));
        setFastRefreshDuration(Math.round(performance.now() - start));
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.warn('Fast priority favorites refresh error:', err);
    } finally {
      setIsFastRefreshing(false);
    }
  }, [favoriteIds]);

  // Trigger fast priority refresh once initialized
  useEffect(() => {
    if (isInitialized && favoriteIds.length > 0) {
      fastRefreshFavorites(favoriteIds);
    }
  }, [isInitialized, favoriteIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Toggle favorite
  const toggleFavorite = useCallback(async (stationId: number) => {
    try {
      const exists = await db.favorites.get(stationId);
      if (exists) {
        await db.favorites.delete(stationId);
        setFavoriteIds(prev => prev.filter(id => id !== stationId));
        setFavoritesData(prev => {
          const next = { ...prev };
          delete next[stationId];
          return next;
        });
      } else {
        await db.favorites.put({ id: stationId, added_at: new Date().toISOString() });
        setFavoriteIds(prev => [...prev, stationId]);
        // Trigger fast refresh immediately for this new favorite!
        fastRefreshFavorites([stationId]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite in IndexedDB:', err);
    }
  }, [fastRefreshFavorites]);

  const isFavorite = useCallback((stationId: number) => {
    return favoriteIds.includes(stationId);
  }, [favoriteIds]);

  return {
    favoriteIds,
    favoritesData,
    isFavorite,
    toggleFavorite,
    fastRefreshFavorites,
    isFastRefreshing,
    fastRefreshDuration,
    lastRefreshedAt,
    isInitialized,
  };
}
