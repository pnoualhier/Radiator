export type SourceCode = 'TELERAY' | 'EURDEP' | 'OPENRADIATION' | 'SAFECAST';

export interface Source {
  id: number;
  code: SourceCode;
  name: string;
  organization: string;
  source_type: 'INSTITUTIONAL' | 'CITIZEN' | 'RESEARCH';
  api_url?: string;
  license?: string;
  is_official: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceHealth {
  code: string;
  name: string;
  is_active: boolean;
  is_official: boolean;
  status: 'OK' | 'DEGRADED' | 'DISABLED' | 'ERROR';
  last_sync_at?: string;
  last_sync_status?: string;
  records_count: number;
}

export interface Measurement {
  id: number;
  station_id: number;
  source_id: number;
  external_id?: string;
  measured_at: string;
  received_at: string;
  value: number; // in nSv/h
  unit: string;
  measurement_type: string;
  quality_status: 'VALID' | 'SUSPECT' | 'MISSING' | 'STALE' | 'INVALID';
  validation_status: string;
  data_nature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
  is_simulated?: boolean;
  raw_value?: number;
  raw_unit?: string;
  metadata_json?: string;
  created_at: string;
}

export interface LatestMeasurement {
  station_id: number;
  station_name: string;
  station_commune?: string;
  department_code?: string;
  latitude: number;
  longitude: number;
  is_official: boolean;
  source_code: string;
  source_name: string;
  measured_at: string;
  value: number; // in nSv/h
  unit: string;
  quality_status: 'VALID' | 'SUSPECT' | 'MISSING' | 'STALE' | 'INVALID';
  is_stale: boolean;
  data_nature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
  is_simulated?: boolean;
}

export interface Station {
  id: number;
  external_id: string;
  source_id: number;
  source_code?: string;
  source_name?: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  country: string;
  region_code?: string;
  department_code?: string;
  commune?: string;
  station_type: 'FIXED' | 'MOBILE' | 'CITIZEN' | 'OTHER';
  is_official: boolean;
  is_active: boolean;
  data_nature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
  is_simulated?: boolean;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  latest_measurement?: Measurement;
}

export interface StationDetail extends Station {
  recent_measurements: Measurement[];
}

export interface StationStatistics {
  station_id: number;
  period_hours: number;
  count: number;
  minimum?: number;
  maximum?: number;
  average?: number;
  median?: number;
  unit: string;
  from_date?: string;
  to_date?: string;
}

export interface OfficialAlert {
  id: number;
  external_id?: string;
  source_id: number;
  source_code?: string;
  source_name?: string;
  title: string;
  description: string;
  severity: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  published_at: string;
  starts_at?: string;
  ends_at?: string;
  affected_area?: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}
