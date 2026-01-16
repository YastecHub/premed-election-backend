import { Server } from 'socket.io';
import http from 'http';
import { config } from './index';
import { logger } from '../utils/logger';

export const createSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: config.clientUrl || true,
      methods: ['GET', 'POST'],
      credentials: true
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