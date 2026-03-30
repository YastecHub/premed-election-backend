import express, { Express } from 'express';
import cors from 'cors';
import multer from 'multer';
import os from 'os';
import { config } from '../config';

export const setupMiddlewares = (app: Express) => {
  const limiters = {
    global: (_req: any, _res: any, next: any) => next(),
    vote: (_req: any, _res: any, next: any) => next(),
    register: (_req: any, _res: any, next: any) => next(),
    verify: (_req: any, _res: any, next: any) => next(),
    adminLogin: (_req: any, _res: any, next: any) => next(),
  };

  // Allow all origins
  app.use(cors({ 
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-developer-key', 'x-admin-key']
  }));

  // Handle preflight requests explicitly
  app.options('*', cors());

  app.use(limiters.global);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  return { limiters };
};

export const createUpload = () => multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
});