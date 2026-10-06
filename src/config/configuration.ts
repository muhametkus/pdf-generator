export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
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
