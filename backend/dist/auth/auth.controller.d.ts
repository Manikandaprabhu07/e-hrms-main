import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
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
    register(body: any): Promise<{
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
    registerAdmin(body: any): Promise<{
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
    getProfile(req: any): any;
    changePassword(req: any, body: any): Promise<{
        message: string;
    }>;
    changeEmail(req: any, body: any): Promise<{
        message: string;
        user: any;
    }>;
}
