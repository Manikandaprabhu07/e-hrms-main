import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., MacBook Pro, Standing Desk

  @Column()
  category: string; // e.g., Electronics, Furniture

  @Column({ unique: true })
  serialNumber: string;

  @Column({ default: 'Available' }) // Available, Assigned, Under Maintenance, Retired
  status: string;

  @Column({ nullable: true })
  purchaseDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
