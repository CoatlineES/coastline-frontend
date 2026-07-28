export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  SIGNED = 'SIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface QuotationLine {
  id: string;
  order: number;
  concept: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  margin?: number;
  resourceId?: string | null;
  resourceType?: string | null;
  isGroup?: boolean;
  isApu?: boolean;
  code?: string | null;
  parentId?: string | null;
  children?: QuotationLine[];
}

export interface QuotationChapter {
  id: string;
  order: number;
  title: string;
  startDate?: string;
  endDate?: string;
  lines: QuotationLine[];
}

export interface QuotationClause {
  id: string;
  order: number;
  title: string;
  content: string;
}

export interface Quotation {
  id: string;
  number: string;
  version: number;
  title?: string | null;
  status: QuotationStatus;
  taxRate: number;
  discount?: number | null;
  notesTitle?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  paymentTerms?: string | null;
  paymentDeadline?: string | null;
  validUntil?: string | null;
  issuedAt?: string | null;
  signedAt?: string | null;
  signatureToken?: string | null;
  clientSignature?: string | null;
  clientSignatoryName?: string | null;
  clientSignatoryDni?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  signatureHash?: string | null;
  createdAt: string;
  updatedAt: string;

  dealId: string;
  deal: {
    id: string;
    name: string;
    probability?: number | null;
    stage: string;
    closeDate?: string | null;
  };
  accountId: string;
  account: {
    id: string;
    name: string;
    cif?: string | null;
    city?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  contact?: { id: string; name?: string | null; position?: string | null; email?: string | null; } | null;
  user?: { id: string; name: string; email: string; } | null;
  businessLine?: { id: string; name: string; } | null;

  chapters: QuotationChapter[];
  clauses: QuotationClause[];
  attachments: { id: string; filename: string; url: string; }[];
}

export interface QuotationSummary extends Omit<Quotation, 'clauses' | 'attachments'> {}
