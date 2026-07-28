import api from './api';
import { ApiResponse, LoginResponse } from './types';

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return response.data;
  },
};
