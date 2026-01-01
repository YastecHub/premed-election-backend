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
    }
  });

  io.on('connection', (socket) => {
    logger.info('Client connected:', socket.id);
  });

  return io;
};