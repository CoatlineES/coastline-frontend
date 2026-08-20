export interface ReportSectionData {
  id: string;
  name: string;
  content: string;
  layout: '1' | '2' | '3';
  images: InspectionReportPhoto[];
}

export interface InspectionReportPhoto {
  id: string;
  type: 'GENERAL' | 'MAP' | 'DETAIL' | 'ZONE_GENERAL' | 'ZONE_GEOMEMBRANE' | 'ZONE_RISKS' | 'ZONE_EQUIPMENT' | 'ZONE_PHOTOS' | 'FINDING';
  url: string;
  caption?: string;
}

export interface MapFinding {
  id: string;
  x: number;
  y: number;
  category: 'Fuga crítica' | 'Depresión crítica' | 'Observación técnica';
  type?: string;
  description?: string;
  photos: InspectionReportPhoto[];
  number: number;
}

export interface InspectionReportZone {
  id: string;
  name: string;
  area: number;
  
  // Tipología
  tipologia: {
    superficie: string;
    impermeabilizacion: string;
    estado: number; // 1-5
  };
  
  // Caracterización
  caracterizacion: {
    uso: string;
    proteccion: string[];
    estructura: string;
  };
  
  // Remates
  remates: {
    altura: string;
    alturaObs: string;
    estado: string;
    estadoObs: string;
  };
  
  // Drenajes
  drenajes: {
    numero: number;
    desconocido: boolean;
    estado: string;
    estadoObs: string;
  };
  
  patologiasVisuales: string[];
  patologiasVisualesObs: string;
  
  patologiasEquipo: {
    criticas: { num: number; area: number };
    moderadas: { num: number; area: number };
    observacion: { num: number; area: number };
    observaciones: string;
  };

  // Mapa de hallazgos
  baseImage?: string;
  mapFindings?: MapFinding[];
  
  riesgosPrl: string[];
  riesgosPrlObs: string;
  
  observacionesGenerales: string;
  recomendaciones: string;
  
  fotografias: InspectionReportPhoto[];
}

export interface GeomembraneZone {
  id: string;
  name: string;
  area: number;
  description: string;
  
  // Datos generales
  installationType?: string;
  installationTypeOther?: string;
  installationUse?: string;
  inspectedArea?: string;
  fillLevel?: string;
  observations?: string;
  
  // Geomembrana
  materialType?: string;
  thickness?: string;
  thicknessUnknown?: boolean;
  finish?: string;
  brand?: string;
  brandUnknown?: boolean;
  color?: string;
  installationYear?: string;
  yearUnknown?: boolean;
  geomembraneObservations?: string;
  
  // Riesgos y observaciones
  risksText?: string;
  risksObservations?: string;
  
  // Equipos utilizados
  equipment?: string[];
  equipmentObservations?: string;
  
  // Mapa de hallazgos
  baseImage?: string;
  mapFindings?: MapFinding[];
  zoneObservations?: string;

  fotografias: InspectionReportPhoto[];
}

export interface InspectionReport {
  id: string;
  projectId: string;
  number: string;
  version: number;
  status: 'DRAFT' | 'FINAL';
  type: string;
  
  date: string;
  technician?: string;
  clientName?: string;
  location?: string;
  
  coverStyle: string;
  customCoverUrl?: string;
  coverTitle?: string;
  coverSubtitle?: string;
  introduction?: string;
  globalRecomms?: string;
  
  zonesData: any[]; // Can be InspectionReportZone[] or GeomembraneZone[]
  extraData?: any;
  
  createdAt: string;
  updatedAt: string;
}
