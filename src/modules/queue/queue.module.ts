import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  DEFAULT_JOB_OPTIONS,
  QUEUE_NAMES,
} from '../../common/constants/queue.constants';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { PdfProcessor } from './processors/pdf.processor';
import { ExternalApiProcessor } from './processors/external-api.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.PDF_GENERATION,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      },
      {
        name: QUEUE_NAMES.EXTERNAL_API_UPDATE,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      },
    ),
    PdfModule,
    StorageModule,
    ExternalApiModule,
  ],
  providers: [PdfProcessor, ExternalApiProcessor],
  exports: [BullModule],
})
export class QueueModule {}
