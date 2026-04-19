import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    actorUserId: string;

    @Column()
    action: string;

    @Column()
    entityType: string;

    @Column()
    entityId: string;

    @Column({ type: 'simple-json', nullable: true })
    oldValues?: Record<string, any>;

    @Column({ type: 'simple-json', nullable: true })
    newValues?: Record<string, any>;

    @Column({ nullable: true })
    ipAddress?: string;

    @Column({ nullable: true })
    userAgent?: string;

    @CreateDateColumn()
    createdAt: Date;
}
