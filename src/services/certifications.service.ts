import api from './api';
import { ProjectCertification, CreateCertificationDto, UpdateCertificationDto } from '../types/certification';

export const certificationsService = {
  async getAllByProject(projectId: string): Promise<ProjectCertification[]> {
    const response = await api.get(`/certifications/project/${projectId}`);
    return response.data;
  },

  async getById(id: string): Promise<ProjectCertification> {
    const response = await api.get(`/certifications/${id}`);
    return response.data;
  },

  async create(data: CreateCertificationDto): Promise<ProjectCertification> {
    const response = await api.post('/certifications', data);
    return response.data;
  },

  async update(id: string, data: UpdateCertificationDto): Promise<ProjectCertification> {
    const response = await api.put(`/certifications/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/certifications/${id}`);
  },

  async generateSignatureLink(id: string): Promise<{ signatureToken: string }> {
    const response = await api.post(`/certifications/${id}/generate-signature-link`);
    return response.data;
  },

  async getBySignatureToken(token: string): Promise<ProjectCertification> {
    const response = await api.get(`/certifications/public/${token}`);
    return response.data;
  },

  async signCertification(token: string, data: { signature: string; signatoryName: string; signatoryDni: string }): Promise<ProjectCertification> {
    const response = await api.post(`/certifications/public/${token}/sign`, data);
    return response.data;
  }
};
