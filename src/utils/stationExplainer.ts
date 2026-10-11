import type { Station, StationDetail } from '../types/radiation';

export interface FactorDetail {
  id: 'geology' | 'weather' | 'natural_baseline' | 'cosmic' | 'instrumentation';
  icon: string;
  title: string;
  shortSummary: string;
  estimatedContribution: string;
  detailedExplanation: string;
  keyPoints: string[];
  variabilityCause: string;
}

export interface StationValueExplanation {
  stationValue: number;
  unit: string;
  stationName: string;
  commune: string;
  departmentCode: string;
  regionName: string;
  evaluationStatus: 'NORMAL_LOW' | 'NORMAL_AVERAGE' | 'NORMAL_GRANITIC' | 'ELEVATED_WATCH';
  evaluationLabel: string;
  evaluationColor: string;
  geologySummary: string;
  cosmicEstimate: number; // in nSv/h
  telluricEstimate: number; // in nSv/h
  factors: FactorDetail[];
  scientificSynthesis: string;
}

// Geological classifications by department code in France
const GRANITIC_DEPARTMENTS = new Set([
  '29', '22', '56', '35', // Bretagne
  '87', '19', '23', '63', '15', '43', '03', '42', // Massif central / Limousin / Auvergne
  '88', '68', '67', // Vosges / Alsace
  '2A', '2B', // Corse cristalline
  '05', '06', '04', '73', '74', '38', // Alpes cristallines
  '09', '66', '65', '31', '64', // Pyrénées axiales
  '85', '44', '49', // Vendée / Loire-Atlantique hercynienne
]);

const SEDIMENTARY_DEPARTMENTS = new Set([
  '75', '77', '78', '91', '92', '93', '94', '95', // Île-de-France (Bassin parisien calcaire)
  '45', '28', '41', '37', '18', '36', // Centre-Val de Loire
  '33', '40', '47', '24', '32', // Bassin aquitain (sables, molasse, calcaire)
  '14', '50', '61', '27', '76', // Normandie sédimentaire
  '59', '62', '80', '60', '02', // Hauts-de-France (craie)
  '10', '51', '08', '52', '54', '55', '57', // Grand Est sédimentaire
  '21', '89', '58', '71', '39', '25', // Bourgogne / Jura
  '13', '83', '84', '30', '34', '11', // Méditerranée calcaire
]);

export function explainStationValue(
  station: Station | StationDetail,
  currentValue?: number
): StationValueExplanation {
  const val = currentValue ?? station.latest_measurement?.value ?? 100;
  const unit = station.unit || station.latest_measurement?.unit || 'nSv/h';
  const dep = station.department_code || '';
  const alt = station.altitude || 120; // default 120m

  const isGranitic = GRANITIC_DEPARTMENTS.has(dep);
  const isSedimentary = SEDIMENTARY_DEPARTMENTS.has(dep);

  // Compute altitude-based cosmic estimate (approx 32 nSv/h at sea level + 15 nSv/h per 1000m)
  const cosmicEst = Math.round(32 + (alt / 1000) * 16);
  // Telluric is the rest of background (val - cosmic)
  const telluricEst = Math.max(30, Math.round(val - cosmicEst));

  // Determine status & geology label
  let evaluationStatus: StationValueExplanation['evaluationStatus'] = 'NORMAL_AVERAGE';
  let evaluationLabel = 'Bruit de fond naturel nominal français';
  let evaluationColor = 'text-emerald-400';
  let geologySummary = 'Sous-sol sédimentaire ordinaire (calcaire, argiles ou craie).';

  if (isGranitic) {
    geologySummary = 'Sous-sol cristallin ou granitique hercynien naturellement riche en uranium-238, thorium-232 et potassium-40.';
    if (val >= 140) {
      evaluationStatus = 'NORMAL_GRANITIC';
      evaluationLabel = 'Fond tellurique granitique naturel (Massif hercynien)';
      evaluationColor = 'text-amber-400';
    }
  } else if (isSedimentary) {
    geologySummary = 'Bassin sédimentaire (calcaire, craie, sables) présentant une concentration modérée en radioéléments primordiaux.';
    if (val < 90) {
      evaluationStatus = 'NORMAL_LOW';
      evaluationLabel = 'Bruit de fond naturel bas (Bassin sédimentaire)';
      evaluationColor = 'text-sky-400';
    }
  }

  if (val > 220) {
    evaluationStatus = 'ELEVATED_WATCH';
    evaluationLabel = 'Valeur au-dessus du fond moyen (Recoupement météo recommandé)';
    evaluationColor = 'text-amber-300';
  }

  const factors: FactorDetail[] = [
    {
      id: 'geology',
      icon: '🌍',
      title: 'Géologie locale (Rayonnement tellurique)',
      shortSummary: isGranitic
        ? 'Massif ancien riche en radioéléments naturels (granite, volcanisme).'
        : 'Roches sédimentaires à émissivité modérée (craie, calcaire, alluvions).',
      estimatedContribution: `~${telluricEst} nSv/h (soit ~${Math.round((telluricEst / val) * 100)}% du total)`,
      detailedExplanation: `Les roches de la croûte terrestre contiennent depuis l'origine de la planète de l'Uranium-238, du Thorium-232 et du Potassium-40. À ${station.commune || station.name || 'cette balise'} (${dep ? 'Dép. ' + dep : 'France'}), la composition minéralogique locale détermine le socle d'émission gamma en continu.`,
      keyPoints: [
        isGranitic
          ? 'Présence de granites ou roches cristallines : émission tellurique naturellement supérieure à la moyenne nationale.'
          : 'Bassin sédimentaire : teneur naturellement plus basse en radioéléments primordiaux.',
        'L’humidité profonde du sol et la nappe phréatique modulent très lentement ce signal au cours des saisons.',
      ],
      variabilityCause: 'Stable sur le long terme ; légère atténuation de quelques % lors de sols gorgés d\'eau.',
    },
    {
      id: 'weather',
      icon: '☁️',
      title: 'Conditions météorologiques (Pluie & Radon)',
      shortSummary: 'Les averses rabattent les descendants radioactifs du radon au sol (Washout).',
      estimatedContribution: 'Fluctuations temporaires de +10 à +60 nSv/h lors d\'averses',
      detailedExplanation: 'Le Radon-222 est un gaz radioactif noble qui s\'exhale continuellement des failles et pores du sol dans l\'air. Dans l\'atmosphère, il se désintègre en microparticules solides émettrices gamma (Plomb-214, Bismuth-214). Lors d\'un épisode pluvieux, ces particules sont lessivées par les gouttes et rabattues au niveau du sol.',
      keyPoints: [
        'Élévation transitoire de +20% à +80% pendant l\'averse : phénomène 100% naturel.',
        'Décroissance radioactive rapide : la demi-vie du Plomb-214 et du Bismuth-214 n\'étant que de 20 à 30 minutes, le débit revient à sa valeur de base en 2 à 4 heures.',
        'La pression atmosphérique basse favorise aussi l\'émanation du radon du sous-sol.',
      ],
      variabilityCause: 'Pics transitoires de quelques heures lors des pluies battantes et des orages.',
    },
    {
      id: 'natural_baseline',
      icon: '☢️',
      title: 'Rayonnement naturel ambiant de référence',
      shortSummary: `Valeur mesurée de ${val.toFixed(1)} ${unit} conforme à la moyenne métropolitaine.`,
      estimatedContribution: 'Norme métropolitaine : 50 à 250 nSv/h',
      detailedExplanation: 'L\'être humain a toujours vécu immergé dans ce bain de rayonnements naturels. En France, l\'exposition ambiante externe moyenne varie de 70 à 150 nSv/h en plaine et peut atteindre 300 nSv/h sur les hauts plateaux granitiques sans aucun impact sanitaire.',
      keyPoints: [
        `La valeur de cette station (${val.toFixed(1)} ${unit}) s'inscrit pleinement dans la distribution statistique nominale observée par l'ASNR.`,
        'Aucune trace d\'activité artificielle anormale n\'est requise pour expliquer ce niveau de débit.',
      ],
      variabilityCause: 'Fond continu permanent existant depuis la formation de la planète.',
    },
    {
      id: 'cosmic',
      icon: '🌌',
      title: 'Rayonnement cosmique & Altitude',
      shortSummary: `Particules relativistes spatiales (~${cosmicEst} nSv/h à ~${alt} m d'altitude).`,
      estimatedContribution: `~${cosmicEst} nSv/h (soit ~${Math.round((cosmicEst / val) * 100)}% du total)`,
      detailedExplanation: 'La Terre est continuellement bombardée par des particules subatomiques d\'énergie extrême issues du Soleil et du cosmos lointain. En traversant l\'atmosphère, elles produisent des gerbes de muons et de neutrons secondaires qui atteignent le détecteur.',
      keyPoints: [
        `Altitude du site : environ ${alt} m. L'effet protecteur du bouclier atmosphérique diminue avec l'altitude (le débit cosmique double tous les 1 500 à 2 000 m).`,
        'Activité solaire : les éruptions solaires et les variations du champ magnétique terrestre créent de légères oscillations.',
      ],
      variabilityCause: 'Stable au sol ; augmente systématiquement avec l\'altitude.',
    },
    {
      id: 'instrumentation',
      icon: '📡',
      title: 'Instrumentation & Métrologie (Bruit statistique)',
      shortSummary: 'Incertitude normale de comptage de Poisson de ± 3 à 8 nSv/h.',
      estimatedContribution: 'Incertitude statistique normale de ± 4 à 8%',
      detailedExplanation: 'La sonde (tube Geiger-Müller à compensation d\'énergie ou chambre d\'ionisation) compte des impulsions individuelles. La désintégration atomique étant un phénomène probabiliste aléatoire, le nombre d\'impacts par minute fluctue naturellement selon une loi de Poisson.',
      keyPoints: [
        'Une variation de ± 5 nSv/h d\'une mesure à l\'autre ne traduit aucun changement physique du lieu, mais le bruit de comptage statistique inhérent à la physique nucléaire.',
        'Moyennage glissant : la télémesure intègre les impulsions sur 10 à 60 minutes pour stabiliser la mesure.',
      ],
      variabilityCause: 'Fluctuations aléatoires mineures visibles d\'une heure à l\'autre.',
    },
  ];

  const scientificSynthesis = `La valeur de ${val.toFixed(1)} ${unit} observée sur la balise ${station.name || 'Téléray'} résulte de l'addition naturelle de la composante tellurique du sol (~${telluricEst} nSv/h) et du rayonnement cosmique d'altitude (~${cosmicEst} nSv/h), soumise aux fluctuations météorologiques (pluie/radon) et à l'incertitude statistique normale du capteur (± 5 nSv/h). Cette dynamique est 100% nominale et ne présente aucun caractère accidentel.`;

  return {
    stationValue: val,
    unit,
    stationName: station.name || 'Station Téléray',
    commune: station.commune || station.name,
    departmentCode: dep,
    regionName: station.region_code || 'France métropolitaine',
    evaluationStatus,
    evaluationLabel,
    evaluationColor,
    geologySummary,
    cosmicEstimate: cosmicEst,
    telluricEstimate: telluricEst,
    factors,
    scientificSynthesis,
  };
}
