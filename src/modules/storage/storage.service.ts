import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>(
      'storage.uploadDir',
      'uploads',
    );
    this.baseUrl = this.configService.get<string>(
      'baseUrl',
      'https://teklifpdfgenerator.hebilogluahsap.com',
    );
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    const fullDirPath = path.resolve(process.cwd(), this.uploadDir);
    if (!fs.existsSync(fullDirPath)) {
      fs.mkdirSync(fullDirPath, { recursive: true });
      this.logger.log(`Created uploads directory at: ${fullDirPath}`);
    }
  }

  /**
   * Saves a PDF buffer to the storage target and returns the public URL.
   *
   * @param fileName - File name to save as (e.g. "276179ea-eb7d-449f-b659-66c28f931547.pdf")
   * @param buffer - The PDF binary buffer
   * @returns Publicly accessible URL for the saved PDF
   */
  async savePdf(fileName: string, buffer: Buffer): Promise<string> {
    const safeFileName = fileName.endsWith('.pdf')
      ? fileName
      : `${fileName}.pdf`;
    const targetPath = path.resolve(
      process.cwd(),
      this.uploadDir,
      safeFileName,
    );

    await fs.promises.writeFile(targetPath, buffer);
    this.logger.log(`Saved PDF to disk: ${targetPath}`);

    // Format public URL: e.g. https://teklifpdfgenerator.hebilogluahsap.com/uploads/276179ea-eb7d-449f-b659-66c28f931547.pdf
    const sanitizedBaseUrl = this.baseUrl.replace(/\/+$/, '');
    const sanitizedUploadDir = this.uploadDir.replace(/^\/+|\/+$/g, '');
    const publicUrl = `${sanitizedBaseUrl}/${sanitizedUploadDir}/${safeFileName}`;

    return publicUrl;
  }
}
