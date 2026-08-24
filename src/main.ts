import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { join } from 'path'; // <-- დაამატეთ ეს იმპორტი

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // ჩართეთ /uploads საქაღალდის სტატიკურად მიწოდება
  app.useStaticAssets({
    root: join(__dirname, '..', 'uploads'), // მიუთითებს პროექტის ძირში არსებულ 'uploads' ფოლდერზე
    prefix: '/uploads/', // URL მისამართის პრეფიქსი
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file, mirrors UploadService's own check
      files: 5,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3000, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.log(err);
});
