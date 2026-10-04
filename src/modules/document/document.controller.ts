import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentQueuedResponseDto } from './dto/document-response.dto';

@ApiTags('Documents')
@Controller('api/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Receive quotation data and enqueue PDF generation asynchronously',
    description:
      'Validates incoming quotation data, strips out any non-relevant tracking like statusHistory, adds job to pdf-generation queue, and immediately responds with HTTP 202.',
  })
  @ApiAcceptedResponse({
    description: 'Quotation PDF generation request successfully queued',
    type: DocumentQueuedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for incoming quotation payload',
  })
  async createDocument(
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentQueuedResponseDto> {
    return this.documentService.queueQuotationDocument(createDocumentDto.data);
  }
}
