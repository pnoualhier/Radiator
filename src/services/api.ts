import type {
  Station,
  StationDetail,
  LatestMeasurement,
  Measurement,
  StationStatistics,
  Source,
  OfficialAlert,
  SourceHealth,
  MeasurementTypeInfo,
} from '../types/radiation';
import { MEASUREMENT_TYPES_CATALOG } from '../types/radiation';
import { db } from '../offline/db';

const BASE_URL = '/api/v1';

export interface ApiResponse<T> {
  data: T;
  isCached: boolean;
  timestamp: string;
}

export class ApiService {
  /**
   * Helper for network request with automatic IndexedDB fallback
   */
  private static async fetchWithOfflineFallback<T>(
    endpoint: string,
    cacheReader: () => Promise<T>,
    cacheWriter: (data: T) => Promise<void>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      if (response.ok) {
        const data = (await response.json()) as T;
        const now = new Date().toISOString();
        // Persist to IndexedDB in background
        cacheWriter(data).catch(err => console.warn('Dexie cache write failed:', err));
        await db.metadata.put({ key: 'last_sync_timestamp', value: now });
        return { data, isCached: false, timestamp: now };
      }
    } catch (networkError) {
      console.info(`Network call to ${endpoint} failed, falling back to IndexedDB:`, networkError);
    }

    // Fallback to IndexedDB
    const cachedData = await cacheReader();
    const meta = await db.metadata.get('last_sync_timestamp');
    return {
      data: cachedData,
      isCached: true,
      timestamp: meta?.value || new Date().toISOString(),
    };
  }

  // 1. Stations
  static async getStations(params?: {
    source?: string;
    measurement_type?: string;
    region?: string;
    department?: string;
    bbox?: string;
    lat?: number;
    lon?: number;
    radius?: number;
    official?: boolean;
    limit?: number;
  }): Promise<ApiResponse<Station[]>> {
    const query = new URLSearchParams();
    if (params?.source) query.set('source', params.source);
    if (params?.measurement_type) query.set('measurement_type', params.measurement_type);
    if (params?.region) query.set('region', params.region);
    if (params?.department) query.set('department', params.department);
    if (params?.bbox) query.set('bbox', params.bbox);
    if (params?.lat !== undefined) query.set('lat', params.lat.toString());
    if (params?.lon !== undefined) query.set('lon', params.lon.toString());
    if (params?.radius !== undefined) query.set('radius', params.radius.toString());
    if (params?.official !== undefined) query.set('official', params.official.toString());
    if (params?.limit !== undefined) query.set('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.fetchWithOfflineFallback<Station[]>(
      `/stations${qs}`,
      async () => {
        let list = await db.stations.toArray();
        if (params?.official !== undefined) {
          list = list.filter(s => s.is_official === params.official);
        }
        if (params?.measurement_type) {
          list = list.filter(s => s.measurement_type === params.measurement_type);
        }
        return list;
      },
      async (stations: Station[]) => {
        await db.stations.bulkPut(stations);
      }
    );
  }

  // 1b. Measurement Types
  static async getMeasurementTypes(): Promise<MeasurementTypeInfo[]> {
    try {
      const res = await fetch(`${BASE_URL}/measurement-types`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch measurement types, using offline catalog:', err);
    }
    return Object.values(MEASUREMENT_TYPES_CATALOG);
  }

  // 2. Station Detail
  static async getStation(stationId: number): Promise<ApiResponse<StationDetail | null>> {
    return this.fetchWithOfflineFallback<StationDetail | null>(
      `/stations/${stationId}`,
      async () => {
        const s = await db.stations.get(stationId);
        if (!s) return null;
        const recent = await db.measurements
          .where('station_id')
          .equals(stationId)
          .reverse()
          .sortBy('measured_at');
        return {
          ...s,
          recent_measurements: recent,
        };
      },
      async (detail: StationDetail | null) => {
        if (detail) {
          await db.stations.put(detail);
          if (detail.recent_measurements && detail.recent_measurements.length > 0) {
            await db.measurements.bulkPut(detail.recent_measurements);
          }
        }
      }
    );
  }

  // 3. Latest Measurements
  static async getLatestMeasurements(): Promise<ApiResponse<LatestMeasurement[]>> {
    return this.fetchWithOfflineFallback<LatestMeasurement[]>(
      '/measurements/latest',
      async () => db.latestMeasurements.toArray(),
      async (items: LatestMeasurement[]) => {
        await db.latestMeasurements.bulkPut(items);
      }
    );
  }

  // 4. Station History
  static async getStationHistory(stationId: number, hours: number = 168): Promise<ApiResponse<Measurement[]>> {
    return this.fetchWithOfflineFallback<Measurement[]>(
      `/stations/${stationId}/measurements?limit=${hours}`,
      async () => {
        return db.measurements
          .where('station_id')
          .equals(stationId)
          .sortBy('measured_at');
      },
      async (items: Measurement[]) => {
        if (items.length > 0) {
          await db.measurements.bulkPut(items);
        }
      }
    );
  }

  // 5. Station Statistics
  static async getStationStatistics(stationId: number, hours: number = 168): Promise<ApiResponse<StationStatistics | null>> {
    try {
      const res = await fetch(`${BASE_URL}/stations/${stationId}/statistics?hours=${hours}`);
      if (res.ok) {
        const data = await res.json();
        return { data, isCached: false, timestamp: new Date().toISOString() };
      }
    } catch {
      // offline calculation from local indexeddb
      const local = await db.measurements.where('station_id').equals(stationId).toArray();
      const vals = local.map(m => m.value).filter(v => v !== undefined && v >= 0);
      if (vals.length > 0) {
        const sorted = [...vals].sort((a, b) => a - b);
        const sum = vals.reduce((acc, v) => acc + v, 0);
        return {
          data: {
            station_id: stationId,
            period_hours: hours,
            count: vals.length,
            minimum: sorted[0],
            maximum: sorted[sorted.length - 1],
            average: Math.round((sum / vals.length) * 10) / 10,
            median: sorted[Math.floor(sorted.length / 2)],
            unit: 'nSv/h',
          },
          isCached: true,
          timestamp: new Date().toISOString(),
        };
      }
    }
    return { data: null, isCached: true, timestamp: new Date().toISOString() };
  }

  // 6. Sources
  static async getSources(): Promise<ApiResponse<Source[]>> {
    return this.fetchWithOfflineFallback<Source[]>(
      '/sources',
      async () => db.sources.toArray(),
      async (sources: Source[]) => {
        await db.sources.bulkPut(sources);
      }
    );
  }

  // 7. Official Alerts
  static async getAlerts(): Promise<ApiResponse<OfficialAlert[]>> {
    return this.fetchWithOfflineFallback<OfficialAlert[]>(
      '/alerts',
      async () => db.alerts.toArray(),
      async (alerts: OfficialAlert[]) => {
        await db.alerts.bulkPut(alerts);
      }
    );
  }

  // 8. Health
  static async getHealth(): Promise<{ status: string; database: string; version: string }> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { status: 'offline', database: 'cached', version: '0.1.0' };
  }

  // 9. Sources Health
  static async getSourcesHealth(): Promise<SourceHealth[]> {
    try {
      const res = await fetch(`${BASE_URL}/health/sources`);
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }
    return [];
  }

  // 10. Admin Sync
  static async triggerSync(sourceCode: string = 'TELERAY', adminKey: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/sync/${sourceCode.toLowerCase()}`, {
      method: 'POST',
      headers: {
        'x-admin-key': adminKey,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Échec de synchronisation' }));
      throw new Error(err.detail || 'Erreur lors de la synchronisation');
    }
    return await res.json();
  }
}
