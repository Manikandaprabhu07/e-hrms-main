import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('payroll')
export class Payroll {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, (employee) => employee.id)
    employee: Employee;

    @Column()
    month: string; // e.g., "January"

    @Column()
    year: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    basicSalary: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    allowances: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deductions: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    netSalary: number;

    @Column({ default: 'Pending' })
    paymentStatus: string; // Pending, Paid, Cancelled

    @Column({ type: 'date', nullable: true })
    paymentDate: Date | null;

    @Column({ type: 'simple-json', nullable: true })
    documents: Array<{
        id: string;
        name: string;
        category: string;
        contentType: string;
        dataUrl: string;
    }>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
