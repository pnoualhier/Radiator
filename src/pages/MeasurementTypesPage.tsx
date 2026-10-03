import React, { useState } from 'react';
import type { MeasurementTypeCode, Station } from '../types/radiation';
import { MEASUREMENT_TYPES_CATALOG } from '../types/radiation';
import type { NavTab } from '../components/Navigation';
import {
  Activity,
  Radio,
  Wind,
  Droplets,
  Layers,
  Apple,
  Atom,
  CloudRain,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Info,
  MapPin,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface MeasurementTypesPageProps {
  stations: Station[];
  onTabChange: (tab: NavTab) => void;
  onSelectStation: (stationId: number) => void;
}

export const MeasurementTypesPage: React.FC<MeasurementTypesPageProps> = ({
  stations,
  onTabChange,
  onSelectStation,
}) => {
  const [selectedType, setSelectedType] = useState<MeasurementTypeCode>('AMBIENT_GAMMA_DOSE_RATE');

  const catalogList = Object.values(MEASUREMENT_TYPES_CATALOG);
  const currentInfo = MEASUREMENT_TYPES_CATALOG[selectedType];

  const matchingStations = stations.filter(
    s => (s.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE') === selectedType
  );

  const getIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Radio':
        return <Radio className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Atom':
        return <Atom className={className} />;
      case 'CloudRain':
        return <CloudRain className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Apple':
        return <Apple className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Page Title & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Architecture Métrologique Radiologique</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-mono mt-1">
          TYPES DE MESURE & VECTEURS DE SURVEILLANCE
        </h1>
        <p className="text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed">
          Comprendre pourquoi une balise <strong>Téléray</strong> (débit de dose gamma externe) ne mesure pas une concentration de radionucléides dans l'air, et comment l'<strong>ASNR</strong> distingue ses réseaux de surveillance spécialisés (<strong>OPERA-Air</strong>, <strong>HydroTéléray</strong>, spectrométrie, etc.).
        </p>
      </div>

      {/* Fundamental Scientific Distinction Box */}
      <section className="rounded-2xl border border-sky-800/60 bg-gradient-to-r from-sky-950/50 via-slate-900/80 to-slate-950 p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-slate-300">
            <h2 className="font-bold text-white text-sm font-mono uppercase text-sky-300">
              Pourquoi Téléray ne mesure pas de concentration de radionucléides dans l'air ?
            </h2>
            <p>
              Une sonde <strong>Téléray (ASNR / IRSN)</strong> est un dosimètre d'ambiance fixe à tube Geiger-Müller ou chambre d'ionisation. Elle compte les impulsions provoquées par les photons gamma traversant son boîtier blindé et calcule un <strong>débit d'équivalent de dose ambiant</strong> exprimé en <strong>nanosieverts par heure (nSv/h)</strong>. Elle indique <em>l'irradiation externe globale</em> ressentie par un être humain à cet endroit, mais :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li>
                <strong>Elle n'aspire pas l'air :</strong> elle est totalement insensible à la concentration massique ou volumique de poussières radioactives si celles-ci sont en infime quantité.
              </li>
              <li>
                <strong>Elle ne discerne pas les isotopes :</strong> elle ne sait pas si la radioactivité provient du Radon naturel, du Césium-137, de l'Iode-131 ou du rayonnement cosmique.
              </li>
              <li>
                <strong>C'est pour cela que l'ASNR opère OPERA-Air et HydroTéléray :</strong> pour déceler les poussières radioactives dans l'air (filtres très grand débit en µBq/m³) et les rejets dans les fleuves (eau brute en Bq/L).
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Catalog Grid (8 Measurement Types) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Catalogue des 8 Grandeurs & Types de Mesure</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Sélectionnez un type pour voir ses caractéristiques
          </span>
        </div>

        {/* 8 Type Selection Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {catalogList.map(type => {
            const isSelected = selectedType === type.code;
            const count = stations.filter(
              s => (s.measurement_type || 'AMBIENT_GAMMA_DOSE_RATE') === type.code
            ).length;

            return (
              <button
                key={type.code}
                onClick={() => setSelectedType(type.code)}
                className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg text-white'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {getIcon(type.icon_name, 'w-4 h-4')}
                    </div>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {type.unit}
                    </span>
                  </div>
                  <div className="mt-2 font-bold text-xs line-clamp-1">{type.short_name}</div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Balises actives</span>
                  <span className={`font-bold ${count > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Measurement Type Deep-Dive Card */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              {getIcon(currentInfo.icon_name, 'w-6 h-6')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white font-mono">
                  {currentInfo.name}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                  Unité : {currentInfo.unit}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Réseaux de référence : <strong>{currentInfo.network_example}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onTabChange('map')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Voir sur la carte</span>
            </button>
            <button
              onClick={() => onTabChange('stations')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition"
            >
              <span>Filtrer dans la liste</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Technical Parameter Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
              Grandeur physique
            </span>
            <span className="text-white font-semibold font-mono text-[11px] leading-snug block">
              {currentInfo.physical_quantity}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
              Milieu / Matrice échantillonnée
            </span>
            <span className="text-white font-semibold text-[11px] leading-snug block">
              {currentInfo.matrix}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 sm:col-span-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block mb-1">
              Distinction majeure avec Téléray
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentInfo.why_distinct_from_teleray}
            </p>
          </div>
        </div>

        {/* Complete Description */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/50 p-4 text-xs text-slate-300 leading-relaxed">
          <h4 className="font-bold text-white uppercase text-[11px] font-mono mb-1 text-slate-400">
            Description méthodologique & objectif de surveillance :
          </h4>
          <p>{currentInfo.description}</p>
        </div>

        {/* Matching stations if present in the database */}
        {matchingStations.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white font-mono">
                Balises actives surveillant ce vecteur ({matchingStations.length})
              </span>
              <span className="text-slate-400 text-[11px]">
                Cliquez pour consulter l'historique détaillé
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {matchingStations.map(st => {
                const latest = st.latest_measurement;
                const val = latest?.value;
                return (
                  <div
                    key={st.id}
                    onClick={() => onSelectStation(st.id)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer text-xs flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{st.commune || st.country}</span>
                        {st.radionuclide_focus && (
                          <span className="text-slate-500">• {st.radionuclide_focus.split(',')[0]}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0 pl-2">
                      <div className="font-bold text-amber-400 text-sm">
                        {val !== undefined ? val.toFixed(val < 1 ? 2 : 1) : '—'}
                      </div>
                      <div className="text-[10px] text-slate-500">{st.latest_measurement?.unit || currentInfo.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Comparative Synthesis Matrix: Sievert vs Becquerel */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Synthèse comparative : Unités et Grandeurs Métrologiques</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-2">Vecteur / Type</th>
                <th className="pb-2">Grandeur</th>
                <th className="pb-2">Unité standard</th>
                <th className="pb-2">Réseau ASNR / France</th>
                <th className="pb-2">Usage principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-bold text-white">Débit de dose gamma</td>
                <td className="py-2.5 text-slate-400">Dose équivalente ambiante</td>
                <td className="py-2.5 font-bold text-amber-300">nSv/h / µSv/h</td>
                <td className="py-2.5 text-emerald-400">Téléray, EURDEP, OpenRadiation</td>
                <td className="py-2.5 text-slate-400">Alerte précoce irradiation externe</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Aérosols atmosphériques</td>
                <td className="py-2.5 text-slate-400">Activité volumique des poussières</td>
                <td className="py-2.5 font-bold text-purple-300">µBq/m³ (microbecquerel/m³)</td>
                <td className="py-2.5 text-sky-400">OPERA-Air (ASNR-IRSN)</td>
                <td className="py-2.5 text-slate-400">Traces d'accidents internationaux (Cs-137, I-131)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Radioactivité dans l'eau</td>
                <td className="py-2.5 text-slate-400">Activité volumique liquide</td>
                <td className="py-2.5 font-bold text-cyan-300">Bq/L (becquerel par litre)</td>
                <td className="py-2.5 text-emerald-400">HydroTéléray (ASNR-IRSN)</td>
                <td className="py-2.5 text-slate-400">Surveillance fleuves (Rhône, Loire, Seine)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Activité volumique gazeuse</td>
                <td className="py-2.5 text-slate-400">Activité gazeuse dans l'air</td>
                <td className="py-2.5 font-bold text-emerald-300">Bq/m³</td>
                <td className="py-2.5 text-slate-400">Surveillance Radon IRSN</td>
                <td className="py-2.5 text-slate-400">Exposition naturelle intérieure (Radon-222)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Activité surfacique</td>
                <td className="py-2.5 text-slate-400">Dépôts météo au sol</td>
                <td className="py-2.5 font-bold text-indigo-300">Bq/m²</td>
                <td className="py-2.5 text-slate-400">Jauges de dépôt météo IRSN</td>
                <td className="py-2.5 text-slate-400">Retombées de pluie et marquage des sols</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Chaîne alimentaire</td>
                <td className="py-2.5 text-slate-400">Activité massique denrées</td>
                <td className="py-2.5 font-bold text-rose-300">Bq/kg frais</td>
                <td className="py-2.5 text-slate-400">Observatoire alimentaire IRSN</td>
                <td className="py-2.5 text-slate-400">Contrôle sanitaire lait, céréales, poissons</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Spectrométrie gamma</td>
                <td className="py-2.5 text-slate-400">Spectre en énergie des photons</td>
                <td className="py-2.5 font-bold text-amber-300">keV / mBq/m³</td>
                <td className="py-2.5 text-slate-400">Laboratoires d'analyse & sondes NaI/HPGe</td>
                <td className="py-2.5 text-slate-400">Identification sans équivoque des isotopes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
