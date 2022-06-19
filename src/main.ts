import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaService } from 'nestjs-prisma';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Example')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('example')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const prisma = app.get(PrismaService);

  await prisma.enableShutdownHooks(app);

  await app.listen(3001);
}

bootstrap();
