import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MysqlService } from './mysql/mysql.service';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  console.log('🔧 Bootstrapping NestJS application...');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // ————————————————
  // 1. VERIFY RAW MYSQL CONNECTION
  // ————————————————
  const mysql = app.get(MysqlService);
  mysql.onModuleInit();

  try {
    const connection = await mysql.getConnection();
    await connection.ping(); // lightweight check
    console.log('✅ MySQL connection established');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }

  // ————————————————
  // 2. GLOBAL CONFIGURATION
  // ————————————————
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // // ———————————————— Swagger Configuration ————————————————

  // const config = new DocumentBuilder()
  //   .setTitle('Your API Title')
  //   .setDescription('Your API description here')
  //   .setVersion('1.0')
  //   .addTag('users') // Example tag
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api-docs', app, document);

  // ————————————————
  // 3. START SERVER
  // ————————————————
  const port = Number(process.env.PORT) || 5000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}

void bootstrap();
