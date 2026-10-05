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

  it('should render items table with production, delivery and installation text', () => {
    const html = renderQuotationHtml(samplePayload);

    expect(html).toContain('High Gloss Mutfak Dolabı');
    expect(html).toContain('6 adet lake iç kapı');
    expect(html).toContain('Lake beyaz özel ölçü mutfak dolabı');
    expect(html).toContain('Üretim Dahildir.');
    expect(html).toContain('Teslimat Dahildir.');
    expect(html).toContain('Montaj Dahildir.');
    expect(html).toContain('72.000,00 TL');
    expect(html).toContain('185.000,00 TL');
  });

  it('should render total amount in tr-TR currency format', () => {
    const html = renderQuotationHtml(samplePayload);

    expect(html).toContain('257.000,00 TL');
  });

  it('should render corporate layout with monochrome logo, no status badge, and VAT/delivery terms', () => {
    const userPayload: PdfGenerationJobPayload = {
      id: '43212f2c-ecc0-49b4-995c-66fcda293cc7',
      quotationNumber: 'QUO-20261004220432161',
      customerId: 'fed400b8-2ac0-49e7-a401-0d3180ae494d',
      customerName: 'muhammet kuş',
      quotationDate: '2026-10-04T22:04:32.163308Z',
      validUntil: '2027-01-01T00:00:00Z',
      totalAmount: 68500.0,
      status: 2,
      statusText: 'WaitingForApproval',
      notes: 'testtt',
      isVatIncluded: false,
      vatStatusText: 'Fiyatlara KDV dahil değildir (+%20 KDV)',
      quotationPdfUrl:
        'http://localhost:3000/uploads/43212f2c-ecc0-49b4-995c-66fcda293cc7.pdf',
      isConvertedToOrder: false,
      createdAt: '2026-10-04T22:04:32.161602Z',
      items: [
        {
          id: 'f98a8739-ff3a-4390-838f-c25b81dacf42',
          productId: 'c1000000-0000-4000-8000-000000000005',
          productName: 'Video Konferans Sistemi',
          quantity: 1,
          unitPrice: 68500.0,
          totalPrice: 68500.0,
          description: null,
          isVatIncluded: true,
          requiresProduction: false,
          requiresDelivery: true,
          requiresInstallation: true,
        },
      ],
    };

    const html = renderQuotationHtml(userPayload);

    // Document title & monochrome logo
    expect(html).toContain('TEKLİF');
    expect(html).not.toContain('PROFORMA TEKLİF');
    expect(html).toContain('data:image/png;base64');
    expect(html).toContain('Hebiloğlu Ahşap');

    // WaitingForApproval should NOT be shown
    expect(html).not.toContain('WaitingForApproval');

    // Customer & Quotation Details
    expect(html).toContain('QUO-20261004220432161');
    expect(html).toContain('muhammet kuş');
    expect(html).toContain('fed400b8-2ac0-49e7-a401-0d3180ae494d');
    expect(html).toContain('testtt');

    // Text-based delivery and installation
    expect(html).toContain('Video Konferans Sistemi');
    expect(html).toContain('Teslimat Dahildir.');
    expect(html).toContain('Montaj Dahildir.');

    // Direct total amount without extra VAT math
    expect(html).toContain('68.500,00 TL');
    expect(html).toContain('Fiyatlara KDV dahil değildir (+%20 KDV)');

    // Terms with VAT, delivery and installation status
    expect(html).toContain('Teklif Koşulları');
    expect(html).toContain('Teklif koşulları KDV hariç olarak anlaşılmıştır');
    expect(html).toContain('Teslimat Durumu:');
    expect(html).toContain('Montaj Durumu:');

    // Signature blocks
    expect(html).toContain('Teklifi Hazırlayan (Hebiloğlu Ahşap)');
    expect(html).toContain('Teklifi Onaylayan (Müşteri)');
  });

  it('should render detailed customer object fields (company, phone, email, address)', () => {
    const payloadWithCustomer: PdfGenerationJobPayload = {
      id: '43212f2c-ecc0-49b4-995c-66fcda293cc7',
      quotationNumber: 'QUO-20261004220432161',
      customerId: 'fed400b8-2ac0-49e7-a401-0d3180ae494d',
      customerName: 'muhammet kuş',
      quotationDate: '2026-10-04T22:04:32.163308Z',
      validUntil: '2027-01-01T00:00:00Z',
      totalAmount: 68500.0,
      status: 2,
      statusText: 'WaitingForApproval',
      notes: 'testtt',
      isVatIncluded: false,
      vatStatusText: 'Fiyatlara KDV dahil değildir (+%20 KDV)',
      isAssemblyIncluded: true,
      assemblyStatusText: 'Montaj Dahildir',
      isDeliveryIncluded: true,
      deliveryStatusText: 'Teslimat Dahildir',
      isConvertedToOrder: false,
      createdAt: '2026-10-04T22:04:32.161602Z',
      customer: {
        id: 'fed400b8-2ac0-49e7-a401-0d3180ae494d',
        firstName: 'muhammet',
        lastName: 'kuş',
        phone: '05536962054',
        email: 'muhametkus@gmail.com',
        companyName: 'Sdmk inşaat',
        address: 'Fevziçakmak mh Postacı sk. No:15 / 5',
        notes: null,
        createdAt: '2026-10-04T20:49:22.977099Z',
      },
      items: [
        {
          id: 'f98a8739-ff3a-4390-838f-c25b81dacf42',
          productId: 'c1000000-0000-4000-8000-000000000005',
          productName: 'Video Konferans Sistemi',
          quantity: 1,
          unitPrice: 68500.0,
          totalPrice: 68500.0,
          description: null,
          isVatIncluded: true,
          requiresProduction: false,
          requiresDelivery: true,
          requiresInstallation: true,
        },
      ],
    };

    const html = renderQuotationHtml(payloadWithCustomer);

    expect(html).toContain('Sdmk inşaat');
    expect(html).toContain('05536962054');
    expect(html).toContain('muhametkus@gmail.com');
    expect(html).toContain('Fevziçakmak mh Postacı sk. No:15 / 5');
    expect(html).toContain('Teslimat Durumu:');
    expect(html).toContain('Teslimat Dahildir');
    expect(html).toContain('Montaj Durumu:');
    expect(html).toContain('Montaj Dahildir');
  });
});

