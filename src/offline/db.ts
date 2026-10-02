import Dexie, { type EntityTable } from 'dexie';
import type { Station, Measurement, LatestMeasurement, OfficialAlert, Source } from '../types/radiation';

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

export { db };
