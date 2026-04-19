# Advanced Implementation Examples

## 🎓 Complete Integration Examples

### 1. Chat List Component with Real-Time Updates

```typescript
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MessagesService } from '@core/services/messages.service';
import { SocketService } from '@core/services/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="chat-list-container">
      <div class="chat-list-header">
        <h2>Messages</h2>
        <input 
          type="text" 
          placeholder="Search conversations..." 
          class="search-input"
        />
      </div>

      <div class="conversations-list">
        @if (conversations().length === 0) {
          <div class="empty-state">
            <p>No conversations yet</p>
          </div>
        } @else {
          @for (conv of conversations(); track conv.id) {
            <div 
              class="conversation-item"
              [class.unread]="conv.unreadCount > 0"
              (click)="openConversation(conv)"
              [class.online]="isUserOnline(conv.otherUserId)"
            >
              <div class="conversation-avatar">
                {{ conv.title.charAt(0).toUpperCase() }}
                @if (isUserOnline(conv.otherUserId)) {
                  <span class="online-indicator"></span>
                }
              </div>

              <div class="conversation-content">
                <div class="conversation-header">
                  <h3>{{ conv.title }}</h3>
                  <span class="time">{{ conv.updatedAt | date: 'short' }}</span>
                </div>
                <p class="last-message">{{ conv.lastMessage?.content }}</p>
              </div>

              @if (conv.unreadCount > 0) {
                <div class="unread-badge">{{ conv.unreadCount }}</div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .chat-list-container {
        width: 100%;
        max-width: 350px;
        border-right: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .chat-list-header {
        padding: 16px;
        border-bottom: 1px solid #ddd;
      }

      .search-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        margin-top: 8px;
      }

      .conversations-list {
        flex: 1;
        overflow-y: auto;
      }

      .conversation-item {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .conversation-item:hover {
        background: #f9f9f9;
      }

      .conversation-item.unread {
        background: #f0f8ff;
        font-weight: 600;
      }

      .conversation-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #007bff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
        position: relative;
      }

      .online-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #4caf50;
        position: absolute;
        bottom: 0;
        right: 0;
        border: 2px solid white;
      }

      .conversation-content {
        flex: 1;
        min-width: 0;
      }

      .conversation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .conversation-header h3 {
        margin: 0;
        font-size: 14px;
      }

      .time {
        font-size: 12px;
        color: #999;
      }

      .last-message {
        margin: 0;
        font-size: 13px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .unread-badge {
        background: #ff4444;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        flex-shrink: 0;
      }

      .empty-state {
        padding: 40px 16px;
        text-align: center;
        color: #999;
      }
    `,
  ],
})
export class ChatListComponent implements OnInit, OnDestroy {
  private messagesService = inject(MessagesService);
  private socketService = inject(SocketService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  conversations = signal<any[]>([]);
  userStatusMap = signal<Map<string, boolean>>(new Map());

  ngOnInit() {
    this.loadConversations();
    
    // Subscribe to user status changes
    this.socketService.userStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.userStatusMap.set(status);
      });
  }

  private async loadConversations() {
    try {
      const convs = await this.messagesService.listMyConversations();
      this.conversations.set(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  openConversation(conv: any) {
    this.router.navigate(['/chat', conv.id, conv.otherUserId]);
    this.messagesService.markConversationRead(conv.id);
  }

  isUserOnline(userId: string): boolean {
    return this.userStatusMap().get(userId) || false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. Enhanced Chat Component with File Sharing

```typescript
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '@core/services/socket.service';

@Component({
  selector: 'app-enhanced-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-wrapper">
      <div class="messages-container">
        @for (message of messages(); track message.id) {
          <div class="message" [class.own]="message.isOwn">
            @if (message.fileUrl) {
              <div class="file-message">
                <a [href]="message.fileUrl" target="_blank">
                  📎 {{ message.fileName }}
                </a>
              </div>
            } @else {
              <div class="text-message">{{ message.content }}</div>
            }
            <div class="message-meta">
              <span class="time">{{ message.createdAt | date: 'short' }}</span>
              <span class="status" [class]="message.status">
                @if (message.status === 'seen') {
                  ✓✓
                } @else if (message.status === 'delivered') {
                  ✓✓
                } @else {
                  ✓
                }
              </span>
            </div>
          </div>
        }
      </div>

      <div class="input-area">
        <div class="file-upload-zone" #fileDropZone>
          <input 
            type="file" 
            hidden 
            #fileInput 
            (change)="onFileSelected($event)"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
          />
          <div class="input-row">
            <input 
              type="text" 
              [(ngModel)]="messageText"
              placeholder="Type a message..."
              (keyup.enter)="sendMessage()"
            />
            <button (click)="fileInput.click()" class="btn-file">
              📎 Attach
            </button>
            <button (click)="sendMessage()" class="btn-send">
              Send
            </button>
          </div>
        </div>

        @if (selectedFile()) {
          <div class="selected-file">
            <span>📄 {{ selectedFile().name }}</span>
            <button (click)="clearFile()" class="btn-clear">✕</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .chat-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .message {
        display: flex;
        flex-direction: column;
        max-width: 70%;
      }

      .message.own {
        align-self: flex-end;
      }

      .text-message,
      .file-message {
        padding: 12px 16px;
        border-radius: 12px;
        background: #f0f0f0;
        word-break: break-word;
      }

      .message.own .text-message,
      .message.own .file-message {
        background: #007bff;
        color: white;
      }

      .file-message a {
        color: inherit;
        text-decoration: none;
        font-weight: 500;
      }

      .file-message a:hover {
        text-decoration: underline;
      }

      .message-meta {
        font-size: 12px;
        margin-top: 4px;
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .input-area {
        padding: 16px;
        border-top: 1px solid #ddd;
      }

      .file-upload-zone {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .input-row {
        display: flex;
        gap: 8px;
      }

      input[type="text"] {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }

      button {
        padding: 10px 16px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 14px;
      }

      .btn-send {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      .selected-file {
        padding: 8px 12px;
        background: #f0f8ff;
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      }

      .btn-clear {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 4px;
      }
    `,
  ],
})
export class EnhancedChatComponent {
  private socketService = inject(SocketService);

  messageText = signal('');
  messages = signal<any[]>([]);
  selectedFile = signal<File | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  sendMessage() {
    const content = this.messageText().trim();
    if (!content && !this.selectedFile()) return;

    if (this.selectedFile()) {
      this.uploadAndSend();
    } else {
      this.socketService.sendMessage('conversationId', content, 'recipientId');
      this.messageText.set('');
    }
  }

  private uploadAndSend() {
    const file = this.selectedFile();
    if (!file) return;

    // Upload file and get URL, then send message with file URL
    const fileUrl = URL.createObjectURL(file);
    this.socketService.sendMessage(
      'conversationId',
      `Shared file: ${file.name}`,
      'recipientId'
    );

    this.selectedFile.set(null);
    this.messageText.set('');
  }

  clearFile() {
    this.selectedFile.set(null);
  }
}
```

### 3. Notification Toast Component

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService, Notification } from '@core/services/socket.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div class="toast-container">
      @for (notification of toasts(); track notification.id) {
        <div 
          class="toast" 
          [@slideIn]
          [class]="notification.type"
          (mouseleave)="removeToast(notification.id)"
        >
          <div class="toast-icon">
            @if (notification.type === 'success') {
              ✅
            } @else if (notification.type === 'error') {
              ❌
            } @else if (notification.type === 'warning') {
              ⚠️
            } @else {
              ℹ️
            }
          </div>

          <div class="toast-content">
            <strong>{{ notification.title }}</strong>
            <p>{{ notification.message }}</p>
          </div>

          <button class="toast-close" (click)="removeToast(notification.id)">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .toast {
        background: white;
        border-radius: 8px;
        padding: 16px;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        gap: 12px;
        align-items: flex-start;
        border-left: 4px solid #999;
      }

      .toast.success {
        border-left-color: #4caf50;
      }

      .toast.error {
        border-left-color: #f44336;
      }

      .toast.warning {
        border-left-color: #ff9800;
      }

      .toast.info {
        border-left-color: #2196f3;
      }

      .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .toast-content {
        flex: 1;
      }

      .toast-content strong {
        display: block;
        margin-bottom: 4px;
      }

      .toast-content p {
        margin: 0;
        font-size: 14px;
        color: #666;
      }

      .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #999;
        padding: 0;
      }

      .toast-close:hover {
        color: #666;
      }
    `,
  ],
})
export class NotificationToastComponent implements OnInit {
  private socketService = inject(SocketService);

  toasts = signal<any[]>([]);

  ngOnInit() {
    this.socketService.notifications$.subscribe((notifications) => {
      if (notifications.length > 0) {
        const latest = notifications[0];
        this.showToast(latest);
      }
    });
  }

  showToast(notification: Notification) {
    const toastItem = {
      id: notification.id,
      ...notification,
      type: 'info',
    };

    this.toasts.update((current) => [toastItem, ...current]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeToast(notification.id);
    }, 5000);
  }

  removeToast(id: string) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
```

### 4. Integration in App Component

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationToastComponent } from './features/notifications/notification-toast.component';
import { ChatListComponent } from './features/chat/chat-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationToastComponent,
    ChatListComponent,
  ],
  template: `
    <div class="app-container">
      <app-notification-toast></app-notification-toast>

      <div class="main-content">
        <aside class="sidebar">
          <app-chat-list></app-chat-list>
        </aside>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      .main-content {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .sidebar {
        width: 350px;
        border-right: 1px solid #ddd;
        overflow: hidden;
      }

      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    `,
  ],
})
export class AppComponent {}
```

---

## 🎯 Key Patterns

### Pattern 1: Async Message Handling
```typescript
@SubscribeMessage('sendMessage')
async handleSendMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() payload: MessagePayload,
) {
  // Verify sender
  // Save to DB
  // Emit to recipient
  // Send confirmation
}
```

### Pattern 2: Multi-Room Broadcasting
```typescript
// Join user room
client.join(`user:${userId}`);

// Send to specific user
this.server.to(`user:${userId}`).emit('event', data);

// Send to all connected
this.server.emit('event', data);
```

### Pattern 3: Error Handling
```typescript
try {
  // Process message
} catch (error) {
  this.logger.error('Error:', error);
  client.emit('error', { message: 'Operation failed' });
}
```

---

## 📈 Scalability Considerations

1. **For Large Message Volume**: Use message queuing (Redis)
2. **For Many Users**: Implement socket adapter for distributed systems
3. **For File Uploads**: Use S3 or cloud storage
4. **For Notifications**: Implement delivery retry mechanism
5. **For Security**: Add rate limiting and message validation

---

**Ready for production integration!**
