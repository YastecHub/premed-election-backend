import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import os from 'os';
import dotenv from 'dotenv';
import { Candidate, Admin, SystemConfig, AccessCode } from './models';
import { randomUUID } from 'crypto';
import { acquireLock, releaseLock } from './utils/locks';
import { Semaphore } from './utils/semaphore';
import { seedInitialData } from './seed';

dotenv.config();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err instanceof Error ? err.stack || err.message : String(err));
});

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL;
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL || true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
});

const limiters = {
  global: (_req: any, _res: any, next: any) => next(),
  vote: (_req: any, _res: any, next: any) => next(),
  register: (_req: any, _res: any, next: any) => next(),
  verify: (_req: any, _res: any, next: any) => next(),
  adminLogin: (_req: any, _res: any, next: any) => next(),
};


// Database Connections
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/premed_election';

// Helper function to get or create the singleton SystemConfig document
async function getSystemConfig() {
  try {
    let config = await SystemConfig.findById('election_config');
    if (!config) {
      config = await SystemConfig.create({
        _id: 'election_config',
        isElectionActive: false,
        startTime: null,
        endTime: null,
        adminSetDurationMinutes: 0
      });
    }
    return config;
  } catch (error) {
    console.error('Error getting system config:', error);
    throw error;
  }
}

// Semaphore implementation moved to ./utils/semaphore
const OCR_MAX_CONCURRENCY = Math.max(1, Number(process.env.OCR_MAX_CONCURRENCY) || 2);
const ocrSemaphore = new Semaphore(OCR_MAX_CONCURRENCY);

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});
import { configureApp } from './app';

// Configure express `app` (middlewares, routes, swagger, error handler)
const appConfig = configureApp(app, { io, upload, ocrSemaphore, acquireLock, releaseLock, getSystemConfig });

// Start Server
const start = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Initialize SystemConfig if it doesn't exist
  await getSystemConfig();
  // Seed basic data if empty (kept as a small helper to avoid repeating logic inline)
  await seedInitialData();

  // Automatic election end detection - check every minute
  setInterval(async () => {
    try {
      const config = await getSystemConfig();

      // If election is active, has an endTime, and the current time has passed endTime
      if (config.isElectionActive && config.endTime && Date.now() > config.endTime.getTime()) {
        config.isElectionActive = false;
        config.updatedAt = new Date();
        await config.save();

        console.log('Election automatically ended at', new Date().toISOString());
        io.emit('election_ended', { reason: 'Election duration expired' });
      }
    } catch (error) {
      console.error('Error in election end detection:', error);
    }
  }, 60 * 1000); 

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (appConfig && (appConfig as any).swaggerMounted) {
      const docsPath = (appConfig as any).docsPath || '/api-docs';
      console.log(`Swagger UI available at http://localhost:${PORT}${docsPath}`);
    } else {
      console.log('Swagger UI not mounted. Run `npm install swagger-jsdoc swagger-ui-express` to enable it.');
    }
  });
};

start().catch(err => {
  console.error("Server startup failed:", err);
  process.exit(1);
});
