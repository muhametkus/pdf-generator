import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        {
          provide: HttpService,
          useValue: {
            put: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: any) => {
              if (key === 'externalApi.baseUrl') return 'http://localhost:5010';
              if (key === 'externalApi.quotationUpdateEndpoint')
                return '/api/Quotations/:id/pdf-url';
              return defaultValue;
            },
          },
        },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should send PUT request with correct URL, headers and payload', async () => {
    const quotationId = '276179ea-eb7d-449f-b659-66c28f931547';
    const pdfUrl =
      'https://teklifpdfgenerator.hebilogluahsap.com/uploads/276179ea-eb7d-449f-b659-66c28f931547.pdf';

    (httpService.put as jest.Mock).mockReturnValue(
      of({ status: 200, data: { success: true } }),
    );

    await service.updateQuotationPdfUrl(quotationId, pdfUrl);

    expect(httpService.put).toHaveBeenCalledWith(
      'http://localhost:5010/api/Quotations/276179ea-eb7d-449f-b659-66c28f931547/pdf-url',
      { quotationPdfUrl: pdfUrl },
      {
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('should propagate errors when PUT request fails', async () => {
    (httpService.put as jest.Mock).mockReturnValue(
      throwError(() => new Error('Connection refused')),
    );

    await expect(
      service.updateQuotationPdfUrl('dummy-id', 'http://localhost/dummy.pdf'),
    ).rejects.toThrow('Connection refused');
  });
});
