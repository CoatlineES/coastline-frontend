import api, { cleanParams } from './api';
import { Activity } from './activities.service';

export enum DealStage {
  LEAD = 'LEAD',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST'
}

export interface Deal {
  id: string;
  name: string;
  amount: number | null;
  stage: DealStage;
  closeDate: string | null;
  accountId: string;
  contactId: string | null;
  userId: string | null;
  probability?: number | null;
  businessLineId?: string | null;
  sourceActivityId?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Incluidos en la respuesta del GET
  account?: { name: string };
  contact?: { name: string };
  user?: { name: string };
  businessLine?: { id: string; name: string };
  activities?: Activity[];
  quotations?: { id: string; number: string; status: string }[];
  projects?: { id: string; name: string; status: string }[];
}

export const dealsService = {
  getAll: (filters?: { search?: string; name?: string; amount?: number; amountMin?: number; amountMax?: number; accountId?: string; contactId?: string; userId?: string; stage?: DealStage | ''; startDate?: string; endDate?: string; closeDateFrom?: string; closeDateTo?: string; }) => 
    api.get<Deal[]>('/deals', { params: cleanParams(filters) }).then(res => res.data),
  
  getById: (id: string) => 
    api.get<Deal>(`/deals/${id}`).then(res => res.data),
  
  create: (data: Partial<Deal>) => 
    api.post<Deal>('/deals', data).then(res => res.data),
  
  update: (id: string, data: Partial<Deal>) => 
    api.put<Deal>(`/deals/${id}`, data).then(res => res.data),
  
  delete: (id: string) => 
    api.delete(`/deals/${id}`).then(res => res.data),
};
