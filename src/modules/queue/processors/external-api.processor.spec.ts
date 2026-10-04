import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { ExternalApiProcessor } from './external-api.processor';
import { ExternalApiService } from '../../external-api/external-api.service';
import { ExternalApiUpdateJobPayload } from '../../../common/interfaces/job-payload.interface';

describe('ExternalApiProcessor', () => {
  let processor: ExternalApiProcessor;
  let externalApiService: ExternalApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiProcessor,
        {
          provide: ExternalApiService,
          useValue: {
            updateQuotationPdfUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<ExternalApiProcessor>(ExternalApiProcessor);
    externalApiService = module.get<ExternalApiService>(ExternalApiService);
  });

  it('should call externalApiService.updateQuotationPdfUrl with payload values', async () => {
    const payload: ExternalApiUpdateJobPayload = {
      quotationId: '276179ea-eb7d-449f-b659-66c28f931547',
      pdfUrl: 'http://localhost:3000/uploads/276179ea-eb7d-449f-b659-66c28f931547.pdf',
    };

    (externalApiService.updateQuotationPdfUrl as jest.Mock).mockResolvedValue(undefined);

    const job = {
      id: 'job-ext-1',
      attemptsMade: 0,
      data: payload,
    } as unknown as Job<ExternalApiUpdateJobPayload>;

    await processor.process(job);

    expect(externalApiService.updateQuotationPdfUrl).toHaveBeenCalledWith(
      payload.quotationId,
      payload.pdfUrl,
    );
  });

  it('should re-throw error to trigger BullMQ exponential retry', async () => {
    const payload: ExternalApiUpdateJobPayload = {
      quotationId: '276179ea-eb7d-449f-b659-66c28f931547',
      pdfUrl: 'http://localhost:3000/uploads/276179ea-eb7d-449f-b659-66c28f931547.pdf',
    };

    (externalApiService.updateQuotationPdfUrl as jest.Mock).mockRejectedValue(
      new Error('Main API unreachable'),
    );

    const job = {
      id: 'job-ext-2',
      attemptsMade: 1,
      data: payload,
    } as unknown as Job<ExternalApiUpdateJobPayload>;

    await expect(processor.process(job)).rejects.toThrow('Main API unreachable');
  });
});
