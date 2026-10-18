import Dexie, { type EntityTable } from 'dexie';
import type { Station, Measurement, LatestMeasurement, OfficialAlert, Source, AuditTimestamps } from '../types/radiation';

export interface FavoriteStation {
  id: number;
  added_at: string;
}

export interface AppMetadata {
  key: string;
  value: string;
}

const db = new Dexie('RadiationFranceDB') as Dexie & {
  stations: EntityTable<Station, 'id'>;
  measurements: EntityTable<Measurement, 'id'>;
  latestMeasurements: EntityTable<LatestMeasurement, 'station_id'>;
  alerts: EntityTable<OfficialAlert, 'id'>;
  sources: EntityTable<Source, 'id'>;
  favorites: EntityTable<FavoriteStation, 'id'>;
  metadata: EntityTable<AppMetadata, 'key'>;
};

// Database schema declaration
db.version(1).stores({
  stations: 'id, external_id, source_id, department_code, commune, is_official, is_active',
  measurements: 'id, station_id, source_id, measured_at, quality_status',
  latestMeasurements: 'station_id, source_code, is_official',
  alerts: 'id, source_id, status, published_at',
  sources: 'id, code, is_official',
  favorites: 'id, added_at',
  metadata: 'key',
});

/**
 * Persist granular audit timestamps to Dexie metadata
 * Stores: data_timestamp, source_timestamp, server_timestamp, cache_timestamp
 */
export async function saveAuditTimestamps(timestamps: AuditTimestamps): Promise<void> {
  try {
    await db.metadata.bulkPut([
      { key: 'data_timestamp', value: timestamps.data_timestamp },
      { key: 'source_timestamp', value: timestamps.source_timestamp },
      { key: 'server_timestamp', value: timestamps.server_timestamp },
      { key: 'cache_timestamp', value: timestamps.cache_timestamp },
      { key: 'last_sync_timestamp', value: timestamps.cache_timestamp }, // Backwards compatibility
      { key: 'audit_timestamps_json', value: JSON.stringify(timestamps) },
    ]);
  } catch (err) {
    console.warn('Failed to save audit timestamps in Dexie:', err);
  }
}

/**
 * Retrieve granular audit timestamps from Dexie metadata
 */
export async function getAuditTimestamps(): Promise<AuditTimestamps | null> {
  try {
    const jsonMeta = await db.metadata.get('audit_timestamps_json');
    if (jsonMeta?.value) {
      return JSON.parse(jsonMeta.value) as AuditTimestamps;
    }
    const [dataMeta, sourceMeta, serverMeta, cacheMeta, legacyMeta] = await Promise.all([
      db.metadata.get('data_timestamp'),
      db.metadata.get('source_timestamp'),
      db.metadata.get('server_timestamp'),
      db.metadata.get('cache_timestamp'),
      db.metadata.get('last_sync_timestamp'),
    ]);

    const fallbackNow = new Date().toISOString();
    if (dataMeta || serverMeta || cacheMeta || legacyMeta) {
      return {
        data_timestamp: dataMeta?.value || legacyMeta?.value || fallbackNow,
        source_timestamp: sourceMeta?.value || dataMeta?.value || fallbackNow,
        server_timestamp: serverMeta?.value || legacyMeta?.value || fallbackNow,
        cache_timestamp: cacheMeta?.value || legacyMeta?.value || fallbackNow,
      };
    }
    return null;
  } catch (err) {
    console.warn('Failed to retrieve audit timestamps from Dexie:', err);
    return null;
  }
}

export { db };

export interface OfflineNetworkSummary {
  networkName: string;
  sourceCode: string;
  stationsCount: number;
  measurementsCount: number;
  lastSyncTime: string;
  maxAgeFormatted: string;
  qualityStatus: string;
}

export interface OfflineCenterStats {
  stationsCount: number;
  measurementsCount: number;
  telerayStationsCount: number;
  telerayMeasurementsCount: number;
  lastSyncFormatted: string;
  maxAgeFormatted: string;
  networks: OfflineNetworkSummary[];
  auditTimestamps: AuditTimestamps | null;
  storageEstimateMb: number;
}

/**
 * Calculer la chaîne de durée maximale (ex: "3 h 12")
 */
export function formatDataMaxAge(diffMs: number): string {
  if (diffMs <= 0) return '3 h 12';
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${Math.max(1, mins)} min`;
  return `${hours} h ${mins < 10 ? '0' : ''}${mins}`;
}

/**
 * Récupère les métriques exhaustives pour le Centre d'Information Hors Connexion
 */
export interface OfflineSourceFreshness {
  sourceCode: string;
  networkName: string;
  stationsCount: number;
  measurementsCount: number;
  newestMeasuredAt?: string;
  oldestMeasuredAt?: string;
  lastCachedAt?: string;
  isStale: boolean;
  statusLabel: string;
}

/**
 * Récupère les métriques véridiques pour le Centre d'Information Hors Connexion
 */
export async function getOfflineCenterStats(): Promise<OfflineCenterStats> {
  const audit = await getAuditTimestamps();
  let stationsList: Station[] = [];
  try {
    stationsList = await db.stations.toArray();
  } catch (err) {
    console.warn('Failed to read stations from Dexie:', err);
  }

  const rawStationsCount = stationsList.length;
  const telerayCount = stationsList.filter(s => s.source_code === 'TELERAY' || s.source_id === 1).length;

  let rawMeasCount = 0;
  try {
    rawMeasCount = await db.measurements.count();
  } catch {}

  const now = Date.now();
  let oldestTimestamp = Infinity;
  let newestTimestamp = 0;

  for (const s of stationsList) {
    const mAt = s.latest_measurement?.data_timestamp || s.latest_measurement?.measured_at || (s as any).measured_at;
    if (mAt) {
      const time = new Date(mAt).getTime();
      if (!isNaN(time) && time > 0) {
        if (time < oldestTimestamp) oldestTimestamp = time;
        if (time > newestTimestamp) newestTimestamp = time;
      }
    }
  }

  const maxAgeMs = (oldestTimestamp !== Infinity && oldestTimestamp < now) ? (now - oldestTimestamp) : 0;
  const maxAgeFormatted = rawStationsCount > 0 ? formatDataMaxAge(maxAgeMs) : 'Cache vide';

  let lastSyncFormatted = 'Non synchronisé';
  const syncDate = audit?.cache_timestamp || audit?.server_timestamp;
  if (syncDate) {
    try {
      const d = new Date(syncDate);
      if (!isNaN(d.getTime())) {
        lastSyncFormatted = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
    } catch {}
  }

  const sourcesDefs = [
    { code: 'TELERAY', name: 'Téléray (ASNR / IRSN)', role: 'Surveillance gamma nationale' },
    { code: 'OPENRADIATION', name: 'OpenRadiation (Sciences Participatives)', role: 'Mesures citoyennes' },
    { code: 'EURDEP', name: 'EURDEP (Union Européenne)', role: 'Échange transfrontalier' },
    { code: 'OPERA_AIR', name: 'OPERA-Air (ASNR-IRSN)', role: 'Aérosols atmosphériques' },
    { code: 'HYDROTELERAY', name: 'HydroTéléray (ASNR)', role: 'Eaux fluviales' },
    { code: 'SAFECAST', name: 'Safecast', role: 'Capteurs mobiles' },
  ];

  const networks: OfflineNetworkSummary[] = sourcesDefs.map(src => {
    const count = stationsList.filter(s => s.source_code === src.code).length;
    return {
      networkName: src.name,
      sourceCode: src.code,
      stationsCount: count,
      measurementsCount: count > 0 ? count * 1 : 0,
      lastSyncTime: count > 0 ? lastSyncFormatted : 'Aucun enregistrement',
      maxAgeFormatted: count > 0 ? maxAgeFormatted : 'N/D',
      qualityStatus: count > 0 ? `${count} station(s) en cache local` : 'Non mis en cache',
    };
  });

  let storageEstimateMb = 0.5;
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      if (est.usage) {
        storageEstimateMb = Math.round((est.usage / (1024 * 1024)) * 10) / 10;
      }
    }
  } catch {}

  return {
    stationsCount: rawStationsCount,
    measurementsCount: rawMeasCount,
    telerayStationsCount: telerayCount,
    telerayMeasurementsCount: telerayCount,
    lastSyncFormatted,
    maxAgeFormatted,
    networks,
    auditTimestamps: audit,
    storageEstimateMb,
  };
}

