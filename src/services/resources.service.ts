import api from './api';

export enum ResourceType {
  MATERIAL = 'MATERIAL',
  MANO_OBRA = 'MANO_OBRA',
  SUMINISTRO = 'SUMINISTRO',
  MAQUINARIA = 'MAQUINARIA',
  SUBCONTRATA = 'SUBCONTRATA',
  CDC = 'CDC',
  APU = 'APU',
  PARTIDA = 'PARTIDA',
  CAPITULO = 'CAPITULO'
}

export interface ResourceFolder {
  id: string;
  name: string;
  parentId?: string | null;
  children?: ResourceFolder[];
}

export interface ResourceComponent {
  id: string;
  parentResourceId: string;
  childResourceId: string | null;
  childResource?: Resource | null;
  concept: string;
  unit: string | null;
  quantity: number;
  unitCost: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  id: string;
  code: string | null;
  name: string;
  resourceType: ResourceType;
  unit: string;
  unitCost: number;
  margin?: number;
  salesPrice?: number;
  folderId?: string | null;
  folder?: { name: string };
  isActive: boolean;
  provider?: { name: string } | null;
  providerId?: string | null;
  notes?: string | null;

  // Nuevos campos avanzados (Wizard)
  yieldPerHour?: number | null;
  workersCount?: number | null;
  laborHourlyCost?: number | null;
  curingHours?: number | null;
  curingBlocksNext?: boolean | null;
  workPhase?: string | null;

  // Etiquetas de filtrado (Wizard)
  wizardRole?: string | null;
  wizardPriority?: number | null;
  wizardWorkTypes?: string[];
  wizardFinishes?: string[];
  wizardSupports?: string[];
  wizardSystems?: string[];

  components?: ResourceComponent[];
  defaultQuantity?: number | null;
}

export const resourcesService = {
  getAll: (params?: { search?: string; resourceType?: string; folderId?: string; isActive?: boolean }) =>
    api.get<{ success: boolean; data: Resource[] }>('/resources', { params }).then(r => r.data.data || []),
    
  getById: (id: string) =>
    api.get<{ success: boolean; data: Resource }>(`/resources/${id}`).then(r => r.data.data),
    
  getFolders: () =>
    api.get<{ success: boolean; data: ResourceFolder[] }>('/resources/folders').then(r => r.data.data || []),

  createFolder: (data: { name: string; parentId?: string | null }) =>
    api.post<{ success: boolean; data: ResourceFolder }>('/resources/folders', data).then(r => r.data.data),
    
  updateFolder: (id: string, data: { name?: string; parentId?: string | null }) =>
    api.put<{ success: boolean; data: ResourceFolder }>(`/resources/folders/${id}`, data).then(r => r.data.data),
    
  deleteFolder: (id: string) =>
    api.delete<{ success: boolean; data: ResourceFolder }>(`/resources/folders/${id}`).then(r => r.data.data),

  create: (data: Partial<Resource>) =>
    api.post<{ success: boolean; data: Resource }>('/resources', data).then(r => r.data.data),
    
  update: (id: string, data: Partial<Resource>) =>
    api.put<{ success: boolean; data: Resource }>(`/resources/${id}`, data).then(r => r.data.data),

  delete: (id: string) =>
    api.delete<{ success: boolean; data: Resource }>(`/resources/${id}`).then(r => r.data.data),

  // Component endpoints
  addComponent: (parentResourceId: string, data: Partial<ResourceComponent>) =>
    api.post<{ success: boolean; data: ResourceComponent }>(`/resources/${parentResourceId}/components`, data).then(r => r.data.data),
    
  updateComponent: (parentResourceId: string, componentId: string, data: Partial<ResourceComponent>) =>
    api.put<{ success: boolean; data: ResourceComponent }>(`/resources/${parentResourceId}/components/${componentId}`, data).then(r => r.data.data),
    
  removeComponent: (parentResourceId: string, componentId: string) =>
    api.delete<{ success: boolean }>(`/resources/${parentResourceId}/components/${componentId}`).then(r => r.data.success),

  // Excel Import/Export
  exportExcel: () =>
    api.get('/resources/export', { responseType: 'blob' }).then(r => r.data),
    
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; data: { importedCount: number } }>('/resources/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
};
