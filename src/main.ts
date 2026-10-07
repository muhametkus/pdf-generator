import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  app.enableCors({
    origin: [
      'https://apisatistakip.hebilogluahsap.com',
      /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/,
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const uploadDir = configService.get<string>('storage.uploadDir', 'uploads');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
    }),
  );

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: `/${uploadDir}/`,
  });

  // Swagger OpenAPI Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PDF Generator Microservice')
    .setDescription(
      'Quotation PDF generation and external API update service',
    )
    .setVersion('1.0')
    .addTag('Documents')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(port, '0.0.0.0');
  console.log(`PDF Generator service is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
