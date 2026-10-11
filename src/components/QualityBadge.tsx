import React from 'react';
import { evaluateMeasurementQuality, type QualityStatus } from '../utils/quality';
import { Clock } from 'lucide-react';

interface QualityBadgeProps {
  measuredAt?: string | null;
  qualityStatus?: QualityStatus | string;
  sourceCode?: string;
  measurementType?: string;
  dataNature?: string;
  variant?: 'full' | 'compact' | 'pill' | 'minimal';
  showTimestamp?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  measuredAt,
  qualityStatus,
  sourceCode,
  measurementType,
  dataNature,
  variant = 'full',
  showTimestamp = true,
  align = 'right',
  className = '',
}) => {
  const q = evaluateMeasurementQuality(
    measuredAt,
    qualityStatus,
    sourceCode,
    measurementType,
    dataNature
  );

  const alignClasses =
    align === 'left'
      ? 'items-start text-left'
      : align === 'center'
      ? 'items-center text-center'
      : 'items-end text-right';

  // 1. Full prominent variant (exact user request:
  // "92 nSv/h
  // 🟢 Mesure valide
  // Mesurée il y a 8 minutes
  // ou :
  // 92 nSv/h
  // 🟠 Donnée ancienne
  // Dernière mesure : il y a 9 h")
  if (variant === 'full') {
    return (
      <div className={`flex flex-col ${alignClasses} font-mono ${className}`}>
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold shadow-xs ${q.badgeBg} ${q.badgeBorder} ${q.textColor}`}
          title={q.description}
        >
          <span>{q.badgeLabel}</span>
        </div>

        {showTimestamp && (
          <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-1 font-mono font-medium">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{q.relativeTime}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Compact variant (inline with badge and relative time together)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 font-mono text-xs ${className}`}>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${q.badgeBg} ${q.badgeBorder} ${q.textColor}`}
          title={q.description}
        >
          <span>{q.badgeLabel}</span>
        </span>
        {showTimestamp && (
          <span className="text-[11px] text-slate-400 truncate">
            {q.relativeTime}
          </span>
        )}
      </div>
    );
  }

  // 3. Pill variant (single pill containing both status and time)
  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs ${q.badgeBg} ${q.badgeBorder} ${q.textColor} ${className}`}
        title={`${q.badgeLabel} — ${q.description}`}
      >
        <span className="font-bold">{q.badgeLabel}</span>
        {showTimestamp && (
          <>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-normal text-[11px]">{q.relativeTime}</span>
          </>
        )}
      </div>
    );
  }

  // 4. Minimal variant (just the colored badge + status)
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${q.textColor} ${className}`}
      title={`${q.badgeLabel} : ${q.relativeTime}`}
    >
      <span>{q.badgeLabel}</span>
    </span>
  );
};
