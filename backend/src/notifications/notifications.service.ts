import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async getMy(userId: string, limit = 50): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async unreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({ where: { userId, isRead: false } });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.unreadCount(userId);
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.notificationsRepository.update({ id, userId } as any, { isRead: true } as any);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false } as any,
      { isRead: true } as any,
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationsRepository.update({ id: notificationId }, { isRead: true } as any);
  }

  /**
   * Create a notification for a single user and push it in real time via WebSocket.
   */
  async createForUser(input: {
    userId: string;
    type?: NotificationType;
    title: string;
    message: string;
    link?: string;
    meta?: any;
  }): Promise<Notification> {
    const n = this.notificationsRepository.create({
      userId: input.userId,
      type: input.type ?? 'system',
      title: input.title,
      message: input.message,
      link: input.link,
      meta: input.meta,
      isRead: false,
    });
    const saved = await this.notificationsRepository.save(n);

    // Push instantly via WebSocket — no SSE, no polling
    try {
      await this.notificationsGateway.notifyUser(input.userId, {
        id: saved.id,
        type: saved.type,
        title: saved.title,
        message: saved.message,
        link: saved.link ?? null,
        meta: saved.meta ?? null,
        createdAt: saved.createdAt,
      });
    } catch {
      // Gateway may not be ready yet (e.g. during seed) — ignore
    }

    return saved;
  }

  /**
   * Create notifications for multiple users and push each in real time.
   */
  async createForUsers(input: {
    userIds: string[];
    type?: NotificationType;
    title: string;
    message: string;
    link?: string;
    meta?: any;
  }): Promise<void> {
    if (!input.userIds?.length) return;

    const rows = input.userIds.map((userId) => ({
      userId,
      type: input.type ?? 'system',
      title: input.title,
      message: input.message,
      link: input.link,
      meta: input.meta,
      isRead: false,
    }));

    const inserted = await this.notificationsRepository.save(rows as any[]);

    // Push each notification in real time
    for (const row of inserted as Notification[]) {
      try {
        await this.notificationsGateway.notifyUser(row.userId, {
          id: row.id,
          type: row.type,
          title: row.title,
          message: row.message,
          link: row.link ?? null,
          meta: row.meta ?? null,
          createdAt: row.createdAt,
        });
      } catch {
        // ignore — user may be offline
      }
    }
  }

  /**
   * Trigger a leave approval/rejection notification to an employee.
   */
  async sendLeaveApprovalNotification(userId: string, message: string): Promise<void> {
    await this.createForUser({
      userId,
      type: 'approval',
      title: 'Leave Update',
      message,
      link: '/leave',
    });
  }

  /**
   * Trigger a new-employee notification to a list of users (e.g. all HR/admins).
   */
  async notifyNewEmployee(userIds: string[], employeeName: string): Promise<void> {
    await this.createForUsers({
      userIds,
      type: 'new_employee',
      title: 'New Employee Added',
      message: `${employeeName} has joined the team.`,
      link: '/employees',
    });
  }

  /**
   * Trigger a delete-request notification to HR/admin.
   */
  async notifyDeleteRequest(userIds: string[], requestedBy: string): Promise<void> {
    await this.createForUsers({
      userIds,
      type: 'delete_request',
      title: 'Delete Request',
      message: `${requestedBy} has requested account deletion.`,
      link: '/approvals',
    });
  }

  /**
   * Trigger a password-reset notification to a user.
   */
  async notifyPasswordReset(userId: string): Promise<void> {
    await this.createForUser({
      userId,
      type: 'password_reset',
      title: 'Password Reset',
      message: 'Your password has been successfully reset.',
      link: '/account-settings',
    });
  }
}
