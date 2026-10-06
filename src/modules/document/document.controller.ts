import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBadGatewayResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';

@ApiTags('Documents')
@Controller('api/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate a quotation PDF and update the external API',
    description:
      'Generates and saves the PDF, then updates the external API before returning HTTP 200.',
  })
  @ApiOkResponse({
    description: 'PDF created and external API updated',
    type: DocumentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for incoming quotation payload',
  })
  @ApiBadGatewayResponse({
    description: 'PDF saved, but the external API update failed',
  })
  async createDocument(
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentService.generateQuotationDocument(
      createDocumentDto.data,
    );
  }
}
