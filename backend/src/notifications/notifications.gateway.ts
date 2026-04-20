import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  // userId -> socketId
  private userSockets: Map<string, string> = new Map();

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      this.userSockets.set(userId, client.id);
      client.join(`notifications:${userId}`);

      this.logger.log(`[Notifications] User ${userId} connected — socket ${client.id}`);

      // Send current unread count on connect
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unreadCount', { count: unreadCount });
    } catch (error) {
      this.logger.error('[Notifications] Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`[Notifications] User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { notificationId: string },
  ) {
    try {
      const token = client.handshake.auth?.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      await this.notificationsService.markRead(userId, payload.notificationId);

      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('notificationRead', { notificationId: payload.notificationId });
      client.emit('unreadCount', { count: unreadCount });
    } catch (error) {
      this.logger.error('[Notifications] markAsRead error:', error);
    }
  }

  @SubscribeMessage('markAllRead')
  async handleMarkAllRead(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      await this.notificationsService.markAllRead(userId);
      client.emit('unreadCount', { count: 0 });
      client.emit('allNotificationsRead', {});
    } catch (error) {
      this.logger.error('[Notifications] markAllRead error:', error);
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      const count = await this.notificationsService.getUnreadCount(userId);
      client.emit('unreadCount', { count });
    } catch (error) {
      this.logger.error('[Notifications] getUnreadCount error:', error);
    }
  }

  /** Push a notification to a single online user */
  async notifyUser(
    userId: string,
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      link?: string | null;
      meta?: any;
      createdAt: Date;
    },
  ) {
    this.server.to(`notifications:${userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link ?? null,
      meta: notification.meta ?? null,
      createdAt: notification.createdAt,
      isRead: false,
    });

    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`notifications:${userId}`).emit('unreadCount', { count: unreadCount });
  }

  /** Push a notification to multiple users */
  async notifyMultipleUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
      await this.notifyUser(userId, notification);
    }
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}
