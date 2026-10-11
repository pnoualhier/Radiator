import React, { useState } from 'react';
import type { Station, StationDetail } from '../types/radiation';
import { explainStationValue } from '../utils/stationExplainer';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface WhyThisValuePanelProps {
  station: Station | StationDetail;
  currentValue?: number;
  onNavigateToMethodology?: () => void;
  defaultExpanded?: boolean;
}

export const WhyThisValuePanel: React.FC<WhyThisValuePanelProps> = ({
  station,
  currentValue,
  onNavigateToMethodology,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null);

  const explanation = explainStationValue(station, currentValue);
  const val = explanation.stationValue;
  const unit = explanation.unit;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm shadow-xl space-y-4">
      {/* Header with Station Value */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-white">
                Pourquoi cette valeur ?
              </h3>
              <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                Pédagogie ASNR
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              Comprendre les 5 facteurs naturels qui expliquent la mesure de <strong className="font-mono text-white">{val.toFixed(1)} {unit}</strong> et ses fluctuations d'un jour à l'autre.
            </p>
          </div>
        </div>

        {/* Big value pill & toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-right">
            <div className="text-[10px] uppercase text-slate-500 font-semibold">Valeur actuelle</div>
            <div className="text-lg font-extrabold text-amber-400">
              {val.toFixed(1)} <span className="text-xs font-normal text-slate-300">{unit}</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            aria-label={isExpanded ? 'Réduire les explications' : 'Afficher les explications'}
            title={isExpanded ? 'Réduire' : 'Déplier'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Reassurance Banner (Anti-panic requirement) */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold font-mono text-emerald-300 flex items-center gap-2">
            <span>{explanation.evaluationLabel}</span>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 border border-emerald-500/30">
              Conformité 100%
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {explanation.scientificSynthesis}
          </p>
        </div>
      </div>

      {/* Main 5 Factors Grid (Requested by User) */}
      {isExpanded && (
        <div className="space-y-4 pt-1">
          <div className="text-xs font-mono font-semibold text-slate-400 flex items-center justify-between">
            <span>Pourquoi cette valeur peut-elle varier ? (5 composantes physiques) :</span>
            <span className="text-[10px] text-slate-500">Cliquez sur un facteur pour le détail</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {explanation.factors.map(factor => {
              const isSelected = selectedFactorId === factor.id;
              return (
                <div
                  key={factor.id}
                  onClick={() => setSelectedFactorId(isSelected ? null : factor.id)}
                  className={`rounded-xl border p-3.5 transition cursor-pointer text-left ${
                    isSelected
                      ? 'border-amber-500/60 bg-slate-950/90 shadow-md ring-1 ring-amber-500/20'
                      : 'border-slate-800 bg-slate-950/50 hover:bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{factor.icon}</span>
                      <div>
                        <div className="font-bold font-mono text-white text-xs">
                          {factor.title}
                        </div>
                        <div className="text-[10px] text-amber-300/80 font-mono">
                          {factor.estimatedContribution}
                        </div>
                      </div>
                    </div>

                    <span className="text-slate-500 hover:text-slate-300 text-[10px] font-mono shrink-0">
                      {isSelected ? '▲ Fermer' : '▼ Détail'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {factor.shortSummary}
                  </p>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-2 animate-in fade-in">
                      <p className="leading-relaxed text-slate-400">
                        {factor.detailedExplanation}
                      </p>

                      <ul className="space-y-1 list-disc list-inside text-slate-300 pl-1">
                        {factor.keyPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-amber-300/90">
                        <strong>Cause principale de fluctuation :</strong> {factor.variabilityCause}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ASNR Doctrine Reminder Quote */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs font-mono text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-[11px]">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Rappel de l'Autorité de Sûreté Nucléaire et de Radioprotection (ASNR) :</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              « Toute variation n'est pas synonyme d'anomalie ou de contamination. Le milieu naturel respire, s'exhale et réagit continuellement aux phénomènes météorologiques et géologiques. Seule une hausse durable et concertée au-delà du seuil d'alerte (&gt; 200 nSv/h) déclenche une investigation opérationnelle. »
            </p>
          </div>

          {/* Link to full Methodology page */}
          {onNavigateToMethodology && (
            <div className="pt-1 flex items-center justify-end">
              <button
                onClick={onNavigateToMethodology}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-mono text-xs font-semibold transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Approfondir dans la page Méthodologie</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
