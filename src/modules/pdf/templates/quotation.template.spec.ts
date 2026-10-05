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
    expect(html).not.toContain('Draft');
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
    expect(html).not.toContain('Müşteri No:');
    expect(html).toContain('testtt');

    // Teklif No should appear only once (in header)
    const matches = html.match(/Teklif No:/g);
    expect(matches).toHaveLength(1);

    // Text-based delivery and installation
    expect(html).toContain('Video Konferans Sistemi');
    expect(html).toContain('Teslimat Dahildir.');
    expect(html).toContain('Montaj Dahildir.');

    // Direct total amount and simplified VAT note
    expect(html).toContain('68.500,00 TL');
    expect(html).toContain('KDV hariçtir.');

    // Terms with VAT, delivery and installation status
    expect(html).toContain('Teklif Koşulları');
    expect(html).toContain('KDV Durumu:</strong> KDV hariçtir.');
    expect(html).toContain('Montaj ve Teslimat hizmeti dahildir.');
    expect(html).toContain('Teklifin onaylanması durumunda ödeme yapıldığında sipariş kesinlik kazanır.');

    // Signature blocks
    expect(html).toContain('Teklifi Hazırlayan (Hebiloğlu Ahşap)');
    expect(html).toContain('Teklifi Onaylayan (Müşteri)');
  });

  it('should render detailed customer object fields (company, phone, email, address)', () => {
    const payloadWithCustomer: PdfGenerationJobPayload = {
      id: 'a21e8635-5a2c-4aa1-85b9-ccce617ba0bb',
      quotationNumber: 'QUO-20261005223359309',
      customerId: 'fed400b8-2ac0-49e7-a401-0d3180ae494d',
      customerName: 'muhammet kuş',
      quotationDate: '2026-10-05T22:33:59.310086Z',
      validUntil: '2026-10-10T00:00:00Z',
      totalAmount: 16000.0,
      status: 1,
      statusText: 'Draft',
      notes: 'Özel lake kaplama yapılacaktır.',
      isVatIncluded: false,
      vatStatusText: 'Fiyatlara KDV dahil değildir (+%20 KDV)',
      isAssemblyIncluded: false,
      assemblyStatusText: 'Montaj Hariçtir',
      isDeliveryIncluded: false,
      deliveryStatusText: 'Teslimat Hariçtir',
      deliveryDays: 15,
      deliveryTimeText: '15 Gün',
      isConvertedToOrder: false,
      createdAt: '2026-10-05T22:33:59.309886Z',
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
          id: '2f04fdd5-1da1-48ee-a540-006b16967723',
          productId: '7687c3e6-bec4-4445-8a14-3dd06417d9b1',
          productName: 'High Gloss Mutfak Dolabı',
          quantity: 1,
          unitPrice: 16000.0,
          totalPrice: 16000.0,
          description: null,
          isVatIncluded: false,
          requiresProduction: true,
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

    // Conditions assertions for Assembly & Delivery excluded
    expect(html).toContain('Montaj hizmeti hariçtir.');
    expect(html).toContain('Teslimat hizmeti hariçtir. Mağazadan teslim alınacaktır.');
    expect(html).toContain('Anlaşılan Teslim Süresi:</strong> 15 Gün (Mücbir sebepler ve operasyonel aksaklıklar sebebiyle doğabilecek istisnai gecikmeler saklıdır.)');
    expect(html).toContain('Teklifin onaylanması durumunda ödeme yapıldığında sipariş kesinlik kazanır.');

    // Notes title check
    expect(html).toContain('Teklif Notları / Ek Şartlar:');
    expect(html).toContain('Özel lake kaplama yapılacaktır.');
  });
});

