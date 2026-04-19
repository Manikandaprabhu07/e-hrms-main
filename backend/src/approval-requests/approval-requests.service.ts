import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from './entities/approval-request.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ApprovalRequestsService {
    constructor(
        @InjectRepository(ApprovalRequest)
        private approvalRequestsRepository: Repository<ApprovalRequest>,
        private notificationsService: NotificationsService,
        private usersService: UsersService,
    ) { }

    findAll(): Promise<ApprovalRequest[]> {
        return this.approvalRequestsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async create(input: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
        const request = this.approvalRequestsRepository.create({
            ...input,
            status: 'PENDING',
        });
        const saved = await this.approvalRequestsRepository.save(request);

        const subAdmins = await this.usersService.findUsersByRoleNames(['SUB_ADMIN', 'SUPER_ADMIN', 'ADMIN']);
        await this.notificationsService.createForUsers({
            userIds: subAdmins.map((user) => user.id),
            title: `Approval Request: ${saved.requestType}`,
            message: `A new ${saved.requestType} request is awaiting your review.`,
            link: '/approvals',
            meta: { requestId: saved.id },
        });

        return saved;
    }

    async findOne(id: string): Promise<ApprovalRequest> {
        const request = await this.approvalRequestsRepository.findOne({ where: { id } });
        if (!request) {
            throw new NotFoundException(`Approval request with ID ${id} not found`);
        }
        return request;
    }

    async approve(id: string, reviewerUserId: string, remarks?: string): Promise<ApprovalRequest> {
        const request = await this.findOne(id);
        if (request.status !== 'PENDING') {
            throw new BadRequestException('Only pending requests can be approved.');
        }

        request.status = 'APPROVED';
        request.reviewedByUserId = reviewerUserId;
        request.reviewedAt = new Date();
        request.remarks = remarks;
        return this.approvalRequestsRepository.save(request);
    }

    async reject(id: string, reviewerUserId: string, remarks?: string): Promise<ApprovalRequest> {
        const request = await this.findOne(id);
        if (request.status !== 'PENDING') {
            throw new BadRequestException('Only pending requests can be rejected.');
        }

        request.status = 'REJECTED';
        request.reviewedByUserId = reviewerUserId;
        request.reviewedAt = new Date();
        request.remarks = remarks;
        return this.approvalRequestsRepository.save(request);
    }
}
