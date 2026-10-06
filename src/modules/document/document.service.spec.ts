import { BadGatewayException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';
import { ExternalApiService } from '../external-api/external-api.service';
import { QuotationDataDto } from './dto/quotation-data.dto';

const data: QuotationDataDto = {
  id: '276179ea-eb7d-449f-b659-66c28f931547',
  quotationNumber: 'TEST-1',
  customerId: '1c38a3c2-75fc-4aa4-a680-546c3e436636',
  customerName: 'Test',
  quotationDate: '2026-10-07T00:00:00Z',
  validUntil: '2026-10-20T00:00:00Z',
  totalAmount: 0,
  status: 1,
  statusText: 'Draft',
  isConvertedToOrder: false,
  createdAt: '2026-10-07T00:00:00Z',
  items: [],
  statusHistory: [{ status: 1 }],
};

describe('DocumentService', () => {
  const pdfUrl = `https://pdf.example.com/uploads/${data.id}.pdf`;
  const buffer = Buffer.from('pdf');
  let pdf: { generatePdf: jest.Mock };
  let storage: { savePdf: jest.Mock };
  let api: { updateQuotationPdfUrl: jest.Mock };
  let service: DocumentService;

  beforeEach(() => {
    pdf = { generatePdf: jest.fn().mockResolvedValue(buffer) };
    storage = { savePdf: jest.fn().mockResolvedValue(pdfUrl) };
    api = { updateQuotationPdfUrl: jest.fn().mockResolvedValue(undefined) };
    service = new DocumentService(
      pdf as unknown as PdfService,
      storage as unknown as StorageService,
      api as unknown as ExternalApiService,
    );
  });

  it('waits for the API update before returning the PDF URL and excludes statusHistory', async () => {
    let finishUpdate!: () => void;
    api.updateQuotationPdfUrl.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishUpdate = resolve;
        }),
    );
    let settled = false;
    const result = service.generateQuotationDocument(data).then((value) => {
      settled = true;
      return value;
    });
    await new Promise((resolve) => setImmediate(resolve));
    expect(settled).toBe(false);
    expect(pdf.generatePdf.mock.calls[0][0]).not.toHaveProperty(
      'statusHistory',
    );
    expect(storage.savePdf).toHaveBeenCalledWith(`${data.id}.pdf`, buffer);
    expect(api.updateQuotationPdfUrl).toHaveBeenCalledWith(data.id, pdfUrl);
    finishUpdate();
    await expect(result).resolves.toEqual({
      success: true,
      status: 'completed',
      pdfUrl,
    });
  });

  it('does not save or update the API when PDF generation fails', async () => {
    pdf.generatePdf.mockRejectedValue(new Error('Browser failed'));
    await expect(service.generateQuotationDocument(data)).rejects.toThrow(
      'Browser failed',
    );
    expect(storage.savePdf).not.toHaveBeenCalled();
    expect(api.updateQuotationPdfUrl).not.toHaveBeenCalled();
  });

  it('does not update the API when storage fails', async () => {
    storage.savePdf.mockRejectedValue(new Error('Disk full'));
    await expect(service.generateQuotationDocument(data)).rejects.toThrow(
      'Disk full',
    );
    expect(api.updateQuotationPdfUrl).not.toHaveBeenCalled();
  });

  it('returns a gateway error when the external API fails', async () => {
    api.updateQuotationPdfUrl.mockRejectedValue(new Error('Timeout'));
    await expect(
      service.generateQuotationDocument(data),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(api.updateQuotationPdfUrl).toHaveBeenCalledTimes(1);
  });
});
