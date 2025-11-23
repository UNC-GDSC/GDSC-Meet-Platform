import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import RoomManager from './services/RoomManager';
import { registerSocketHandlers } from './handlers/socketHandlers';
import logger from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const maxParticipants = parseInt(process.env.MAX_PARTICIPANTS_PER_ROOM || '50', 10);
const roomManager = new RoomManager(maxParticipants);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/rooms', (req, res) => {
  try {
    const rooms = roomManager.getAllRooms().map((room) => ({
      id: room.id,
      name: room.name,
      participantCount: room.participants.size,
      createdAt: room.createdAt,
    }));
    res.json({ rooms });
  } catch (error) {
    logger.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const stats = roomManager.getRoomStats(req.params.roomId);
    if (!stats) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching room stats:', error);
    res.status(500).json({ error: 'Failed to fetch room stats' });
  }
});

registerSocketHandlers(io, roomManager);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Max participants per room: ${maxParticipants}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});
