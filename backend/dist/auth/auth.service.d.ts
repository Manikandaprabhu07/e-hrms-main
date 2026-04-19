import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../access/roles.service';
import { ApprovalRequestsService } from '../approval-requests/approval-requests.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private rolesService;
    private approvalRequestsService;
    private auditLogsService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, rolesService: RolesService, approvalRequestsService: ApprovalRequestsService, auditLogsService: AuditLogsService);
    validateUser(emailOrUsername: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        accessToken: string;
        expiresIn: number;
        user: {
            id: any;
            username: any;
            email: any;
            firstName: any;
            lastName: any;
            roles: any;
            permissions: any;
        };
    }>;
    register(userData: any): Promise<{
        id: string;
        username: string;
        email: string;
        profileImage: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        passwordChangedCount: number;
        passwordChangeRestricted: boolean;
        roles: import("../access/entities/role.entity").Role[];
        permissions: import("../access/entities/permission.entity").Permission[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    registerAdmin(userData: any): Promise<{
        id: string;
        username: string;
        email: string;
        profileImage: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        passwordChangedCount: number;
        passwordChangeRestricted: boolean;
        roles: import("../access/entities/role.entity").Role[];
        permissions: import("../access/entities/permission.entity").Permission[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(userId: string, payload: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }): Promise<{
        message: string;
    }>;
    changeEmail(userId: string, payload: {
        newEmail: string;
        password: string;
    }): Promise<{
        message: string;
        user: any;
    }>;
}
