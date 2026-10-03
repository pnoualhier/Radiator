export type SourceCode = 'TELERAY' | 'OPERA_AIR' | 'HYDROTELERAY' | 'EURDEP' | 'OPENRADIATION' | 'SAFECAST';

export type NetworkTier = 'INSTITUTIONAL' | 'PARTICIPATORY' | 'INTERNATIONAL';

export type MeasurementTypeCode =
  | 'AMBIENT_GAMMA_DOSE_RATE'       // Débit de dose gamma ambiant (nSv/h, µSv/h) - Téléray, OpenRadiation, Safecast, EURDEP
  | 'ATMOSPHERIC_AEROSOLS'          // Aérosols atmosphériques (µBq/m³, mBq/m³) - Réseau OPERA-Air (ASNR-IRSN)
  | 'RADIONUCLIDE_CONCENTRATION'    // Concentration en radionucléides spécifiques (Bq/m³, mBq/m³)
  | 'WATER_RADIOACTIVITY'           // Radioactivité dans l'eau et fleuves (Bq/L) - Réseau HydroTéléray (ASNR-IRSN)
  | 'VOLUMETRIC_ACTIVITY'           // Activité volumique dans l'air (Bq/m³) - Gaz rares, Radon
  | 'SURFACE_ACTIVITY'              // Activité surfacique / Dépôts au sol (Bq/m²)
  | 'FOOD_RADIOACTIVITY'            // Radioactivité dans la chaîne alimentaire (Bq/kg)
  | 'GAMMA_SPECTROMETRY';           // Spectrométrie gamma (Spectres en énergie & isotopes)

export interface MeasurementTypeInfo {
  code: MeasurementTypeCode;
  name: string;
  short_name: string;
  unit: string;
  description: string;
  physical_quantity: string;
  matrix: string;
  why_distinct_from_teleray: string;
  icon_name: string;
  network_example: string;
}

export const MEASUREMENT_TYPES_CATALOG: Record<MeasurementTypeCode, MeasurementTypeInfo> = {
  AMBIENT_GAMMA_DOSE_RATE: {
    code: 'AMBIENT_GAMMA_DOSE_RATE',
    name: 'Débit de dose gamma ambiant',
    short_name: 'Dose gamma ambiante',
    unit: 'nSv/h',
    physical_quantity: "Débit d'équivalent de dose ambiant H*(10) en Sv/h",
    matrix: 'Air ambiant extérieur à 1 m du sol',
    why_distinct_from_teleray: "C'est la mesure principale de Téléray. Elle mesure l'effet externe global de tous les rayonnements gamma combinés mais ne peut pas identifier les radionucléides individuellement.",
    description: "Mesure globale continue de l'irradiation gamma ambiante externe. Les sondes (Geiger-Müller ou chambres d'ionisation) enregistrent l'élévation globale du débit de dose sans différencier les isotopes émetteurs.",
    icon_name: 'Radio',
    network_example: 'Téléray (ASNR / IRSN), OpenRadiation, EURDEP, Safecast',
  },
  ATMOSPHERIC_AEROSOLS: {
    code: 'ATMOSPHERIC_AEROSOLS',
    name: 'Aérosols atmosphériques (Particules en suspension)',
    short_name: 'Aérosols (OPERA-Air)',
    unit: 'µBq/m³',
    physical_quantity: "Activité volumique des particules en suspension dans l'air",
    matrix: 'Filtres aérosols à très grand débit (100 à 1000 m³/h)',
    why_distinct_from_teleray: "Téléray ne mesure pas la concentration des poussières radioactives dans l'air. Le réseau OPERA-Air de l'ASNR aspire l'air en continu sur filtres pour détecter d'infimes traces artificielles (Césium-137, Iode-131, Béryllium-7).",
    description: "Surveillance sentinelle ultra-sensible de l'atmosphère française. Permet d'observer les masses d'air internationales et de détecter des traces de contaminations bien avant qu'elles ne soient visibles sur le débit de dose gamma global.",
    icon_name: 'Wind',
    network_example: 'Réseau OPERA-Air (ASNR-IRSN)',
  },
  RADIONUCLIDE_CONCENTRATION: {
    code: 'RADIONUCLIDE_CONCENTRATION',
    name: 'Concentration en radionucléides spécifiques',
    short_name: 'Concentration radionucléides',
    unit: 'mBq/m³',
    physical_quantity: "Activité volumique isotopique par mètre cube",
    matrix: "Air, gaz d'échappement, panaches de rejet",
    why_distinct_from_teleray: "Mesure quantitative ciblée par radionucléide (ex: Césium-134/137, Strontium-90, Tritium, Carbone-14) inaccessible aux simples compteurs gamma Téléray.",
    description: "Quantification individualisée de chaque isotope radioactif dans l'environnement atmosphérique ou aquatique après prélèvement et analyse spécifique en métrologie.",
    icon_name: 'Atom',
    network_example: 'Laboratoires de radiométrie environnementale IRSN',
  },
  WATER_RADIOACTIVITY: {
    code: 'WATER_RADIOACTIVITY',
    name: "Radioactivité dans l'eau et les fleuves",
    short_name: 'Eaux fluviales (HydroTéléray)',
    unit: 'Bq/L',
    physical_quantity: 'Activité volumique dans les eaux douces ou de mer',
    matrix: 'Eau brute de fleuve (Rhône, Seine, Loire, Rhin, Garonne)',
    why_distinct_from_teleray: "Téléray est un réseau terrestre atmosphérique. L'ASNR exploite HydroTéléray avec des stations de pompage continues au fil des fleuves en aval des centrales pour mesurer le Tritium et l'activité globale de l'eau.",
    description: "Télésurveillance en temps réel de la qualité radiologique des grands bassins fluviaux français et de l'eau brute destinée à la potabilisation ou au refroidissement industriel.",
    icon_name: 'Droplets',
    network_example: 'Réseau HydroTéléray (ASNR-IRSN)',
  },
  VOLUMETRIC_ACTIVITY: {
    code: 'VOLUMETRIC_ACTIVITY',
    name: 'Activité volumique gazeuse',
    short_name: 'Activité volumique (Gaz)',
    unit: 'Bq/m³',
    physical_quantity: 'Activité par unité de volume de gaz ou air',
    matrix: "Air ambiant, atmosphère confinée, sous-sols",
    why_distinct_from_teleray: "Concerne les radionucléides gazeux non filtrables (Radon-222 naturel, Xénon-133, Krypton-85) nécessitant des chambres de détection alpha ou de piégeage cryogénique.",
    description: "Surveillance de la présence de gaz radioactifs dans l'atmosphère, notamment le Radon-222 d'origine tellurique et les gaz rares de fission.",
    icon_name: 'CloudRain',
    network_example: 'Réseau national de surveillance du Radon IRSN',
  },
  SURFACE_ACTIVITY: {
    code: 'SURFACE_ACTIVITY',
    name: 'Activité surfacique (Dépôts et retombées au sol)',
    short_name: 'Dépôts au sol',
    unit: 'Bq/m²',
    physical_quantity: 'Activité déposée par unité de surface de sol',
    matrix: 'Collecteurs météorologiques (pluie, neige, dépôts secs)',
    why_distinct_from_teleray: "Mesure la contamination accumulée au mètre carré sur la végétation et le sol par retombée météo, alors que Téléray mesure l'ambiance aérienne instantanée.",
    description: "Évaluation des retombées atmosphériques humides (lessivage par la pluie) et sèches sur des jauges de dépôt pour cartographier le marquage rémanent des sols.",
    icon_name: 'Layers',
    network_example: 'Collecteurs de retombées météorologiques IRSN',
  },
  FOOD_RADIOACTIVITY: {
    code: 'FOOD_RADIOACTIVITY',
    name: 'Radioactivité dans la chaîne alimentaire',
    short_name: 'Aliments & Chaîne trophique',
    unit: 'Bq/kg',
    physical_quantity: 'Activité massique dans les denrées alimentaires',
    matrix: 'Lait de vache, céréales, viandes, poissons, fruits et légumes',
    why_distinct_from_teleray: "Évalue le risque d'incorporation interne par ingestion d'aliments, totalement invisible sur une sonde de dose externe gamma.",
    description: "Prélèvements sentinelles dans les fermes et coopératives sentinelles françaises pour vérifier l'absence de transfert de radioactivité vers l'alimentation humaine.",
    icon_name: 'Apple',
    network_example: 'Observatoire sentinelle de la chaîne alimentaire',
  },
  GAMMA_SPECTROMETRY: {
    code: 'GAMMA_SPECTROMETRY',
    name: 'Spectrométrie gamma (Identification spectrale des isotopes)',
    short_name: 'Spectrométrie gamma',
    unit: 'mBq/m³',
    physical_quantity: 'Distribution de fluence et énergie des photons gamma (keV / MeV)',
    matrix: 'Spectres complets (détecteurs Germanium hyperpur HPGe ou NaI)',
    why_distinct_from_teleray: "Une balise Téléray classique donne un seul chiffre (nSv/h). La spectrométrie trace une courbe d'énergie qui signe formellement la 'carte d'identité' de chaque radionucléide (Cs-137 à 662 keV, Co-60 à 1173 et 1332 keV).",
    description: "Méthode de référence physique d'identification et de quantification des radionucléides émetteurs gamma sans équivoque.",
    icon_name: 'Activity',
    network_example: 'Spectromètres de laboratoire IRSN & Balises spectrales',
  },
};

export interface OpenRadiationMeta {
  report_uuid?: string;
  qualification?: string;
  atypical?: boolean;
  raw_usvh?: number;
  public_url?: string;
  daily_download_url?: string;
}

export interface Source {
  id: number;
  code: SourceCode;
  name: string;
  organization: string;
  source_type: 'INSTITUTIONAL' | 'CITIZEN' | 'RESEARCH';
  api_url?: string;
  license?: string;
  is_official: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceHealth {
  code: string;
  name: string;
  is_active: boolean;
  is_official: boolean;
  status: 'OK' | 'DEGRADED' | 'DISABLED' | 'ERROR';
  last_sync_at?: string;
  last_sync_status?: string;
  records_count: number;
}

export interface Measurement {
  id: number;
  station_id: number;
  source_id: number;
  external_id?: string;
  measured_at: string;
  received_at: string;
  value: number;
  unit: string;
  measurement_type: MeasurementTypeCode;
  radionuclide?: string;
  sample_matrix?: string;
  detection_limit?: number;
  quality_status: 'VALID' | 'SUSPECT' | 'MISSING' | 'STALE' | 'INVALID';
  validation_status: string;
  data_nature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
  is_simulated?: boolean;
  raw_value?: number;
  raw_unit?: string;
  metadata_json?: string;
  created_at: string;
}

export interface LatestMeasurement {
  station_id: number;
  station_name: string;
  station_commune?: string;
  department_code?: string;
  latitude: number;
  longitude: number;
  is_official: boolean;
  source_code: string;
  source_name: string;
  measured_at: string;
  value: number;
  unit: string;
  measurement_type?: MeasurementTypeCode;
  radionuclide?: string;
  sample_matrix?: string;
  quality_status: 'VALID' | 'SUSPECT' | 'MISSING' | 'STALE' | 'INVALID';
  is_stale: boolean;
  data_nature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
  is_simulated?: boolean;
}

export interface Station {
  id: number;
  external_id: string;
  source_id: number;
  source_code?: string;
  source_name?: string;
  network_tier?: NetworkTier;
  measurement_type?: MeasurementTypeCode;
  unit?: string;
  radionuclide_focus?: string;
  sample_matrix?: string;
  openradiation_meta?: OpenRadiationMeta;
  name: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  country: string;
  region_code?: string;
  department_code?: string;
  commune?: string;
  station_type: 'FIXED' | 'MOBILE' | 'CITIZEN' | 'OTHER';
  is_official: boolean;
  is_active: boolean;
  data_nature?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
  is_simulated?: boolean;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  latest_measurement?: Measurement;
}

export interface StationDetail extends Station {
  recent_measurements: Measurement[];
}

export interface StationStatistics {
  station_id: number;
  period_hours: number;
  count: number;
  minimum?: number;
  maximum?: number;
  average?: number;
  median?: number;
  unit: string;
  from_date?: string;
  to_date?: string;
}

export interface OfficialAlert {
  id: number;
  external_id?: string;
  source_id: number;
  source_code?: string;
  source_name?: string;
  title: string;
  description: string;
  severity: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  published_at: string;
  starts_at?: string;
  ends_at?: string;
  affected_area?: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}
