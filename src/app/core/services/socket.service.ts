import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { getRuntimeEnv } from '../config/runtime-env';

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  status: 'sent' | 'delivered' | 'seen';
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  createdAt: Date;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private authService = inject(AuthService);
  
  private chatSocket: Socket | null = null;
  private notificationSocket: Socket | null = null;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private userStatusSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  public userStatus$ = this.userStatusSubject.asObservable();

  private typingUsersSubject = new BehaviorSubject<Set<string>>(new Set());
  public typingUsers$ = this.typingUsersSubject.asObservable();

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  private isNotificationConnectedSubject = new BehaviorSubject<boolean>(false);
  public isNotificationConnected$ = this.isNotificationConnectedSubject.asObservable();

  constructor() {}

  connectChat(url?: string): void {
    if (this.chatSocket?.connected) return;


    const token = this.authService.accessToken();
    if (!token) {
      console.warn('No authentication token available');
      return;
    }

    const env = getRuntimeEnv();
    const baseUrl = (url ?? env.SOCKET_BASE_URL).trim();

    this.chatSocket = io(`${baseUrl}/chat`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupChatListeners();
  }

  connectNotifications(url?: string): void {
    if (this.notificationSocket?.connected) return;


    const token = this.authService.accessToken();
    if (!token) {
      console.warn('No authentication token available');
      return;
    }

    const env = getRuntimeEnv();
    const baseUrl = (url ?? env.SOCKET_BASE_URL).trim();

    this.notificationSocket = io(`${baseUrl}/notifications`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupNotificationListeners();
  }

  private setupChatListeners(): void {
    if (!this.chatSocket) return;

    this.chatSocket.on('connect', () => {
      console.log('Chat socket connected');
      this.isConnectedSubject.next(true);
    });

    this.chatSocket.on('disconnect', () => {
      console.log('Chat socket disconnected');
      this.isConnectedSubject.next(false);
    });

    this.chatSocket.on('newMessage', (message: Message) => {
      const messages = this.messagesSubject.value;
      this.messagesSubject.next([...messages, message]);
    });

    this.chatSocket.on('messageSent', (message: Message) => {
      const messages = this.messagesSubject.value;
      const index = messages.findIndex((m) => m.id === message.id);
      if (index >= 0) {
        messages[index] = message;
        this.messagesSubject.next([...messages]);
      }
    });

    this.chatSocket.on('messageSeen', (data: any) => {
      const messages = this.messagesSubject.value;
      const message = messages.find((m) => m.id === data.messageId);
      if (message) {
        message.status = 'seen';
        this.messagesSubject.next([...messages]);
      }
    });

    this.chatSocket.on('userStatusChanged', (data: any) => {
      const status = this.userStatusSubject.value;
      status.set(data.userId, data.isOnline);
      this.userStatusSubject.next(new Map(status));
    });

    this.chatSocket.on('userTyping', (data: any) => {
      const typingUsers = new Set(this.typingUsersSubject.value);
      if (data.isTyping) {
        typingUsers.add(data.userId);
      } else {
        typingUsers.delete(data.userId);
      }
      this.typingUsersSubject.next(typingUsers);
    });

    this.chatSocket.on('error', (error: any) => {
      console.error('Chat socket error:', error);
    });
  }

  private setupNotificationListeners(): void {
    if (!this.notificationSocket) return;

    this.notificationSocket.on('connect', () => {
      console.log('Notification socket connected');
      this.isNotificationConnectedSubject.next(true);
    });

    this.notificationSocket.on('disconnect', () => {
      console.log('Notification socket disconnected');
      this.isNotificationConnectedSubject.next(false);
    });

    this.notificationSocket.on('notification', (notification: Notification) => {
      const notifications = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...notifications]);
    });

    this.notificationSocket.on('unreadCount', (data: any) => {
      this.unreadCountSubject.next(data.count);
    });

    this.notificationSocket.on('notificationRead', (data: any) => {
      const notifications = this.notificationsSubject.value;
      const notification = notifications.find((n) => n.id === data.notificationId);
      if (notification) {
        notification.isRead = true;
        this.notificationsSubject.next([...notifications]);
      }
    });

    this.notificationSocket.on('allNotificationsRead', () => {
      const notifications = this.notificationsSubject.value.map((n) => ({ ...n, isRead: true }));
      this.notificationsSubject.next(notifications);
      this.unreadCountSubject.next(0);
    });

    this.notificationSocket.on('error', (error: any) => {
      console.error('Notification socket error:', error);
    });
  }

  sendMessage(conversationId: string, content: string, recipientId: string): void {
    if (!this.chatSocket?.connected) {
      console.warn('Chat socket not connected');
      return;
    }
    this.chatSocket.emit('sendMessage', { conversationId, content, recipientId });
  }

  startTyping(conversationId: string, recipientId: string): void {
    if (!this.chatSocket?.connected) return;
    this.chatSocket.emit('typing', { conversationId, recipientId, isTyping: true });
  }

  stopTyping(conversationId: string, recipientId: string): void {
    if (!this.chatSocket?.connected) return;
    this.chatSocket.emit('typing', { conversationId, recipientId, isTyping: false });
  }

  markMessageAsRead(messageId: string, conversationId: string, recipientId: string): void {
    if (!this.chatSocket?.connected) return;
    this.chatSocket.emit('markAsRead', { messageId, conversationId, recipientId });
  }

  markNotificationAsRead(notificationId: string): void {
    if (!this.notificationSocket?.connected) return;
    if (notificationId === 'all') {
      this.notificationSocket.emit('markAllRead', {});
    } else {
      this.notificationSocket.emit('markAsRead', { notificationId });
    }
  }

  getUnreadCount(): void {
    if (!this.notificationSocket?.connected) return;
    this.notificationSocket.emit('getUnreadCount');
  }

  disconnectChat(): void {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
      this.isConnectedSubject.next(false);
    }
  }

  disconnectNotifications(): void {
    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
      this.isNotificationConnectedSubject.next(false);
    }
  }

  disconnect(): void {
    this.disconnectChat();
    this.disconnectNotifications();
  }
}
