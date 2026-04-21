import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseClaim } from './entities/expense-claim.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private readonly expenseClaimRepository: Repository<ExpenseClaim>,
  ) {}

  async findAll(): Promise<ExpenseClaim[]> {
    return this.expenseClaimRepository.find();
  }

  async create(data: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    const claim = this.expenseClaimRepository.create(data);
    return this.expenseClaimRepository.save(claim);
  }

  async updateStatus(id: string, status: string): Promise<ExpenseClaim> {
    const claim = await this.expenseClaimRepository.findOne({ where: { id } });
    if (!claim) {
      throw new NotFoundException(`Expense claim with ID ${id} not found`);
    }
    claim.status = status;
    return this.expenseClaimRepository.save(claim);
  }
}
