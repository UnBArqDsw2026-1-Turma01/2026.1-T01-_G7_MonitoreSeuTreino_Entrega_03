import 'reflect-metadata';
import { register } from 'tsconfig-paths';
import { compilerOptions } from '../tsconfig.json';

register({
  baseUrl: './',
  paths: compilerOptions.paths,
});

import { AppModule } from '@infrastructure/modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from '@presentation/filters/domain-exception.filter';
import { LoggingInterceptor } from '@presentation/interceptors/logging.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.useLogger(logger);

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.useGlobalFilters(new DomainExceptionFilter(logger));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication and user management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(console.error);
