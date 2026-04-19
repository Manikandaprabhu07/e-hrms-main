import { ApprovalRequestsService } from './approval-requests.service';
export declare class ApprovalRequestsController {
    private readonly approvalRequestsService;
    constructor(approvalRequestsService: ApprovalRequestsService);
    findAll(): Promise<import("./entities/approval-request.entity").ApprovalRequest[]>;
    create(body: any): Promise<import("./entities/approval-request.entity").ApprovalRequest>;
    approve(id: string, req: any, body: any): Promise<import("./entities/approval-request.entity").ApprovalRequest>;
    reject(id: string, req: any, body: any): Promise<import("./entities/approval-request.entity").ApprovalRequest>;
}
