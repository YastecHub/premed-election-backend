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

  // Configure CORS for both local development and production
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://premedelection.vercel.app',
    ...(config.clientUrl ? [config.clientUrl] : [])
  ];

  app.use(cors({ 
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list or allow all in dev
      if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-developer-key', 'x-admin-key']
  }));

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