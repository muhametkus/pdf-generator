import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  DEFAULT_JOB_OPTIONS,
  QUEUE_NAMES,
} from '../../common/constants/queue.constants';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.PDF_GENERATION,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
