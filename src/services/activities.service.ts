import api, { cleanParams } from './api';

export enum ActivityType {
  TASK = 'task',
  CALL = 'call',
  EMAIL = 'email',
  LLAMADA = 'llamada',
  REUNION_COMERCIAL = 'reunion_comercial',
  REUNION_SEGUIMIENTO = 'reunion_seguimiento',
  COTIZACION = 'cotizacion',
  SEGUIMIENTO = 'seguimiento'
}

export enum ActivityResult {
  CALL_BACK = 'CALL_BACK',
  INTERESTED = 'INTERESTED',
  NO_ANSWER = 'NO_ANSWER'
}

export interface Activity {
  id: string;
  subject: string;
  notes: string | null;
  activityType: ActivityType;
  result: ActivityResult | null;
  completedAt: string | null;
  accountId: string;
  userId: string | null;
  contactId: string | null;
  dealId: string | null;
  parentActivityId: string | null;
  createdAt: string;
  updatedAt: string;
  account?: { name: string };
  user?: { name: string, email: string };
  contact?: { name: string };
  deal?: { name: string };
  parentActivity?: { subject: string, id: string };
}

export const activitiesService = {
  getAll: async (params?: { search?: string; subject?: string; notes?: string; accountId?: string; userId?: string; activityType?: string; result?: string; contactId?: string; dealId?: string; parentActivityId?: string; startDate?: string; endDate?: string; completedAtFrom?: string; completedAtTo?: string; }): Promise<Activity[]> => {
    const response = await api.get('/activities', { params: cleanParams(params) });
    return response.data;
  },

  getById: async (id: string): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  create: async (data: Partial<Activity>): Promise<Activity> => {
    const response = await api.post('/activities', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  }
};
