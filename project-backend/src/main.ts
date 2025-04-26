import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static files từ folder uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // => file sẽ truy cập qua /uploads/filename
  });

  await app.listen(3000);
}
bootstrap();
