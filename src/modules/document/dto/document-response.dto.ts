import { ApiProperty } from '@nestjs/swagger';

export class DocumentQueuedResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates the document job was successfully queued',
  })
  success: boolean;

  @ApiProperty({
    example: '142',
    description: 'BullMQ Job identifier for tracking queue progress',
  })
  jobId: string;

  @ApiProperty({
    example: 'queued',
    description: 'Current status of the request',
  })
  status: 'queued';
}
