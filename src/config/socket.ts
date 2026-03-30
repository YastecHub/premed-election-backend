import { Server } from 'socket.io';
import http from 'http';
import { config } from './index';
import { logger } from '../utils/logger';

export const createSocketServer = (server: http.Server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://premedelection.vercel.app',
    ...(config.clientUrl ? [config.clientUrl] : [])
  ];

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    logger.info('Client connected:', socket.id);
    
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected:', socket.id, reason);
    });
  });

  return io;
};