import api from './api';
import { User } from './auth.service';

export interface DailyLogWorker {
  id: string;
  userId: string | null;
  contractorWorkerId?: string | null;
  externalName: string | null;
  role?: string;
  hoursNormal: number;
  hoursExtra: number;
  user?: {
    id: string;
    name: string;
  };
  contractorWorker?: {
    id: string;
    name: string;
  };
  tempId?: string; // Client-side only
}

export interface DailyLogTaskWorker {
  id?: string;
  dailyLogWorkerId?: string;
  tempWorkerId?: string; // Client-side only
  projectTaskComponentId: string | null;
  hours: number;
  dailyLogWorker?: {
    user?: { name: string };
    externalName?: string | null;
  };
  projectTaskComponent?: any;
}

export interface DailyLogTask {
  id: string;
  projectTaskId: string;
  quantityDone: number;
  notes: string | null;
  projectTask?: {
    id: string;
    name: string;
    quantity: number;
    unit: string | null;
  };
  workers?: DailyLogTaskWorker[];
}

export interface DailyLog {
  id: string;
  date: string;
  weather?: string;
  notes?: string;
  photos?: string[];
  projectId: string;
  reportedById?: string;
  reportedBy?: { id: string; name: string };
  workers: DailyLogWorker[];
  tasks: DailyLogTask[];
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const dailyLogsService = {
  getAll: async (): Promise<DailyLog[]> => {
    const response = await api.get('/daily-logs');
    return response.data;
  },

  getToday: async (): Promise<DailyLog[]> => {
    const response = await api.get('/daily-logs/today');
    return response.data;
  },

  getByProject: async (projectId: string): Promise<DailyLog[]> => {
    const response = await api.get(`/daily-logs/project/${projectId}`);
    return response.data;
  },

  getById: async (id: string): Promise<DailyLog> => {
    const response = await api.get(`/daily-logs/${id}`);
    return response.data;
  },

  create: async (data: Partial<DailyLog>): Promise<DailyLog> => {
    const response = await api.post('/daily-logs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DailyLog>): Promise<DailyLog> => {
    const response = await api.put(`/daily-logs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/daily-logs/${id}`);
  }
};
