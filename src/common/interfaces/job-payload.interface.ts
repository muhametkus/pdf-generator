export interface QuotationItemPayload {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
}

export interface PdfGenerationJobPayload {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  quotationDate: string;
  validUntil: string;
  totalAmount: number;
  status: number;
  statusText: string;
  notes?: string;
  quotationPdfUrl?: string | null;
  isConvertedToOrder: boolean;
  createdAt: string;
  items: QuotationItemPayload[];
  // NOTE: statusHistory is explicitly excluded per business requirements
}

export interface ExternalApiUpdateJobPayload {
  quotationId: string;
  pdfUrl: string;
}
