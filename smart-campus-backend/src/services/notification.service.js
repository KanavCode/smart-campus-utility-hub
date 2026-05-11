const { Server } = require('socket.io');
const { logger } = require('../config/db');

class NotificationService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.io with the HTTP server
   * @param {import('http').Server} server 
   */
  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim())
          : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`New client connected: ${socket.id}`);

      // Allow users to join specific rooms (e.g., department, year, or user-specific)
      socket.on('join', (room) => {
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room: ${room}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    logger.info('Socket.io initialized successfully');
    return this.io;
  }

  /**
   * Send a notification to all connected clients
   * @param {string} event 
   * @param {any} data 
   */
  broadcast(event, data) {
    if (!this.io) {
      logger.error('NotificationService.broadcast called before initialization');
      return;
    }
    this.io.emit(event, data);
    logger.info(`Broadcasted event: ${event}`);
  }

  /**
   * Send a notification to a specific room
   * @param {string} room 
   * @param {string} event 
   * @param {any} data 
   */
  sendToRoom(room, event, data) {
    if (!this.io) {
      logger.error('NotificationService.sendToRoom called before initialization');
      return;
    }
    this.io.to(room).emit(event, data);
    logger.info(`Sent event ${event} to room ${room}`);
  }
}

module.exports = new NotificationService();
