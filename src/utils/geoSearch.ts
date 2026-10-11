import type { Station } from '../types/radiation';

export type GeoZoneType = 'COMMUNE' | 'DEPARTMENT' | 'REGION' | 'FACILITY';

export interface GeoZone {
  id: string;
  type: GeoZoneType;
  name: string;
  subtitle: string;
  code?: string;
  center: [number, number]; // [lat, lon]
  suggestedZoom: number;
  stations: Station[];
  stationsCount: number;
  averageDoseRate?: number;
  minDoseRate?: number;
  maxDoseRate?: number;
  complianceStatus: 'NORMAL' | 'ELEVATED' | 'OFFLINE';
  geologicalContext?: string;
}

export interface GeoSearchResult {
  query: string;
  zones: GeoZone[];
  matchingStations: Station[];
}

// Distance helper (Haversine formula in km)
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon terrestre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Normalize text for diacritic-insensitive search
export function normalizeGeoText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 🏛️ Official French Departments Register
export interface DepartmentDef {
  code: string;
  name: string;
  regionCode: string;
  regionName: string;
  center: [number, number];
  geologySummary?: string;
}

export const FRENCH_DEPARTMENTS: DepartmentDef[] = [
  { code: '01', name: 'Ain', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [46.1, 5.3], geologySummary: 'Bordure jurassienne et alluvions' },
  { code: '02', name: 'Aisne', regionCode: 'HDF', regionName: 'Hauts-de-France', center: [49.5, 3.5], geologySummary: 'Bassin calcaire sédimentaire' },
  { code: '03', name: 'Allier', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [46.3, 3.2], geologySummary: 'Nord du Massif Central' },
  { code: '04', name: 'Alpes-de-Haute-Provence', regionCode: 'PAC', regionName: "Provence-Alpes-Côte d'Azur", center: [44.1, 6.2], geologySummary: 'Préalpes calcaires' },
  { code: '05', name: 'Hautes-Alpes', regionCode: 'PAC', regionName: "Provence-Alpes-Côte d'Azur", center: [44.7, 6.4], geologySummary: 'Massif alpin cristallin' },
  { code: '06', name: 'Alpes-Maritimes', regionCode: 'PAC', regionName: "Provence-Alpes-Côte d'Azur", center: [43.9, 7.2], geologySummary: 'Arc alpin et littoral calcaire' },
  { code: '07', name: 'Ardèche', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [44.7, 4.4], geologySummary: 'Bordure volcanique et granitique cévenole' },
  { code: '08', name: 'Ardennes', regionCode: 'GES', regionName: 'Grand Est', center: [49.7, 4.7], geologySummary: 'Massif ardennais schisteux primaire' },
  { code: '09', name: 'Ariège', regionCode: 'OCC', regionName: 'Occitanie', center: [42.9, 1.5], geologySummary: 'Pyrénées axiales cristallines' },
  { code: '10', name: 'Aube', regionCode: 'GES', regionName: 'Grand Est', center: [48.3, 4.1], geologySummary: 'Champagne crayeuse' },
  { code: '11', name: 'Aude', regionCode: 'OCC', regionName: 'Occitanie', center: [43.1, 2.4], geologySummary: 'Corbières et littoral méditerranéen' },
  { code: '12', name: 'Aveyron', regionCode: 'OCC', regionName: 'Occitanie', center: [44.3, 2.6], geologySummary: 'Grands Causses et socle du Rouergue' },
  { code: '13', name: 'Bouches-du-Rhône', regionCode: 'PAC', regionName: "Provence-Alpes-Côte d'Azur", center: [43.5, 5.1], geologySummary: 'Delta rhodanien et massifs calcaires' },
  { code: '14', name: 'Calvados', regionCode: 'NOR', regionName: 'Normandie', center: [49.1, -0.3], geologySummary: 'Plaine de Caen et Bocage normand' },
  { code: '15', name: 'Cantal', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [45.0, 2.7], geologySummary: 'Stratovolcan cantalien et socle granitique' },
  { code: '16', name: 'Charente', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [45.7, 0.2], geologySummary: 'Plateaux calcaires charentais' },
  { code: '17', name: 'Charente-Maritime', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [45.9, -0.9], geologySummary: 'Plaine côtière atlantique' },
  { code: '18', name: 'Cher', regionCode: 'CVL', regionName: 'Centre-Val de Loire', center: [47.1, 2.4], geologySummary: 'Champagne berrichonne' },
  { code: '19', name: 'Corrèze', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [45.3, 1.9], geologySummary: 'Socle cristallin et granitique limousin' },
  { code: '21', name: "Côte-d'Or", regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [47.3, 4.8], geologySummary: 'Côte calcaire et plateau bourguignon' },
  { code: '22', name: "Côtes-d'Armor", regionCode: 'BRE', regionName: 'Bretagne', center: [48.4, -2.9], geologySummary: 'Socle hercynien armoricain' },
  { code: '23', name: 'Creuse', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [46.0, 2.0], geologySummary: 'Hauts plateaux granitiques uranifères' },
  { code: '24', name: 'Dordogne', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [45.1, 0.7], geologySummary: 'Périgord calcaire karstique' },
  { code: '25', name: 'Doubs', regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [47.2, 6.4], geologySummary: 'Massif jurassien plissé' },
  { code: '26', name: 'Drôme', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [44.7, 5.1], geologySummary: 'Vallée du Rhône et Préalpes dioises' },
  { code: '27', name: 'Eure', regionCode: 'NOR', regionName: 'Normandie', center: [49.1, 1.1], geologySummary: 'Plateaux crayeux normands' },
  { code: '28', name: 'Eure-et-Loir', regionCode: 'CVL', regionName: 'Centre-Val de Loire', center: [48.4, 1.4], geologySummary: 'Plaine céréalière de Beauce' },
  { code: '29', name: 'Finistère', regionCode: 'BRE', regionName: 'Bretagne', center: [48.2, -4.1], geologySummary: 'Socle granitique armoricain littoral' },
  { code: '2A', name: 'Corse-du-Sud', regionCode: 'COR', regionName: 'Corse', center: [41.9, 8.9], geologySummary: 'Corse cristalline granitique hercynienne' },
  { code: '2B', name: 'Haute-Corse', regionCode: 'COR', regionName: 'Corse', center: [42.4, 9.3], geologySummary: 'Schistes lustrés et plaine orientale' },
  { code: '30', name: 'Gard', regionCode: 'OCC', regionName: 'Occitanie', center: [44.0, 4.2], geologySummary: 'Cévennes granitiques et garrigues calcaires' },
  { code: '31', name: 'Haute-Garonne', regionCode: 'OCC', regionName: 'Occitanie', center: [43.4, 1.3], geologySummary: 'Bassin aquitain et Piémont pyrénéen' },
  { code: '32', name: 'Gers', regionCode: 'OCC', regionName: 'Occitanie', center: [43.6, 0.6], geologySummary: 'Collines molassiques de Gascogne' },
  { code: '33', name: 'Gironde', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [44.8, -0.6], geologySummary: 'Sables des Landes et estuaire sédimentaire' },
  { code: '34', name: 'Hérault', regionCode: 'OCC', regionName: 'Occitanie', center: [43.6, 3.2], geologySummary: 'Bas-Languedoc calcaire et littoral' },
  { code: '35', name: 'Ille-et-Vilaine', regionCode: 'BRE', regionName: 'Bretagne', center: [48.1, -1.7], geologySummary: 'Bassin de Rennes et schistes armoricains' },
  { code: '36', name: 'Indre', regionCode: 'CVL', regionName: 'Centre-Val de Loire', center: [46.8, 1.6], geologySummary: 'Brenne et Boischaut' },
  { code: '37', name: 'Indre-et-Loire', regionCode: 'CVL', regionName: 'Centre-Val de Loire', center: [47.2, 0.7], geologySummary: 'Tuffeau de Touraine et Val de Loire' },
  { code: '38', name: 'Isère', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [45.2, 5.6], geologySummary: 'Préalpes calcaires et massifs cristallins' },
  { code: '39', name: 'Jura', regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [46.7, 5.7], geologySummary: 'Plateaux et faisceaux jurassiens' },
  { code: '40', name: 'Landes', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [43.9, -0.8], geologySummary: 'Sables quaternaires des Landes' },
  { code: '41', name: 'Loir-et-Cher', regionCode: 'CVL', regionName: 'Centre-Val de Loire', center: [47.6, 1.3], geologySummary: 'Sologne sablonneuse et Val de Loire' },
  { code: '42', name: 'Loire', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [45.6, 4.2], geologySummary: 'Monts du Forez et bassin houiller' },
  { code: '43', name: 'Haute-Loire', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [45.1, 3.8], geologySummary: 'Plateaux volcaniques du Velay' },
  { code: '44', name: 'Loire-Atlantique', regionCode: 'PDL', regionName: 'Pays de la Loire', center: [47.3, -1.6], geologySummary: 'Bassin ligérien et socle armoricain' },
  { code: '45', name: 'Loiret', regionCode: 'CVL', regionName: 'Centre-Val de Loire', center: [47.9, 2.2], geologySummary: 'Val de Loire et forêt d Orléans' },
  { code: '46', name: 'Lot', regionCode: 'OCC', regionName: 'Occitanie', center: [44.6, 1.6], geologySummary: 'Causses du Quercy karstiques' },
  { code: '47', name: 'Lot-et-Garonne', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [44.4, 0.4], geologySummary: 'Vallée de la Garonne alluvionnaire' },
  { code: '48', name: 'Lozère', regionCode: 'OCC', regionName: 'Occitanie', center: [44.5, 3.5], geologySummary: 'Socle granitique de Margeride et Causses' },
  { code: '49', name: 'Maine-et-Loire', regionCode: 'PDL', regionName: 'Pays de la Loire', center: [47.4, -0.5], geologySummary: 'Anjou noir schisteux et Anjou blanc calcaire' },
  { code: '50', name: 'Manche', regionCode: 'NOR', regionName: 'Normandie', center: [49.1, -1.3], geologySummary: 'Socle cadomien et littoral cotentinois' },
  { code: '51', name: 'Marne', regionCode: 'GES', regionName: 'Grand Est', center: [49.0, 4.3], geologySummary: 'Champagne crayeuse et vignoble' },
  { code: '52', name: 'Haute-Marne', regionCode: 'GES', regionName: 'Grand Est', center: [48.1, 5.2], geologySummary: 'Plateau de Langres calcaire jurassique' },
  { code: '53', name: 'Mayenne', regionCode: 'PDL', regionName: 'Pays de la Loire', center: [48.2, -0.6], geologySummary: 'Socle armoricain oriental' },
  { code: '54', name: 'Meurthe-et-Moselle', regionCode: 'GES', regionName: 'Grand Est', center: [48.8, 6.2], geologySummary: 'Plateau lorrain et côtes de Meuse' },
  { code: '55', name: 'Meuse', regionCode: 'GES', regionName: 'Grand Est', center: [49.0, 5.4], geologySummary: 'Argilites et calcaires jurassiques' },
  { code: '56', name: 'Morbihan', regionCode: 'BRE', regionName: 'Bretagne', center: [47.8, -2.8], geologySummary: 'Socle granitique et golfe littoral' },
  { code: '57', name: 'Moselle', regionCode: 'GES', regionName: 'Grand Est', center: [49.1, 6.5], geologySummary: 'Plateau lorrain triasique et bassin houiller' },
  { code: '58', name: 'Nièvre', regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [47.0, 3.5], geologySummary: 'Massif du Morvan granitique' },
  { code: '59', name: 'Nord', regionCode: 'HDF', regionName: 'Hauts-de-France', center: [50.5, 3.1], geologySummary: 'Plaine de Flandre et littoral maritime' },
  { code: '60', name: 'Oise', regionCode: 'HDF', regionName: 'Hauts-de-France', center: [49.4, 2.4], geologySummary: 'Plateaux calcaires picards' },
  { code: '61', name: 'Orne', regionCode: 'NOR', regionName: 'Normandie', center: [48.6, 0.1], geologySummary: 'Collines du Perche et bocage normand' },
  { code: '62', name: 'Pas-de-Calais', regionCode: 'HDF', regionName: 'Hauts-de-France', center: [50.5, 2.3], geologySummary: 'Boulonnais et collines d Artois' },
  { code: '63', name: 'Puy-de-Dôme', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [45.7, 3.1], geologySummary: 'Chaîne des Puys volcanique et plaine de Limagne' },
  { code: '64', name: 'Pyrénées-Atlantiques', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [43.3, -0.8], geologySummary: 'Pyrénées occidentales et Pays basque' },
  { code: '65', name: 'Hautes-Pyrénées', regionCode: 'OCC', regionName: 'Occitanie', center: [43.0, 0.1], geologySummary: 'Massif cristallin de Néouvielle' },
  { code: '66', name: 'Pyrénées-Orientales', regionCode: 'OCC', regionName: 'Occitanie', center: [42.6, 2.6], geologySummary: 'Massif du Canigou et plaine du Roussillon' },
  { code: '67', name: 'Bas-Rhin', regionCode: 'GES', regionName: 'Grand Est', center: [48.7, 7.6], geologySummary: 'Fossé rhénan alluvionnaire et Vosges gréseuses' },
  { code: '68', name: 'Haut-Rhin', regionCode: 'GES', regionName: 'Grand Est', center: [47.9, 7.3], geologySummary: 'Hautes Vosges cristallines et plaine d Alsace' },
  { code: '69', name: 'Rhône', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [45.8, 4.7], geologySummary: 'Couloir rhodanien et monts du Lyonnais' },
  { code: '70', name: 'Haute-Saône', regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [47.6, 6.1], geologySummary: 'Plateaux saônois calcaires' },
  { code: '71', name: 'Saône-et-Loire', regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [46.7, 4.6], geologySummary: 'Bordure morvandelle et Bresse' },
  { code: '72', name: 'Sarthe', regionCode: 'PDL', regionName: 'Pays de la Loire', center: [48.0, 0.2], geologySummary: 'Transition armoricaine et sédimentaire' },
  { code: '73', name: 'Savoie', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [45.5, 6.5], geologySummary: 'Massifs subalpins et alpins internes' },
  { code: '74', name: 'Haute-Savoie', regionCode: 'ARA', regionName: 'Auvergne-Rhône-Alpes', center: [46.0, 6.4], geologySummary: 'Massif du Mont-Blanc cristallin' },
  { code: '75', name: 'Paris', regionCode: 'IDF', regionName: 'Île-de-France', center: [48.8566, 2.3522], geologySummary: 'Bassin calcaire lutétien sédimentaire' },
  { code: '76', name: 'Seine-Maritime', regionCode: 'NOR', regionName: 'Normandie', center: [49.7, 1.0], geologySummary: 'Falaises de craie et plateau de Caux' },
  { code: '77', name: 'Seine-et-Marne', regionCode: 'IDF', regionName: 'Île-de-France', center: [48.6, 2.9], geologySummary: 'Plateau de Brie sédimentaire' },
  { code: '78', name: 'Yvelines', regionCode: 'IDF', regionName: 'Île-de-France', center: [48.8, 1.9], geologySummary: 'Plaine de Versailles et sables stampiens' },
  { code: '79', name: 'Deux-Sèvres', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [46.5, -0.3], geologySummary: 'Seuil du Poitou et Gâtine' },
  { code: '80', name: 'Somme', regionCode: 'HDF', regionName: 'Hauts-de-France', center: [49.9, 2.3], geologySummary: 'Plateau picard crayeux' },
  { code: '81', name: 'Tarn', regionCode: 'OCC', regionName: 'Occitanie', center: [43.8, 2.2], geologySummary: 'Monts de Lacaune et socle sidérolithique' },
  { code: '82', name: 'Tarn-et-Garonne', regionCode: 'OCC', regionName: 'Occitanie', center: [44.1, 1.3], geologySummary: 'Confluence Tarn-Garonne alluvionnaire' },
  { code: '83', name: 'Var', regionCode: 'PAC', regionName: "Provence-Alpes-Côte d'Azur", center: [43.4, 6.3], geologySummary: 'Massif des Maures cristallin et Provence calcaire' },
  { code: '84', name: 'Vaucluse', regionCode: 'PAC', regionName: "Provence-Alpes-Côte d'Azur", center: [44.0, 5.1], geologySummary: 'Mont Ventoux et comtat venaissin' },
  { code: '85', name: 'Vendée', regionCode: 'PDL', regionName: 'Pays de la Loire', center: [46.7, -1.3], geologySummary: 'Bocage vendéen et littoral rétro-littoral' },
  { code: '86', name: 'Vienne', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [46.6, 0.4], geologySummary: 'Seuil du Poitou calcaire' },
  { code: '87', name: 'Haute-Vienne', regionCode: 'NAQ', regionName: 'Nouvelle-Aquitaine', center: [45.8336, 1.2611], geologySummary: 'Socle hercynien granitique uranifère' },
  { code: '88', name: 'Vosges', regionCode: 'GES', regionName: 'Grand Est', center: [48.2, 6.4], geologySummary: 'Massif vosgien cristallin et gréseux' },
  { code: '89', name: 'Yonne', regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [47.8, 3.6], geologySummary: 'Plateau sénonais et Puisaye' },
  { code: '90', name: 'Territoire de Belfort', regionCode: 'BFC', regionName: 'Bourgogne-Franche-Comté', center: [47.6, 6.9], geologySummary: 'Trouée de Belfort et Vosges du Sud' },
  { code: '91', name: 'Essonne', regionCode: 'IDF', regionName: 'Île-de-France', center: [48.5, 2.2], geologySummary: 'Plateau de Beauce et sables de Fontainebleau' },
  { code: '92', name: 'Hauts-de-Seine', regionCode: 'IDF', regionName: 'Île-de-France', center: [48.8, 2.2], geologySummary: 'Bassin parisien calcaire' },
  { code: '93', name: 'Seine-Saint-Denis', regionCode: 'IDF', regionName: 'Île-de-France', center: [48.9, 2.4], geologySummary: 'Plaine de France alluvionnaire' },
  { code: '94', name: 'Val-de-Marne', regionCode: 'IDF', regionName: 'Île-de-France', center: [48.8, 2.5], geologySummary: 'Vallée de la Seine et de la Marne' },
  { code: '95', name: "Val-d'Oise", regionCode: 'IDF', regionName: 'Île-de-France', center: [49.1, 2.1], geologySummary: 'Vexin français calcaire' },
];

// 🗺️ Official French Regions Register
export interface RegionDef {
  code: string;
  name: string;
  center: [number, number];
  zoom: number;
  departmentCodes: string[];
}

export const FRENCH_REGIONS: RegionDef[] = [
  { code: 'IDF', name: 'Île-de-France', center: [48.85, 2.35], zoom: 9, departmentCodes: ['75', '77', '78', '91', '92', '93', '94', '95'] },
  { code: 'NAQ', name: 'Nouvelle-Aquitaine', center: [45.7, 0.3], zoom: 7, departmentCodes: ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'] },
  { code: 'ARA', name: 'Auvergne-Rhône-Alpes', center: [45.4, 4.4], zoom: 7, departmentCodes: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'] },
  { code: 'BRE', name: 'Bretagne', center: [48.2, -2.9], zoom: 8, departmentCodes: ['22', '29', '35', '56'] },
  { code: 'GES', name: 'Grand Est', center: [48.7, 6.2], zoom: 7, departmentCodes: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'] },
  { code: 'HDF', name: 'Hauts-de-France', center: [50.1, 2.8], zoom: 8, departmentCodes: ['02', '59', '60', '62', '80'] },
  { code: 'NOR', name: 'Normandie', center: [49.2, -0.4], zoom: 8, departmentCodes: ['14', '27', '50', '61', '76'] },
  { code: 'OCC', name: 'Occitanie', center: [43.6, 1.4], zoom: 7, departmentCodes: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '81', '82', '66'] },
  { code: 'PAC', name: "Provence-Alpes-Côte d'Azur", center: [43.9, 6.1], zoom: 8, departmentCodes: ['04', '05', '06', '13', '83', '84'] },
  { code: 'PDL', name: 'Pays de la Loire', center: [47.5, -0.6], zoom: 8, departmentCodes: ['44', '49', '53', '72', '85'] },
  { code: 'CVL', name: 'Centre-Val de Loire', center: [47.8, 1.7], zoom: 8, departmentCodes: ['18', '28', '36', '37', '41', '45'] },
  { code: 'BFC', name: 'Bourgogne-Franche-Comté', center: [47.3, 5.0], zoom: 8, departmentCodes: ['21', '25', '39', '58', '70', '71', '89', '90'] },
  { code: 'COR', name: 'Corse', center: [42.0, 9.0], zoom: 8, departmentCodes: ['2A', '2B'] },
];

// ⚛️ Major Nuclear Sites & Sensitive Monitoring Facilities
export interface NuclearFacilityDef {
  id: string;
  name: string;
  commune: string;
  departmentCode: string;
  center: [number, number];
  zoom: number;
  description: string;
}

export const MONITORED_FACILITIES: NuclearFacilityDef[] = [
  { id: 'FAC-CATTENOM', name: 'Centrale nucléaire de Cattenom', commune: 'Cattenom', departmentCode: '57', center: [49.4180, 6.2200], zoom: 12, description: 'CNPE de Cattenom (4 réacteurs de 1300 MWe) sur la Moselle' },
  { id: 'FAC-GRAVELINES', name: 'Centrale nucléaire de Gravelines', commune: 'Gravelines', departmentCode: '59', center: [51.0150, 2.1280], zoom: 12, description: 'Plus grande centrale nucléaire d Europe occidentale (6 réacteurs de 900 MWe)' },
  { id: 'FAC-TRICASTIN', name: 'Site nucléaire du Tricastin', commune: 'Saint-Paul-Trois-Châteaux', departmentCode: '26', center: [44.3486, 4.7672], zoom: 12, description: 'CNPE et plateforme Orano d enrichissement d uranium' },
  { id: 'FAC-CADARACHE', name: 'Centre d études nucléaires de Cadarache', commune: 'Saint-Paul-lès-Durance', departmentCode: '13', center: [43.6872, 5.7611], zoom: 12, description: 'Centre CEA de R&D et projet international ITER' },
  { id: 'FAC-FLAMANVILLE', name: 'Centrale nucléaire de Flamanville', commune: 'Flamanville', departmentCode: '50', center: [49.5360, -1.8820], zoom: 12, description: 'CNPE côtier de Flamanville (EPR et réacteurs 1300 MWe)' },
  { id: 'FAC-CRUAS', name: 'Centrale nucléaire de Cruas-Meysse', commune: 'Cruas', departmentCode: '07', center: [44.6978, 4.7558], zoom: 12, description: 'CNPE de Cruas (4 réacteurs 900 MWe) sur le Rhône' },
  { id: 'FAC-BUGEY', name: 'Centrale nucléaire du Bugey', commune: 'Saint-Vulbas', departmentCode: '01', center: [45.7989, 5.2711], zoom: 12, description: 'CNPE du Bugey (4 réacteurs 900 MWe) à 30 km de Lyon' },
  { id: 'FAC-CIVAUX', name: 'Centrale nucléaire de Civaux', commune: 'Civaux', departmentCode: '86', center: [46.4564, 0.6536], zoom: 12, description: 'CNPE de Civaux (2 réacteurs N4 de 1450 MWe) sur la Vienne' },
  { id: 'FAC-CHOOZ', name: 'Centrale nucléaire de Chooz', commune: 'Chooz', departmentCode: '08', center: [50.0903, 4.7894], zoom: 12, description: 'CNPE de Chooz (2 réacteurs N4 de 1450 MWe) dans la pointe des Ardennes' },
  { id: 'FAC-GOLFECH', name: 'Centrale nucléaire de Golfech', commune: 'Golfech', departmentCode: '82', center: [44.1111, 0.8444], zoom: 12, description: 'CNPE de Golfech (2 réacteurs 1300 MWe) sur la Garonne' },
  { id: 'FAC-BLAYAIS', name: 'Centrale nucléaire du Blayais', commune: 'Braud-et-Saint-Louis', departmentCode: '33', center: [45.2558, -0.6931], zoom: 12, description: 'CNPE du Blayais (4 réacteurs 900 MWe) sur l estuaire de la Gironde' },
];

/**
 * 🔍 Intelligent Geographic Resolver
 * Résout les communes, départements, régions et installations nucléaires
 * et calcule en temps réel le nombre de balises et leurs métriques radiologiques.
 */
export function searchGeographicZones(query: string, stations: Station[]): GeoSearchResult {
  const rawQ = query.trim();
  if (!rawQ) {
    return { query: rawQ, zones: [], matchingStations: [] };
  }

  const normQ = normalizeGeoText(rawQ);
  const zones: GeoZone[] = [];
  const addedZoneIds = new Set<string>();

  // Helper to compute zone stats
  function computeZoneStats(stList: Station[]): {
    avg?: number;
    min?: number;
    max?: number;
    compliance: 'NORMAL' | 'ELEVATED' | 'OFFLINE';
  } {
    if (stList.length === 0) {
      return { compliance: 'OFFLINE' };
    }
    const vals = stList
      .map(s => s.latest_measurement?.value)
      .filter((v): v is number => typeof v === 'number' && v > 0);

    if (vals.length === 0) {
      return { compliance: 'NORMAL' };
    }
    const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const compliance = avg > 300 ? 'ELEVATED' : 'NORMAL';
    return { avg, min, max, compliance };
  }

  // 1. Check Monitored Nuclear Facilities (Cattenom, Gravelines, Tricastin, etc.)
  for (const fac of MONITORED_FACILITIES) {
    const normFacName = normalizeGeoText(fac.name);
    const normFacCommune = normalizeGeoText(fac.commune);

    if (normFacName.includes(normQ) || normFacCommune.includes(normQ)) {
      // Find stations within 30 km of the facility
      const nearbyStations = stations.filter(s => {
        const dist = getDistanceKm(fac.center[0], fac.center[1], s.latitude, s.longitude);
        return dist <= 30;
      });

      const stats = computeZoneStats(nearbyStations);

      zones.push({
        id: fac.id,
        type: 'FACILITY',
        name: fac.name,
        subtitle: `${fac.commune} (${fac.departmentCode}) • Rayon de surveillance 30 km`,
        code: fac.departmentCode,
        center: fac.center,
        suggestedZoom: fac.zoom,
        stations: nearbyStations,
        stationsCount: nearbyStations.length,
        averageDoseRate: stats.avg,
        minDoseRate: stats.min,
        maxDoseRate: stats.max,
        complianceStatus: stats.compliance,
        geologicalContext: fac.description,
      });
      addedZoneIds.add(fac.id);
    }
  }

  // 2. Check French Departments (by exact code or name)
  for (const dept of FRENCH_DEPARTMENTS) {
    const isCodeMatch = dept.code.toLowerCase() === rawQ.toLowerCase();
    const normDeptName = normalizeGeoText(dept.name);
    const isNameMatch = normDeptName.includes(normQ);

    if (isCodeMatch || isNameMatch) {
      // Stations in this department
      const deptStations = stations.filter(s => {
        if (s.department_code && s.department_code === dept.code) return true;
        // Or within 45 km of center if department code not explicitly set
        return getDistanceKm(dept.center[0], dept.center[1], s.latitude, s.longitude) <= 45;
      });

      const stats = computeZoneStats(deptStations);

      zones.push({
        id: `DEPT-${dept.code}`,
        type: 'DEPARTMENT',
        name: `${dept.name} (${dept.code})`,
        subtitle: `Département • Région ${dept.regionName}`,
        code: dept.code,
        center: dept.center,
        suggestedZoom: 9,
        stations: deptStations,
        stationsCount: deptStations.length,
        averageDoseRate: stats.avg,
        minDoseRate: stats.min,
        maxDoseRate: stats.max,
        complianceStatus: stats.compliance,
        geologicalContext: dept.geologySummary,
      });
      addedZoneIds.add(`DEPT-${dept.code}`);
    }
  }

  // 3. Check French Regions (e.g. Bretagne, Île-de-France, Nouvelle-Aquitaine)
  for (const reg of FRENCH_REGIONS) {
    const isCodeMatch = reg.code.toLowerCase() === rawQ.toLowerCase();
    const normRegName = normalizeGeoText(reg.name);
    const isNameMatch = normRegName.includes(normQ);

    if (isCodeMatch || isNameMatch) {
      const regStations = stations.filter(s => {
        if (s.region_code && s.region_code === reg.code) return true;
        if (s.department_code && reg.departmentCodes.includes(s.department_code)) return true;
        return getDistanceKm(reg.center[0], reg.center[1], s.latitude, s.longitude) <= 150;
      });

      const stats = computeZoneStats(regStations);

      zones.push({
        id: `REG-${reg.code}`,
        type: 'REGION',
        name: `Région ${reg.name}`,
        subtitle: `Région administrative (${reg.departmentCodes.length} départements)`,
        code: reg.code,
        center: reg.center,
        suggestedZoom: reg.zoom,
        stations: regStations,
        stationsCount: regStations.length,
        averageDoseRate: stats.avg,
        minDoseRate: stats.min,
        maxDoseRate: stats.max,
        complianceStatus: stats.compliance,
        geologicalContext: `Ensemble du maillage régional (${reg.name})`,
      });
      addedZoneIds.add(`REG-${reg.code}`);
    }
  }

  // 4. Check Communes / Agglomerations (Paris, Limoges, Brest, Lyon, etc.)
  // Group stations by unique commune name
  const communeMap = new Map<string, { commune: string; stations: Station[]; center: [number, number]; dept?: string }>();

  stations.forEach(s => {
    const comm = s.commune || s.name.split('-')[0].trim();
    if (!comm) return;
    const normComm = normalizeGeoText(comm);

    if (normComm.includes(normQ) || normComm === normQ) {
      if (!communeMap.has(normComm)) {
        communeMap.set(normComm, {
          commune: comm,
          stations: [],
          center: [s.latitude, s.longitude],
          dept: s.department_code,
        });
      }
      communeMap.get(normComm)!.stations.push(s);
    }
  });

  // Also include major known cities even if station has slightly different label
  const KNOWN_CITIES = [
    { name: 'Paris', center: [48.8566, 2.3522] as [number, number], dept: '75' },
    { name: 'Limoges', center: [45.8336, 1.2611] as [number, number], dept: '87' },
    { name: 'Brest', center: [48.4447, -4.4180] as [number, number], dept: '29' },
    { name: 'Lyon', center: [45.7278, 4.9450] as [number, number], dept: '69' },
    { name: 'Cherbourg', center: [49.6337, -1.6221] as [number, number], dept: '50' },
    { name: 'Gravelines', center: [51.0150, 2.1280] as [number, number], dept: '59' },
    { name: 'Strasbourg', center: [48.5444, 7.6269] as [number, number], dept: '67' },
    { name: 'Toulouse', center: [43.5414, 1.3711] as [number, number], dept: '31' },
    { name: 'Marseille', center: [43.4356, 5.2136] as [number, number], dept: '13' },
    { name: 'Bordeaux', center: [44.8283, -0.6997] as [number, number], dept: '33' },
    { name: 'Rennes', center: [48.0719, -1.7289] as [number, number], dept: '35' },
    { name: 'Nantes', center: [47.2184, -1.5536] as [number, number], dept: '44' },
    { name: 'Clermont-Ferrand', center: [45.7772, 3.0870] as [number, number], dept: '63' },
    { name: 'Ajaccio', center: [41.9239, 8.7978] as [number, number], dept: '2A' },
    { name: 'Bastia', center: [42.5489, 9.4847] as [number, number], dept: '2B' },
  ];

  for (const city of KNOWN_CITIES) {
    const normCity = normalizeGeoText(city.name);
    if (normCity.includes(normQ) || normCity === normQ) {
      if (!communeMap.has(normCity)) {
        // Find stations within 25 km of city center
        const nearby = stations.filter(s => {
          return getDistanceKm(city.center[0], city.center[1], s.latitude, s.longitude) <= 25;
        });
        if (nearby.length > 0) {
          communeMap.set(normCity, {
            commune: city.name,
            stations: nearby,
            center: city.center,
            dept: city.dept,
          });
        }
      }
    }
  }

  // Convert communeMap to zones
  communeMap.forEach((data, normKey) => {
    const zoneId = `COMMUNE-${normKey}`;
    if (!addedZoneIds.has(zoneId)) {
      const stats = computeZoneStats(data.stations);
      zones.push({
        id: zoneId,
        type: 'COMMUNE',
        name: data.commune,
        subtitle: `Agglomération${data.dept ? ` (${data.dept})` : ''} • Périmètre local`,
        code: data.dept,
        center: data.center,
        suggestedZoom: 12,
        stations: data.stations,
        stationsCount: data.stations.length,
        averageDoseRate: stats.avg,
        minDoseRate: stats.min,
        maxDoseRate: stats.max,
        complianceStatus: stats.compliance,
        geologicalContext: `Surveillance rapprochée de la commune de ${data.commune}`,
      });
      addedZoneIds.add(zoneId);
    }
  });

  // 5. Individual matching stations (for direct selection)
  const matchingStations = stations
    .filter(s => {
      const name = normalizeGeoText(s.name);
      const commune = normalizeGeoText(s.commune || '');
      const dept = (s.department_code || '').toLowerCase();
      const ext = s.external_id.toLowerCase();
      return (
        name.includes(normQ) ||
        commune.includes(normQ) ||
        dept === rawQ.toLowerCase() ||
        ext.includes(normQ)
      );
    })
    .slice(0, 12);

  // Sort zones: Communes & Facilities first, then Departments, then Regions
  const typeOrder: Record<GeoZoneType, number> = {
    COMMUNE: 1,
    FACILITY: 2,
    DEPARTMENT: 3,
    REGION: 4,
  };

  zones.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

  return {
    query: rawQ,
    zones,
    matchingStations,
  };
}
