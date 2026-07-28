import api from './api';

export interface BusinessLine {
  id: string;
  name: string;
  _count?: { deals: number; quotations: number };
}

export const businessLinesService = {
  getAll: () => api.get<BusinessLine[]>('/business-lines').then(r => r.data),
  getById: (id: string) => api.get<BusinessLine>(`/business-lines/${id}`).then(r => r.data),
  create: (data: { name: string }) => api.post<BusinessLine>('/business-lines', data).then(r => r.data),
  update: (id: string, data: { name: string }) => api.put<BusinessLine>(`/business-lines/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/business-lines/${id}`),
};
