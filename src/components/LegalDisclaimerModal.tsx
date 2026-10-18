import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Info,
  Scale,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  isFirstVisit?: boolean;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isFirstVisit = false,
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    try {
      localStorage.setItem('radiation_france_disclaimer_accepted', 'true');
    } catch {
      // ignore
    }
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">Mentions Légales & Non-Responsabilité</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  Obligatoire
                </span>
                <HelpTooltip
                  title="Cadre Juridique & Statut de l'Auteur"
                  position="bottom"
                  align="start"
                  content="Exposition claire du statut juridique : application citoyenne indépendante à vocation informative. L'auteur et développeur indépendant ne saurait être tenu responsable des données brutes télémétriques issues des réseaux tiers."
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Conditions d'utilisation et clause de décharge d'auteur</p>
            </div>
          </div>

          {!isFirstVisit && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
              setHasScrolledToBottom(true);
            }
          }}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs font-mono text-slate-300 leading-relaxed"
        >
          {/* Important Highlight Banner */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2 text-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Avertissement formel de l'auteur de l'application</span>
              </div>
              <HelpTooltip
                title="Clause de Décharge d'Auteur"
                position="left"
                content="L'auteur décline expressément toute responsabilité quant aux décisions ou interprétations prises sur la base des télémesures affichées. Les seules données faisant foi en matière de sécurité civile sont les communiqués officiels de l'ASNR et de la Préfecture."
              />
            </div>
            <p className="text-[11px] leading-relaxed">
              En utilisant cette application, vous reconnaissez expressément que <strong>l'auteur et développeur indépendant ne saurait être tenu responsable des données fournies</strong>, de leur exactitude, de leur actualité, de leurs éventuelles interruptions ou de l'usage qui en est fait.
            </p>
          </div>

          {/* Section 1: Rôle et nature de l'outil */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <h3 className="text-white font-bold text-xs flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>1. Objet de l'application & Indépendance</span>
            </h3>
            <p className="text-slate-400 text-[11px]">
              « Radiation France » est une interface citoyenne bénévole et indépendante ayant pour unique objet de visualiser et de vulgariser les données publiques ouvertes relatives à la radioactivité environnementale en France (issues de Téléray / ASNR-IRSN, EURDEP, OpenRadiation et Safecast). L'application n'est affiliée à aucun organisme d'État ni à aucun exploitant industriel.
            </p>
          </div>

          {/* Section 2: Exonération totale de responsabilité */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
            <h3 className="text-white font-bold text-xs flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>2. Clause d'Exonération de Responsabilité (Non-Responsabilité)</span>
            </h3>
            <p className="text-slate-400 text-[11px]">
              L'auteur de l'application décline toute responsabilité de plein droit quant à :
            </p>
            <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside pl-1">
              <li>
                <strong>Fiabilité et intégrité des télémesures :</strong> Les données affichées proviennent d'API publiques tierces et de capteurs soumis à des aléas physiques (pannes, coupures réseau, dérives de sonde, artéfacts météo).
              </li>
              <li>
                <strong>Délais de rafraîchissement :</strong> Les télémesures peuvent comporter un décalage temporel inhérent aux fréquences de transmission des réseaux amont.
              </li>
              <li>
                <strong>Interprétations et décisions :</strong> L'auteur ne peut être tenu responsable d'une mauvaise interprétation des chiffres (notamment la confusion entre bruit de fond géologique normal et contamination accidentelle).
              </li>
              <li>
                <strong>Dommages directs ou indirects :</strong> Aucune garantie n'est fournie quant à la disponibilité permanente ou l'absence d'erreurs logicielles. L'application est fournie « en l'état ».
              </li>
            </ul>
          </div>

          {/* Section 3: Absence de substitution aux alertes officielles */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2 text-rose-200">
            <h3 className="font-bold text-xs flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>3. Absence de substitution aux canaux d'urgence d'État</span>
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Cette application n'est pas un système officiel d'alerte aux populations. <strong>Elle ne remplace en aucun cas les alertes de la Sécurité Civile, les sirènes SAIP, les notifications d'urgence FR-Alert, ni les consignes de l'Autorité de Sûreté Nucléaire et de Radioprotection (ASNR) ou des Préfectures.</strong> En situation d'incident avéré, écoutez impérativement les stations de Radio France et suivez les instructions des pouvoirs publics.
            </p>
          </div>

          {/* Section 4: Propriété intellectuelle et licences distinctes par producteur */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <h3 className="text-white font-bold text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>4. Licences des Données Publiques et Obligations d'Attribution par Producteur</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Les télémesures proviennent de producteurs indépendants dotés de leurs propres régimes de réutilisation juridique :
            </p>
            <div className="space-y-2 text-[11px]">
              <div className="border-l-2 border-emerald-500 pl-2.5 py-0.5">
                <span className="text-emerald-400 font-bold block">Téléray, HydroTéléray & OPERA-Air (ASNR / IRSN) :</span>
                <span className="text-slate-300">
                  <strong>Licence Ouverte v2.0 (Etalab)</strong> — Réutilisation libre commerciale et non commerciale. Mention obligatoire : <em>« Source : ASNR - Réseau Téléray / HydroTéléray / OPERA-Air »</em> avec horodatage du relevé, sans caution officielle de l'ASNR.
                </span>
              </div>
              <div className="border-l-2 border-sky-500 pl-2.5 py-0.5">
                <span className="text-sky-400 font-bold block">EURDEP (Commission Européenne - DG JRC) :</span>
                <span className="text-slate-300">
                  <strong>Décision 2011/833/UE (EU Open Data)</strong> — Réutilisation libre avec obligation de mentionner la source (<em>« Source : Union Européenne, DG JRC - Plateforme EURDEP »</em>) et les modifications apportées.
                </span>
              </div>
              <div className="border-l-2 border-purple-500 pl-2.5 py-0.5">
                <span className="text-purple-400 font-bold block">OpenRadiation (Consortium IRSN / Sorbonne / ANCCLI) :</span>
                <span className="text-slate-300">
                  <strong>ODbL v1.0 (Open Database License)</strong> — Science participative avec obligation stricte de partage à l'identique (<em>Share-Alike</em>) et mention <em>« Données OpenRadiation sous licence ODbL »</em> avec lien vers openradiation.org.
                </span>
              </div>
              <div className="border-l-2 border-amber-500 pl-2.5 py-0.5">
                <span className="text-amber-400 font-bold block">Safecast (Safecast Global) :</span>
                <span className="text-slate-300">
                  <strong>CC0 1.0 Universal (Domaine Public)</strong> — Données de dosimétrie citoyenne bGeigie dans le domaine public avec citation éthique recommandée (<em>safecast.org</em>).
                </span>
              </div>
              <div className="border-l-2 border-slate-600 pl-2.5 py-0.5">
                <span className="text-slate-400 font-bold block">Cartographie (OpenStreetMap) :</span>
                <span className="text-slate-300">
                  <strong>ODbL</strong> — Données cartographiques © Contributeurs OpenStreetMap.
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-[10px] italic">
              Les marques, acronymes et logos cités demeurent la propriété exclusive de leurs organismes producteurs respectifs.
            </p>
          </div>

        </div>

        {/* Footer with Acceptance button */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            {isFirstVisit
              ? 'Veuillez accepter les mentions légales pour accéder à l\'application.'
              : 'Conditions valables pour l\'ensemble des sessions.'}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isFirstVisit && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
              >
                Fermer
              </button>
            )}

            <button
              onClick={handleAccept}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>J'ai compris et j'accepte les conditions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
