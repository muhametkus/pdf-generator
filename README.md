# PDF Generator

NestJS ve Chromium ile teklif PDF'i üretir, dosyayı saklar ve ana API'ye PDF URL'sini PUT ile gönderir. Redis veya kuyruk servisi gerekmez. İstek, PDF üretimi ve API güncellemesi tamamlanana kadar bekler.

## Coolify: Dockerfile ile dağıtım

1. Değişiklikleri Git deposuna gönderin. Build Pack olarak **Dockerfile** seçin.
2. Proje repo kökündeyse **Base Directory:** `/`, **Dockerfile Location:** `/Dockerfile`.
3. **Ports Exposes:** `3000`. **Domains:** `https://pdf.sizin-domaininiz.com`. DNS kaydını sunucuya yönlendirin.
4. Environment Variables:

   ```dotenv
   NODE_ENV=production
   PORT=3000
   BASE_URL=https://pdf.sizin-domaininiz.com
   EXTERNAL_API_BASE_URL=https://apisatistakip.hebilogluahsap.com
   EXTERNAL_API_QUOTATION_UPDATE_ENDPOINT=/api/Quotations/:id/pdf-url
   UPLOAD_DIR=uploads
   ```

5. Persistent Storage bölümünden `/app/uploads` hedefine kalıcı volume ekleyin. Dizin `node` kullanıcısı (UID 1000) tarafından yazılabilir olmalıdır. Mevcut PDF'leriniz varsa önceki depolamayı taşıyın veya aynı volume'u bağlayın.
6. Deploy çalıştırın. Sağlık kontrolü `/health`, Swagger `/api/docs` adresindedir. Swagger production ortamında da açıktır.

`BASE_URL` PDF servisinin dışarıdan erişilebilir adresidir. GitHub bağlantı zaman aşımı sunucu ağ erişimiyle ilgilidir; build pack değiştirmek bunu çözmez.

Kaynak: [Coolify Dockerfile dokümantasyonu](https://coolify.io/docs/applications/builds/dockerfile).

## İstek ve yanıt

`POST /api/documents` mevcut `{ "success": true, "data": { ... } }` teklif gövdesini kabul eder. Alanlar Swagger'da açıklanır. PDF kaydedilip ana API güncellendikten sonra **HTTP 200** döner:

```json
{
  "success": true,
  "status": "completed",
  "pdfUrl": "https://pdf.sizin-domaininiz.com/uploads/teklif-id.pdf"
}
```

Önceki HTTP 202, `jobId` ve `queued` yanıtı kaldırıldı. İstemci zaman aşımını PDF üretimi ve dış API isteğini kapsayacak şekilde ayarlayın. Dış API isteğinin zaman aşımı 30 saniyedir.

```http
PUT https://apisatistakip.hebilogluahsap.com/api/Quotations/<teklif-id>/pdf-url
Content-Type: application/json

{"quotationPdfUrl":"https://pdf.sizin-domaininiz.com/uploads/<teklif-id>.pdf"}
```

PDF üretimi/depolama başarısızsa HTTP 500; dış API güncellenemezse HTTP 502 döner. Bu durumda oluşturulan PDF diskte kalır. Otomatik arka plan yeniden denemesi yoktur; istemci isteği tekrar gönderebilir. Aynı teklif ID'si aynı PDF dosyasının üzerine yazar. Önceki Redis kuyruğunda bekleyen işler bu sürümde işlenmez; geçişten önce tamamlanmalarını bekleyin veya ilgili istekleri yeniden gönderin.

## Yerel Docker

```bash
docker build -t pdf-generator .
docker run -d --name pdf-generator --init -p 3000:3000 \
  -e BASE_URL=http://localhost:3000 \
  -v pdf-uploads:/app/uploads pdf-generator
```

Docker image'ı Node.js 24, production bağımlılıkları, Chromium ve fontları içerir; uygulama `node` kullanıcısıyla çalışır. `.env` ve yerel PDF dosyaları image'a eklenmez.

İsteğe bağlı tek servisli Compose da kullanılabilir. `.env.example` dosyasından `.env` hazırlayın:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Coolify'da Compose kullanmaya devam ederseniz `app` domain alanına `https://pdf.sizin-domaininiz.com:3000` girin; `BASE_URL` içinde port bulunmamalıdır. `pdf-uploads` volume'u PDF'leri korur. `docker compose down -v` volume verilerini siler.

## Geliştirme ve test

Node.js 24 gerekir. Redis gerekmez.

```bash
npm ci
npm run start:dev
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

Yerel PDF/API denemelerinde gerçek teklifleri güncellememek için `EXTERNAL_API_BASE_URL` değerini bir mock servise yönlendirin.
