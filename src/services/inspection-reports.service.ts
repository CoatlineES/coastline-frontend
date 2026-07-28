import api from './api';
import { InspectionReport } from '../types/inspection-report';

export const inspectionReportsService = {
  getByProject: async (projectId: string): Promise<InspectionReport[]> => {
    const { data } = await api.get(`/inspection-reports/project/${projectId}`);
    return data;
  },

  getById: async (id: string): Promise<InspectionReport> => {
    const { data } = await api.get(`/inspection-reports/${id}`);
    return data;
  },

  create: async (payload: Partial<InspectionReport>): Promise<InspectionReport> => {
    const { data } = await api.post('/inspection-reports', payload);
    return data;
  },

  update: async (id: string, payload: Partial<InspectionReport>): Promise<InspectionReport> => {
    const { data } = await api.put(`/inspection-reports/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/inspection-reports/${id}`);
  }
};
