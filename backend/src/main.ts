import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { setDefaultResultOrder } from 'dns';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

// Prefer IPv4 addresses to avoid environments where IPv6 is unreachable.
setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  (app as any).set('trust proxy', 1);

  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  // Enable CORS for REST
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Use Socket.IO adapter with CORS so WebSocket namespaces work
  app.useWebSocketAdapter(new IoAdapter(app));

  // Set global API prefix
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  // Use validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
  console.log(`WebSocket namespaces: /chat  /notifications`);
}
bootstrap();
