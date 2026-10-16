import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';

export interface HelpTooltipProps {
  content: React.ReactNode;
  title?: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'start' | 'end';
  iconSize?: 'sm' | 'md' | 'lg';
  variant?: 'amber' | 'sky' | 'emerald' | 'slate';
  children?: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  className = '',
  position = 'top',
  align = 'center',
  iconSize = 'sm',
  variant = 'amber',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<any>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen]);

  // Position classes
  let positionClass = '';
  let arrowClass = '';

  if (position === 'bottom') {
    positionClass = 'top-full mt-2';
    arrowClass = 'bottom-full -mb-1 border-b-slate-900 dark:border-b-slate-950 border-t-transparent';
  } else if (position === 'left') {
    positionClass = 'right-full mr-2 top-1/2 -translate-y-1/2';
    arrowClass = 'left-full -ml-1 top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-950 border-r-transparent';
  } else if (position === 'right') {
    positionClass = 'left-full ml-2 top-1/2 -translate-y-1/2';
    arrowClass = 'right-full -mr-1 top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-950 border-l-transparent';
  } else {
    // Default 'top'
    positionClass = 'bottom-full mb-2';
    arrowClass = 'top-full -mt-1 border-t-slate-900 dark:border-t-slate-950 border-b-transparent';
  }

  // Alignment classes for top/bottom
  if (position === 'top' || position === 'bottom') {
    if (align === 'start') {
      positionClass += ' left-0';
      arrowClass += ' left-4';
    } else if (align === 'end') {
      positionClass += ' right-0';
      arrowClass += ' right-4';
    } else {
      positionClass += ' left-1/2 -translate-x-1/2';
      arrowClass += ' left-1/2 -translate-x-1/2';
    }
  }

  // Icon sizing
  const iconDimensions =
    iconSize === 'lg' ? 'w-4 h-4' : iconSize === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  // Variant colors
  const variantStyles = {
    amber: {
      btn: 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border-amber-500/30',
      badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: 'text-amber-400',
    },
    sky: {
      btn: 'text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border-sky-500/30',
      badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      icon: 'text-sky-400',
    },
    emerald: {
      btn: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border-emerald-500/30',
      badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: 'text-emerald-400',
    },
    slate: {
      btn: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border-slate-700',
      badge: 'text-slate-300 bg-slate-800 border-slate-700',
      icon: 'text-slate-400',
    },
  }[variant];

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="cursor-help"
        >
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`p-1 rounded-full border transition focus:outline-hidden ${variantStyles.btn}`}
          aria-label={title || 'Information explicative'}
          aria-expanded={isOpen}
          title={title || 'Cliquez pour afficher les explications'}
        >
          <HelpCircle className={iconDimensions} />
        </button>
      )}

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-[60] ${positionClass} w-72 sm:w-84 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-900 border border-slate-700/80 p-3.5 shadow-2xl text-xs font-mono text-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto`}
          role="tooltip"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{title || 'Explication de la zone'}</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              aria-label="Fermer l'infobulle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="text-[11px] text-slate-300 leading-relaxed font-sans space-y-1.5">
            {content}
          </div>

          {/* Arrow */}
          <div className={`absolute border-4 border-transparent ${arrowClass}`} />
        </div>
      )}
    </div>
  );
};

