import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';

interface NotificationPayload {
  type: string; // 'delete_request', 'password_reset', 'new_employee', 'approval'
  recipientId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

interface NotificationReadPayload {
  notificationId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server | undefined;

  private logger = new Logger('NotificationsGateway');
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      this.userSockets.set(userId, client.id);
      client.join(`notifications:${userId}`);

      this.logger.log(`User ${userId} connected to notifications with socket ${client.id}`);

      // Send unread count
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unreadCount', { count: unreadCount });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected from notifications`);
        break;
      }
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: NotificationReadPayload,
  ) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      await this.notificationsService.markAsRead(payload.notificationId);

      client.emit('notificationRead', { notificationId: payload.notificationId });
      this.logger.log(`Notification ${payload.notificationId} marked as read by ${userId}`);
    } catch (error) {
      this.logger.error('Mark as read error:', error);
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unreadCount', { count: unreadCount });
    } catch (error) {
      this.logger.error('Get unread count error:', error);
    }
  }

  async notifyUser(
    userId: string,
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, any>;
      createdAt: Date;
    },
  ) {
    this.server!.to(`notifications:${userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      createdAt: notification.createdAt,
      isRead: false,
    });

    // Update unread count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server!.to(`notifications:${userId}`).emit('unreadCount', { count: unreadCount });
  }

  async notifyMultipleUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
      await this.notifyUser(userId, notification);
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
