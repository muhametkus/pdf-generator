import { BadGatewayException, Injectable } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';
import { ExternalApiService } from '../external-api/external-api.service';
import { QuotationDataDto } from './dto/quotation-data.dto';
import { DocumentResponseDto } from './dto/document-response.dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    private readonly externalApiService: ExternalApiService,
  ) {}

  async generateQuotationDocument(
    data: QuotationDataDto,
  ): Promise<DocumentResponseDto> {
    // statusHistory is excluded from PDF data per business requirements.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { statusHistory, ...quotation } = data;
    const buffer = await this.pdfService.generatePdf(quotation);
    const pdfUrl = await this.storageService.savePdf(
      `${quotation.id}.pdf`,
      buffer,
    );

    try {
      await this.externalApiService.updateQuotationPdfUrl(quotation.id, pdfUrl);
    } catch {
      throw new BadGatewayException(
        'PDF created, but the external API could not be updated. Retry the request.',
      );
    }

    return { success: true, status: 'completed', pdfUrl };
  }
}
