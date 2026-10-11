import type { Station } from '../types/radiation';

export interface InterpolationBounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

export const FRANCE_INTERPOLATION_BOUNDS: InterpolationBounds = {
  south: 41.3,
  north: 51.3,
  west: -5.4,
  east: 9.8,
};

export interface InterpolatedPointResult {
  estimatedDose: number;
  confidencePercent: number;
  nearestStationName: string;
  nearestStationDose: number;
  distanceKm: number;
}

// Fast approximate distance in km
function fastDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const midLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dx = (lon2 - lon1) * Math.cos(midLat) * 111.32;
  const dy = (lat2 - lat1) * 110.57;
  return Math.sqrt(dx * dx + dy * dy);
}

// Color scale mapping for gamma radiation in nSv/h
function getColorForDose(dose: number): [number, number, number] {
  if (dose < 75) {
    // Bleu ciel profond (bassins très faibles)
    return [14, 165, 233];
  } else if (dose < 95) {
    // Sarcelle / Cyan (bassin parisien calcaire ~85 nSv/h)
    const t = (dose - 75) / 20;
    return [
      Math.round(14 + (20 - 14) * t),
      Math.round(165 + (184 - 165) * t),
      Math.round(233 + (166 - 233) * t),
    ];
  } else if (dose < 115) {
    // Émeraude (fond nominal moyen France ~90-110 nSv/h)
    const t = (dose - 95) / 20;
    return [
      Math.round(20 + (16 - 20) * t),
      Math.round(184 + (185 - 184) * t),
      Math.round(166 + (129 - 166) * t),
    ];
  } else if (dose < 140) {
    // Ambre / Doré (socles armoricains bretons & transitions ~115-135 nSv/h)
    const t = (dose - 115) / 25;
    return [
      Math.round(16 + (245 - 16) * t),
      Math.round(185 + (158 - 185) * t),
      Math.round(129 + (11 - 129) * t),
    ];
  } else if (dose < 170) {
    // Orange cuivré (socle granitique limousin hercynien ~140-165 nSv/h)
    const t = (dose - 140) / 30;
    return [
      Math.round(245 + (249 - 245) * t),
      Math.round(158 + (115 - 158) * t),
      Math.round(11 + (22 - 11) * t),
    ];
  } else {
    // Rouge carmin (anomalies ou reliefs granitiques élevés)
    return [239, 68, 68];
  }
}

/**
 * 📊 Interpolate single coordinate point using IDW (Inverse Distance Weighting)
 */
export function interpolatePointDose(
  lat: number,
  lon: number,
  stations: Station[]
): InterpolatedPointResult | null {
  const valid = stations.filter(
    s =>
      s.latest_measurement &&
      typeof s.latest_measurement.value === 'number' &&
      s.latest_measurement.value > 0 &&
      (!s.measurement_type || s.measurement_type === 'AMBIENT_GAMMA_DOSE_RATE' || s.source_code === 'TELERAY')
  );

  if (valid.length === 0) return null;

  let sumWeight = 0;
  let sumVal = 0;
  let minDistance = Infinity;
  let nearestStation: Station = valid[0];

  const maxDistanceKm = 180;
  const power = 2;
  const smooth = 12;

  for (const s of valid) {
    const d = fastDistanceKm(lat, lon, s.latitude, s.longitude);
    if (d < minDistance) {
      minDistance = d;
      nearestStation = s;
    }

    if (d <= maxDistanceKm) {
      const w = 1 / Math.pow(d + smooth, power);
      sumWeight += w;
      sumVal += w * s.latest_measurement!.value;
    }
  }

  if (minDistance > maxDistanceKm || sumWeight === 0) {
    return null;
  }

  const estimatedDose = Math.round((sumVal / sumWeight) * 10) / 10;
  const confidencePercent = Math.max(10, Math.min(98, Math.round((1 - minDistance / maxDistanceKm) * 100)));

  return {
    estimatedDose,
    confidencePercent,
    nearestStationName: nearestStation.commune || nearestStation.name,
    nearestStationDose: nearestStation.latest_measurement!.value,
    distanceKm: Math.round(minDistance),
  };
}

/**
 * 🗺️ Generate continuous spatial distribution heat raster as Data URL
 * Uses client-side off-screen canvas with IDW interpolation.
 */
export function generateHeatmapDataUrl(
  stations: Station[],
  bounds: InterpolationBounds = FRANCE_INTERPOLATION_BOUNDS,
  width = 240,
  height = 240
): string | null {
  if (typeof document === 'undefined') return null;

  // Filter gamma stations with positive dose rate
  const gammaStations = stations
    .map(s => ({
      lat: s.latitude,
      lon: s.longitude,
      val: s.latest_measurement?.value,
      isOffline: s.is_active === false || s.latest_measurement?.quality_status === 'MISSING',
    }))
    .filter(
      (s): s is { lat: number; lon: number; val: number; isOffline: boolean } =>
        typeof s.val === 'number' && s.val > 0 && !s.isOffline
    );

  if (gammaStations.length === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const latSpan = bounds.north - bounds.south;
  const lonSpan = bounds.east - bounds.west;
  const maxDistKm = 175;
  const power = 1.9;
  const smooth = 10;

  for (let y = 0; y < height; y++) {
    // y goes from top (north) to bottom (south)
    const lat = bounds.north - (y / height) * latSpan;
    const midLatRad = lat * (Math.PI / 180);
    const cosLat = Math.cos(midLatRad);

    for (let x = 0; x < width; x++) {
      // x goes from left (west) to right (east)
      const lon = bounds.west + (x / width) * lonSpan;

      let sumWeight = 0;
      let sumVal = 0;
      let minDistSq = Infinity;

      for (let i = 0; i < gammaStations.length; i++) {
        const s = gammaStations[i];
        const dx = (lon - s.lon) * cosLat * 111.32;
        const dy = (lat - s.lat) * 110.57;
        const dSq = dx * dx + dy * dy;

        if (dSq < minDistSq) {
          minDistSq = dSq;
        }

        if (dSq <= maxDistKm * maxDistKm) {
          const d = Math.sqrt(dSq);
          const w = 1 / Math.pow(d + smooth, power);
          sumWeight += w;
          sumVal += w * s.val;
        }
      }

      const pixelIndex = (y * width + x) * 4;
      const minDist = Math.sqrt(minDistSq);

      if (minDist > maxDistKm || sumWeight === 0) {
        // Transparent outside station coverage
        data[pixelIndex] = 0;
        data[pixelIndex + 1] = 0;
        data[pixelIndex + 2] = 0;
        data[pixelIndex + 3] = 0;
      } else {
        const interpolatedDose = sumVal / sumWeight;
        const [r, g, b] = getColorForDose(interpolatedDose);

        // Alpha falloff based on distance from nearest sensor
        const fadeFactor = Math.pow(Math.max(0, 1 - minDist / maxDistKm), 0.7);
        const alpha = Math.round(fadeFactor * 210); // Max opacity ~82%

        data[pixelIndex] = r;
        data[pixelIndex + 1] = g;
        data[pixelIndex + 2] = b;
        data[pixelIndex + 3] = alpha;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL();
}
