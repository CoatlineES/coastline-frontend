import api from './api';

export interface EmployeeDocument {
  id: string;
  name: string;
  category: 'CONTRACT' | 'PAYROLL' | 'TAX_CERT' | 'MEDICAL_LEAVE' | 'SAFETY' | 'ID_DOCUMENT' | 'CERTIFICATION' | 'OTHER';
  fileUrl: string;
  userId: string;
  uploadedById?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
  uploadedBy?: { id: string; name: string };
}

export const documentsService = {
  getDocuments: async (): Promise<EmployeeDocument[]> => {
    const response = await api.get('/documents');
    return response.data.data; // assuming controller wraps in { success: true, data: ... }
  },

  uploadDocument: async (data: { name: string; category: string; fileUrl: string; userId?: string }): Promise<EmployeeDocument> => {
    const response = await api.post('/documents', data);
    return response.data.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  }
};
