import { Repository } from 'typeorm';
import { ApprovalRequest } from './entities/approval-request.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
export declare class ApprovalRequestsService {
    private approvalRequestsRepository;
    private notificationsService;
    private usersService;
    constructor(approvalRequestsRepository: Repository<ApprovalRequest>, notificationsService: NotificationsService, usersService: UsersService);
    findAll(): Promise<ApprovalRequest[]>;
    create(input: Partial<ApprovalRequest>): Promise<ApprovalRequest>;
    findOne(id: string): Promise<ApprovalRequest>;
    approve(id: string, reviewerUserId: string, remarks?: string): Promise<ApprovalRequest>;
    reject(id: string, reviewerUserId: string, remarks?: string): Promise<ApprovalRequest>;
}
