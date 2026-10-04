import { IsBoolean, IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuotationDataDto } from './quotation-data.dto';

export class CreateDocumentDto {
  @ApiProperty({
    example: true,
    description: 'Success indicator of the upstream payload',
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    type: QuotationDataDto,
    description: 'Main quotation data container',
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => QuotationDataDto)
  data: QuotationDataDto;
}
