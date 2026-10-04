import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuotationItemDto {
  @ApiProperty({
    example: '19e676cc-1051-4993-bae8-117da1f69bc7',
    description: 'Item ID',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: '7687c3e6-bec4-4445-8a14-3dd06417d9b1',
    description: 'Product ID',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 'High Gloss Mutfak Dolabı',
    description: 'Product Name',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    example: 6,
    description: 'Quantity',
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    example: 12000,
    description: 'Unit Price in TL',
  })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({
    example: 72000,
    description: 'Total Price in TL',
  })
  @IsNumber()
  totalPrice: number;

  @ApiProperty({
    example: '6 adet lake iç kapı',
    description: 'Item description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: true,
    description: 'Requires production flag',
  })
  @IsBoolean()
  requiresProduction: boolean;

  @ApiProperty({
    example: true,
    description: 'Requires delivery flag',
  })
  @IsBoolean()
  requiresDelivery: boolean;

  @ApiProperty({
    example: true,
    description: 'Requires installation flag',
  })
  @IsBoolean()
  requiresInstallation: boolean;
}
