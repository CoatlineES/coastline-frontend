import api from './api';
import { User } from './auth.service';

export type AbsenceType = 'VACACIONES' | 'ENFERMEDAD' | 'MATRIMONIO' | 'MUDANZA' | 'HOSPITALIZACION' | 'CITA_MEDICA' | 'ASUNTOS_PROPIOS' | 'OTROS';
export type AbsenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Absence {
  id: string;
  userId: string;
  user?: Partial<User>;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  status: AbsenceStatus;
  comments?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAbsenceDTO {
  type: string;
  startDate: string;
  endDate: string;
  comments?: string;
  attachmentUrl?: string;
}

export const absencesService = {
  getAll: async (): Promise<Absence[]> => {
    const response = await api.get('/absences');
    return response.data;
  },

  getUserAbsences: async (userId: string): Promise<Absence[]> => {
    const response = await api.get(`/absences/user/${userId}`);
    return response.data;
  },

  create: async (data: CreateAbsenceDTO): Promise<Absence> => {
    const response = await api.post('/absences', data);
    return response.data;
  },

  updateStatus: async (id: string, status: AbsenceStatus): Promise<Absence> => {
    const response = await api.patch(`/absences/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/absences/${id}`);
  }
};
