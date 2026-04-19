import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../access/roles.service';
import { getJwtSecret } from './jwt-secret';
import { ApprovalRequestsService } from '../approval-requests/approval-requests.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RolesService,
        private approvalRequestsService: ApprovalRequestsService,
        private auditLogsService: AuditLogsService,
    ) { }

    async validateUser(emailOrUsername: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmailOrUsername(emailOrUsername);
        if (user && !user.isActive) {
            throw new UnauthorizedException('User account is disabled');
        }
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const roles = user.roles || [];
        const directPermissions = Array.isArray(user.permissions) ? user.permissions : [];
        const effectivePermissions = directPermissions.length > 0
            ? directPermissions
            : roles.flatMap((role: any) => role.permissions || []);
        const permissionNames = Array.from(new Set(effectivePermissions.map((permission: any) => permission.name)));
        const payload = {
            email: user.email,
            sub: user.id,
            roles: roles.map((r: any) => r.name),
            permissions: permissionNames,
        };

        let jwtSecret: string;
        try {
            jwtSecret = getJwtSecret(this.configService);
        } catch (e: any) {
            throw new InternalServerErrorException(e?.message ?? 'JWT secret not configured.');
        }

        return {
            accessToken: this.jwtService.sign(payload, {
                secret: jwtSecret,
                expiresIn: '1d',   // 🔥 HARDCODE FOR NOW
            }),
            expiresIn: 3600,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: roles,
                permissions: effectivePermissions,
            },
        };
    }

    async register(userData: any) {
        const existingUser = await this.usersService.findOneByEmail(userData.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const employeeRole = await this.rolesService.findByName('EMPLOYEE');
        const user = await this.usersService.create({
            ...userData,
            password: hashedPassword,
            roles: employeeRole ? [employeeRole] : [],
        });

        const { password, ...result } = user;
        return result;
    }

    async registerAdmin(userData: any) {
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret || userData.adminSecret !== adminSecret) {
            throw new UnauthorizedException('Invalid admin registration secret');
        }

        const existingUser = await this.usersService.findOneByEmail(userData.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const adminRole = await this.rolesService.findByName('ADMIN');
        const user = await this.usersService.create({
            ...userData,
            password: hashedPassword,
            roles: adminRole ? [adminRole] : [],
        });

        const { password, ...result } = user;
        return result;
    }

    async changePassword(
        userId: string,
        payload: { currentPassword: string; newPassword: string; confirmPassword: string },
    ) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (payload.newPassword !== payload.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        if (String(payload.newPassword).length < 8) {
            throw new BadRequestException('New password must be at least 8 characters');
        }

        const matches = await bcrypt.compare(payload.currentPassword, user.password);
        if (!matches) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const roleNames = (user.roles || []).map((role: any) => String(role?.name || '').toUpperCase());
        const requiresApprovalAfterFirstChange = roleNames.includes('HR') || roleNames.includes('SUB_ADMIN');
        if (requiresApprovalAfterFirstChange && (user.passwordChangedCount || 0) >= 1) {
            await this.approvalRequestsService.create({
                requestType: 'PASSWORD_RESET',
                requestedByUserId: user.id,
                targetUserId: user.id,
                payload: {
                    reason: `${roleNames.includes('HR') ? 'HR' : 'SUB_ADMIN'} password change requires approval after first self-service update.`,
                },
            });
            await this.auditLogsService.create({
                actorUserId: user.id,
                action: 'PASSWORD_RESET_REQUESTED',
                entityType: 'user',
                entityId: user.id,
                oldValues: { passwordChangedCount: user.passwordChangedCount || 0 },
                newValues: { approvalRequestCreated: true },
            });
            return { message: 'Password change request has been sent to Sub Admin for approval.' };
        }

        const hashedPassword = await bcrypt.hash(String(payload.newPassword), 10);
        await this.usersService.update(userId, {
            password: hashedPassword,
            passwordChangedCount: (user.passwordChangedCount || 0) + 1,
            passwordChangeRestricted: requiresApprovalAfterFirstChange,
        });
        await this.auditLogsService.create({
            actorUserId: user.id,
            action: 'PASSWORD_CHANGED',
            entityType: 'user',
            entityId: user.id,
            oldValues: { passwordChangedCount: user.passwordChangedCount || 0 },
            newValues: { passwordChangedCount: (user.passwordChangedCount || 0) + 1 },
        });

        return { message: 'Password changed successfully' };
    }

    async changeEmail(
        userId: string,
        payload: { newEmail: string; password: string },
    ) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const matches = await bcrypt.compare(payload.password, user.password);
        if (!matches) {
            throw new UnauthorizedException('Password is incorrect');
        }

        const normalizedEmail = String(payload.newEmail || '').trim().toLowerCase();
        if (!normalizedEmail) {
            throw new BadRequestException('New email is required');
        }

        const existingUser = await this.usersService.findOneByEmail(normalizedEmail);
        if (existingUser && existingUser.id !== userId) {
            throw new ConflictException('Email already exists');
        }

        const updatedUser = await this.usersService.update(userId, { email: normalizedEmail });
        const { password, ...safeUser } = updatedUser as any;

        return {
            message: 'Email changed successfully',
            user: safeUser,
        };
    }
}
