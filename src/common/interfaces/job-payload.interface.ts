export interface QuotationItemPayload {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string | null;
  isVatIncluded?: boolean;
  requiresProduction: boolean;
  requiresDelivery: boolean;
  requiresInstallation: boolean;
}

export interface CustomerPayload {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  address?: string;
  notes?: string | null;
  createdAt?: string;
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
  isVatIncluded?: boolean;
  vatStatusText?: string;
  isAssemblyIncluded?: boolean;
  assemblyStatusText?: string;
  isDeliveryIncluded?: boolean;
  deliveryStatusText?: string;
  deliveryDays?: number | null;
  expectedDeliveryDate?: string | null;
  deliveryTimeText?: string | null;
  customer?: CustomerPayload;
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
