import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import {
  DEFAULT_JOB_OPTIONS,
  QUEUE_NAMES,
} from '../../../common/constants/queue.constants';
import {
  ExternalApiUpdateJobPayload,
  PdfGenerationJobPayload,
} from '../../../common/interfaces/job-payload.interface';
import { PdfService } from '../../pdf/pdf.service';
import { StorageService } from '../../storage/storage.service';

@Processor(QUEUE_NAMES.PDF_GENERATION, { concurrency: 2 })
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    @InjectQueue(QUEUE_NAMES.EXTERNAL_API_UPDATE)
    private readonly externalApiQueue: Queue<ExternalApiUpdateJobPayload>,
  ) {
    super();
  }

  async process(job: Job<PdfGenerationJobPayload>): Promise<{ pdfUrl: string }> {
    const quotation = job.data;
    this.logger.log(
      `Processing PDF generation job ${job.id} for quotation: ${quotation.quotationNumber} (${quotation.id})`,
    );

    try {
      // 1. Generate PDF buffer using Puppeteer
      const pdfBuffer = await this.pdfService.generatePdf(quotation);

      // 2. Persist PDF buffer to storage and obtain public URL
      const fileName = `${quotation.id}.pdf`;
      const pdfUrl = await this.storageService.savePdf(fileName, pdfBuffer);

      this.logger.log(
        `PDF saved successfully. Public URL: ${pdfUrl}. Queuing external API update job...`,
      );

      // 3. Add job to external-api-update queue with retry backoff
      await this.externalApiQueue.add(
        'update-quotation-pdf-url',
        {
          quotationId: quotation.id,
          pdfUrl,
        },
        DEFAULT_JOB_OPTIONS,
      );

      this.logger.log(
        `Dispatched external-api-update job for quotation: ${quotation.id}`,
      );

      return { pdfUrl };
    } catch (error) {
      this.logger.error(
        `Error processing PDF generation job ${job.id} for quotation ${quotation.id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }
}
