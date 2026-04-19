import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService, Message } from '../../core/services/socket.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2>Messages</h2>
        <div class="connection-status" [class.connected]="isConnected()">
          <span class="status-dot"></span>
          {{ isConnected() ? 'Connected' : 'Disconnected' }}
        </div>
      </div>

      <div class="chat-content">
        <div class="messages-list">
          @for (message of messages(); track message.id) {
            <div class="message" [class.own]="isOwnMessage(message)">
              <div class="message-content">
                <p>{{ message.content }}</p>
                <span class="message-time">{{ message.createdAt | date: 'short' }}</span>
                <span class="message-status" [class]="message.status">
                  @if (message.status === 'sent') {
                    ✓
                  } @else if (message.status === 'delivered') {
                    ✓✓
                  } @else if (message.status === 'seen') {
                    ✓✓✓
                  }
                </span>
              </div>
            </div>
          }
          @if (isTyping()) {
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          }
        </div>

        <div class="chat-input-area">
          <input
            type="text"
            [(ngModel)]="messageInput"
            (keyup.enter)="sendMessage()"
            (input)="onTyping()"
            placeholder="Type a message..."
            class="message-input"
          />
          <button (click)="sendMessage()" class="btn btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 800px;
        margin: 0 auto;
      }

      .chat-header {
        padding: 20px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .connection-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #999;
      }

      .connection-status.connected {
        color: #4caf50;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #999;
      }

      .connection-status.connected .status-dot {
        background: #4caf50;
      }

      .chat-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }

      .messages-list {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .message {
        display: flex;
        justify-content: flex-start;
      }

      .message.own {
        justify-content: flex-end;
      }

      .message-content {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 12px;
        background: #f0f0f0;
        word-break: break-word;
      }

      .message.own .message-content {
        background: #007bff;
        color: white;
      }

      .message-content p {
        margin: 0;
        font-size: 14px;
      }

      .message-time {
        font-size: 12px;
        color: #999;
        display: block;
        margin-top: 4px;
      }

      .message.own .message-time {
        color: rgba(255, 255, 255, 0.7);
      }

      .message-status {
        font-size: 12px;
        margin-left: 4px;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .typing-indicator span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #999;
        animation: typing 1.4s infinite;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          opacity: 0.5;
          transform: translateY(0);
        }
        30% {
          opacity: 1;
          transform: translateY(-10px);
        }
      }

      .chat-input-area {
        padding: 16px;
        border-top: 1px solid #ddd;
        display: flex;
        gap: 8px;
      }

      .message-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }

      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }
    `,
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  private socketService = inject(SocketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private typingTimeout: any;

  conversationId = signal<string>('');
  recipientId = signal<string>('');
  messageInput = signal<string>('');
  messages = signal<Message[]>([]);
  isConnected = signal<boolean>(false);
  isTyping = signal<boolean>(false);

  ngOnInit(): void {
    this.conversationId.set(this.route.snapshot.paramMap.get('conversationId') || '');
    this.recipientId.set(this.route.snapshot.paramMap.get('recipientId') || '');

    // Connect to WebSocket
    this.socketService.connectChat();

    // Subscribe to messages
    this.socketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages) => {
        this.messages.set(messages);
        this.scrollToBottom();
      });

    // Subscribe to connection status
    this.socketService.isConnected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.isConnected.set(connected);
      });

    // Subscribe to typing status
    this.socketService.typingUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((typingUsers) => {
        this.isTyping.set(typingUsers.has(this.recipientId()));
      });
  }

  sendMessage(): void {
    const content = this.messageInput().trim();
    if (!content) return;

    this.socketService.sendMessage(
      this.conversationId(),
      content,
      this.recipientId(),
    );

    this.messageInput.set('');
    this.socketService.stopTyping(this.conversationId(), this.recipientId());
  }

  onTyping(): void {
    this.socketService.startTyping(this.conversationId(), this.recipientId());

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.socketService.stopTyping(this.conversationId(), this.recipientId());
    }, 3000);
  }

  isOwnMessage(message: Message): boolean {
    // You'll need to inject AuthService to get current user ID
    return true; // Placeholder
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = document.querySelector('.messages-list');
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
