import api from './api';

export interface QuotationTemplateLine {
  id: string;
  order: number;
  concept: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  margin: number;
  resourceType?: string;
  resourceId?: string;
  isGroup: boolean;
  isApu: boolean;
  parentId?: string;
  code?: string;
  children?: QuotationTemplateLine[];
}

export interface QuotationTemplateChapter {
  id: string;
  order: number;
  title: string;
  lines: QuotationTemplateLine[];
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  businessLineId?: string;
  businessLine?: { id: string; name: string };
  chapters: QuotationTemplateChapter[];
}

export const quotationTemplatesService = {
  getAll: (filters?: { businessLineId?: string }) => 
    api.get<QuotationTemplate[]>('/quotation-templates', { params: filters }).then(r => r.data),
  
  getById: (id: string) => 
    api.get<QuotationTemplate>(`/quotation-templates/${id}`).then(r => r.data),
  
  create: (data: Partial<QuotationTemplate>) => 
    api.post<QuotationTemplate>('/quotation-templates', data).then(r => r.data),
  
  update: (id: string, data: Partial<QuotationTemplate>) => 
    api.put<QuotationTemplate>(`/quotation-templates/${id}`, data).then(r => r.data),
  
  delete: (id: string) => 
    api.delete(`/quotation-templates/${id}`),

  createFromQuotation: (data: { quotationId: string; name: string; description?: string }) =>
    api.post<QuotationTemplate>('/quotation-templates/from-quotation', data).then(r => r.data),

  // Chapters
  addChapter: (templateId: string, data: { title: string; order?: number }) =>
    api.post(`/quotation-templates/${templateId}/chapters`, data).then(r => r.data),

  updateChapter: (chapterId: string, data: { title?: string; order?: number }) =>
    api.put(`/quotation-templates/chapters/${chapterId}`, data).then(r => r.data),

  deleteChapter: (chapterId: string) =>
    api.delete(`/quotation-templates/chapters/${chapterId}`),

  // Lines
  addLine: (chapterId: string, data: any) =>
    api.post(`/quotation-templates/chapters/${chapterId}/lines`, data).then(r => r.data),

  updateLine: (lineId: string, data: any) =>
    api.put(`/quotation-templates/lines/${lineId}`, data).then(r => r.data),

  deleteLine: (lineId: string) =>
    api.delete(`/quotation-templates/lines/${lineId}`),
};
