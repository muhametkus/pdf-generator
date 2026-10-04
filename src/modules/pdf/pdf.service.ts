import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PdfGenerationJobPayload } from '../../common/interfaces/job-payload.interface';
import { renderQuotationHtml } from './templates/quotation.template';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Generates a PDF buffer from quotation data using Puppeteer.
   *
   * @param data - The quotation payload (without statusHistory)
   * @returns Buffer containing the rendered PDF binary
   */
  async generatePdf(data: PdfGenerationJobPayload): Promise<Buffer> {
    this.logger.log(`Generating PDF for quotation: ${data.quotationNumber} (${data.id})`);

    const html = renderQuotationHtml(data);
    let browser: puppeteer.Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ],
      });

      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
      });

      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      this.logger.log(
        `Successfully generated PDF for quotation ${data.quotationNumber}, size: ${pdfUint8Array.length} bytes`,
      );

      return Buffer.from(pdfUint8Array);
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF for quotation ${data.quotationNumber}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    } finally {
      if (browser) {
        await browser.close().catch((err) => {
          this.logger.warn(`Failed to close puppeteer browser: ${err?.message}`);
        });
      }
    }
  }
}
