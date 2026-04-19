export type ApprovalRequestType = 'DELETE_EMPLOYEE' | 'PASSWORD_RESET' | 'PROFILE_UPDATE_RESTRICTED';
export type ApprovalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export declare class ApprovalRequest {
    id: string;
    requestType: ApprovalRequestType;
    status: ApprovalRequestStatus;
    requestedByUserId: string;
    targetUserId?: string;
    targetEmployeeId?: string;
    payload?: Record<string, any>;
    reviewedByUserId?: string;
    remarks?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
