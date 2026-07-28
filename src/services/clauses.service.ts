import axios from 'axios';

const API_URL = 'http://localhost:4000/api/clauses';

export interface LibraryClause {
  id: string;
  title: string;
  content: string;
  category: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const clausesService = {
  getAll: async (): Promise<LibraryClause[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: string): Promise<LibraryClause> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data: Omit<LibraryClause, 'id' | 'createdAt' | 'updatedAt'>): Promise<LibraryClause> => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  update: async (id: string, data: Partial<LibraryClause>): Promise<LibraryClause> => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  reorder: async (updates: { id: string; sortOrder: number }[]): Promise<void> => {
    await axios.post(`${API_URL}/reorder`, { updates });
  },
};
