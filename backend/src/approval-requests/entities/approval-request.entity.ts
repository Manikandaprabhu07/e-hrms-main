import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ApprovalRequestType =
    | 'DELETE_EMPLOYEE'
    | 'PASSWORD_RESET'
    | 'PROFILE_UPDATE_RESTRICTED';

export type ApprovalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

@Entity('approval_requests')
export class ApprovalRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    requestType: ApprovalRequestType;

    @Column()
    status: ApprovalRequestStatus;

    @Column()
    requestedByUserId: string;

    @Column({ nullable: true })
    targetUserId?: string;

    @Column({ nullable: true })
    targetEmployeeId?: string;

    @Column({ type: 'simple-json', nullable: true })
    payload?: Record<string, any>;

    @Column({ nullable: true })
    reviewedByUserId?: string;

    @Column({ type: 'text', nullable: true })
    remarks?: string;

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
