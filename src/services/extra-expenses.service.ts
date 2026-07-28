import api from './api';

export interface ExtraExpense {
  id: string;
  projectId: string;
  concept: string;
  amount: number;
  date: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const extraExpensesService = {
  getByProject: async (projectId: string): Promise<ExtraExpense[]> => {
    const response = await api.get(`/projects/${projectId}/extra-expenses`);
    return response.data;
  },

  create: async (projectId: string, data: Partial<ExtraExpense>): Promise<ExtraExpense> => {
    const response = await api.post(`/projects/${projectId}/extra-expenses`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<ExtraExpense>): Promise<ExtraExpense> => {
    const response = await api.put(`/projects/extra-expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/extra-expenses/${id}`);
  }
};
