"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const approval_request_entity_1 = require("./entities/approval-request.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
let ApprovalRequestsService = class ApprovalRequestsService {
    constructor(approvalRequestsRepository, notificationsService, usersService) {
        this.approvalRequestsRepository = approvalRequestsRepository;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    findAll() {
        return this.approvalRequestsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async create(input) {
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
    async findOne(id) {
        const request = await this.approvalRequestsRepository.findOne({ where: { id } });
        if (!request) {
            throw new common_1.NotFoundException(`Approval request with ID ${id} not found`);
        }
        return request;
    }
    async approve(id, reviewerUserId, remarks) {
        const request = await this.findOne(id);
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending requests can be approved.');
        }
        request.status = 'APPROVED';
        request.reviewedByUserId = reviewerUserId;
        request.reviewedAt = new Date();
        request.remarks = remarks;
        return this.approvalRequestsRepository.save(request);
    }
    async reject(id, reviewerUserId, remarks) {
        const request = await this.findOne(id);
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending requests can be rejected.');
        }
        request.status = 'REJECTED';
        request.reviewedByUserId = reviewerUserId;
        request.reviewedAt = new Date();
        request.remarks = remarks;
        return this.approvalRequestsRepository.save(request);
    }
};
exports.ApprovalRequestsService = ApprovalRequestsService;
exports.ApprovalRequestsService = ApprovalRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(approval_request_entity_1.ApprovalRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], ApprovalRequestsService);
//# sourceMappingURL=approval-requests.service.js.map