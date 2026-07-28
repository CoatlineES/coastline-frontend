export interface InspectionReportPhoto {
  id: string;
  type: 'GENERAL' | 'MAP' | 'DETAIL';
  url: string;
  caption?: string;
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
  
  riesgosPrl: string[];
  riesgosPrlObs: string;
  
  observacionesGenerales: string;
  recomendaciones: string;
  
  fotografias: InspectionReportPhoto[];
}

export interface InspectionReport {
  id: string;
  projectId: string;
  number: string;
  version: number;
  status: 'DRAFT' | 'FINAL';
  
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
  
  zonesData: InspectionReportZone[];
  
  createdAt: string;
  updatedAt: string;
}
