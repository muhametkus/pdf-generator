import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuotationItemDto } from './quotation-item.dto';

export class QuotationDataDto {
  @ApiProperty({
    example: '276179ea-eb7d-449f-b659-66c28f931547',
    description: 'Quotation ID',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'QUO-20260905204501387',
    description: 'Quotation reference number',
  })
  @IsString()
  @IsNotEmpty()
  quotationNumber: string;

  @ApiProperty({
    example: '1c38a3c2-75fc-4aa4-a680-546c3e436636',
    description: 'Customer ID',
  })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: 'Mehmet Yılmaz',
    description: 'Customer full name',
  })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: '2026-09-05T20:45:01.393028Z',
    description: 'Quotation creation timestamp (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  quotationDate: string;

  @ApiProperty({
    example: '2026-09-20T00:00:00Z',
    description: 'Validity end date (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  validUntil: string;

  @ApiProperty({
    example: 257000,
    description: 'Total quotation amount in TL',
  })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({
    example: 1,
    description: 'Status code',
  })
  @IsNumber()
  status: number;

  @ApiProperty({
    example: 'Draft',
    description: 'Status label',
  })
  @IsString()
  @IsNotEmpty()
  statusText: string;

  @ApiPropertyOptional({
    example: 'Mutfak dolabı ve kapı ön teklifi',
    description: 'Quotation remarks and notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: null,
    description: 'Public URL of generated PDF (null prior to generation)',
  })
  @IsString()
  @IsOptional()
  quotationPdfUrl?: string | null;

  @ApiProperty({
    example: false,
    description: 'Indicates whether converted to order',
  })
  @IsBoolean()
  isConvertedToOrder: boolean;

  @ApiProperty({
    example: '2026-09-05T20:45:01.387872Z',
    description: 'Record creation date (ISO 8601)',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    type: [QuotationItemDto],
    description: 'List of quotation line items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];

  @ApiPropertyOptional({
    type: [Object],
    example: [],
    description: 'Historical status log (ignored by PDF generation logic)',
  })
  @IsArray()
  @IsOptional()
  statusHistory?: any[];
}
