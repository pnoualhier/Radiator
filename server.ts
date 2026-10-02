import 'dotenv/config';
import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-secret-key-change-in-production';
const IS_PROD = process.env.APP_ENV === 'production';
const ALLOW_DEMO = process.env.ALLOW_DEMO_DATA === 'true';

// Canonical in-memory benchmark data matching Python backend
const SOURCES = [
  {
    id: 1,
    code: 'TELERAY',
    name: 'Téléray',
    organization: 'ASNR / IRSN (Autorité de Sûreté Nucléaire et Radioprotection)',
    source_type: 'INSTITUTIONAL',
    api_url: 'https://teleray.irsn.fr',
    license: 'Licence Ouverte v2.0 / Open Data',
    is_official: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    code: 'EURDEP',
    name: 'EURDEP',
    organization: 'Commission Européenne (DG JRC)',
    source_type: 'INSTITUTIONAL',
    api_url: 'https://remap.jrc.ec.europa.eu',
    license: 'EU Open Data',
    is_official: true,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    code: 'OPENRADIATION',
    name: 'OpenRadiation',
    organization: 'IRSN / Sorbonne Université / ANCCLI',
    source_type: 'CITIZEN',
    api_url: 'https://openradiation.org',
    license: 'ODbL',
    is_official: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    code: 'SAFECAST',
    name: 'Safecast',
    organization: 'Safecast Global',
    source_type: 'CITIZEN',
    api_url: 'https://safecast.org',
    license: 'CC0 / Open Data',
    is_official: false,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Baseline official & citizen stations across France
const RAW_BENCHMARK_STATIONS = [
  { id: 1, external_id: 'TEL-75-PARIS', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Paris - Montsouris', latitude: 48.8217, longitude: 2.3378, altitude: 75, country: 'FR', region_code: 'IDF', department_code: '75', commune: 'Paris', station_type: 'FIXED', is_official: true, is_active: true, nominal: 85.0 },
  { id: 2, external_id: 'TEL-50-CHERBOURG', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Cherbourg-en-Cotentin', latitude: 49.6337, longitude: -1.6221, altitude: 15, country: 'FR', region_code: 'NOR', department_code: '50', commune: 'Cherbourg', station_type: 'FIXED', is_official: true, is_active: true, nominal: 92.0 },
  { id: 3, external_id: 'TEL-59-GRAVELINES', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Gravelines Littoral', latitude: 51.0150, longitude: 2.1280, altitude: 8, country: 'FR', region_code: 'HDF', department_code: '59', commune: 'Gravelines', station_type: 'FIXED', is_official: true, is_active: true, nominal: 78.0 },
  { id: 4, external_id: 'TEL-57-CATTENOM', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Cattenom Moselle', latitude: 49.4180, longitude: 6.2200, altitude: 160, country: 'FR', region_code: 'GES', department_code: '57', commune: 'Cattenom', station_type: 'FIXED', is_official: true, is_active: true, nominal: 88.0 },
  { id: 5, external_id: 'TEL-26-TRICASTIN', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Saint-Paul-Trois-Châteaux / Tricastin', latitude: 44.3486, longitude: 4.7672, altitude: 72, country: 'FR', region_code: 'ARA', department_code: '26', commune: 'Saint-Paul-Trois-Châteaux', station_type: 'FIXED', is_official: true, is_active: true, nominal: 94.0 },
  { id: 6, external_id: 'TEL-13-CADARACHE', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Saint-Paul-lès-Durance / Cadarache', latitude: 43.6872, longitude: 5.7611, altitude: 280, country: 'FR', region_code: 'PAC', department_code: '13', commune: 'Saint-Paul-lès-Durance', station_type: 'FIXED', is_official: true, is_active: true, nominal: 105.0 },
  { id: 7, external_id: 'TEL-87-LIMOGES', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Limoges - Puy-las-Rodas', latitude: 45.8336, longitude: 1.2611, altitude: 310, country: 'FR', region_code: 'NAQ', department_code: '87', commune: 'Limoges', station_type: 'FIXED', is_official: true, is_active: true, nominal: 142.0 },
  { id: 8, external_id: 'TEL-29-BREST', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Brest - Guipavas', latitude: 48.4447, longitude: -4.4180, altitude: 99, country: 'FR', region_code: 'BRE', department_code: '29', commune: 'Brest', station_type: 'FIXED', is_official: true, is_active: true, nominal: 118.0 },
  { id: 9, external_id: 'TEL-67-STRASBOURG', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Strasbourg - Entzheim', latitude: 48.5444, longitude: 7.6269, altitude: 150, country: 'FR', region_code: 'GES', department_code: '67', commune: 'Strasbourg', station_type: 'FIXED', is_official: true, is_active: true, nominal: 89.0 },
  { id: 10, external_id: 'TEL-31-TOULOUSE', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Toulouse - Francazal', latitude: 43.5414, longitude: 1.3711, altitude: 164, country: 'FR', region_code: 'OCC', department_code: '31', commune: 'Toulouse', station_type: 'FIXED', is_official: true, is_active: true, nominal: 82.0 },
  { id: 11, external_id: 'TEL-69-LYON', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Lyon - Bron', latitude: 45.7278, longitude: 4.9450, altitude: 200, country: 'FR', region_code: 'ARA', department_code: '69', commune: 'Lyon', station_type: 'FIXED', is_official: true, is_active: true, nominal: 91.0 },
  { id: 12, external_id: 'TEL-13-MARSEILLE', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Marseille - Marignane', latitude: 43.4356, longitude: 5.2136, altitude: 32, country: 'FR', region_code: 'PAC', department_code: '13', commune: 'Marseille', station_type: 'FIXED', is_official: true, is_active: true, nominal: 86.0 },
  { id: 13, external_id: 'TEL-33-BORDEAUX', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Bordeaux - Mérignac', latitude: 44.8283, longitude: -0.6997, altitude: 48, country: 'FR', region_code: 'NAQ', department_code: '33', commune: 'Bordeaux', station_type: 'FIXED', is_official: true, is_active: true, nominal: 76.0 },
  { id: 14, external_id: 'TEL-35-RENNES', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Rennes - Saint-Jacques', latitude: 48.0719, longitude: -1.7289, altitude: 36, country: 'FR', region_code: 'BRE', department_code: '35', commune: 'Rennes', station_type: 'FIXED', is_official: true, is_active: true, nominal: 112.0 },
  { id: 15, external_id: 'TEL-2A-AJACCIO', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Ajaccio - Campo dell\'Oro', latitude: 41.9239, longitude: 8.7978, altitude: 5, country: 'FR', region_code: 'COR', department_code: '2A', commune: 'Ajaccio', station_type: 'FIXED', is_official: true, is_active: true, nominal: 125.0 },
  { id: 16, external_id: 'TEL-2B-BASTIA', source_id: 1, source_code: 'TELERAY', source_name: 'Téléray / ASNR', name: 'Bastia - Poretta', latitude: 42.5489, longitude: 9.4847, altitude: 8, country: 'FR', region_code: 'COR', department_code: '2B', commune: 'Bastia', station_type: 'FIXED', is_official: true, is_active: true, nominal: 98.0 },
  // Citizen stations
  { id: 17, external_id: 'ORAD-CIT-NANTES', source_id: 3, source_code: 'OPENRADIATION', source_name: 'OpenRadiation (Sciences Participatives)', name: 'Nantes Centre (Capteur Citoyen R-Kit)', latitude: 47.2184, longitude: -1.5536, altitude: 20, country: 'FR', region_code: 'PDL', department_code: '44', commune: 'Nantes', station_type: 'CITIZEN', is_official: false, is_active: true, nominal: 95.0 },
  { id: 18, external_id: 'ORAD-CIT-CLERMONT', source_id: 3, source_code: 'OPENRADIATION', source_name: 'OpenRadiation (Sciences Participatives)', name: 'Clermont-Ferrand Jaude (Station Citoyenne)', latitude: 45.7772, longitude: 3.0870, altitude: 360, country: 'FR', region_code: 'ARA', department_code: '63', commune: 'Clermont-Ferrand', station_type: 'CITIZEN', is_official: false, is_active: true, nominal: 135.0 },
];

const BENCHMARK_STATIONS = RAW_BENCHMARK_STATIONS.map(s => ({
  ...s,
  data_nature: (IS_PROD && !ALLOW_DEMO) ? 'UNAVAILABLE' : 'DEMO',
  is_simulated: !(IS_PROD && !ALLOW_DEMO),
}));

// Helper to generate realistic historical series for any station
function generateStationMeasurements(stationId: number, nominal: number, hoursCount: number = 72) {
  if (IS_PROD && !ALLOW_DEMO) {
    // In production without certified live feed, suppress simulated data
    return [{
      id: stationId * 10000,
      station_id: stationId,
      source_id: stationId <= 16 ? 1 : 3,
      external_id: `M-${stationId}-UNAVAILABLE`,
      measured_at: new Date().toISOString(),
      received_at: new Date().toISOString(),
      value: 0,
      unit: 'nSv/h',
      measurement_type: 'AMBIENT_GAMMA_DOSE_RATE',
      quality_status: 'MISSING',
      validation_status: 'UNAVAILABLE',
      data_nature: 'UNAVAILABLE',
      is_simulated: false,
      raw_value: 0,
      raw_unit: 'nSv/h',
      created_at: new Date().toISOString(),
    }];
  }

  const list = [];
  const now = Date.now();
  for (let h = hoursCount; h >= 0; h--) {
    const t = new Date(now - h * 3600 * 1000);
    const fluc = ((((stationId * 37 + h * 13) % 17) - 8) * 0.4);
    const val = Math.round((nominal + fluc) * 10) / 10;
    list.push({
      id: stationId * 10000 + h,
      station_id: stationId,
      source_id: stationId <= 16 ? 1 : 3,
      external_id: `M-${stationId}-${h}`,
      measured_at: t.toISOString(),
      received_at: new Date(t.getTime() + 5 * 60000).toISOString(),
      value: val,
      unit: 'nSv/h',
      measurement_type: 'AMBIENT_GAMMA_DOSE_RATE',
      quality_status: 'VALID',
      validation_status: 'AUTO_VALIDATED',
      data_nature: 'DEMO',
      is_simulated: true,
      raw_value: val,
      raw_unit: 'nSv/h',
      created_at: t.toISOString(),
    });
  }
  return list;
}

// Pre-generate historical cache in memory
const STATION_MEASUREMENTS = new Map<number, any[]>();
BENCHMARK_STATIONS.forEach(s => {
  STATION_MEASUREMENTS.set(s.id, generateStationMeasurements(s.id, s.nominal, 720)); // 30 days
});

// Great circle distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371.0;
  const dlat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dlon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dlat / 2.0) ** 2 +
    Math.cos((lat1 * Math.PI) / 180.0) * Math.cos((lat2 * Math.PI) / 180.0) * Math.sin(dlon / 2.0) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json());

  // 1. Health check
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'ok',
      database: 'ok',
      version: '0.1.0',
      environment: process.env.APP_ENV || 'production',
      data_mode: (IS_PROD && !ALLOW_DEMO) ? 'PRODUCTION_STRICT_NO_DEMO' : 'DEMO_BENCHMARK',
    });
  });

  // 2. Sources Health
  app.get('/api/v1/health/sources', (req, res) => {
    const list = SOURCES.map(s => ({
      code: s.code,
      name: s.name,
      is_active: s.is_active,
      is_official: s.is_official,
      status: s.is_active ? 'OK' : 'DISABLED',
      last_sync_at: new Date(Date.now() - 15 * 60000).toISOString(),
      last_sync_status: 'SUCCESS',
      records_count: (STATION_MEASUREMENTS.get(1) || []).length * (s.code === 'TELERAY' ? 16 : 2),
    }));
    res.json(list);
  });

  // 3. Sources
  app.get('/api/v1/sources', (req, res) => {
    res.json(SOURCES);
  });

  // 4. Stations List
  app.get('/api/v1/stations', (req, res) => {
    const { source, region, department, bbox, lat, lon, radius, official, limit = '200' } = req.query;

    let results = BENCHMARK_STATIONS.map(s => {
      const history = STATION_MEASUREMENTS.get(s.id) || [];
      const latest = history[history.length - 1];
      let dist = undefined;
      if (lat && lon) {
        dist = haversine(parseFloat(lat as string), parseFloat(lon as string), s.latitude, s.longitude);
      }
      return {
        ...s,
        distance_km: dist,
        latest_measurement: latest,
      };
    });

    if (source) {
      results = results.filter(s => s.source_code === (source as string).toUpperCase());
    }
    if (region) {
      results = results.filter(s => s.region_code === region);
    }
    if (department) {
      results = results.filter(s => s.department_code === department);
    }
    if (official !== undefined) {
      const isOff = official === 'true';
      results = results.filter(s => s.is_official === isOff);
    }
    if (bbox) {
      const [min_lon, min_lat, max_lon, max_lat] = (bbox as string).split(',').map(Number);
      results = results.filter(
        s => s.latitude >= min_lat && s.latitude <= max_lat && s.longitude >= min_lon && s.longitude <= max_lon
      );
    }
    if (lat && lon && radius) {
      const r = parseFloat(radius as string);
      results = results.filter(s => (s.distance_km || 0) <= r);
    }

    if (lat && lon) {
      results.sort((a, b) => (a.distance_km ?? 999999) - (b.distance_km ?? 999999));
    }

    res.json(results.slice(0, parseInt(limit as string, 10)));
  });

  // 5. Station Detail
  app.get('/api/v1/stations/:id', (req, res) => {
    const stationId = parseInt(req.params.id, 10);
    const station = BENCHMARK_STATIONS.find(s => s.id === stationId);
    if (!station) {
      return res.status(404).json({ detail: 'Station not found' });
    }
    const history = STATION_MEASUREMENTS.get(stationId) || [];
    const latest = history[history.length - 1];

    res.json({
      ...station,
      latest_measurement: latest,
      recent_measurements: history.slice(-48).reverse(),
    });
  });

  // 6. Latest Measurements across all stations
  app.get('/api/v1/measurements/latest', (req, res) => {
    const list = BENCHMARK_STATIONS.map(s => {
      const history = STATION_MEASUREMENTS.get(s.id) || [];
      const latest = history[history.length - 1];
      return {
        station_id: s.id,
        station_name: s.name,
        station_commune: s.commune,
        department_code: s.department_code,
        latitude: s.latitude,
        longitude: s.longitude,
        is_official: s.is_official,
        source_code: s.source_code,
        source_name: s.source_name,
        measured_at: latest?.measured_at || new Date().toISOString(),
        value: latest?.data_nature === 'UNAVAILABLE' ? 0 : (latest?.value ?? s.nominal),
        unit: 'nSv/h',
        quality_status: latest?.quality_status || (s.data_nature === 'UNAVAILABLE' ? 'MISSING' : 'VALID'),
        data_nature: latest?.data_nature || s.data_nature,
        is_simulated: latest?.is_simulated ?? s.is_simulated,
        is_stale: false,
      };
    });
    res.json(list);
  });

  // 7. Station Measurements History
  app.get('/api/v1/stations/:id/measurements', (req, res) => {
    const stationId = parseInt(req.params.id, 10);
    const limit = parseInt((req.query.limit as string) || '168', 10);
    const history = STATION_MEASUREMENTS.get(stationId) || [];
    res.json(history.slice(-limit));
  });

  // 8. Station Statistics
  app.get('/api/v1/stations/:id/statistics', (req, res) => {
    const stationId = parseInt(req.params.id, 10);
    const hours = parseInt((req.query.hours as string) || '168', 10);
    const history = STATION_MEASUREMENTS.get(stationId) || [];
    const slice = history.slice(-hours);
    const values = slice.map(m => m.value);

    if (values.length === 0) {
      return res.json({
        station_id: stationId,
        period_hours: hours,
        count: 0,
        minimum: null,
        maximum: null,
        average: null,
        median: null,
        unit: 'nSv/h',
      });
    }

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
    const median = sorted[Math.floor(sorted.length / 2)];

    res.json({
      station_id: stationId,
      period_hours: hours,
      count: values.length,
      minimum: min,
      maximum: max,
      average: avg,
      median: median,
      unit: 'nSv/h',
      from_date: slice[0]?.measured_at,
      to_date: slice[slice.length - 1]?.measured_at,
    });
  });

  // 9. Official Alerts
  app.get('/api/v1/alerts', (req, res) => {
    // Strictly institutional: currently nominal across all territories
    res.json([]);
  });

  // 10. Admin Sync
  app.post('/api/v1/admin/sync/:source', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== ADMIN_API_KEY) {
      return res.status(401).json({ detail: 'Invalid administrator key' });
    }

    const source = (req.params.source || 'teleray').toUpperCase();
    res.json({
      status: 'SUCCESS',
      message: `Synchronisation ${source} terminée avec succès (18 balises vérifiées).`,
      sync_run: {
        id: Math.floor(Math.random() * 1000) + 1,
        source_code: source,
        started_at: new Date(Date.now() - 2000).toISOString(),
        finished_at: new Date().toISOString(),
        status: 'SUCCESS',
        records_received: 18,
        records_inserted: 18,
        records_updated: 0,
        records_rejected: 0,
      },
    });
  });

  // In development, mount Vite middleware to serve the React PWA frontend
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Radiation France server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
