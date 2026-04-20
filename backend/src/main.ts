import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { setDefaultResultOrder } from 'dns';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { url } from 'inspector';

// Prefer IPv4 addresses to avoid environments where IPv6 is unreachable.
setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  (app as any).set('trust proxy', 1);

  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Set global API prefix (but keep GET / working so "backend link" doesn't show 404)
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  // Use validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const url = process.env.PORT ?? 3000;
  await app.listen(url);
  console.log(`Application is running on: ${url}/api`);
}
bootstrap();
