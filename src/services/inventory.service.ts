import api from './api';

export interface InventoryItem {
  id: string;
  sku: string | null;
  name: string;
  status: string;
  notes: string | null;
  category: string | null;
  location: string | null;
  stock: number;
  minStock: number;
  unit: string;
  isReturnable?: boolean;
  mainRisk: string | null;
  specificMeasures: string | null;
  associatedPpe: string | null;
  createdAt: string;
  updatedAt: string;
  resourceId?: string | null;
  resource?: {
    id: string;
    name: string;
    code: string | null;
    unit: string;
    resourceType: string;
  } | null;
}

export interface InventoryRequestItem {
  id: string;
  requestId: string;
  itemId: string;
  quantity: number;
  qtyApproved: number | null;
  unit: string;
  notes: string | null;
  motivo: string | null;
  item?: InventoryItem;
}

export interface InventoryRequest {
  id: string;
  movementCode: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  urgency: string;
  requestType: string;
  notes: string | null;
  projectId: string | null;
  destination: string | null;
  requestedById: string;
  requiresApproval: boolean;
  approvalReason: string | null;
  reviewedById: string | null;
  dateRequested: string;
  dateReviewed: string | null;
  desiredDeliveryAt: string | null;
  items: InventoryRequestItem[];
  requestedBy?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
    address: string | null;
  };
}

export const inventoryService = {
  // --- ITEMS ---
  getItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory/items');
    return response.data;
  },

  createItem: async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.post('/inventory/items', data);
    return response.data;
  },

  updateItem: async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put(`/inventory/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/inventory/items/${id}`);
  },

  // --- REQUESTS ---
  getRequests: async (): Promise<InventoryRequest[]> => {
    const response = await api.get('/inventory/requests');
    return response.data;
  },

  createRequest: async (data: {
    projectId?: string;
    destination?: string;
    urgency?: string;
    requestType?: string;
    notes?: string;
    items: { itemId: string; quantity: number; notes?: string }[];
  }): Promise<InventoryRequest> => {
    const response = await api.post('/inventory/requests', data);
    return response.data;
  },

  updateRequestStatus: async (id: string, data: { status: 'APPROVED' | 'REJECTED'; approvalReason?: string }): Promise<InventoryRequest> => {
    const response = await api.patch(`/inventory/requests/${id}/status`, data);
    return response.data;
  },

  getActiveAssignments: async (): Promise<any[]> => {
    const response = await api.get('/inventory/assignments');
    return response.data;
  },

  getMovements: async (): Promise<any[]> => {
    const response = await api.get('/inventory/movements');
    return response.data;
  }
};
