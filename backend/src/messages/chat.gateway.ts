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
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

interface MessagePayload {
  conversationId: string;
  content: string;
  recipientId: string;
}

interface TypingPayload {
  conversationId: string;
  recipientId: string;
  isTyping: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private userStatus: Map<string, boolean> = new Map(); // userId -> isOnline

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
    private usersService: UsersService,
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
      this.userStatus.set(userId, true);

      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);

      // Broadcast online status
      this.server.emit('userStatusChanged', {
        userId,
        isOnline: true,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    let userId: string | null = null;

    // Find which user this socket belonged to
    for (const [uid, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        userId = uid;
        break;
      }
    }

    if (userId) {
      this.userSockets.delete(userId);
      this.userStatus.set(userId, false);

      this.logger.log(`User ${userId} disconnected`);

      // Broadcast offline status
      this.server.emit('userStatusChanged', {
        userId,
        isOnline: false,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const senderId = decoded.sub;

      // Save message to database
      const message = await this.messagesService.createMessage(
        payload.conversationId,
        senderId,
        payload.content,
      );

      // Get recipient socket
      const recipientSocketId = this.userSockets.get(payload.recipientId);
      const status = recipientSocketId ? 'delivered' : 'sent';

      const messageData = {
        id: message.id,
        conversationId: payload.conversationId,
        senderUserId: senderId,
        content: payload.content,
        status,
        createdAt: message.createdAt,
      };

      // Send to recipient's room
      this.server.to(`user:${payload.recipientId}`).emit('newMessage', messageData);

      // Send confirmation to sender
      client.emit('messageSent', { ...messageData, status: 'sent' });

      this.logger.log(`Message sent from ${senderId} to ${payload.recipientId}`);
    } catch (error) {
      this.logger.error('Send message error:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    const token = client.handshake.auth.token;
    const decoded = this.jwtService.verify(token);
    const userId = decoded.sub;

    // Notify recipient
    this.server.to(`user:${payload.recipientId}`).emit('userTyping', {
      conversationId: payload.conversationId,
      userId,
      isTyping: payload.isTyping,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string; conversationId: string; recipientId: string },
  ) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      // Update message status
      await this.messagesService.markMessageAsRead(payload.messageId);

      // Notify sender
      this.server.emit('messageSeen', {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        seenBy: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Mark as read error:', error);
    }
  }

  getOnlineUsers(): string[] {
    const onlineUsers: string[] = [];
    for (const [userId, isOnline] of this.userStatus.entries()) {
      if (isOnline) {
        onlineUsers.push(userId);
      }
    }
    return onlineUsers;
  }

  getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }
}
