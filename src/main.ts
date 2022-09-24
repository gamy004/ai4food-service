import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer, ValidationError } from 'class-validator';
import { EntityNotFoundExceptionFilter } from './common/exceptions/entity-notfound-exception.filter';
import * as basicAuth from 'express-basic-auth';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const appOptions = { cors: true };

  const app = await NestFactory.create(AppModule, appOptions);

  // const mqttApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  //   transport: Transport.MQTT,
  //   options: {
  //     url: 'mqtt://localhost:1883',
  //   },
  // });

  app.setGlobalPrefix('api');

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // exceptionFactory: (errors: ValidationError[]) => {
      //   let messages = [];

      //   function extractError(errors) {
      //     console.log(errors);

      //     errors.forEach(error => {
      //       if (error.constraints) {
      //         messages = [
      //           ...messages,
      //           ...Object.values(error.constraints)
      //         ];
      //       }

      //       if (error.children) {
      //         extractError(error.children);
      //       }
      //     })
      //   }

      //   extractError(errors);

      //   return new UnprocessableEntityException({
      //     "statusCode": HttpStatus.UNPROCESSABLE_ENTITY,
      //     "error": "Unprocessable Entity",
      //     "message": [...new Set(messages)]
      //   });
      // },
    }),
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(
      ['/docs', 'docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USERNAME || 'swagger']:
            process.env.SWAGGER_PASSWORD || 'swaggerPassword',
        },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('AI Food Safety API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Swab')
    .addTag('Lab')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document);

  app.useGlobalFilters(new EntityNotFoundExceptionFilter());

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3001);
  // await mqttApp.listen();
}

bootstrap();
