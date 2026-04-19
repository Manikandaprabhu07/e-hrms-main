import { Role } from '../../access/entities/role.entity';
import { Permission } from '../../access/entities/permission.entity';
export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    profileImage: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    passwordChangedCount: number;
    passwordChangeRestricted: boolean;
    roles: Role[];
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}
