import { PdfGenerationJobPayload } from '../../../common/interfaces/job-payload.interface';
import { formatCurrency } from '../../../common/utils/currency.util';
import { formatDate } from '../../../common/utils/date.util';
import { COMPANY_LOGO_BASE64 } from './assets/logo.base64';

export function renderQuotationHtml(data: PdfGenerationJobPayload): string {
  const quotationDateFormatted = formatDate(data.quotationDate);
  const validUntilFormatted = formatDate(data.validUntil);
  const totalAmountFormatted = formatCurrency(data.totalAmount);

  // Customer details
  const customerName =
    data.customerName ||
    (data.customer
      ? `${data.customer.firstName || ''} ${data.customer.lastName || ''}`.trim()
      : '') ||
    '-';
  const customerCompany = data.customer?.companyName || '';
  const customerPhone = data.customer?.phone || '';
  const customerEmail = data.customer?.email || '';
  const customerAddress = data.customer?.address || '';

  // Determine VAT status
  const isVatExcluded =
    data.isVatIncluded === false ||
    (typeof data.vatStatusText === 'string' &&
      data.vatStatusText.toLowerCase().includes('dahil değildir'));

  const vatConditionText = isVatExcluded ? 'KDV hariçtir.' : 'KDV dahildir.';

  // Assembly and Delivery flags
  const isAssembly =
    data.isAssemblyIncluded !== undefined
      ? data.isAssemblyIncluded
      : data.items.length > 0 && data.items.every((i) => i.requiresInstallation);

  const isDelivery =
    data.isDeliveryIncluded !== undefined
      ? data.isDeliveryIncluded
      : data.items.length > 0 && data.items.every((i) => i.requiresDelivery);

  const deliveryTime =
    data.deliveryTimeText ||
    (data.deliveryDays ? `${data.deliveryDays} Gün` : null) ||
    (data.expectedDeliveryDate ? formatDate(data.expectedDeliveryDate) : null);

  const conditionsListHtml: string[] = [];
  conditionsListHtml.push(
    `<li>İşbu teklif <strong>${validUntilFormatted}</strong> tarihine kadar geçerlidir.</li>`,
  );
  conditionsListHtml.push(`<li><strong>KDV Durumu:</strong> ${vatConditionText}</li>`);

  if (isAssembly) {
    conditionsListHtml.push(
      `<li><strong>Montaj Durumu:</strong> Montaj ve Teslimat hizmeti dahildir.</li>`,
    );
  } else {
    conditionsListHtml.push(
      `<li><strong>Montaj Durumu:</strong> Montaj hizmeti hariçtir.</li>`,
    );
    if (isDelivery) {
      conditionsListHtml.push(
        `<li><strong>Teslimat Durumu:</strong> Teslimat hizmeti dahildir.</li>`,
      );
    } else {
      conditionsListHtml.push(
        `<li><strong>Teslimat Durumu:</strong> Teslimat hizmeti hariçtir. Mağazadan teslim alınacaktır.</li>`,
      );
    }
  }

  if (deliveryTime) {
    conditionsListHtml.push(
      `<li><strong>Anlaşılan Teslim Süresi:</strong> ${escapeHtml(deliveryTime)} (Mücbir sebepler ve operasyonel aksaklıklar sebebiyle doğabilecek istisnai gecikmeler saklıdır.)</li>`,
    );
  }

  conditionsListHtml.push(
    `<li>Teklifin onaylanması durumunda ödeme yapıldığında sipariş kesinlik kazanır.</li>`,
  );

  const itemsHtml = data.items
    .map((item, index) => {
      const unitPriceFormatted = formatCurrency(item.unitPrice);
      const totalPriceFormatted = formatCurrency(item.totalPrice);

      const itemDelivery =
        data.isDeliveryIncluded !== undefined
          ? data.isDeliveryIncluded
          : item.requiresDelivery;
      const deliveryText = itemDelivery
        ? 'Teslimat Dahildir.'
        : 'Teslimat Dahil Değildir.';

      const itemAssembly =
        data.isAssemblyIncluded !== undefined
          ? data.isAssemblyIncluded
          : item.requiresInstallation;
      const installationText = itemAssembly
        ? 'Montaj Dahildir.'
        : 'Montaj Dahil Değildir.';

      const productionText = item.requiresProduction
        ? 'Üretim Dahildir.'
        : 'Üretim Gerekli Değildir.';

      const descriptionText =
        item.description && item.description.trim().length > 0
          ? `<div class="product-desc">${escapeHtml(item.description)}</div>`
          : '';

      return `
        <tr>
          <td class="text-center font-bold text-muted">${index + 1}</td>
          <td>
            <div class="product-name">${escapeHtml(item.productName)}</div>
            ${descriptionText}
            <div class="item-specs">
              <span>${deliveryText}</span>
              <span class="spec-dot">•</span>
              <span>${installationText}</span>
              ${item.requiresProduction ? `<span class="spec-dot">•</span><span>${productionText}</span>` : ''}
            </div>
          </td>
          <td class="text-center font-bold">${item.quantity}</td>
          <td class="text-right">${unitPriceFormatted}</td>
          <td class="text-right font-bold text-dark">${totalPriceFormatted}</td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Teklif - ${escapeHtml(data.quotationNumber)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1f2937;
      background-color: #ffffff;
      font-size: 11.5px;
      line-height: 1.45;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .logo-container {
      display: flex;
      align-items: center;
    }
    .logo-img {
      max-width: 250px;
      height: auto;
      max-height: 65px;
      object-fit: contain;
    }
    .header-doc-info {
      text-align: right;
    }
    .doc-main-title {
      font-size: 26px;
      font-weight: 800;
      color: #111827;
      letter-spacing: 1px;
      text-transform: uppercase;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .doc-ref-number {
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .info-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 10px 14px;
    }
    .info-card h4 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-bottom: 7px;
    }
    .info-row {
      display: flex;
      margin-bottom: 4.5px;
      font-size: 11px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      width: 115px;
      font-weight: 600;
      color: #6b7280;
      flex-shrink: 0;
    }
    .info-value {
      flex: 1;
      color: #111827;
      word-break: break-word;
    }

    .notes-box {
      margin-bottom: 16px;
      padding: 9px 12px;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-left: 3px solid #374151;
      border-radius: 3px;
      font-size: 11px;
      color: #1f2937;
    }
    .notes-title {
      font-weight: 700;
      margin-bottom: 2px;
      color: #111827;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    thead th {
      background-color: #1f2937;
      color: #ffffff;
      font-weight: 600;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border-right: 1px solid #374151;
    }
    thead th:last-child {
      border-right: none;
    }
    tbody td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
      border-right: 1px solid #f3f4f6;
      vertical-align: top;
      font-size: 11px;
    }
    tbody td:last-child {
      border-right: none;
    }
    tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .text-muted { color: #6b7280; }
    .text-dark { color: #111827; }

    .product-name {
      font-weight: 700;
      color: #111827;
      font-size: 11.5px;
    }
    .product-desc {
      color: #4b5563;
      font-size: 10.5px;
      margin-top: 2px;
    }
    .item-specs {
      font-size: 10px;
      color: #4b5563;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .spec-dot {
      color: #9ca3af;
    }

    .calculation-section {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .terms-card {
      flex: 1.2;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 10.5px;
      color: #374151;
    }
    .terms-card h5 {
      font-size: 10.5px;
      font-weight: 700;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
    }
    .terms-card ol {
      padding-left: 15px;
      line-height: 1.55;
    }

    .summary-card {
      width: 290px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      background-color: #ffffff;
      align-self: flex-start;
    }
    .summary-row.total-row {
      background-color: #1f2937;
      color: #ffffff;
      padding: 11px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
    }
    .summary-row.total-row .total-amount {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }
    .vat-status-note {
      padding: 6px 12px;
      font-size: 10px;
      color: #4b5563;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: right;
    }

    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
      page-break-inside: avoid;
    }
    .signature-box {
      border: 1px dashed #d1d5db;
      border-radius: 4px;
      padding: 10px 12px;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: #f9fafb;
    }
    .signature-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #111827;
      text-transform: uppercase;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
    }
    .signature-placeholder {
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      font-style: italic;
      margin-top: 22px;
    }

    .footer {
      margin-top: 20px;
      border-top: 1px solid #e5e7eb;
      padding-top: 7px;
      text-align: center;
      font-size: 9.5px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      <img src="${COMPANY_LOGO_BASE64}" alt="Hebiloğlu Ahşap" class="logo-img" />
    </div>
    <div class="header-doc-info">
      <div class="doc-main-title">TEKLİF</div>
      <div class="doc-ref-number">Teklif No: ${escapeHtml(data.quotationNumber)}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <h4>Müşteri Bilgileri</h4>
      <div class="info-row">
        <span class="info-label">Müşteri Adı:</span>
        <span class="info-value font-bold">${escapeHtml(customerName)}</span>
      </div>
      ${
        customerCompany
          ? `
      <div class="info-row">
        <span class="info-label">Firma / Ünvan:</span>
        <span class="info-value font-bold">${escapeHtml(customerCompany)}</span>
      </div>
      `
          : ''
      }
      ${
        customerPhone
          ? `
      <div class="info-row">
        <span class="info-label">Telefon:</span>
        <span class="info-value">${escapeHtml(customerPhone)}</span>
      </div>
      `
          : ''
      }
      ${
        customerEmail
          ? `
      <div class="info-row">
        <span class="info-label">E-Posta:</span>
        <span class="info-value">${escapeHtml(customerEmail)}</span>
      </div>
      `
          : ''
      }
      ${
        customerAddress
          ? `
      <div class="info-row">
        <span class="info-label">Adres:</span>
        <span class="info-value">${escapeHtml(customerAddress)}</span>
      </div>
      `
          : ''
      }
    </div>
    <div class="info-card">
      <h4>Teklif Bilgileri</h4>
      <div class="info-row">
        <span class="info-label">Teklif Tarihi:</span>
        <span class="info-value">${quotationDateFormatted}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Geçerlilik Tarihi:</span>
        <span class="info-value font-bold">${validUntilFormatted}</span>
      </div>
    </div>
  </div>

  ${
    data.notes
      ? `
    <div class="notes-box">
      <div class="notes-title">Teklif Notları / Ek Şartlar:</div>
      <div>${escapeHtml(data.notes)}</div>
    </div>
  `
      : ''
  }

  <table>
    <thead>
      <tr>
        <th style="width: 35px;" class="text-center">#</th>
        <th>Ürün ve Hizmet Açıklaması</th>
        <th style="width: 60px;" class="text-center">Adet</th>
        <th style="width: 120px;" class="text-right">Birim Fiyat</th>
        <th style="width: 130px;" class="text-right">Toplam Fiyat</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="calculation-section">
    <div class="terms-card">
      <h5>Teklif Koşulları</h5>
      <ol>
        ${conditionsListHtml.join('\n        ')}
      </ol>
    </div>

    <div class="summary-card">
      <div class="summary-row total-row">
        <span>Toplam Tutar:</span>
        <span class="total-amount">${totalAmountFormatted}</span>
      </div>
      <div class="vat-status-note">${isVatExcluded ? 'KDV hariçtir.' : 'KDV dahildir.'}</div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-title">Teklifi Hazırlayan (Hebiloğlu Ahşap)</div>
      <div class="signature-placeholder">Yetkili İmza / Kaşe</div>
    </div>
    <div class="signature-box">
      <div class="signature-title">Teklifi Onaylayan (Müşteri)</div>
      <div class="signature-placeholder">${escapeHtml(customerName)} / Kaşe - İmza</div>
    </div>
  </div>

  <div class="footer">
    Hebiloğlu Ahşap Kapı-Kasa-Pervaz Sistemleri • İşbu teklif belgesi elektronik olarak üretilmiştir.
  </div>
</body>
</html>`;
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
