import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  DEFAULT_JOB_OPTIONS,
  QUEUE_NAMES,
} from '../../common/constants/queue.constants';
import { PdfGenerationJobPayload } from '../../common/interfaces/job-payload.interface';
import { QuotationDataDto } from './dto/quotation-data.dto';
import { DocumentQueuedResponseDto } from './dto/document-response.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.PDF_GENERATION)
    private readonly pdfQueue: Queue<PdfGenerationJobPayload>,
  ) {}

  /**
   * Enqueues a quotation for PDF generation and subsequent external API notification.
   * Explicitly strips out statusHistory per business rules.
   *
   * @param data - The full quotation data object from the request
   * @returns DocumentQueuedResponseDto with jobId and status
   */
  async queueQuotationDocument(
    data: QuotationDataDto,
  ): Promise<DocumentQueuedResponseDto> {
    // Exclude statusHistory from job payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { statusHistory, ...jobPayload } = data;

    this.logger.log(
      `Queueing PDF generation for quotation: ${jobPayload.quotationNumber} (${jobPayload.id})`,
    );

    const job = await this.pdfQueue.add(
      'generate-quotation-pdf',
      jobPayload,
      DEFAULT_JOB_OPTIONS,
    );

    this.logger.log(
      `Job enqueued successfully with ID: ${job.id} on queue: ${QUEUE_NAMES.PDF_GENERATION}`,
    );

    return {
      success: true,
      jobId: String(job.id),
      status: 'queued',
    };
  }
}
