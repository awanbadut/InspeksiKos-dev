import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

let isAppInitialized = false;
let appInstance: any = null;

export const createServer = async () => {
  if (isAppInitialized && appInstance) {
    return server;
  }

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  appInstance = app;
  isAppInitialized = true;
  
  return server;
};

// Vercel Serverless Function entrypoint
export default async (req: any, res: any) => {
  await createServer();
  server(req, res);
};
