import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'completed' })
  status: 'completed';

  @ApiProperty({
    example:
      'https://pdf.example.com/uploads/276179ea-eb7d-449f-b659-66c28f931547.pdf',
  })
  pdfUrl: string;
}
