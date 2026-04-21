import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseClaim } from './entities/expense-claim.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private readonly expenseClaimRepository: Repository<ExpenseClaim>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<ExpenseClaim[]> {
    return this.expenseClaimRepository.find();
  }

  async create(data: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    // Enforce INR currency
    data.currency = 'INR';
    const claim = this.expenseClaimRepository.create(data);
    return this.expenseClaimRepository.save(claim);
  }

  async updateStatus(id: string, status: string): Promise<ExpenseClaim> {
    const claim = await this.expenseClaimRepository.findOne({ where: { id } });
    if (!claim) {
      throw new NotFoundException(`Expense claim with ID ${id} not found`);
    }
    claim.status = status;
    const saved = await this.expenseClaimRepository.save(claim);

    try {
      await this.notificationsService.createForUser({
        userId: claim.employeeId,
        type: 'system',
        title: 'Expense Claim Updated',
        message: `Your expense claim for ${claim.expenseType} has been marked as ${status}.`,
        link: '/expenses'
      });
    } catch (e) {
      console.log('Failed to send expense notification', e);
    }

    return saved;
  }
}
