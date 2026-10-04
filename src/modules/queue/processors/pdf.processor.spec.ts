import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../../../common/constants/queue.constants';
import { PdfProcessor } from './pdf.processor';
import { PdfService } from '../../pdf/pdf.service';

jest.mock('../../pdf/pdf.service');
import { StorageService } from '../../storage/storage.service';
import { PdfGenerationJobPayload } from '../../../common/interfaces/job-payload.interface';

describe('PdfProcessor', () => {
  let processor: PdfProcessor;
  let pdfService: PdfService;
  let storageService: StorageService;
  let externalApiQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfProcessor,
        {
          provide: PdfService,
          useValue: {
            generatePdf: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            savePdf: jest.fn(),
          },
        },
        {
          provide: getQueueToken(QUEUE_NAMES.EXTERNAL_API_UPDATE),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<PdfProcessor>(PdfProcessor);
    pdfService = module.get<PdfService>(PdfService);
    storageService = module.get<StorageService>(StorageService);
    externalApiQueue = module.get<Queue>(getQueueToken(QUEUE_NAMES.EXTERNAL_API_UPDATE));
  });

  it('should generate pdf, save to storage and enqueue external-api-update job', async () => {
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
      isConvertedToOrder: false,
      createdAt: '2026-09-05T20:45:01.387872Z',
      items: [],
    };

    const mockBuffer = Buffer.from('pdf-binary');
    const mockPdfUrl = 'http://localhost:3000/uploads/276179ea-eb7d-449f-b659-66c28f931547.pdf';

    (pdfService.generatePdf as jest.Mock).mockResolvedValue(mockBuffer);
    (storageService.savePdf as jest.Mock).mockResolvedValue(mockPdfUrl);
    (externalApiQueue.add as jest.Mock).mockResolvedValue({ id: 'external-job-1' });

    const job = {
      id: 'job-1',
      data: samplePayload,
    } as unknown as Job<PdfGenerationJobPayload>;

    const result = await processor.process(job);

    expect(pdfService.generatePdf).toHaveBeenCalledWith(samplePayload);
    expect(storageService.savePdf).toHaveBeenCalledWith(
      '276179ea-eb7d-449f-b659-66c28f931547.pdf',
      mockBuffer,
    );
    expect(externalApiQueue.add).toHaveBeenCalledWith(
      'update-quotation-pdf-url',
      {
        quotationId: '276179ea-eb7d-449f-b659-66c28f931547',
        pdfUrl: mockPdfUrl,
      },
      DEFAULT_JOB_OPTIONS,
    );
    expect(result).toEqual({ pdfUrl: mockPdfUrl });
  });
});
