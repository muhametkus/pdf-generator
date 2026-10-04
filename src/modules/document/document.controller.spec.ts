import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            queueQuotationDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);
  });

  it('should call documentService.queueQuotationDocument and return queued response', async () => {
    const requestDto: CreateDocumentDto = {
      success: true,
      data: {
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
        items: [],
      },
    };

    const mockResponse = {
      success: true as const,
      jobId: '123',
      status: 'queued' as const,
    };

    (service.queueQuotationDocument as jest.Mock).mockResolvedValue(mockResponse);

    const result = await controller.createDocument(requestDto);

    expect(service.queueQuotationDocument).toHaveBeenCalledWith(requestDto.data);
    expect(result).toEqual(mockResponse);
  });
});
