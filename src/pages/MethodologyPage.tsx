import React, { useState } from 'react';
import {
  BookOpen,
  Activity,
  Zap,
  Mountain,
  CloudRain,
  Radio,
  Users,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  HelpCircle,
  Gauge,
  Layers,
  ArrowRightLeft,
  Sparkles,
  Compass,
  FileCheck2,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('all');

  return (
    <div className="space-y-8 pb-20 md:pb-12 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-mono font-semibold text-amber-400">
              <BookOpen className="w-3.5 h-3.5" /> MÉTHODOLOGIE & RADIOPROTECTION
            </span>
            <h1 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
              Méthodologie de Surveillance
            </h1>
            <p className="mt-2 text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Guide complet de métrologie nucléaire, de physique environnementale et d'interprétation rigoureuse des mesures de radioactivité en France.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 max-w-xs text-xs font-mono text-amber-200/90">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Doctrine d'État ASNR / IRSN</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              « Les variations naturelles peuvent être importantes selon la géologie locale et les conditions environnementales. »
            </p>
          </div>
        </div>

        {/* Quick Jump Navigation Pills */}
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-mono">
          <a
            href="#grandeurs-unites"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Débit de dose & Unités</span>
          </a>
          <a
            href="#dose-vs-activite"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>2. Dose vs Activité (Sv / Bq)</span>
          </a>
          <a
            href="#rayonnement-naturel"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Géologie & Cosmique</span>
          </a>
          <a
            href="#pluie-radon"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>4. Pluie & Rabattement du Radon</span>
          </a>
          <a
            href="#limites-capteurs"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>5. Limites des capteurs</span>
          </a>
          <a
            href="#sources-donnees"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>6. Institutionnel vs Citoyen</span>
          </a>
        </div>
      </div>

      {/* SECTION 1: DÉBIT DE DOSE ET UNITÉS */}
      <section id="grandeurs-unites" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xs space-y-4">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg font-mono border-b border-slate-800/80 pb-3">
          <Gauge className="w-5 h-5 text-amber-400" />
          <span>1. Qu'est-ce qu'un Débit de Dose ?</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Le <strong>débit de dose ambiant</strong> correspond à l'intensité du champ de rayonnements ionisants traversant un lieu donné par unité de temps. En radioprotection environnementale, la grandeur physique normalisée est la <strong>dose équivalente ambiante H*(10)</strong>, mesurée conventionnellement à <strong>1 mètre du sol</strong>.
          </p>
          <p>
            Elle évalue l'énergie déposée par les rayonnements gamma et cosmiques dans la matière vivante, pondérée par l'efficacité biologique relative de ces rayonnements.
          </p>

          {/* Unit Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-1.5">
              <div className="font-mono font-bold text-amber-400 text-sm flex items-center justify-between">
                <span>nSv/h</span>
                <span className="text-[10px] text-slate-500">Unité courante</span>
              </div>
              <div className="text-[11px] font-semibold text-white">Nanosievert par heure</div>
              <p className="text-[11px] text-slate-400">
                Un milliardième de Sievert par heure (10⁻⁹ Sv/h). C'est l'unité usuelle des télémesures du réseau Téléray pour le bruit de fond ordinaire.
              </p>
              <div className="pt-2 text-[10px] font-mono text-amber-300/80 border-t border-slate-800/80">
                Exemple France : 70 à 250 nSv/h
              </div>
            </div>

            <div className="rounded-xl border border-sky-500/30 bg-slate-950/80 p-4 space-y-1.5">
              <div className="font-mono font-bold text-sky-400 text-sm flex items-center justify-between">
                <span>µSv/h</span>
                <span className="text-[10px] text-slate-500">Radioprotection</span>
              </div>
              <div className="text-[11px] font-semibold text-white">Microsievert par heure</div>
              <p className="text-[11px] text-slate-400">
                Un millionième de Sievert par heure (10⁻⁶ Sv/h). Utilisé pour les seuils de pré-alerte, les interventions médicales ou l'exposition en vol aérien.
              </p>
              <div className="pt-2 text-[10px] font-mono text-sky-300/80 border-t border-slate-800/80">
                1 µSv/h = 1 000 nSv/h
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-4 space-y-1.5">
              <div className="font-mono font-bold text-emerald-400 text-sm flex items-center justify-between">
                <span>mSv/an</span>
                <span className="text-[10px] text-slate-500">Dose cumulée</span>
              </div>
              <div className="text-[11px] font-semibold text-white">Millisievert par an</div>
              <p className="text-[11px] text-slate-400">
                Dose totale accumulée sur une année complète. L'exposition moyenne de la population française est d'environ <strong>4,5 mSv/an</strong> (dont ~2,9 mSv d'origine naturelle).
              </p>
              <div className="pt-2 text-[10px] font-mono text-emerald-300/80 border-t border-slate-800/80">
                Seuil réglementaire public : 1 mSv/an (hors naturel/médical)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DOSE VS ACTIVITÉ */}
      <section id="dose-vs-activite" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xs space-y-4">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg font-mono border-b border-slate-800/80 pb-3">
          <ArrowRightLeft className="w-5 h-5 text-sky-400" />
          <span>2. La Différence Fondamentale : Dose (Sievert) vs Activité (Becquerel)</span>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">L'analogie pédagogique du tireur à l'arc :</strong>
              <p className="mt-1 text-slate-300">
                • Le <strong>Becquerel (Bq)</strong> compte le nombre de flèches tirées par seconde à la source.<br />
                • Le <strong>Sievert (Sv)</strong> mesure l'impact et l'effet biologique subi par la cible qui reçoit ces flèches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-sky-800/50 bg-slate-950 p-4 space-y-2">
              <span className="text-sm font-bold font-mono text-sky-400 flex items-center gap-1.5">
                <span>Le Becquerel (Bq) — L'Émission</span>
              </span>
              <p>
                Le <strong>Becquerel</strong> mesure l'activité radioactive d'un échantillon ou d'une source : il correspond exactement à <strong>1 désintégration nucléaire par seconde</strong>.
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li><strong>Bq/m³ :</strong> Activité volumique dans l'air (ex : concentration de gaz Radon dans les habitations ou l'air libre).</li>
                <li><strong>µBq/m³ :</strong> Traces infimes d'aérosols atmosphériques mesurées par aspiration géante par le réseau <strong>OPERA-Air</strong> (10⁻⁶ Bq/m³).</li>
                <li><strong>Bq/L :</strong> Activité volumique dans l'eau mesurée par <strong>HydroTéléray</strong> (ex : Tritium fluvial).</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-800/50 bg-slate-950 p-4 space-y-2">
              <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1.5">
                <span>Le Sievert (Sv) — L'Effet Biologique</span>
              </span>
              <p>
                Le <strong>Sievert</strong> évalue l'impact sanitaire potentiel de l'énergie absorbée par les tissus vivants. Il prend en considération :
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li>Le type de rayonnement (alpha, bêta, gamma, neutrons).</li>
                <li>La radiosensibilité propre à chaque organe du corps humain.</li>
                <li>Le débit temporel d'exposition ($H^*(10)$ en nSv/h ou µSv/h).</li>
              </ul>
              <div className="text-[11px] text-amber-300/90 pt-1">
                Une balise Téléray mesure des Sieverts (effet gamma ambiant global), et non des Becquerels (qui nécessitent un prélèvement de matière).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RAYONNEMENT NATUREL, GÉOLOGIE ET RAYONNEMENT COSMIQUE */}
      <section id="rayonnement-naturel" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xs space-y-4">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg font-mono border-b border-slate-800/80 pb-3">
          <Mountain className="w-5 h-5 text-emerald-400" />
          <span>3. Les Composantes du Bruit de Fond Naturel</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            La Terre est naturellement radioactive depuis sa formation il y a 4,5 milliards d'années. L'exposition naturelle externe reçue à la surface du territoire français se divise en deux composantes fondamentales :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Tellurique et géologie */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="font-bold text-emerald-400 text-sm font-mono flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-emerald-400" />
                <span>Le Rayonnement Tellurique (Géologie)</span>
              </div>
              <p>
                Émis par les radioéléments primordiaux piégés dans la croûte terrestre : l'Uranium-238, le Thorium-232, le Radium-226 et le Potassium-40. L'intensité mesurée dépend étroitement de la composition des roches :
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-amber-300">Massifs granitiques & volcaniques :</span><br />
                  Bretagne (Finistère, Morbihan), Massif central (Limousin, Auvergne), Vosges, Corse.<br />
                  <span className="text-white font-mono font-semibold">Fond naturel : 150 à 350 nSv/h</span> (présence accrue d'uranium et de potassium dans le granite).
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-sky-300">Bassins sédimentaires :</span><br />
                  Bassin parisien (Île-de-France, Champagne), Bassin aquitain.<br />
                  <span className="text-white font-mono font-semibold">Fond naturel : 60 à 110 nSv/h</span> (roches calcaires et marneuses moins riches en radioéléments).
                </div>
              </div>
            </div>

            {/* Rayonnement cosmique */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="font-bold text-sky-400 text-sm font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Le Rayonnement Cosmique (Altitude)</span>
              </div>
              <p>
                Flux continu de particules relativistes (protons, noyaux lourds) venues du Soleil et du milieu interstellaire qui heurtent la haute atmosphère et créent une cascade de particules secondaires (muons, neutrons, électrons).
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div>
                  <strong className="text-white">Effet direct de l'altitude :</strong> L'épaisseur d'atmosphère protectrice diminue avec l'altitude.
                </div>
                <div className="font-mono text-sky-300 text-[11px]">
                  • Niveau de la mer (Brest, Marseille) : ~30 nSv/h de dose cosmique<br />
                  • Station d'altitude (1 500 m, Alpes / Pyrénées) : ~70 nSv/h<br />
                  • Vol commercial de ligne (10 000 m) : ~2 000 à 4 000 nSv/h (2 à 4 µSv/h)
                </div>
                <p className="text-[10px] text-slate-500">
                  Une balise située à Chamonix mesurera donc un débit systématiquement supérieur à une balise en bord de mer, sans aucun lien avec une activité artificielle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PLUIE ET RABATTEMENT DU RADON */}
      <section id="pluie-radon" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xs space-y-4">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg font-mono border-b border-slate-800/80 pb-3">
          <CloudRain className="w-5 h-5 text-cyan-400" />
          <span>4. Pluie et Lessivage du Radon : Pourquoi le débit augmente-t-il lors d'une averse ?</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-slate-200">
            <span className="text-cyan-300 font-bold block mb-1">
              Phénomène physique de rabattement atmosphérique (« Washout »)
            </span>
            <p className="leading-relaxed">
              Il est très courant d'observer sur une balise Téléray un pic temporaire de <strong>+20% à +80%</strong> au début d'un épisode pluvieux soutenu. Ce phénomène est <strong>100% naturel, bien documenté par l'ASNR et rigoureusement inoffensif</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-mono font-bold text-[11px] block">
                Étape 1 : Émanation du sol
              </span>
              <p className="text-[11px] text-slate-400">
                Le Radon-222, gaz noble issu de la chaîne de l'uranium présent dans les roches, s'échappe continuellement du sol et diffuse dans l'atmosphère.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-mono font-bold text-[11px] block">
                Étape 2 : Lessivage par les gouttes
              </span>
              <p className="text-[11px] text-slate-400">
                Dans l'air, le radon se désintègre en descendants solides émetteurs gamma (Plomb-214 et Bismuth-214). Lors de l'averse, les gouttes de pluie capturent ces particules en suspension et les rabattent massivement au sol près de la sonde.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-mono font-bold text-[11px] block">
                Étape 3 : Décroissance rapide
              </span>
              <p className="text-[11px] text-slate-400">
                Ces descendants ont une demi-vie très courte (environ 20 à 30 minutes). Dès la fin de la pluie, le signal redescend naturellement à son niveau habituel en 2 à 4 heures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIMITES DES CAPTEURS */}
      <section id="limites-capteurs" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xs space-y-4">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg font-mono border-b border-slate-800/80 pb-3">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>5. Limites Métrologiques et Physiques des Capteurs</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Les détecteurs de rayonnement ambiant (tubes Geiger-Müller à compensation d'énergie ou chambres d'ionisation proportionnelles) sont des instruments de mesure scientifique qui répondent à des lois physiques strictes :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-300 font-mono text-xs block">
                Fluctuations statistiques (Bruit de Poisson)
              </span>
              <p className="text-[11px] text-slate-400">
                La désintégration radioactive étant un processus probabiliste, le nombre de photons gamma heurtant le détecteur fluctue naturellement d'une minute à l'autre. Une variation de ± 5 à 10 nSv/h autour de la moyenne n'est pas un changement physique du milieu, mais l'incertitude statistique normale de tout capteur.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-300 font-mono text-xs block">
                Absence de sélectivité isotopique (Spectre)
              </span>
              <p className="text-[11px] text-slate-400">
                Une sonde Téléray mesure un débit d'équivalent de dose global en nSv/h, mais ne peut pas indiquer quels radionucléides spécifiques sont présents. Pour identifier un isotope (Césium-137, Iode-131, etc.), des prélèvements sur filtres aérosols et une spectrométrie gamma en laboratoire sont indispensables.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-300 font-mono text-xs block">
                Temps d'intégration et moyennage
              </span>
              <p className="text-[11px] text-slate-400">
                Pour réduire l'impact du bruit statistique, les télémesures sont généralement moyennées sur des fenêtres temporelles glissantes de 10 à 60 minutes selon les réseaux.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-300 font-mono text-xs block">
                Conditions météo et perturbations matérielles
              </span>
              <p className="text-[11px] text-slate-400">
                Foudre, humidité extrême, accumulation de neige ou givre sur l'abri de sonde peuvent occasionner des artéfacts transitoires. Les algorithmes de surveillance de l'ASNR les qualifient automatiquement en statut « SUSPECT » ou « INVALID » lors de la validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: INSTITUTIONNEL VS CITOYEN */}
      <section id="sources-donnees" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xs space-y-4">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg font-mono border-b border-slate-800/80 pb-3">
          <Radio className="w-5 h-5 text-rose-400" />
          <span>6. Données Institutionnelles vs Données Citoyennes : Deux Approches Complémentaires</span>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Notre application agrège à la fois les réseaux d'alerte officiels d'État et les plateformes de science citoyenne ouverte. Comprendre leurs différences garantit une interprétation équilibrée et scientifique :
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Critère</th>
                  <th className="p-3 text-amber-400">Réseaux Institutionnels (Téléray / ASNR, EURDEP)</th>
                  <th className="p-3 text-sky-400">Réseaux Citoyens (OpenRadiation, Safecast)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                <tr>
                  <td className="p-3 font-semibold text-white">Positionnement</td>
                  <td className="p-3 text-slate-300">Sondes fixes à 1 m du sol sous abri normalisé permanent.</td>
                  <td className="p-3 text-slate-300">Capteurs mobiles (sac à dos, véhicule) ou stations personnelles.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Étalonnage</td>
                  <td className="p-3 text-slate-300">Laboratoires de métrologie agréés avec sources certifiées COFRAC.</td>
                  <td className="p-3 text-slate-300">Étalonnage d'usine selon les fabricants (variabilité selon modèles).</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Validation</td>
                  <td className="p-3 text-slate-300">Double contrôle algorithmique et validation humaine par des experts 24h/24.</td>
                  <td className="p-3 text-slate-300">Filtrage communautaire et algorithmique (OpenRadiation score).</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Valeur juridique</td>
                  <td className="p-3 text-emerald-400 font-semibold">Télémesures certifiées d'État faisant foi pour les plans d'urgence.</td>
                  <td className="p-3 text-sky-400 font-semibold">Veille participative, cartographie de terrain et transparence civile.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Couverture</td>
                  <td className="p-3 text-slate-300">457 stations réparties stratégiquement (INB, frontières, agglomérations).</td>
                  <td className="p-3 text-slate-300">Grande densité ponctuelle là où les citoyens se déplacent.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white">Conclusion méthodologique :</strong> Les données citoyennes apportent une formidable réactivité participative et un maillage de proximité, tandis que le réseau Téléray d'État fournit l'assise métrologique de référence pour les seuils d'alerte de sécurité civile.
            </div>
          </div>
        </div>
      </section>

      {/* Synthesis Footer Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center space-y-2 text-xs font-mono">
        <div className="text-white font-bold flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Synthèse pour le citoyen et l'analyste</span>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto text-[11px] leading-relaxed">
          Toute observation ponctuelle doit être confrontée au bruit de fond géologique de la commune, à l'historique sur 7 jours et aux conditions météorologiques (pluie) avant de conclure à une anomalie.
        </p>
      </div>
    </div>
  );
};
