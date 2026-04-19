import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService, Notification } from '../../core/services/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <h3>Notifications</h3>
        <span class="unread-badge" *ngIf="unreadCount() > 0">
          {{ unreadCount() }}
        </span>
      </div>

      <div class="notifications-list">
        @if (notifications().length === 0) {
          <div class="no-notifications">
            <p>No notifications yet</p>
          </div>
        } @else {
          @for (notification of notifications(); track notification.id) {
            <div
              class="notification-item"
              [class.unread]="!notification.isRead"
              (click)="handleNotificationClick(notification)"
            >
              <div class="notification-icon">
                @if (notification.type === 'delete_request') {
                  <span class="icon">🗑️</span>
                } @else if (notification.type === 'password_reset') {
                  <span class="icon">🔐</span>
                } @else if (notification.type === 'new_employee') {
                  <span class="icon">👤</span>
                } @else if (notification.type === 'approval') {
                  <span class="icon">✅</span>
                } @else if (notification.type === 'message') {
                  <span class="icon">💬</span>
                } @else {
                  <span class="icon">ℹ️</span>
                }
              </div>

              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">
                  {{ notification.createdAt | date: 'short' }}
                </div>
              </div>

              @if (!notification.isRead) {
                <div class="unread-indicator"></div>
              }
            </div>
          }
        }
      </div>

      <div class="notifications-footer">
        <button class="btn btn-sm" (click)="markAllAsRead()">
          Mark all as read
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        width: 100%;
        max-width: 400px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: 500px;
      }

      .notifications-header {
        padding: 16px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .notifications-header h3 {
        margin: 0;
        font-size: 18px;
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
      }

      .notifications-list {
        flex: 1;
        overflow-y: auto;
        max-height: 400px;
      }

      .no-notifications {
        padding: 40px 16px;
        text-align: center;
        color: #999;
      }

      .notification-item {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
        position: relative;
      }

      .notification-item:hover {
        background: #f9f9f9;
      }

      .notification-item.unread {
        background: #f0f8ff;
      }

      .notification-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .notification-message {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
        word-break: break-word;
      }

      .notification-time {
        font-size: 12px;
        color: #999;
      }

      .unread-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #007bff;
        flex-shrink: 0;
        margin-top: 4px;
      }

      .notifications-footer {
        padding: 12px 16px;
        border-top: 1px solid #ddd;
        text-align: center;
      }

      .btn {
        background: transparent;
        border: 1px solid #ddd;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        color: #666;
        transition: all 0.2s;
      }

      .btn:hover {
        background: #f0f0f0;
        border-color: #999;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
      }
    `,
  ],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private socketService = inject(SocketService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  ngOnInit(): void {
    // Connect to notifications
    this.socketService.connectNotifications();

    // Subscribe to notifications
    this.socketService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications.set(notifications);
      });

    // Subscribe to unread count
    this.socketService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount.set(count);
      });
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.socketService.markNotificationAsRead(notification.id);
    }

    // Navigate if notification has a link
    const link = (notification.data as any)?.link;
    if (link) {
      this.router.navigate([link]);
    }
  }

  markAllAsRead(): void {
    // Mark all notifications as read
    for (const notification of this.notifications()) {
      if (!notification.isRead) {
        this.socketService.markNotificationAsRead(notification.id);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
