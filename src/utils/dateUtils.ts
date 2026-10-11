/**
 * Utilitaires d'horodatage et de formatage sécurisés
 * Protège rigoureusement contre les RangeError / TypeError en environnement strict (Safari / WebKit / iOS).
 */

export function safeFormatTime(
  dateValue?: string | number | Date | null,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' },
  fallback = '—'
): string {
  if (!dateValue) return fallback;
  try {
    const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString('fr-FR', options);
  } catch (err) {
    console.warn('safeFormatTime error:', err);
    return fallback;
  }
}

export function safeFormatDate(
  dateValue?: string | number | Date | null,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
  fallback = '—'
): string {
  if (!dateValue) return fallback;
  try {
    const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('fr-FR', options);
  } catch (err) {
    console.warn('safeFormatDate error:', err);
    return fallback;
  }
}

export function safeFormatDateTime(
  dateValue?: string | number | Date | null,
  fallback = '—'
): string {
  if (!dateValue) return fallback;
  try {
    const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    console.warn('safeFormatDateTime error:', err);
    return fallback;
  }
}

export function safeFormatNumber(
  num?: number | null,
  decimals = 1,
  fallback = '—'
): string {
  if (num === undefined || num === null || isNaN(num)) return fallback;
  try {
    return num.toFixed(decimals);
  } catch {
    return fallback;
  }
}
