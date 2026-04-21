import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_assignments')
export class AssetAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => Asset, (asset) => asset.id)
  asset: Asset;

  @Column({ type: 'date' })
  assignedDate: string;

  @Column({ type: 'date', nullable: true })
  returnDate: string;

  @Column({ default: 'Assigned' }) // Assigned, Returned, Lost
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
