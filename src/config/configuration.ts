export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl:
    process.env.BASE_URL || 'https://teklifpdfgenerator.hebilogluahsap.com',
  externalApi: {
    baseUrl:
      process.env.EXTERNAL_API_BASE_URL ||
      'https://apisatistakip.hebilogluahsap.com',
    quotationUpdateEndpoint:
      process.env.EXTERNAL_API_QUOTATION_UPDATE_ENDPOINT ||
      '/api/Quotations/:id/pdf-url',
  },
  storage: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
});
