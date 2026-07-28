import api, { cleanParams } from './api';
import { Project, ProjectDocument } from './types';

export const projectsService = {
  getAll: async (filters?: any): Promise<Project[]> => {
    const response = await api.get('/projects', { params: cleanParams(filters) });
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getMyAssignedProjects: async (): Promise<Project[]> => {
    const workerId = localStorage.getItem('contractor_worker_id');
    const params = workerId ? { workerId } : {};
    const response = await api.get('/projects/my-assigned', { params });
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  createDemo: async (name: string): Promise<Project> => {
    const response = await api.post('/projects/demo', { name });
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addDocument: async (projectId: string, data: any): Promise<ProjectDocument> => {
    const response = await api.post(`/projects/${projectId}/documents`, data);
    return response.data;
  },

  deleteDocument: async (projectId: string, documentId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/documents/${documentId}`);
  },

  createFromDeal: async (dealId: string): Promise<Project> => {
    const response = await api.post('/projects/from-deal', { dealId });
    return response.data;
  },

  initializeBudget: async (projectId: string): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/budget`);
    return response.data;
  },

  addWorker: async (projectId: string, payload: { userId?: string, contractorWorkerId?: string, role?: string }) => {
    const response = await api.post(`/projects/${projectId}/workers`, payload);
    return response.data;
  },

  removeWorker: async (projectId: string, workerId: string) => {
    await api.delete(`/projects/${projectId}/workers/${workerId}`);
  }
};
