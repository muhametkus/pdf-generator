import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../../common/constants/queue.constants';
import { DocumentService } from './document.service';
import { QuotationDataDto } from './dto/quotation-data.dto';

describe('DocumentService', () => {
  let service: DocumentService;
  let pdfQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getQueueToken(QUEUE_NAMES.PDF_GENERATION),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    pdfQueue = module.get<Queue>(getQueueToken(QUEUE_NAMES.PDF_GENERATION));
  });

  it('should enqueue job without statusHistory and return queued response', async () => {
    const mockQuotationData: QuotationDataDto = {
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
      ],
      statusHistory: [
        { status: 1, changedAt: '2026-09-05T20:45:01.387872Z', user: 'admin' },
      ],
    };

    (pdfQueue.add as jest.Mock).mockResolvedValue({ id: 'job-999' });

    const result = await service.queueQuotationDocument(mockQuotationData);

    expect(result).toEqual({
      success: true,
      jobId: 'job-999',
      status: 'queued',
    });

    // Verify statusHistory was stripped out from the queue payload
    expect(pdfQueue.add).toHaveBeenCalledTimes(1);
    const [jobName, payload, options] = (pdfQueue.add as jest.Mock).mock.calls[0];

    expect(jobName).toBe('generate-quotation-pdf');
    expect(payload.id).toBe(mockQuotationData.id);
    expect(payload.quotationNumber).toBe(mockQuotationData.quotationNumber);
    expect(payload).not.toHaveProperty('statusHistory');
    expect(options).toEqual(DEFAULT_JOB_OPTIONS);
  });
});
