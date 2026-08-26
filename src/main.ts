import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import mongoSanitize from '@exortek/fastify-mongo-sanitize';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 1_048_576 }),
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 5,
    },
  });

  await app.register(helmet);

  await app.register(mongoSanitize, {
    replaceWith: '_',
    sanitizeObjects: ['body', 'params', 'query'],
    recursive: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );
  await app.listen(3000, '0.0.0.0');
}

bootstrap().catch((err) => {
  console.log(err);
});
