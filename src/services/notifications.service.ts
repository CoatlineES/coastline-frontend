import api from './api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = async (limit = 50): Promise<Notification[]> => {
  const response = await api.get('/notifications', { params: { limit } });
  return response.data.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread-count');
  return response.data.data.count;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

export const clearAll = async (): Promise<void> => {
  await api.delete('/notifications');
};
