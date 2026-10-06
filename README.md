# PDF Generator

NestJS + BullMQ ile teklif PDF'i üretir, dosyayı saklar ve ana API'ye PDF URL'sini PUT ile gönderir. Docker Compose uygulamayı, Chromium'u ve Redis'i birlikte çalıştırır.

## Coolify kurulumu

1. Bu dosyaları Git deposuna gönderin ve Coolify'da depodan yeni bir Application oluşturun.
2. **Build Pack:** `Docker Compose`. **Base Directory:** bu projenin depodaki dizini (repo kökündeyse `/`). **Docker Compose Location:** `/docker-compose.yml`.
3. `app` servisinin **Domains** alanına `https://pdf.sizin-domaininiz.com:3000` yazın. DNS kaydını Coolify sunucusuna yönlendirin. `:3000` proxy'nin konteyner içindeki hedef portudur; dışarıdan HTTPS 443 kullanılır.
4. **Environment Variables** bölümünde aşağıdaki değerleri ayarlayın:

   ```dotenv
   BASE_URL=https://pdf.sizin-domaininiz.com
   EXTERNAL_API_BASE_URL=https://apisatistakip.hebilogluahsap.com
   EXTERNAL_API_QUOTATION_UPDATE_ENDPOINT=/api/Quotations/:id/pdf-url
   ```

   `BASE_URL` PDF servisinin herkese açık adresidir; ana API adresi değildir ve sonuna `:3000` eklenmez. Gerçek domaininizle değiştirin. Bu değer zorunludur. Diğer iki değişkenin varsayılanları yukarıdaki gibidir.
5. **Deploy** çalıştırın. `https://pdf.sizin-domaininiz.com/health` adresi `{"status":"ok"}` döndürmeli. Swagger: `/api/docs`.

Kaynak: [Coolify Docker Compose dokümantasyonu](https://coolify.io/docs/applications/builds/docker-compose).

## Docker yapısı ve depolama

- Çok aşamalı Dockerfile: Node.js 24, yalnızca production bağımlılıkları, Chromium ve Türkçe karakterleri destekleyen fontlar. Uygulama `node` kullanıcısıyla çalışır.
- `app` servisi HTTP sunucusunu ve PDF/API kuyruk işleyicilerini aynı süreçte çalıştırır. `init: true` Chromium alt süreçlerini yönetir; kapanışta NestJS shutdown hook'ları kullanılır.
- `pdf-uploads` volume'u `/app/uploads` altında PDF'leri saklar.
- `redis-data` volume'u Redis AOF verisini saklar. `appendfsync everysec` kullanılır; ani sistem kaybında son yaklaşık bir saniyelik yazım kaybolabilir. Kuyruk için `noeviction` açıktır.
- Redis yalnızca Docker ağı içindedir; host portu yayınlanmaz. Compose kendi Redis bağlantısını ayarlar.
- `/health` uygulamanın HTTP canlılık kontrolüdür; Chromium veya dış API erişimini kontrol etmez. Redis'in ayrıca kendi healthcheck'i vardır.

Volume'lar yeniden dağıtımlarda korunur. `docker compose down -v` bu verileri siler; normal durdurma için `docker compose down` kullanın. Mevcut yerel `uploads/` dosyaları image'a kopyalanmaz; gerekiyorsa bunları volume'a ayrıca taşıyın. PDF ve Redis volume'larını yedekleyin.

## Yerelde Docker ile çalıştırma

`.env.example` dosyasını `.env` olarak kopyalayın. Mevcut `.env` varsa üzerine yazmadan API adresini kontrol edin; eski `http://localhost:5010` değeri Docker içinde çalışmaz.

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
docker compose logs -f app
```

Yerel ayar: `BASE_URL=http://localhost:3000`. Yerel override yalnızca uygulamanın portunu `127.0.0.1:3000` üzerinde yayınlar. Coolify'da yalnızca ana `docker-compose.yml` dosyasını kullanın.

## API akışı

`POST /api/documents` Swagger'da tanımlı `{ "success": true, "data": { ... } }` teklif gövdesini kabul eder ve HTTP 202 ile kuyruk işinin ID'sini döndürür. PDF üretildikten sonra dosya `/uploads/<teklif-id>.pdf` üzerinden sunulur ve şu istek yapılır:

```http
PUT https://apisatistakip.hebilogluahsap.com/api/Quotations/<teklif-id>/pdf-url
Content-Type: application/json

{"quotationPdfUrl":"https://pdf.sizin-domaininiz.com/uploads/<teklif-id>.pdf"}
```

Endpoint ve gövde [ana API Swagger şeması](https://apisatistakip.hebilogluahsap.com/swagger/index.html) ile uyumludur. Başarısız işler BullMQ yeniden deneme politikasına göre işlenir. Yerel denemelerde gerçek teklifleri güncellememek için `EXTERNAL_API_BASE_URL` değerini bir mock servise yönlendirin.

## Docker olmadan geliştirme

Node.js 24 ve erişilebilir Redis gerekir. `.env` içindeki Redis bağlantısını ayarlayın.

```bash
npm ci
npm run start:dev
npm test -- --runInBand
npm run build
```

Docker dışında Puppeteer kendi tarayıcısını indirir. Docker image'ı ise sistem Chromium'unu `PUPPETEER_EXECUTABLE_PATH` üzerinden kullanır.
