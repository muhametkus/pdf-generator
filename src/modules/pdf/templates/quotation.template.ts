import { PdfGenerationJobPayload } from '../../../common/interfaces/job-payload.interface';
import { formatCurrency } from '../../../common/utils/currency.util';
import { formatDate } from '../../../common/utils/date.util';

export function renderQuotationHtml(data: PdfGenerationJobPayload): string {
  const quotationDateFormatted = formatDate(data.quotationDate);
  const validUntilFormatted = formatDate(data.validUntil);
  const totalAmountFormatted = formatCurrency(data.totalAmount);

  const itemsHtml = data.items
    .map((item, index) => {
      const unitPriceFormatted = formatCurrency(item.unitPrice);
      const totalPriceFormatted = formatCurrency(item.totalPrice);

      const productionBadge = item.requiresProduction
        ? '<span class="badge badge-info">✓ Üretim</span>'
        : '<span class="badge badge-muted">✗ Üretim</span>';

      const deliveryBadge = item.requiresDelivery
        ? '<span class="badge badge-info">✓ Teslimat</span>'
        : '<span class="badge badge-muted">✗ Teslimat</span>';

      const installationBadge = item.requiresInstallation
        ? '<span class="badge badge-info">✓ Montaj</span>'
        : '<span class="badge badge-muted">✗ Montaj</span>';

      return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>
            <div class="product-name">${escapeHtml(item.productName)}</div>
            <div class="product-desc">${escapeHtml(item.description || '-')}</div>
            <div class="badge-group">
              ${productionBadge}
              ${deliveryBadge}
              ${installationBadge}
            </div>
          </td>
          <td class="text-center font-bold">${item.quantity}</td>
          <td class="text-right">${unitPriceFormatted}</td>
          <td class="text-right font-bold">${totalPriceFormatted}</td>
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
      size: A4;
      margin: 15mm;
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
      color: #1e293b;
      background-color: #ffffff;
      font-size: 13px;
      line-height: 1.5;
      padding: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .quotation-badge {
      display: inline-block;
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 14px;
      text-align: right;
    }
    .quotation-badge .number {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .quotation-badge .status {
      font-size: 12px;
      font-weight: 600;
      color: #2563eb;
      margin-top: 2px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-card h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      margin-bottom: 6px;
    }
    .info-label {
      width: 130px;
      font-weight: 600;
      color: #475569;
    }
    .info-value {
      flex: 1;
      color: #0f172a;
    }
    .notes-box {
      margin-bottom: 20px;
      padding: 12px;
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      font-size: 12px;
      color: #92400e;
    }
    .notes-title {
      font-weight: 700;
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .product-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 13px;
    }
    .product-desc {
      color: #64748b;
      font-size: 12px;
      margin-top: 3px;
    }
    .badge-group {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .badge-muted {
      background-color: #f1f5f9;
      color: #94a3b8;
      border: 1px solid #e2e8f0;
    }
    .total-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;
    }
    .total-box {
      width: 320px;
      background-color: #f8fafc;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 16px;
      text-align: right;
    }
    .total-label {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
    }
    .total-value {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">TEKLİF / QUOTATION</div>
      <div class="brand-subtitle">Resmi Fiyat ve Koşul Teklif Mektubu</div>
    </div>
    <div class="quotation-badge">
      <div class="number">${escapeHtml(data.quotationNumber)}</div>
      <div class="status">Durum: ${escapeHtml(data.statusText)}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <h4>Müşteri Bilgileri</h4>
      <div class="info-row">
        <span class="info-label">Müşteri Adı:</span>
        <span class="info-value font-bold">${escapeHtml(data.customerName)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Müşteri No:</span>
        <span class="info-value">${escapeHtml(data.customerId)}</span>
      </div>
    </div>
    <div class="info-card">
      <h4>Teklif Detayları</h4>
      <div class="info-row">
        <span class="info-label">Teklif No:</span>
        <span class="info-value font-bold">${escapeHtml(data.quotationNumber)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Teklif Tarihi:</span>
        <span class="info-value">${quotationDateFormatted}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Geçerlilik Tarihi:</span>
        <span class="info-value">${validUntilFormatted}</span>
      </div>
    </div>
  </div>

  ${
    data.notes
      ? `
    <div class="notes-box">
      <div class="notes-title">Notlar:</div>
      <div>${escapeHtml(data.notes)}</div>
    </div>
  `
      : ''
  }

  <table>
    <thead>
      <tr>
        <th style="width: 40px;" class="text-center">#</th>
        <th>Ürün ve Hizmet Açıklaması</th>
        <th style="width: 70px;" class="text-center">Adet</th>
        <th style="width: 130px;" class="text-right">Birim Fiyat</th>
        <th style="width: 140px;" class="text-right">Toplam Fiyat</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-box">
      <div class="total-label">Toplam Tutar</div>
      <div class="total-value">${totalAmountFormatted}</div>
    </div>
  </div>

  <div class="footer">
    İşbu teklif belgesi sistem tarafından elektronik olarak üretilmiştir. Belirtilen geçerlilik tarihine kadar geçerlidir.
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
