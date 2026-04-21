import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpenseClaim } from './entities/expense-claim.entity';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(): Promise<ExpenseClaim[]> {
    return this.expensesService.findAll();
  }

  @Post()
  create(@Body() data: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    return this.expensesService.create(data);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<ExpenseClaim> {
    return this.expensesService.updateStatus(id, status);
  }
}
