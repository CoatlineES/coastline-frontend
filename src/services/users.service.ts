import api from './api';
import { ApiResponse, UserResponse, CreateUserPayload } from './types';

export const usersService = {
  getUsers: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get<ApiResponse<UserResponse[]>>('/users');
    return response.data;
  },

  createUser: async (userData: CreateUserPayload): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post<ApiResponse<UserResponse>>('/users', userData);
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, userData: any): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put<ApiResponse<UserResponse>>(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  },

  // --- OBREROS DE CONTRATISTAS ---
  getContractorWorkers: async (contractorId: string): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get<ApiResponse<UserResponse[]>>(`/contractors/workers?contractorId=${contractorId}`);
    return response.data;
  },

  addContractorWorker: async (contractorId: string, name: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post<ApiResponse<UserResponse>>('/contractors/workers', {
      contractorId,
      name
    });
    return response.data;
  },

  updateContractorWorker: async (contractorId: string, workerId: string, name: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put<ApiResponse<UserResponse>>(`/contractors/workers/${workerId}`, {
      contractorId,
      name
    });
    return response.data;
  },

  deleteContractorWorker: async (contractorId: string, workerId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/contractors/workers/${workerId}?contractorId=${contractorId}`);
    return response.data;
  },
};
