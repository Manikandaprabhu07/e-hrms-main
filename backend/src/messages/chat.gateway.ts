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
import { Injectable, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { Inject, forwardRef } from '@nestjs/common';
interface MessagePayload {
  conversationId: string;
  content: string;
  recipientId: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

interface TypingPayload {
  conversationId: string;
  recipientId: string;
  isTyping: boolean;
}

interface MarkReadPayload {
  messageId: string;
  conversationId: string;
  recipientId: string; // original sender — we notify them
}

@WebSocketGateway({
  namespace: 'chat',
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
  // userId -> socketId
  private userSockets: Map<string, string> = new Map();
  // userId -> isOnline
  private userStatus: Map<string, boolean> = new Map();

  constructor(
    @Inject(forwardRef(() => MessagesService))
    private messagesService: MessagesService,
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
      this.userStatus.set(userId, true);

      client.join(`user:${userId}`);
      this.logger.log(`[Chat] User ${userId} connected — socket ${client.id}`);

      // Tell everyone this user is online
      this.server.emit('userStatusChanged', {
        userId,
        isOnline: true,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('[Chat] Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    let userId: string | null = null;

    for (const [uid, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        userId = uid;
        break;
      }
    }

    if (userId) {
      this.userSockets.delete(userId);
      this.userStatus.set(userId, false);

      this.logger.log(`[Chat] User ${userId} disconnected`);

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
      const token = client.handshake.auth?.token;
      const decoded = this.jwtService.verify(token);
      const senderId = decoded.sub;

      // Persist message
      const message = await this.messagesService.createMessage(
        payload.conversationId,
        senderId,
        payload.content,
      );

      const recipientOnline = this.userSockets.has(payload.recipientId);
      const status = recipientOnline ? 'delivered' : 'sent';

      const messageData = {
        id: message.id,
        conversationId: payload.conversationId,
        senderUserId: senderId,
        content: payload.content,
        fileUrl: payload.fileUrl ?? null,
        fileType: payload.fileType ?? null,
        fileName: payload.fileName ?? null,
        status,
        createdAt: message.createdAt,
      };

      // Push to recipient in real time
      this.server
        .to(`user:${payload.recipientId}`)
        .emit('newMessage', messageData);

      // Confirm to sender
      client.emit('messageSent', { ...messageData, status });

      this.logger.log(
        `[Chat] Message ${message.id} from ${senderId} → ${payload.recipientId} (${status})`,
      );
    } catch (error) {
      this.logger.error('[Chat] sendMessage error:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    try {
      const token = client.handshake.auth?.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      this.server.to(`user:${payload.recipientId}`).emit('userTyping', {
        conversationId: payload.conversationId,
        userId,
        isTyping: payload.isTyping,
      });
    } catch {
      // ignore — token may have just expired
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MarkReadPayload,
  ) {
    try {
      const token = client.handshake.auth?.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      await this.messagesService.markMessageAsRead(payload.messageId);

      // Notify the ORIGINAL SENDER (recipientId = the person who sent the message)
      this.server
        .to(`user:${payload.recipientId}`)
        .emit('messageSeen', {
          messageId: payload.messageId,
          conversationId: payload.conversationId,
          seenBy: userId,
          timestamp: new Date(),
        });
    } catch (error) {
      this.logger.error('[Chat] markAsRead error:', error);
    }
  }

  /** Called by MessagesService to push a new message via WS when sent through REST */
  pushNewMessage(recipientId: string, messageData: any): void {
    this.server.to(`user:${recipientId}`).emit('newMessage', messageData);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userStatus.entries())
      .filter(([, online]) => online)
      .map(([uid]) => uid);
  }

  isUserOnline(userId: string): boolean {
    return this.userStatus.get(userId) === true;
  }
}
