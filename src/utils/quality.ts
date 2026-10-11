/**
 * Système de Qualité et Fraîcheur des Télémesures
 * Conforme aux standards de surveillance de l'ASNR (Autorité de Sûreté Nucléaire et Radioprotection)
 */

export type QualityStatus = 'VALID' | 'SUSPECT' | 'MISSING' | 'STALE' | 'INVALID';

export interface QualityEvaluation {
  status: QualityStatus;
  isStale: boolean;
  relativeTime: string;
  shortLabel: string;
  badgeLabel: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  description: string;
  diffMinutes: number;
  diffHours: number;
}

/**
 * Seuils d'obsolescence (stale) selon la cinétique de chaque réseau
 */
export function getStaleThresholdHours(sourceCode?: string, measurementType?: string): number {
  if (sourceCode === 'OPERA_AIR' || measurementType === 'ATMOSPHERIC_AEROSOLS') {
    // Aérosols : prélèvements hebdomadaires de 7 jours + 5 jours d'analyse spectrométrique
    return 24 * 10; // 10 jours
  }
  if (sourceCode === 'HYDROTELERAY' || measurementType === 'WATER_RADIOACTIVITY') {
    // Eaux fluviales : mesure en continu
    return 12; // 12 heures
  }
  if (sourceCode === 'OPENRADIATION' || sourceCode === 'SAFECAST') {
    // Capteurs citoyens
    return 24; // 24 heures
  }
  // Téléray & EURDEP : réseau de télémesure gamma à haute fréquence (transmission horaire/infra-horaire)
  // Téléray est considéré ancien au-delà de 2 heures
  return 2;
}

/**
 * Évalue la qualité et la fraîcheur d'une mesure
 */
export function evaluateMeasurementQuality(
  measuredAt?: string | null,
  rawQualityStatus?: QualityStatus | string,
  sourceCode?: string,
  measurementType?: string,
  dataNature?: string
): QualityEvaluation {
  if (!measuredAt || dataNature === 'UNAVAILABLE' || rawQualityStatus === 'MISSING') {
    return {
      status: 'MISSING',
      isStale: true,
      relativeTime: 'Donnée non reçue',
      shortLabel: 'Manquante',
      badgeLabel: '⚪ Donnée manquante',
      dotColor: 'bg-slate-400',
      badgeBg: 'bg-slate-900/80',
      badgeBorder: 'border-slate-700',
      textColor: 'text-slate-300',
      description: 'Aucune télémesure récente n a été transmise par cette station.',
      diffMinutes: 999999,
      diffHours: 99999,
    };
  }

  if (rawQualityStatus === 'INVALID') {
    return {
      status: 'INVALID',
      isStale: false,
      relativeTime: 'Mesure rejetée',
      shortLabel: 'Invalide',
      badgeLabel: '❌ Mesure invalide',
      dotColor: 'bg-red-500',
      badgeBg: 'bg-red-950/80',
      badgeBorder: 'border-red-600/60',
      textColor: 'text-red-300',
      description: 'Mesure rejetée par le contrôle qualité automatisé (erreur matérielle, valeur négative ou hors plage physique).',
      diffMinutes: 0,
      diffHours: 0,
    };
  }

  if (rawQualityStatus === 'SUSPECT') {
    return {
      status: 'SUSPECT',
      isStale: false,
      relativeTime: 'Contrôle requis',
      shortLabel: 'Suspecte',
      badgeLabel: '🟡 Donnée suspecte',
      dotColor: 'bg-amber-400',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-600/60',
      textColor: 'text-amber-300',
      description: 'Mesure atypique présentant un écart statistique important par rapport au bruit de fond habituel.',
      diffMinutes: 0,
      diffHours: 0,
    };
  }

  const measuredDate = new Date(measuredAt);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - measuredDate.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const staleThreshold = getStaleThresholdHours(sourceCode, measurementType);
  const isStale = diffHours >= staleThreshold || rawQualityStatus === 'STALE';

  // Formatage relatif naturel en français
  let relativeTime = '';
  if (isStale) {
    if (diffHours < 24) {
      relativeTime = `Dernière mesure : il y a ${diffHours} h`;
    } else if (diffDays === 1) {
      relativeTime = 'Dernière mesure : hier';
    } else {
      relativeTime = `Dernière mesure : il y a ${diffDays} jours`;
    }
  } else {
    if (diffMinutes < 1) {
      relativeTime = 'Mesurée à l instant';
    } else if (diffMinutes < 60) {
      relativeTime = `Mesurée il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      relativeTime = `Mesurée il y a ${diffHours} h`;
    }
  }

  if (isStale) {
    return {
      status: 'STALE',
      isStale: true,
      relativeTime,
      shortLabel: 'Ancienne',
      badgeLabel: '🟠 Donnée ancienne',
      dotColor: 'bg-amber-500',
      badgeBg: 'bg-amber-950/70',
      badgeBorder: 'border-amber-600/50',
      textColor: 'text-amber-300',
      description: `Aucune transmission récente depuis plus de ${staleThreshold}h (délai de rafraîchissement normal dépassé pour ${sourceCode || 'ce réseau'}).`,
      diffMinutes,
      diffHours,
    };
  }

  return {
    status: 'VALID',
    isStale: false,
    relativeTime,
    shortLabel: 'Valide',
    badgeLabel: '🟢 Mesure valide',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/40',
    textColor: 'text-emerald-300',
    description: 'Télémesure récente validée conforme aux protocoles métrologiques.',
    diffMinutes,
    diffHours,
  };
}
