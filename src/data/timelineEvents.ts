export type EventInesLevel = 0 | 1 | 2 | 'EXERCICE' | 'AUCUN';

export interface TimelineEvent {
  id: string;
  year: number; // 2026
  month: number; // 1 to 12
  monthName: string; // 'Janvier', 'Février', etc.
  monthShort: string; // 'Jan', 'Fév', 'Mars', 'Avr', etc.
  dateString: string; // '18 Janvier 2026'
  exactDate: string; // '2026-01-18'
  title: string;
  location: string;
  departmentCode: string;
  region: string;

  // 1. Mesure Téléray
  teleray: {
    baselineValue: number; // e.g. 95
    peakValue: number; // e.g. 158
    unit: string; // 'nSv/h'
    deltaPercent: number; // e.g. +66%
    stationsInvolved: string[];
    sensorType: string;
    curveTrend: 'STABLE' | 'MODERATE_SPIKE' | 'SHARP_PEAK' | 'DIP';
    validationStatus: 'VALIDÉ_ASNR' | 'ANALYSE_CONFORME' | 'BRUIT_NORMAL';
  };

  // 2. Alertes officielles
  officialAlert: {
    authority: 'ASNR' | 'IRSN' | 'SÉCURITÉ_CIVILE' | 'AIEA' | 'EURDEP';
    inesLevel: EventInesLevel;
    inesLabel: string;
    alertType: 'AVIS_INCIDENT' | 'EXERCICE_PPI' | 'BULLETIN_INFORMATIF' | 'COMMUNIQUÉ_OFFICIEL';
    title: string;
    summary: string;
    actionTaken: string;
    sanitaryImpact: 'AUCUN_IMPACT' | 'SURVEILLANCE_RENFORCÉE';
  };

  // 3. Événements environnementaux
  environmental: {
    phenomenon:
      | 'ORAGE_RADON_WASHOUT'
      | 'POUSSIERE_SAHARIENNE'
      | 'TEMPETE_OCEANIQUE'
      | 'ERUPTION_SOLAIRE'
      | 'CRUE_FLUVIALE'
      | 'NEIGE_ATTENUATION'
      | 'FEU_FORET';
    phenomenonLabel: string;
    icon: string;
    meteorologicalContext: string;
    impactOnMeasurements: string;
  };

  // Synthèse de corrélation
  correlationVerdict: {
    isArtificialContamination: boolean;
    verdictTitle: string;
    verdictExplanation: string;
    statusBadge: 'NATUREL_CONFIRMÉ' | 'EXERCICE_MAÎTRISÉ' | 'ÉCART_SANS_REJET';
  };
}

export const TIMELINE_YEARS = [2026, 2025];

export const TIMELINE_MONTHS = [
  { num: 1, label: 'Janvier', short: 'Jan' },
  { num: 2, label: 'Février', short: 'Fév' },
  { num: 3, label: 'Mars', short: 'Mars' },
  { num: 4, label: 'Avril', short: 'Avril' },
  { num: 5, label: 'Mai', short: 'Mai' },
  { num: 6, label: 'Juin', short: 'Juin' },
  { num: 7, label: 'Juillet', short: 'Juil' },
  { num: 8, label: 'Août', short: 'Août' },
  { num: 9, label: 'Septembre', short: 'Sept' },
  { num: 10, label: 'Octobre', short: 'Oct' },
  { num: 11, label: 'Novembre', short: 'Nov' },
  { num: 12, label: 'Décembre', short: 'Déc' },
];

export const TIMELINE_EVENTS_2026: TimelineEvent[] = [
  {
    id: 'evt-2026-01-tempete-bretagne',
    year: 2026,
    month: 1,
    monthName: 'Janvier',
    monthShort: 'Jan',
    dateString: '14 Janvier 2026',
    exactDate: '2026-01-14',
    title: 'Tempête atlantique « Gervaise » & Washout massif sur le massif armoricain',
    location: 'Brest, Quimper, Lannion',
    departmentCode: '29',
    region: 'Bretagne',
    teleray: {
      baselineValue: 145,
      peakValue: 218,
      unit: 'nSv/h',
      deltaPercent: 50.3,
      stationsInvolved: ['Téléray Brest-Gouesnou', 'Téléray Quimper-Plomelin', 'Téléray Lannion-Aéroport'],
      sensorType: 'Sonde gamma sous abri normalisé ASNR',
      curveTrend: 'SHARP_PEAK',
      validationStatus: 'VALIDÉ_ASNR',
    },
    officialAlert: {
      authority: 'ASNR',
      inesLevel: 'AUCUN',
      inesLabel: 'Sans classement INES',
      alertType: 'BULLETIN_INFORMATIF',
      title: 'Bulletin de surveillance radiologique n°2026-02',
      summary: 'L\'ASNR informe de variations transitoires enregistrées sur les balises d\'alerte bretonnes lors du passage du front pluvio-orageux.',
      actionTaken: 'Recoupement automatique avec les radars pluviométriques Météo-France. Aucune action de sûreté requise.',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'ORAGE_RADON_WASHOUT',
      phenomenonLabel: 'Lessivage pluvieux intense du Radon-222',
      icon: '🌧️',
      meteorologicalContext: 'Pluie battante soutenue (34 mm en 3h) associée à une baisse brutale de pression barométrique (982 hPa).',
      impactOnMeasurements: 'Rabattement au sol des descendants gamma du radon (Plomb-214 et Bismuth-214). Retour au niveau de base en 3h15 après la fin des pluies.',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Phénomène 100% naturel de rabattement pluvieux',
      verdictExplanation: 'La hausse de débit de dose coïncide à la seconde près avec le front de précipitations. La spectrométrie OPERA-Air ne relève aucun radionucléide artificiel.',
      statusBadge: 'NATUREL_CONFIRMÉ',
    },
  },
  {
    id: 'evt-2026-02-exercice-ppi-flamanville',
    year: 2026,
    month: 2,
    monthName: 'Février',
    monthShort: 'Fév',
    dateString: '18 Février 2026',
    exactDate: '2026-02-18',
    title: 'Exercice national de crise de sécurité civile (Plan Particulier d\'Intervention)',
    location: 'CNPE de Flamanville, Les Pieux, Cherbourg',
    departmentCode: '50',
    region: 'Normandie',
    teleray: {
      baselineValue: 82,
      peakValue: 84,
      unit: 'nSv/h',
      deltaPercent: 2.4,
      stationsInvolved: ['Téléray Flamanville-Bourg', 'Téléray Diélette', 'Téléray Cherbourg-Octeville'],
      sensorType: 'Réseau télémétrique d\'alerte immédiate Téléray',
      curveTrend: 'STABLE',
      validationStatus: 'ANALYSE_CONFORME',
    },
    officialAlert: {
      authority: 'SÉCURITÉ_CIVILE',
      inesLevel: 'EXERCICE',
      inesLabel: 'Exercice réglementaire d\'État',
      alertType: 'EXERCICE_PPI',
      title: 'Activation du Centre Opérationnel Départemental de la Manche',
      summary: 'Simulation grandeur nature d\'un incident technique sur l\'EPR de Flamanville sans aucun rejet dans l\'environnement.',
      actionTaken: 'Test des sirènes d\'alerte SAIP, transmission en temps réel des données Téléray au centre de crise ASNR / IRSN.',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'TEMPETE_OCEANIQUE',
      phenomenonLabel: 'Conditions maritimes normales en Cotentin',
      icon: '🌬️',
      meteorologicalContext: 'Ciel couvert, vent d\'ouest modéré (45 km/h), absence de précipitations significatives.',
      impactOnMeasurements: 'Fond radiologique marin et sédimentaire strictement stable à 82-84 nSv/h sur tout le périmètre de 20 km.',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Exercice de sécurité civile maîtrisé • Données stables',
      verdictExplanation: 'L\'exercice réglementaire s\'est déroulé avec succès. Les balises réelles Téléray confirment une stabilité totale du bruit de fond ambiant.',
      statusBadge: 'EXERCICE_MAÎTRISÉ',
    },
  },
  {
    id: 'evt-2026-03-sable-sahara-sud',
    year: 2026,
    month: 3,
    monthName: 'Mars',
    monthShort: 'Mars',
    dateString: '22 Mars 2026',
    exactDate: '2026-03-22',
    title: 'Épisode de poussières désertiques sahariennes (Sirocco méditerranéen)',
    location: 'Marseille, Nice, Montpellier, Perpignan',
    departmentCode: '13',
    region: 'Provence-Alpes-Côte d\'Azur / Occitanie',
    teleray: {
      baselineValue: 88,
      peakValue: 104,
      unit: 'nSv/h',
      deltaPercent: 18.2,
      stationsInvolved: ['Téléray Marseille-Prado', 'Téléray Marignane', 'Téléray Nice-Aéroport'],
      sensorType: 'Sondes Téléray + Filtres aérosols OPERA-Air',
      curveTrend: 'MODERATE_SPIKE',
      validationStatus: 'VALIDÉ_ASNR',
    },
    officialAlert: {
      authority: 'IRSN',
      inesLevel: 'AUCUN',
      inesLabel: 'Sans classement INES',
      alertType: 'BULLETIN_INFORMATIF',
      title: 'Note d\'information : Remontée de particules minérales sahariennes',
      summary: 'L\'IRSN publie l\'analyse des filtres atmosphériques grand débit OPERA-Air prélevés lors de l\'épisode de ciel ocre.',
      actionTaken: 'Spectrométrie gamma HPGe en laboratoire : détection d\'isotopes naturels du potassium-40 et du thorium-232 fixés sur les sables.',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'POUSSIERE_SAHARIENNE',
      phenomenonLabel: 'Panache de poussières minérales du Sahara',
      icon: '🏜️',
      meteorologicalContext: 'Flux de sud puissant transportant plusieurs milliers de tonnes de microparticules d\'Afrique du Nord.',
      impactOnMeasurements: 'Légère élévation naturelle du débit gamma au sol (+15 nSv/h) et dépôt au sol lors de pluies chargées de sable.',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Traces telluriques naturelles transportées par le vent',
      verdictExplanation: 'La composition isotopique identifiée par OPERA-Air confirme la signature exclusive des radioéléments géologiques sahariens, sans aucun composé artificiel.',
      statusBadge: 'NATUREL_CONFIRMÉ',
    },
  },
  {
    id: 'evt-2026-04-ecart-tricastin',
    year: 2026,
    month: 4,
    monthName: 'Avril',
    monthShort: 'Avril',
    dateString: '11 Avril 2026',
    exactDate: '2026-04-11',
    title: 'Écart d\'exploitation classé INES 0 (Non-conformité temporaire d\'une vanne)',
    location: 'Site nucléaire du Tricastin (Drôme)',
    departmentCode: '26',
    region: 'Auvergne-Rhône-Alpes',
    teleray: {
      baselineValue: 92,
      peakValue: 93,
      unit: 'nSv/h',
      deltaPercent: 1.1,
      stationsInvolved: ['Téléray Pierrelatte', 'Téléray Bollène', 'Téléray Saint-Paul-Trois-Châteaux'],
      sensorType: 'Balises de clôture et de proximité Téléray',
      curveTrend: 'STABLE',
      validationStatus: 'ANALYSE_CONFORME',
    },
    officialAlert: {
      authority: 'ASNR',
      inesLevel: 0,
      inesLabel: 'Niveau 0 INES (Écart)',
      alertType: 'AVIS_INCIDENT',
      title: 'Avis d\'incident INES 0 : Fermeture différée d\'une tuyauterie secondaire',
      summary: 'EDF a déclaré à l\'ASNR un écart d\'exploitation sur l\'unité de production n°2 lors des opérations de maintenance programmée.',
      actionTaken: 'Remise en conformité immédiate du lignage. Contrôle continu des balises environnementales sans aucun rejet liquide ou gazeux.',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'TEMPETE_OCEANIQUE',
      phenomenonLabel: 'Mistral rhodanien soutenu (75 km/h)',
      icon: '💨',
      meteorologicalContext: 'Ciel parfaitement dégagé, vent fort orienté nord-sud dans la vallée du Rhône.',
      impactOnMeasurements: 'Débit gamma stable à 92 nSv/h. Détection HydroTéléray sur le Rhône conforme aux bruits de fond usuels en tritium (1,8 Bq/L).',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Écart matériel d\'atelier sans rejet externe',
      verdictExplanation: 'Les capteurs Téléray et HydroTéléray confirment l\'absence absolue de rejet radiologique dans l\'air ou le fleuve Rhône.',
      statusBadge: 'ÉCART_SANS_REJET',
    },
  },
  {
    id: 'evt-2026-05-tempete-solaire',
    year: 2026,
    month: 5,
    monthName: 'Mai',
    monthShort: 'Mai',
    dateString: '12 Mai 2026',
    exactDate: '2026-05-12',
    title: 'Tempête géomagnétique solaire de classe G4 & Aurores boréales visibles en France',
    location: 'Ensemble du territoire métropolitain',
    departmentCode: 'FR',
    region: 'France entière',
    teleray: {
      baselineValue: 98,
      peakValue: 106,
      unit: 'nSv/h',
      deltaPercent: 8.1,
      stationsInvolved: ['Balises alpines d\'altitude (Pic du Midi, Chamonix, Briançon)'],
      sensorType: 'Sondes haute sensibilité + Réseau cosmique neutronique',
      curveTrend: 'MODERATE_SPIKE',
      validationStatus: 'VALIDÉ_ASNR',
    },
    officialAlert: {
      authority: 'IRSN',
      inesLevel: 'AUCUN',
      inesLabel: 'Sans classement INES',
      alertType: 'BULLETIN_INFORMATIF',
      title: 'Observation de l\'activité solaire par le réseau SIEVERT',
      summary: 'L\'IRSN informe d\'une hausse modérée du débit de dose cosmique en haute altitude liée à une éjection de masse coronale (CME).',
      actionTaken: 'Surveillance des doses des personnels navigants aériens par le système SIEVERT. Aucun impact sanitaire au niveau du sol.',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'ERUPTION_SOLAIRE',
      phenomenonLabel: 'Éjection de masse coronale (CME) solaire',
      icon: '🌌',
      meteorologicalContext: 'Indice Kp géomagnétique = 8,3. Aurores boréales observées jusqu\'en Île-de-France et en Bretagne.',
      impactOnMeasurements: 'Légère modulation du flux cosmique secondaire (+8 nSv/h sur les sommets alpins, imperceptible au niveau de la mer).',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Phénomène cosmique naturel d\'origine solaire',
      verdictExplanation: 'La hausse est strictement d\'origine spatiale et mesurée simultanément sur l\'ensemble des observatoires européens EURDEP.',
      statusBadge: 'NATUREL_CONFIRMÉ',
    },
  },
  {
    id: 'evt-2026-06-crue-loire-hydro',
    year: 2026,
    month: 6,
    monthName: 'Juin',
    monthShort: 'Juin',
    dateString: '24 Juin 2026',
    exactDate: '2026-06-24',
    title: 'Épisode de crue orageuse de la Loire & Bilan HydroTéléray',
    location: 'Bassin de la Loire (Belleville, Dampierre, Saint-Laurent)',
    departmentCode: '45',
    region: 'Centre-Val de Loire',
    teleray: {
      baselineValue: 85,
      peakValue: 110,
      unit: 'nSv/h',
      deltaPercent: 29.4,
      stationsInvolved: ['HydroTéléray Dampierre-en-Burly', 'Téléray Gien', 'HydroTéléray Orléans'],
      sensorType: 'Sonde de scintillation immergée HydroTéléray + Balises d\'air',
      curveTrend: 'MODERATE_SPIKE',
      validationStatus: 'VALIDÉ_ASNR',
    },
    officialAlert: {
      authority: 'ASNR',
      inesLevel: 'AUCUN',
      inesLabel: 'Sans classement INES',
      alertType: 'COMMUNIQUÉ_OFFICIEL',
      title: 'Bilan de surveillance hydrologique en période de crue',
      summary: 'L\'ASNR confirme le maintien des mesures en continu sur les effluents liquides fluviaux malgré les débits exceptionnels de la Loire.',
      actionTaken: 'Analyse d\'eau quotidienne : tritium mesuré à 2,1 Bq/L (très largement inférieur à la référence européenne de 100 Bq/L).',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'CRUE_FLUVIALE',
      phenomenonLabel: 'Crue estivale de la Loire (débit x 4)',
      icon: '🌊',
      meteorologicalContext: 'Séquence d\'orages stationnaires sur le Massif central entraînant une onde de crue fluviale rapide.',
      impactOnMeasurements: 'Dilution hydrologique des eaux fluviales et élévation temporaire de +25 nSv/h sur les berges due au rabattement du radon sous les orages.',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Surveillance fluviale 100% nominale en période de crue',
      verdictExplanation: 'Toutes les mesures hydrologiques et gamma restent conformes aux normes d\'eau potable de la directive européenne Euratom.',
      statusBadge: 'NATUREL_CONFIRMÉ',
    },
  },
  {
    id: 'evt-2026-08-feux-sud-opera',
    year: 2026,
    month: 8,
    monthName: 'Août',
    monthShort: 'Août',
    dateString: '14 Août 2026',
    exactDate: '2026-08-14',
    title: 'Feux de forêt méditerranéens & Remise en suspension de traces de Césium-137',
    location: 'Massif des Maures / Sainte-Baume (Var)',
    departmentCode: '83',
    region: 'Provence-Alpes-Côte d\'Azur',
    teleray: {
      baselineValue: 94,
      peakValue: 97,
      unit: 'nSv/h',
      deltaPercent: 3.2,
      stationsInvolved: ['Téléray Toulon', 'OPERA-Air Cadarache', 'Téléray Hyères'],
      sensorType: 'Filtres à grand débit OPERA-Air (700 m³/h)',
      curveTrend: 'STABLE',
      validationStatus: 'VALIDÉ_ASNR',
    },
    officialAlert: {
      authority: 'IRSN',
      inesLevel: 'AUCUN',
      inesLabel: 'Sans classement INES',
      alertType: 'BULLETIN_INFORMATIF',
      title: 'Note IRSN : Surveillance des fumées d\'incendies de forêt',
      summary: 'L\'IRSN publie l\'analyse des prélèvements d\'air dans le panache de fumée de l\'incendie de forêt.',
      actionTaken: 'Spectrométrie gamma fine : détection de traces infimes de Cs-137 historique rémanent (0,4 µBq/m³), sans aucun danger pour la population.',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'FEU_FORET',
      phenomenonLabel: 'Fumées d\'incendies de biomasse forestière',
      icon: '🔥',
      meteorologicalContext: 'Sécheresse caniculaire sévère, mistral violent à 80 km/h, propagation rapide de feux de forêt.',
      impactOnMeasurements: 'Débit gamma au sol Téléray inchangé (94 nSv/h). Détection à l\'état de micro-traces sur filtres d\'air de retombées anciennes piégées dans le bois.',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Rémanence historique dans la biomasse végétale',
      verdictExplanation: 'Les traces de Cs-137 correspondent à la combustion de végétaux ayant stocké des retombées anciennes (Tchernobyl 1986 et essais atmosphériques des années 1960). Niveau 100 000 fois inférieur aux seuils sanitaires.',
      statusBadge: 'NATUREL_CONFIRMÉ',
    },
  },
  {
    id: 'evt-2026-10-episode-cevenol',
    year: 2026,
    month: 10,
    monthName: 'Octobre',
    monthShort: 'Oct',
    dateString: '04 Octobre 2026',
    exactDate: '2026-10-04',
    title: 'Épisode cévenol d\'intensité remarquable : Pic de radon sous déluge pluvieux',
    location: 'Alès, Mende, Aubenas, Le Vigan',
    departmentCode: '30',
    region: 'Occitanie / Auvergne-Rhône-Alpes',
    teleray: {
      baselineValue: 128,
      peakValue: 242,
      unit: 'nSv/h',
      deltaPercent: 89.1,
      stationsInvolved: ['Téléray Alès-Centre', 'Téléray Mende-Aérodrome', 'Téléray Aubenas'],
      sensorType: 'Sondes d\'alerte Téléray haute sensibilité',
      curveTrend: 'SHARP_PEAK',
      validationStatus: 'VALIDÉ_ASNR',
    },
    officialAlert: {
      authority: 'ASNR',
      inesLevel: 'AUCUN',
      inesLabel: 'Sans classement INES',
      alertType: 'COMMUNIQUÉ_OFFICIEL',
      title: 'Alerte météo cévenole & Explication des hausses de télémesures',
      summary: 'L\'ASNR rappelle que les hausses rapides mesurées sur les Cévennes résultent du rabattement pluvieux massif du radon naturel.',
      actionTaken: 'Supervision algorithmique 24/7 : vérification de la décroissance radioactive concordante avec la demi-vie du Bismuth-214.',
      sanitaryImpact: 'AUCUN_IMPACT',
    },
    environmental: {
      phenomenon: 'ORAGE_RADON_WASHOUT',
      phenomenonLabel: 'Épisode cévenol stationnaire (220 mm en 12h)',
      icon: '⛈️',
      meteorologicalContext: 'Confluence d\'air chaud et très humide en provenance de Méditerranée venant buter sur le relief granitique des Cévennes.',
      impactOnMeasurements: 'Hausse spectaculaire de +114 nSv/h en 90 minutes sur les balises cévenoles lors du paroxysme de l\'orage, suivie d\'un retour nominal sous 3 heures.',
    },
    correlationVerdict: {
      isArtificialContamination: false,
      verdictTitle: 'Archétype de washout cévenol naturel de radon',
      verdictExplanation: 'Cas d\'école illustrant la corrélation parfaite entre géologie granitique cévenole (riche en uranium/radon) et lessivage torrentiel de l\'atmosphère par les pluies.',
      statusBadge: 'NATUREL_CONFIRMÉ',
    },
  },
];
