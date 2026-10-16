import React, { useState } from 'react';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Radio,
  Map,
  HelpCircle,
  WifiOff,
  Sparkles,
} from 'lucide-react';

interface ContextualTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface TourStep {
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: string;
  tip: string;
  targetTab?: string;
}

export const ContextualTour: React.FC<ContextualTourProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      title: 'Le Débit de Dose Ambiant en Direct',
      badge: 'Grandeur physique',
      icon: <Radio className="w-6 h-6 text-amber-400" />,
      content:
        'L\'unité de mesure principale est le nanosievert par heure (nSv/h). En France métropolitaine, le bruit de fond naturel ordinaire se situe entre 70 et 150 nSv/h en plaine et jusqu\'à 250 nSv/h en zone granitique ou en montagne.',
      tip: 'Astuce : 1 µSv/h = 1 000 nSv/h. Le seuil de pré-alerte réglementaire de l\'ASNR est fixé au-delà de 200 nSv/h.',
      targetTab: 'home',
    },
    {
      title: 'La Carte Interactive & 457 Balises d\'État',
      badge: 'Cartographie',
      icon: <Map className="w-6 h-6 text-sky-400" />,
      content:
        'La carte géolocalise l\'ensemble des stations officielles Téléray de l\'ASNR/IRSN, du réseau européen EURDEP et des capteurs citoyens OpenRadiation et Safecast. Vous pouvez filtrer par vecteur (air, fleuves, poussières).',
      tip: 'Astuce : Cliquez sur n\'importe quelle balise pour afficher son relevé en direct et son historique 24h.',
      targetTab: 'map',
    },
    {
      title: 'L\'outil « Pourquoi cette valeur ? »',
      badge: 'Pédagogie ASNR',
      icon: <HelpCircle className="w-6 h-6 text-emerald-400" />,
      content:
        'Pour chaque station, cet outil décompose les 5 facteurs réels de variation : la géologie du sous-sol, les averses (lessivage du radon), le fond naturel, l\'altitude cosmique et le bruit statistique normal du détecteur.',
      tip: 'Astuce : Cela évite d\'interpréter à tort toute variation naturelle comme une contamination.',
      targetTab: 'stations',
    },
    {
      title: 'Mode Autonome Hors Connexion & PWA',
      badge: 'Résilience civile',
      icon: <WifiOff className="w-6 h-6 text-purple-400" />,
      content:
        'L\'application intègre une base locale IndexedDB (12 000+ points de mesure). Même en cas de coupure de réseau ou de crise, l\'application démarre instantanément et affiche les dernières données mémorisées.',
      tip: 'Astuce : Utilisez le bouton "Installer l\'application" pour l\'ajouter sur votre écran d\'accueil mobile ou PC.',
      targetTab: 'home',
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (steps[nextIdx].targetTab && onNavigateToTab) {
        onNavigateToTab(steps[nextIdx].targetTab!);
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (steps[prevIdx].targetTab && onNavigateToTab) {
        onNavigateToTab(steps[prevIdx].targetTab!);
      }
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('radiation_france_tour_completed', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl overflow-hidden text-slate-100 flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-xs">Visite Guidée & Onboarding</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              Étape {currentStepIndex + 1} / {steps.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800">
              {currentStep.icon}
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
              {currentStep.badge}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mt-1">{currentStep.title}</h3>
            <p className="mt-2 text-slate-300 text-xs leading-relaxed">{currentStep.content}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-amber-200/90 leading-relaxed">
            {currentStep.tip}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition text-[11px]"
            >
              Passer
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1 shadow-md"
            >
              <span>{isLast ? 'Terminer' : 'Suivant'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
