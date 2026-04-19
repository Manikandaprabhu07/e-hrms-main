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
exports.ApprovalRequestsController = void 0;
const common_1 = require("@nestjs/common");
const approval_requests_service_1 = require("./approval-requests.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let ApprovalRequestsController = class ApprovalRequestsController {
    constructor(approvalRequestsService) {
        this.approvalRequestsService = approvalRequestsService;
    }
    findAll() {
        return this.approvalRequestsService.findAll();
    }
    create(body) {
        return this.approvalRequestsService.create(body);
    }
    approve(id, req, body) {
        return this.approvalRequestsService.approve(id, req.user.id, body?.remarks);
    }
    reject(id, req, body) {
        return this.approvalRequestsService.reject(id, req.user.id, body?.remarks);
    }
};
exports.ApprovalRequestsController = ApprovalRequestsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SUB_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApprovalRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SUB_ADMIN', 'HR'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApprovalRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SUB_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ApprovalRequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SUB_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ApprovalRequestsController.prototype, "reject", null);
exports.ApprovalRequestsController = ApprovalRequestsController = __decorate([
    (0, common_1.Controller)('approval-requests'),
    __metadata("design:paramtypes", [approval_requests_service_1.ApprovalRequestsService])
], ApprovalRequestsController);
//# sourceMappingURL=approval-requests.controller.js.map