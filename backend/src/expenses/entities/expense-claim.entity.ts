import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('expense_claims')
export class ExpenseClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employeeId: string;

  @Column()
  expenseType: string; // e.g., Travel, Meals, Supplies

  @Column('decimal')
  amount: number;

  @Column()
  currency: string;

  @Column('text')
  description: string;

  @Column({ default: 'Pending' }) // Pending, Approved, Rejected, Paid
  status: string;

  @Column({ nullable: true })
  receiptUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
