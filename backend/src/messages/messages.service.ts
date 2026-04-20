import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmployeesService } from '../employees/employees.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class MessagesService {
  private cachedAdminUserId: string | null = null;

  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService,
    private employeesService: EmployeesService,
    private notificationsService: NotificationsService,
    private chatGateway: ChatGateway,
  ) {}

  private async getAdminUserId(): Promise<string> {
    if (this.cachedAdminUserId) return this.cachedAdminUserId;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrms.com';
    const admin = await this.usersService.findOneByEmail(adminEmail);
    if (!admin) {
      throw new NotFoundException('Admin user not found. Seed may have failed.');
    }
    this.cachedAdminUserId = admin.id;
    return admin.id;
  }

  private async assertMember(conversationId: string, userId: string): Promise<Conversation> {
    const conv = await this.conversationsRepository.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.adminUserId !== userId && conv.employeeUserId !== userId) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }
    return conv;
  }

  async ensureEmployeeConversation(employeeUserId: string): Promise<Conversation> {
    const adminUserId = await this.getAdminUserId();
    const existing = await this.conversationsRepository.findOne({ where: { employeeUserId, adminUserId } });
    if (existing) return existing;
    const conv = this.conversationsRepository.create({ employeeUserId, adminUserId });
    return this.conversationsRepository.save(conv);
  }

  async ensureConversationForEmployeeId(employeeId: string): Promise<Conversation> {
    const emp = await this.employeesService.findOne(employeeId);
    if (!emp.userId) {
      throw new BadRequestException('Employee does not have a login account (userId missing).');
    }
    return this.ensureEmployeeConversation(emp.userId);
  }

  async listMyConversations(userId: string): Promise<any[]> {
    const convs = await this.conversationsRepository.find({
      where: [{ adminUserId: userId }, { employeeUserId: userId }],
      order: { updatedAt: 'DESC' },
    });

    const result: any[] = [];
    for (const conv of convs) {
      const isAdminView = userId === conv.adminUserId;
      const emp = await this.employeesService.findByUserId(conv.employeeUserId).catch(() => null as any);
      const employeeName = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Employee';

      const last = await this.messagesRepository.findOne({
        where: { conversation: { id: conv.id } as any },
        order: { createdAt: 'DESC' },
      });

      const unreadCount = await this.messagesRepository.count({
        where: userId === conv.adminUserId
          ? { conversation: { id: conv.id } as any, unreadForAdmin: true }
          : { conversation: { id: conv.id } as any, unreadForEmployee: true },
      } as any);

      result.push({
        id: conv.id,
        employeeUserId: conv.employeeUserId,
        adminUserId: conv.adminUserId,
        title: isAdminView ? employeeName : 'Admin',
        employee: emp
          ? {
              id: emp.id,
              employeeId: emp.employeeId,
              name: employeeName,
              department: emp.department,
              designation: emp.designation,
            }
          : null,
        lastMessage: last
          ? { content: last.content, createdAt: last.createdAt, senderUserId: last.senderUserId }
          : null,
        unreadCount,
        updatedAt: conv.updatedAt,
      });
    }
    return result;
  }

  async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    await this.assertMember(conversationId, userId);
    return this.messagesRepository.find({
      where: { conversation: { id: conversationId } as any },
      order: { createdAt: 'ASC' },
    });
  }

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    const conv = await this.assertMember(conversationId, userId);
    if (conv.adminUserId === userId) {
      await this.messagesRepository.update(
        { conversation: { id: conversationId } as any } as any,
        { unreadForAdmin: false } as any,
      );
    } else {
      await this.messagesRepository.update(
        { conversation: { id: conversationId } as any } as any,
        { unreadForEmployee: false } as any,
      );
    }
  }

  /**
   * Send a message via REST — persists to DB, then immediately pushes
   * a newMessage WebSocket event to the recipient (if online).
   */
  async sendMessage(conversationId: string, userId: string, content: string): Promise<Message> {
    const conv = await this.assertMember(conversationId, userId);
    const trimmed = String(content || '').trim();
    if (!trimmed) throw new BadRequestException('Message content is required');

    const isAdminSender = conv.adminUserId === userId;
    const recipientId = isAdminSender ? conv.employeeUserId : conv.adminUserId;

    const msg = this.messagesRepository.create({
      conversation: conv,
      senderUserId: userId,
      content: trimmed,
      unreadForAdmin: !isAdminSender,
      unreadForEmployee: isAdminSender,
    });
    const saved = await this.messagesRepository.save(msg);

    // Bump conversation updatedAt
    await this.conversationsRepository.update({ id: conv.id } as any, { updatedAt: new Date() } as any);

    const recipientOnline = this.chatGateway.isUserOnline(recipientId);

    // Push real-time message to recipient via WebSocket
    this.chatGateway.pushNewMessage(recipientId, {
      id: saved.id,
      conversationId: conv.id,
      senderUserId: userId,
      content: saved.content,
      status: recipientOnline ? 'delivered' : 'sent',
      createdAt: saved.createdAt,
    });

    // Also create a notification for the recipient
    await this.notificationsService.createForUser({
      userId: recipientId,
      type: 'message',
      title: 'New Message',
      message: isAdminSender ? 'You have a new message from Admin.' : 'You have a new message.',
      link: '/dashboard',
      meta: { conversationId: conv.id },
    });

    return saved;
  }

  /** Alias used by ChatGateway (WebSocket path) */
  async createMessage(conversationId: string, userId: string, content: string): Promise<Message> {
    return this.sendMessage(conversationId, userId, content);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.messagesRepository.update({ id: messageId }, {} as any);
  }
}
