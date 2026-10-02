import React from 'react';
import { BookOpen, HelpCircle, Activity, Shield, Zap, Info, Layers } from 'lucide-react';

export const InfoPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          COMPRENDRE LA RADIOACTIVITÉ
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Guide pédagogique et scientifique pour interpréter rigoureusement les données radiologiques.
        </p>
      </div>

      {/* Grid of Educational Sections */}
      <div className="space-y-4 text-xs text-slate-300">
        {/* Section 1: Qu'est-ce que le débit de dose ? */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-2 font-mono">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>1. Le Débit de Dose Ambiant ($H^*(10)$)</span>
          </div>
          <p className="leading-relaxed">
            Le débit de dose équivalent ambiant représente l'énergie déposée par les rayonnements ionisants (principalement gamma et cosmique) dans l'organisme par unité de temps.
            L'unité de référence internationale est le <strong>Sievert par heure (Sv/h)</strong>. Dans l'environnement ordinaire, les valeurs sont infinitésimales, exprimées en <strong>nanosieverts par heure (nSv/h)</strong> ou <strong>microsieverts par heure (µSv/h)</strong>.
          </p>
          <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] text-amber-300">
            1 µSv/h = 1 000 nSv/h &nbsp;&nbsp;|&nbsp;&nbsp; 0,10 µSv/h = 100 nSv/h
          </div>
        </section>

        {/* Section 2: Différence Dose vs Activité */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-2 font-mono">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>2. Différence entre Activité (Becquerel) et Dose (Sievert)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-sky-400 text-xs block mb-1">
                Le Becquerel (Bq) — L'Émission
              </span>
              <p>
                Mesure le nombre de désintégrations nucléaires par seconde au sein d'une source radioactive ou d'un échantillon (sol, aliment, eau, air). C'est la mesure de la <em>quantité de radioactivité</em> émise.
              </p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 text-xs block mb-1">
                Le Sievert (Sv) — L'Effet Biologique
              </span>
              <p>
                Évalue l'impact biologique potentiel des rayonnements sur les tissus vivants en tenant compte de la nature du rayonnement (alpha, beta, gamma) et de la sensibilité des organes.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Bruit de fond naturel en France */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-2 font-mono">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>3. Le Bruit de Fond Naturel en France</span>
          </div>
          <p className="leading-relaxed">
            La Terre est naturellement radioactive depuis sa formation. En France, l'exposition naturelle moyenne au rayonnement ambiant externe se situe couramment entre <strong>50 et 150 nSv/h</strong>.
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
            <li>
              <strong>Massifs granitiques</strong> (Bretagne, Massif Central, Vosges, Corse) : le fond naturel atteint fréquemment <strong>150 à 350 nSv/h</strong> en raison de la présence naturelle d'uranium et de thorium dans le granite.
            </li>
            <li>
              <strong>Bassins sédimentaires</strong> (Bassin Parisien, Bassin Aquitain) : le fond naturel calcaire ou marneux est généralement plus bas, de l'ordre de <strong>60 à 100 nSv/h</strong>.
            </li>
            <li>
              <strong>Pluie et lessivage du radon</strong> : lors d'averses soutenues, les descendants radioactifs du radon naturellement présents dans l'atmosphère sont rabattus au sol, entraînant une hausse temporaire et parfaitement inoffensive de 20 à 50 nSv/h qui s'estompe en quelques heures.
            </li>
          </ul>
        </section>

        {/* Section 4: Fonctionnement des sondes */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-2 font-mono">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>4. Fonctionnement d'une Balise Téléray</span>
          </div>
          <p className="leading-relaxed">
            Les balises permanentes du réseau Téléray (ASNR / IRSN) sont équipées de détecteurs blindés (tubes Geiger-Müller à compensation d'énergie ou chambres d'ionisation proportionnelles). Elles mesurent en continu à 1 mètre du sol et transmettent automatiquement leurs données télémesurées toutes les 10 à 60 minutes.
          </p>
          <div className="mt-3 rounded-xl bg-slate-950 p-3 border border-slate-800 text-slate-400">
            <strong className="text-slate-200">Limites métrologiques :</strong> Une sonde de mesure ambiante ne détermine pas la composition isotopique (quels radionucléides sont présents). Pour cela, des prélèvements d'aérosols et des analyses par spectrométrie gamma en laboratoire sont réalisés séparément par les réseaux de surveillance spécialisés.
          </div>
        </section>
      </div>
    </div>
  );
};
