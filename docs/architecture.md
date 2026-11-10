# Architecture

Radiation France (repository: `Radiator`) is composed of a React web application, a Node/Express server used by the default frontend workflow, and a separate Python API backend. The two servers are distinct: running the frontend does not start or connect it to the Python backend.

## Web application and default API

The web application is built with React 19, TypeScript, Vite 8, and Tailwind CSS 4. Leaflet / React-Leaflet provide map components; Recharts renders charts. `src/` contains the pages, UI components, client-side services, connectors, and bundled data.

`npm run dev` starts `server.ts`. This Express server integrates Vite for development and exposes the frontend's `/api/v1` routes. The public landing page is rendered at `/`; the existing React application is rendered at `/app`, with its selected tab optionally supplied by `?tab=map`, `?tab=sources`, and other existing tab IDs. API paths remain under `/api/v1`. The PWA manifest starts at `/app` so installed users continue to open the application. The server contains source connector attempts as well as local fixtures, generated or preloaded values, and some hard-coded health counters. A returned station, measurement, or count is not inherently evidence that a source is connected or that the value is a live observation. Check the relevant route and its source/status metadata before interpreting it.

## Separate Python backend

`backend/` contains a FastAPI application and Python source connectors, using SQLAlchemy and its configured database integration. It is an independent service. It is not started by `npm run dev`, and no default frontend configuration was identified that wires the web client to this backend. Its connector code indicates implementation intent, not successful access to a source or availability of current measurements.

## Local persistence, charts, and maps

The frontend uses Dexie over IndexedDB for local data persistence and cache behavior. `ApiService` can attempt to use cached responses after network errors; cached content may be incomplete or stale. Recharts presents time series, and Leaflet provides mapping. Any interpolation or visualization derived from sparse measurements is an estimate, not a sensor observation.

## Progressive web app and offline behavior

The project configures `vite-plugin-pwa` / Workbox, including static asset caching and caching rules for selected API requests and map tiles. The development server disables the service worker. Offline availability therefore depends on which resources were previously cached and on the runtime cache strategy; it is not guaranteed for a first visit or for every screen and data source. IndexedDB cache fallback does not make cached values current.

## Source and data integrity caveats

- Téléray catalog metadata does not establish access to a direct, live measurement feed.
- The default server contains demo fixtures and other local values. Some UI badges and summary counters are static and may not reflect connector state.
- The alert ledger is initialized locally, and the timeline is bundled under `src/data/timelineEvents.ts`; neither is a verified live official feed.
- The Python backend's connectors are separate from the default frontend server.
- A connector being present, an API returning a successful response, or a station appearing on a map is not sufficient proof of measurement provenance. Use explicit source attribution and status, and verify against the data publisher before treating values as operational.

See [sources.md](sources.md) for the documented connector status and attribution cautions.
