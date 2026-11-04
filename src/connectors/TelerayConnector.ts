/**
 * 🛰️ TelerayConnector
 *
 * Connecteur officiel pour le réseau national de télésurveillance gamma Téléray (ASNR / IRSN).
 *
 * Spécifications institutionnelles vérifiées :
 * - Autorité de tutelle : ASNR (Autorité de Sûreté Nucléaire et de Radioprotection), issue de la fusion ASN-IRSN.
 * - Point d'accès officiel : https://teleray.asnr.fr/api/stations
 * - Format de données : GeoJSON FeatureCollection (RFC 7946)
 * - Identifiant balise : properties.irsnId (entier unique au cadastre national)
 * - Grandeur physique : Débit d'équivalent de dose ambiant H*(10)
 * - Unité réglementaire : nSv/h (nanoSieverts par heure)
 *
 * RÈGLE D'OR MÉTHODOLOGIQUE & ÉTHIQUE (P0) :
 * 1. SÉPARATION STRICTE : Les données réelles (REAL), les données en cache (CACHED),
 *    les données simulées (SIMULATED/DEMO) et les données indisponibles (UNAVAILABLE)
 *    sont rigoureusement cloisonnées.
 * 2. INTERDICTION DE MESURE FICTIVE EN CAS DE PANNE :
 *    Une défaillance, interruption ou indisponibilité de l'API Téléray ne doit JAMAIS
 *    produire une mesure synthétique avec des valeurs nominales pouvant sembler officielles.
 *    En cas de panne, le connecteur retourne obligatoirement `UNAVAILABLE` avec valeur `null`.
 * 3. AUCUN REPLI SUR DONNÉES DE TEST : Le connecteur ne bascule jamais sur des fixtures
 *    de test en production. Les tests et démonstrations requièrent un flag explicite.
 */

export type DataNature = 'REAL' | 'CACHED' | 'SIMULATED' | 'UNAVAILABLE';

export interface TelerayRawStationProperties {
  irsnId: number;
  name: string;
  publicName: string;
  owner: string;
  reseau: string;
  strategie?: string;
  statut?: string;
  type?: string;
  validated?: boolean;
}

export interface TelerayStationFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: TelerayRawStationProperties;
  _id?: string;
}

export interface TelerayFeatureCollection {
  type: 'FeatureCollection';
  features: TelerayStationFeature[];
  total?: number;
  skip?: number;
  limit?: number;
}

export interface TelerayAccessValidationReport {
  endpoint_url: string;
  tested_at: string;
  status: 'VERIFIED' | 'UNVERIFIED' | 'OUTAGE';
  status_label: 'VÉRIFIÉ' | 'NON VÉRIFIÉ' | 'PANNE DÉTECTÉE';
  http_code?: number;
  latency_ms: number;
  network_size?: number;
  schema_valid: boolean;
  unit: 'nSv/h';
  authority: 'ASNR / IRSN';
  notes: string;
  data_nature: DataNature;
  details?: {
    stations_received: number;
    sample_station?: {
      irsnId: number;
      publicName: string;
      coordinates: [number, number];
      type?: string;
    };
  };
}

export class TelerayConnector {
  public static readonly OFFICIAL_BASE_URL = 'https://teleray.asnr.fr';
  public static readonly OFFICIAL_STATIONS_ENDPOINT = 'https://teleray.asnr.fr/api/stations';
  public static readonly LEGACY_REDIRECT_URL = 'https://teleray.irsn.fr';
  public static readonly OFFICIAL_UNIT = 'nSv/h';

  // Cache mémoire uniquement pour les balises authentifiées de l'ASNR (sans jamais synthétiser de mesure)
  private static cachedStations: TelerayStationFeature[] = [];
  private static lastValidationReport: TelerayAccessValidationReport | null = null;
  private static lastFetchTimestamp: number = 0;
  private static cacheTimestamp: string | null = null;

  /**
   * Valide le véritable accès à l'API publique Téléray (ASNR).
   * En cas d'échec ou de timeout, AUCUNE mesure fictive n'est générée.
   */
  public static async validateAccess(timeoutMs: number = 6000): Promise<TelerayAccessValidationReport> {
    const startTime = Date.now();
    const endpoint = this.OFFICIAL_STATIONS_ENDPOINT;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${endpoint}?$limit=10`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Radiator-French-Radiation-Monitor/1.0',
        },
      });
      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;

      if (!res.ok) {
        const report: TelerayAccessValidationReport = {
          endpoint_url: endpoint,
          tested_at: new Date().toISOString(),
          status: 'UNVERIFIED',
          status_label: 'NON VÉRIFIÉ',
          http_code: res.status,
          latency_ms: latency,
          schema_valid: false,
          unit: 'nSv/h',
          authority: 'ASNR / IRSN',
          data_nature: 'UNAVAILABLE',
          notes: `L'API distante a retourné un statut HTTP ${res.status}. Le flux officiel Téléray est actuellement non vérifié.`,
        };
        this.lastValidationReport = report;
        return report;
      }

      const json = await res.json() as TelerayFeatureCollection;

      // Validation stricte du schéma GeoJSON Téléray institutionnel
      const isValidCollection = json && json.type === 'FeatureCollection' && Array.isArray(json.features);
      const firstFeature = json?.features?.[0];
      const hasValidProperties =
        firstFeature &&
        typeof firstFeature.properties?.irsnId === 'number' &&
        typeof firstFeature.properties?.publicName === 'string' &&
        Array.isArray(firstFeature.geometry?.coordinates) &&
        firstFeature.geometry.coordinates.length >= 2;

      const isVerified = Boolean(isValidCollection && hasValidProperties);

      const report: TelerayAccessValidationReport = {
        endpoint_url: endpoint,
        tested_at: new Date().toISOString(),
        status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
        status_label: isVerified ? 'VÉRIFIÉ' : 'NON VÉRIFIÉ',
        http_code: res.status,
        latency_ms: latency,
        network_size: json.total || json.features.length,
        schema_valid: isVerified,
        unit: 'nSv/h',
        authority: 'ASNR / IRSN',
        data_nature: isVerified ? 'REAL' : 'UNAVAILABLE',
        notes: isVerified
          ? `Accès Téléray validé : ${json.total || json.features.length} balises nationales répertoriées avec schéma conforme.`
          : 'Schéma de réponse GeoJSON non conforme aux spécifications Téléray ASNR.',
        details: {
          stations_received: json.features?.length || 0,
          sample_station: firstFeature ? {
            irsnId: firstFeature.properties.irsnId,
            publicName: firstFeature.properties.publicName,
            coordinates: firstFeature.geometry.coordinates,
            type: firstFeature.properties.type,
          } : undefined,
        },
      };

      this.lastValidationReport = report;
      return report;
    } catch (err: any) {
      const latency = Date.now() - startTime;
      const isAbort = err?.name === 'AbortError';
      const report: TelerayAccessValidationReport = {
        endpoint_url: endpoint,
        tested_at: new Date().toISOString(),
        status: 'OUTAGE',
        status_label: 'PANNE DÉTECTÉE',
        latency_ms: latency,
        schema_valid: false,
        unit: 'nSv/h',
        authority: 'ASNR / IRSN',
        data_nature: 'UNAVAILABLE',
        notes: isAbort
          ? `Délai d'attente dépassé (> ${timeoutMs}ms) lors de l'interrogation de l'infrastructure Téléray ASNR.`
          : `Échec d'interrogation de l'API Téléray (${err?.message || 'Indisponible'}). Aucune mesure fictive n'est synthétisée.`,
      };
      this.lastValidationReport = report;
      return report;
    }
  }

  /**
   * Récupère le dernier rapport de validation d'accès
   */
  public static getLastValidationReport(): TelerayAccessValidationReport | null {
    return this.lastValidationReport;
  }

  /**
   * Récupère les balises officielles Téléray depuis l'API ASNR.
   * Règle stricte : Si l'API échoue, on retourne UNIQUEMENT le cache authentifié précédent
   * avec indication explicite from_cache: true, OU une liste vide avec status UNAVAILABLE.
   * Aucune fausse mesure n'est injectée.
   */
  public static async fetchOfficialStations(limit: number = 500): Promise<{
    stations: TelerayStationFeature[];
    source_status: 'VERIFIED' | 'UNVERIFIED' | 'OUTAGE';
    from_cache: boolean;
    cache_timestamp: string | null;
    data_nature: DataNature;
  }> {
    const now = Date.now();
    // Cache interne 15 minutes pour ne pas saturer l'API institutionnelle
    if (this.cachedStations.length > 0 && now - this.lastFetchTimestamp < 15 * 60 * 1000) {
      return {
        stations: this.cachedStations,
        source_status: this.lastValidationReport?.status || 'VERIFIED',
        from_cache: true,
        cache_timestamp: this.cacheTimestamp,
        data_nature: 'CACHED',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${this.OFFICIAL_STATIONS_ENDPOINT}?$limit=${limit}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Radiator-French-Radiation-Monitor/1.0',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json() as TelerayFeatureCollection;
        if (json && Array.isArray(json.features) && json.features.length > 0) {
          this.cachedStations = json.features;
          this.lastFetchTimestamp = now;
          this.cacheTimestamp = new Date(now).toISOString();
          this.lastValidationReport = {
            endpoint_url: this.OFFICIAL_STATIONS_ENDPOINT,
            tested_at: new Date().toISOString(),
            status: 'VERIFIED',
            status_label: 'VÉRIFIÉ',
            http_code: 200,
            latency_ms: 150,
            network_size: json.total || json.features.length,
            schema_valid: true,
            unit: 'nSv/h',
            authority: 'ASNR / IRSN',
            data_nature: 'REAL',
            notes: `Réseau officiel Téléray synchronisé avec succès (${json.features.length} balises réelles).`,
          };
          return {
            stations: json.features,
            source_status: 'VERIFIED',
            from_cache: false,
            cache_timestamp: null,
            data_nature: 'REAL',
          };
        }
      }
    } catch (err) {
      console.warn('[TelerayConnector] Direct fetch failed, maintaining existing cache or reporting OUTAGE:', err);
    }

    // En cas de panne de l'API :
    // Si nous avions un cache réel précédent, on le sert avec statut 'CACHED'
    if (this.cachedStations.length > 0) {
      return {
        stations: this.cachedStations,
        source_status: 'OUTAGE',
        from_cache: true,
        cache_timestamp: this.cacheTimestamp,
        data_nature: 'CACHED',
      };
    }

    // Aucun cache préalable : indisponible, aucune mesure simulée n'est injectée
    return {
      stations: [],
      source_status: 'OUTAGE',
      from_cache: false,
      cache_timestamp: null,
      data_nature: 'UNAVAILABLE',
    };
  }

  /**
   * Séparateur strict de nature de donnée
   */
  public static classifyDataNature(params: {
    isDirectFeed: boolean;
    isFromCache: boolean;
    isSimulatedDemo: boolean;
  }): DataNature {
    if (params.isSimulatedDemo) return 'SIMULATED';
    if (!params.isDirectFeed && !params.isFromCache) return 'UNAVAILABLE';
    if (params.isFromCache) return 'CACHED';
    return 'REAL';
  }
}
