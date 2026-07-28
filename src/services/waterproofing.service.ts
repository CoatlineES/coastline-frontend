import api from './api';

export interface WaterproofingZone {
  id: string;
  certificateId?: string;
  projectTaskId?: string;
  customZoneName?: string;
  projectTask?: { id: string; name: string };
  status: string; // PENDING, APPROVED, REJECTED
  notes?: string;
  photos: string[];
}

export interface WaterproofingCertificate {
  id: string;
  date: string;
  technicianId: string;
  technician?: { id: string; name: string; email: string };
  projectId: string;
  notes?: string;
  generalPhotos: string[];
  status: string;
  zones: WaterproofingZone[];
  createdAt: string;
  updatedAt: string;
}

export const waterproofingService = {
  getByProject: async (projectId: string): Promise<WaterproofingCertificate[]> => {
    const response = await api.get(`/waterproofing/project/${projectId}`);
    return response.data;
  },

  getById: async (id: string): Promise<WaterproofingCertificate> => {
    const response = await api.get(`/waterproofing/${id}`);
    return response.data;
  },

  create: async (data: Partial<WaterproofingCertificate>): Promise<WaterproofingCertificate> => {
    const response = await api.post('/waterproofing', data);
    return response.data;
  },

  update: async (id: string, data: Partial<WaterproofingCertificate>): Promise<WaterproofingCertificate> => {
    const response = await api.put(`/waterproofing/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/waterproofing/${id}`);
  }
};
