import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../../../common/constants/queue.constants';
import { ExternalApiUpdateJobPayload } from '../../../common/interfaces/job-payload.interface';
import { ExternalApiService } from '../../external-api/external-api.service';

@Processor(QUEUE_NAMES.EXTERNAL_API_UPDATE)
export class ExternalApiProcessor extends WorkerHost {
  private readonly logger = new Logger(ExternalApiProcessor.name);

  constructor(private readonly externalApiService: ExternalApiService) {
    super();
  }

  async process(job: Job<ExternalApiUpdateJobPayload>): Promise<void> {
    const { quotationId, pdfUrl } = job.data;

    this.logger.log(
      `Processing external-api-update job ${job.id} for quotation: ${quotationId} (Attempt: ${job.attemptsMade + 1})`,
    );

    try {
      await this.externalApiService.updateQuotationPdfUrl(quotationId, pdfUrl);

      this.logger.log(
        `Successfully updated quotation ${quotationId} on external API with PDF URL: ${pdfUrl}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed attempt ${job.attemptsMade + 1} for external-api-update job ${job.id} (quotation: ${quotationId}): ${error?.message}`,
      );
      // Re-throwing error allows BullMQ to manage exponential backoff retry attempts
      throw error;
    }
  }
}
