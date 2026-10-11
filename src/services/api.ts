import type {
  Station,
  StationDetail,
  LatestMeasurement,
  Measurement,
  StationStatistics,
  Source,
  OfficialAlert,
  SourceHealth,
  NetworkHealthSummary,
  MeasurementTypeInfo,
  StationsCompareResponse,
  AuditTimestamps,
} from '../types/radiation';
import { MEASUREMENT_TYPES_CATALOG } from '../types/radiation';
import { db, saveAuditTimestamps, getAuditTimestamps } from '../offline/db';

const BASE_URL = '/api/v1';

export interface ApiResponse<T> {
  data: T;
  isCached: boolean;
  timestamp: string;
  timestamps?: AuditTimestamps;
}

export class ApiService {
  /**
   * Helper for network request with automatic IndexedDB fallback and granular 4-timestamp audit
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
        const cacheNow = new Date().toISOString();
        const serverTimestamp =
          response.headers.get('x-server-timestamp') ||
          (data as any)?.server_timestamp ||
          cacheNow;

        // Extract finest data_timestamp and source_timestamp from payload
        let dataTimestamp: string | undefined = (data as any)?.data_timestamp;
        let sourceTimestamp: string | undefined = (data as any)?.source_timestamp;

        if (!dataTimestamp && Array.isArray(data) && data.length > 0) {
          // Scan for most recent measurement time in the dataset
          for (const item of data) {
            const mAt =
              item?.latest_measurement?.data_timestamp ||
              item?.latest_measurement?.measured_at ||
              item?.data_timestamp ||
              item?.measured_at;
            if (mAt) {
              if (!dataTimestamp || new Date(mAt).getTime() > new Date(dataTimestamp).getTime()) {
                dataTimestamp = mAt;
                sourceTimestamp =
                  item?.latest_measurement?.source_timestamp ||
                  item?.source_timestamp ||
                  mAt;
              }
            }
          }
        }

        const finalDataTimestamp: string = dataTimestamp || serverTimestamp;
        const finalSourceTimestamp: string = sourceTimestamp || finalDataTimestamp;

        const auditTimestamps: AuditTimestamps = {
          data_timestamp: finalDataTimestamp,
          source_timestamp: finalSourceTimestamp,
          server_timestamp: serverTimestamp,
          cache_timestamp: cacheNow,
        };

        // Persist to IndexedDB in background
        cacheWriter(data).catch(err => console.warn('Dexie cache write failed:', err));
        saveAuditTimestamps(auditTimestamps).catch(err => console.warn('Dexie audit timestamp write failed:', err));

        return {
          data,
          isCached: false,
          timestamp: cacheNow,
          timestamps: auditTimestamps,
        };
      }
    } catch (networkError) {
      console.info(`Network call to ${endpoint} failed, falling back to IndexedDB:`, networkError);
    }

    // Fallback to IndexedDB
    const cachedData = await cacheReader();
    const storedTimestamps = await getAuditTimestamps();
    const now = new Date().toISOString();

    const auditTimestamps: AuditTimestamps = storedTimestamps || {
      data_timestamp: now,
      source_timestamp: now,
      server_timestamp: now,
      cache_timestamp: now,
    };

    return {
      data: cachedData,
      isCached: true,
      timestamp: auditTimestamps.cache_timestamp,
      timestamps: auditTimestamps,
    };
  }

  // 1. Stations
  static async getStations(params?: {
    source?: string;
    measurement_type?: string;
    observation_mode?: string;
    radionuclide?: string;
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
    if (params?.observation_mode) query.set('observation_mode', params.observation_mode);
    if (params?.radionuclide) query.set('radionuclide', params.radionuclide);
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
        if (params?.observation_mode) {
          const m = params.observation_mode;
          if (m === 'AMBIENT_GAMMA') {
            list = list.filter(s => !s.measurement_type || s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE');
          } else if (m === 'ATMOSPHERIC_AEROSOLS') {
            list = list.filter(s => s.source_code === 'OPERA_AIR' || s.measurement_type === 'ATMOSPHERIC_AEROSOLS');
          } else if (m === 'WATER_RADIOACTIVITY') {
            list = list.filter(s => s.source_code === 'HYDROTELERAY' || s.measurement_type === 'WATER_RADIOACTIVITY');
          } else if (m === 'CITIZEN_DATA') {
            list = list.filter(s => s.source_code === 'OPENRADIATION' || s.source_code === 'SAFECAST');
          }
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

  // 1c. OPERA-Air Radionuclides Catalog
  static async getOperaAirRadionuclides(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/opera-air/radionuclides`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch OPERA-Air radionuclides:', err);
    }
    return [];
  }

  // 1d. OPERA-Air National Summary
  static async getOperaAirSummary(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/opera-air/summary`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch OPERA-Air summary:', err);
    }
    return null;
  }

  // 1e. HydroTéléray River Surveillance Synthesis
  static async getHydroteleraySummary(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/hydroteleray/summary`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch HydroTéléray summary:', err);
    }
    return null;
  }

  // 1f. HydroTéléray Basins
  static async getHydrotelerayBasins(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/hydroteleray/basins`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch HydroTéléray basins:', err);
    }
    return [];
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

  // 5b. Compare Stations (Multi-series metrics and historical chart)
  static async compareStations(ids: number[] = [1, 7, 8, 11], hours: number = 168): Promise<StationsCompareResponse> {
    try {
      const res = await fetch(`${BASE_URL}/stations/compare?ids=${ids.join(',')}&hours=${hours}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch station comparison from server:', e);
    }
    return {
      period_hours: hours,
      stations: [],
      timeline: [],
      geological_insights: [],
    };
  }

  // 5c. Fast Priority Favorites Refresh (Startup instant sync)
  static async getFavoritesLatest(ids: number[]): Promise<{
    duration_ms: number;
    refreshed_at: string;
    count: number;
    favorites: Array<{
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
    }>;
  } | null> {
    try {
      const qs = ids && ids.length > 0 ? `?ids=${ids.join(',')}` : '';
      const res = await fetch(`${BASE_URL}/favorites/latest${qs}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch fast favorites:', e);
    }
    return null;
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

  // 7. Official Alerts (Strictly via OfficialAlertConnector)
  static async getAlerts(params?: {
    status?: string;
    severity?: string;
    source?: string;
  }): Promise<ApiResponse<OfficialAlert[]>> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.source) query.set('source', params.source);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.fetchWithOfflineFallback<OfficialAlert[]>(
      `/alerts${qs}`,
      async () => {
        let list = await db.alerts.toArray();
        if (params?.status && params.status !== 'ALL') {
          list = list.filter(a => a.status === params.status);
        }
        if (params?.severity && params.severity !== 'ALL') {
          list = list.filter(a => a.severity === params.severity);
        }
        return list;
      },
      async (alerts: OfficialAlert[]) => {
        if (alerts && alerts.length > 0) {
          await db.alerts.bulkPut(alerts);
        }
      }
    );
  }

  // 7b. Sync Alerts via Official Connector
  static async syncAlerts(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/alerts/sync`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to trigger alert sync:', e);
    }
    return null;
  }

  // 7c. Alert Connector Status
  static async getAlertConnectorStatus(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/alerts/connector-status`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to fetch alert connector status:', e);
    }
    return null;
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

  // 9b. Global Network Health Summary
  static async getNetworkHealthSummary(): Promise<NetworkHealthSummary | null> {
    try {
      const res = await fetch(`${BASE_URL}/health/summary`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch network health summary:', err);
    }
    return null;
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
