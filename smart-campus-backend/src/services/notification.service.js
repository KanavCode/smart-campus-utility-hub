const { Server } = require('socket.io');
const { logger, query } = require('../config/db');

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

  async getUsersByRole(role) {
    const result = await query(
      'SELECT id, email, full_name FROM users WHERE role = $1 AND is_active = true',
      [role]
    );
    return result.rows;
  }

  async sendEmailNotification(email, payload) {
    const webhookUrl = process.env.NOTIFICATION_EMAIL_WEBHOOK_URL;
    if (!webhookUrl) {
      return { status: 'skipped' };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: payload.title,
          text: payload.message,
          metadata: payload.metadata || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Email webhook failed with status ${response.status}`);
      }

      return { status: 'sent' };
    } catch (error) {
      logger.error('Email notification failed', { email, error: error.message });
      return { status: 'failed' };
    }
  }

  async createNotificationsForUsers({
    users,
    eventType,
    title,
    message,
    metadata = {},
    sendEmail = false,
  }) {
    if (!Array.isArray(users) || users.length === 0) {
      return { created: 0, emailed: 0 };
    }

    const statuses = await Promise.all(users.map(async (user) => {
      const emailResult = sendEmail && user.email
        ? await this.sendEmailNotification(user.email, { title, message, metadata })
        : { status: 'skipped' };

      await query(
        `
        INSERT INTO notifications (user_id, event_type, title, message, metadata, email_status, email_sent_at)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
      `,
        [
          user.id,
          eventType,
          title,
          message,
          JSON.stringify(metadata || {}),
          emailResult.status,
          emailResult.status === 'sent' ? new Date().toISOString() : null,
        ]
      );

      return emailResult.status;
    }));

    const emailed = statuses.filter((status) => status === 'sent').length;
    const created = statuses.length;

    return { created, emailed };
  }

  async notifyRole({
    role,
    eventType,
    title,
    message,
    metadata = {},
    socketEvent = null,
    socketPayload = null,
    sendEmail = false,
  }) {
    const users = await this.getUsersByRole(role);
    const result = await this.createNotificationsForUsers({
      users,
      eventType,
      title,
      message,
      metadata,
      sendEmail,
    });

    if (socketEvent) {
      this.broadcast(socketEvent, socketPayload || { title, message, ...metadata });
    }

    return result;
  }
}

module.exports = new NotificationService();
