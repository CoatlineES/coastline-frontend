import api from './api';
import { Quotation, QuotationStatus } from '../types/quotation';

export const quotationsService = {
  getAll: (filters?: Record<string, string>) => 
    api.get('/quotations', { params: filters }).then(r => r.data),
  
  getById: (id: string): Promise<Quotation> => 
    api.get(`/quotations/${id}`).then(r => r.data),
  
  create: (data: Partial<Quotation>) => 
    api.post('/quotations', data).then(r => r.data),
  createFromTemplate: (templateId: string, data: Partial<Quotation>) =>
    api.post(`/quotations/from-template/${templateId}`, data).then(r => r.data),
  update: (id: string, data: Partial<Quotation>) => 
    api.put(`/quotations/${id}`, data).then(r => r.data),
  
  updateStatus: (id: string, status: QuotationStatus) =>
    api.put(`/quotations/${id}/status`, { status }).then(r => r.data),
  
  duplicate: (id: string) => 
    api.post(`/quotations/${id}/duplicate`).then(r => r.data),
    
  generatePlan: (id: string, startDate?: string) =>
    api.post(`/quotations/${id}/generate-plan`, { startDate }).then(r => r.data),
  
  delete: (id: string) => 
    api.delete(`/quotations/${id}`),

  // Adjuntos
  addAttachment: (id: string, data: { filename: string; url: string }) => api.post(`/quotations/${id}/attachments`, data),
  deleteAttachment: (id: string, attachmentId: string) => api.delete(`/quotations/${id}/attachments/${attachmentId}`),

  // Firma Digital
  // Capítulos
  addChapter: (id: string, data: { title: string; order: number }) =>
    api.post(`/quotations/${id}/chapters`, data).then(r => r.data),
  updateChapter: (id: string, chapterId: string, data: Partial<{ title: string; order: number }>) =>
    api.put(`/quotations/${id}/chapters/${chapterId}`, data).then(r => r.data),
  deleteChapter: (id: string, chapterId: string) =>
    api.delete(`/quotations/${id}/chapters/${chapterId}`),
  reorderChapters: (id: string, chapters: { id: string; order: number }[]) =>
    api.put(`/quotations/${id}/chapters/reorder`, { chapters }).then(r => r.data),
  saveChapterToLibrary: (id: string, chapterId: string) =>
    api.post(`/quotations/${id}/chapters/${chapterId}/save-to-library`).then(r => r.data),

  // Líneas (APUs)
  addLine: (id: string, chapterId: string, data: { concept: string; unit?: string; quantity: number; unitPrice: number; order?: number; resourceId?: string | null; isGroup?: boolean; parentId?: string | null; code?: string | null }) =>
    api.post(`/quotations/${id}/chapters/${chapterId}/lines`, data).then(r => r.data),
  updateLine: (id: string, chapterId: string, lineId: string, data: Partial<{ concept: string; unit: string; quantity: number; unitPrice: number; order: number; resourceId: string | null; isGroup: boolean; parentId: string | null; isApu: boolean; code: string | null }>) =>
    api.put(`/quotations/${id}/chapters/${chapterId}/lines/${lineId}`, data).then(r => r.data),
  deleteLine: (id: string, chapterId: string, lineId: string) =>
    api.delete(`/quotations/${id}/chapters/${chapterId}/lines/${lineId}`),
  reorderLines: (id: string, chapterId: string, lines: { id: string; order: number }[]) =>
    api.put(`/quotations/${id}/chapters/${chapterId}/lines/reorder`, { lines }).then(r => r.data),
  saveLineToLibrary: (id: string, lineId: string) =>
    api.post(`/quotations/${id}/lines/${lineId}/save-to-library`).then(r => r.data),

  // Cláusulas
  addClause: (id: string, data: { title: string; content: string; order?: number }) =>
    api.post(`/quotations/${id}/clauses`, data).then(r => r.data),
  updateClause: (id: string, clauseId: string, data: Partial<{ title: string; content: string; order: number }>) =>
    api.put(`/quotations/${id}/clauses/${clauseId}`, data).then(r => r.data),
  deleteClause: (id: string, clauseId: string) =>
    api.delete(`/quotations/${id}/clauses/${clauseId}`),
};
