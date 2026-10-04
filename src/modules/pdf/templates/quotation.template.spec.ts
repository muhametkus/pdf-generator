import { renderQuotationHtml } from './quotation.template';
import { PdfGenerationJobPayload } from '../../../common/interfaces/job-payload.interface';

describe('renderQuotationHtml', () => {
  const samplePayload: PdfGenerationJobPayload = {
    id: '276179ea-eb7d-449f-b659-66c28f931547',
    quotationNumber: 'QUO-20260905204501387',
    customerId: '1c38a3c2-75fc-4aa4-a680-546c3e436636',
    customerName: 'Mehmet Yılmaz',
    quotationDate: '2026-09-05T20:45:01.393028Z',
    validUntil: '2026-09-20T00:00:00Z',
    totalAmount: 257000,
    status: 1,
    statusText: 'Draft',
    notes: 'Mutfak dolabı ve kapı ön teklifi',
    quotationPdfUrl: null,
    isConvertedToOrder: false,
    createdAt: '2026-09-05T20:45:01.387872Z',
    items: [
      {
        id: '19e676cc-1051-4993-bae8-117da1f69bc7',
        productId: '7687c3e6-bec4-4445-8a14-3dd06417d9b1',
        productName: 'High Gloss Mutfak Dolabı',
        quantity: 6,
        unitPrice: 12000,
        totalPrice: 72000,
        description: '6 adet lake iç kapı',
        requiresProduction: true,
        requiresDelivery: true,
        requiresInstallation: true,
      },
      {
        id: '2be71a5e-4d11-4095-b8b6-45c3aaace97b',
        productId: '7687c3e6-bec4-4445-8a14-3dd06417d9b1',
        productName: 'High Gloss Mutfak Dolabı',
        quantity: 1,
        unitPrice: 185000,
        totalPrice: 185000,
        description: 'Lake beyaz özel ölçü mutfak dolabı',
        requiresProduction: true,
        requiresDelivery: true,
        requiresInstallation: true,
      },
    ],
  };

  it('should render all quotation header fields correctly formatted', () => {
    const html = renderQuotationHtml(samplePayload);

    expect(html).toContain('QUO-20260905204501387');
    expect(html).toContain('Mehmet Yılmaz');
    expect(html).toContain('05.09.2026');
    expect(html).toContain('20.09.2026');
    expect(html).toContain('Draft');
    expect(html).toContain('Mutfak dolabı ve kapı ön teklifi');
  });

  it('should render items table with production, delivery and installation badges', () => {
    const html = renderQuotationHtml(samplePayload);

    expect(html).toContain('High Gloss Mutfak Dolabı');
    expect(html).toContain('6 adet lake iç kapı');
    expect(html).toContain('Lake beyaz özel ölçü mutfak dolabı');
    expect(html).toContain('✓ Üretim');
    expect(html).toContain('✓ Teslimat');
    expect(html).toContain('✓ Montaj');
    expect(html).toContain('72.000,00 TL');
    expect(html).toContain('185.000,00 TL');
  });

  it('should render total amount in tr-TR currency format', () => {
    const html = renderQuotationHtml(samplePayload);

    expect(html).toContain('257.000,00 TL');
  });
});
