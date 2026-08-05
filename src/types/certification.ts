export interface ProjectCertificationLine {
  id?: string;
  certificationId?: string;
  quotationLineId: string;
  quantity: number;
}

export interface ProjectCertification {
  id: string;
  name: string;
  date: string | Date;
  projectId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lines: ProjectCertificationLine[];

  status?: string;
  signatureToken?: string | null;
  clientSignature?: string | null;
  clientSignatoryName?: string | null;
  clientSignatoryDni?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  signatureHash?: string | null;
  signedAt?: string | Date | null;
  
  projectCode?: string | null;
  projectCity?: string | null;
  projectAddress?: string | null;
  clientName?: string | null;
  clientCif?: string | null;
  clientAddress?: string | null;
  
  introduction?: string | null;
  observations?: string | null;
  conclusions?: string | null;
  paymentConditions?: string | null;
}

export interface CreateCertificationDto {
  name: string;
  date: string;
  projectId: string;
  lines: {
    quotationLineId: string;
    quantity: number;
  }[];
}

export interface UpdateCertificationDto {
  name?: string;
  date?: string;
  lines?: {
    quotationLineId: string;
    quantity: number;
  }[];
  projectCode?: string;
  projectCity?: string;
  projectAddress?: string;
  clientName?: string;
  clientCif?: string;
  clientAddress?: string;
  introduction?: string;
  observations?: string;
  conclusions?: string;
  paymentConditions?: string;
}
