import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
import { PermissionsService } from '../access/permissions.service';
import { EventsService } from '../events/events.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
        private readonly permissionsService: PermissionsService,
        private readonly eventsService: EventsService,
    ) { }

    async onModuleInit() {
        await this.ensureDefaultPermissions();
        await this.ensureDefaultRoles();
        await this.ensureAdminUser();
        await this.ensureHRUser();
        await this.ensureDefaultEvents();
    }

    private async ensureDefaultPermissions() {
        const defaults = [
            { name: 'dashboard.read', resource: 'dashboard', action: 'read', description: 'View dashboard' },
            { name: 'employees.read', resource: 'employees', action: 'read', description: 'View employees' },
            { name: 'employees.write', resource: 'employees', action: 'write', description: 'Create/update employees' },
            { name: 'employees.delete', resource: 'employees', action: 'delete', description: 'Delete employees' },
            { name: 'attendance.read', resource: 'attendance', action: 'read', description: 'View attendance' },
            { name: 'attendance.write', resource: 'attendance', action: 'write', description: 'Manage attendance' },
            { name: 'attendance.delete', resource: 'attendance', action: 'delete', description: 'Delete attendance entries' },
            { name: 'payroll.read', resource: 'payroll', action: 'read', description: 'View payroll' },
            { name: 'payroll.write', resource: 'payroll', action: 'write', description: 'Manage payroll' },
            { name: 'payroll.delete', resource: 'payroll', action: 'delete', description: 'Delete payroll items' },
            { name: 'leave.read', resource: 'leave', action: 'read', description: 'View leave requests' },
            { name: 'leave.write', resource: 'leave', action: 'write', description: 'Create leave requests' },
            { name: 'leave.delete', resource: 'leave', action: 'delete', description: 'Delete leave requests' },
            { name: 'leave.approve', resource: 'leave', action: 'approve', description: 'Approve/reject leave' },
            { name: 'training.read', resource: 'training', action: 'read', description: 'View training' },
            { name: 'training.write', resource: 'training', action: 'write', description: 'Manage training' },
            { name: 'training.delete', resource: 'training', action: 'delete', description: 'Delete training' },
            { name: 'events.read', resource: 'events', action: 'read', description: 'View events' },
            { name: 'feedback.read', resource: 'feedback', action: 'read', description: 'View feedback' },
            { name: 'feedback.write', resource: 'feedback', action: 'write', description: 'Send feedback' },
            { name: 'feedback.delete', resource: 'feedback', action: 'delete', description: 'Delete feedback' },
            { name: 'performance.read', resource: 'performance', action: 'read', description: 'View performance' },
            { name: 'performance.write', resource: 'performance', action: 'write', description: 'Manage performance' },
            { name: 'performance.delete', resource: 'performance', action: 'delete', description: 'Delete performance records' },
            { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles' },
            { name: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Manage permissions' },
            { name: 'users.manage', resource: 'users', action: 'manage', description: 'Manage users' },
            { name: 'approvals.manage', resource: 'approvals', action: 'manage', description: 'Approve or reject requests' },
            { name: 'events.write', resource: 'events', action: 'write', description: 'Manage events' },
            { name: 'events.delete', resource: 'events', action: 'delete', description: 'Delete events' },
        ];

        for (const perm of defaults) {
            const existing = await this.permissionsService.findByName(perm.name);
            if (!existing) {
                await this.permissionsService.create(perm);
            }
        }
    }

    private async ensureDefaultRoles() {
        const allPermissions = await this.permissionsService.findAll();
        const employeePermissions = allPermissions.filter((p) =>
            ['employees.read', 'leave.read', 'leave.write', 'feedback.write', 'dashboard.read', 'events.read', 'training.read', 'attendance.read', 'payroll.read'].includes(p.name)
        );
        const hrPermissions = allPermissions.filter((p) =>
            !['roles.manage', 'permissions.manage', 'users.manage', 'employees.delete'].includes(p.name)
        );
        const subAdminPermissions = allPermissions.filter((p) =>
            !['permissions.manage'].includes(p.name)
        );

        const legacyAdminRole = await this.rolesService.findByName('ADMIN');
        if (!legacyAdminRole) {
            await this.rolesService.create({
                name: 'ADMIN',
                level: 100,
                description: 'Legacy administrator compatibility role',
                permissions: allPermissions,
            } as any);
        } else {
            await this.rolesService.update(legacyAdminRole.id, {
                level: 100,
                description: 'Legacy administrator compatibility role',
                permissions: allPermissions,
            } as any);
        }

        const superAdminRole = await this.rolesService.findByName('SUPER_ADMIN');
        if (!superAdminRole) {
            await this.rolesService.create({
                name: 'SUPER_ADMIN',
                level: 100,
                description: 'Main authority with full system access',
                permissions: allPermissions,
            } as any);
        } else {
            await this.rolesService.update(superAdminRole.id, {
                level: 100,
                description: 'Main authority with full system access',
                permissions: allPermissions,
            } as any);
        }

        const subAdminRole = await this.rolesService.findByName('SUB_ADMIN');
        if (!subAdminRole) {
            await this.rolesService.create({
                name: 'SUB_ADMIN',
                level: 80,
                description: 'Delegated administrator with approval authority',
                permissions: subAdminPermissions,
            } as any);
        } else {
            await this.rolesService.update(subAdminRole.id, {
                level: 80,
                description: 'Delegated administrator with approval authority',
                permissions: subAdminPermissions,
            } as any);
        }

        const employeeRole = await this.rolesService.findByName('EMPLOYEE');
        if (!employeeRole) {
            await this.rolesService.create({
                name: 'EMPLOYEE',
                level: 10,
                description: 'Employee role',
                permissions: employeePermissions,
            } as any);
        } else {
            await this.rolesService.update(employeeRole.id, {
                level: 10,
                description: 'Employee role',
                permissions: employeePermissions,
            } as any);
        }

        const hrRole = await this.rolesService.findByName('HR');
        if (!hrRole) {
            await this.rolesService.create({
                name: 'HR',
                level: 50,
                description: 'HR role',
                permissions: hrPermissions,
            } as any);
        } else {
            await this.rolesService.update(hrRole.id, {
                level: 50,
                description: 'HR role',
                permissions: hrPermissions,
            } as any);
        }
    }

    private async ensureAdminUser() {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrms.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';
        const existing = await this.usersService.findOneByEmail(adminEmail);
        if (existing) {
            return;
        }

        const adminRole = await this.rolesService.findByName('SUPER_ADMIN');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await this.usersService.create({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            roles: adminRole ? [adminRole] : [],
            isActive: true,
        });
    }

    private async ensureHRUser() {
        const hrEmail = 'hr@hrms.com';
        const hrPassword = 'hr@123';
        const existing = await this.usersService.findOneByEmail(hrEmail);
        if (existing) {
            return;
        }

        const hrRole = await this.rolesService.findByName('HR');
        if (!hrRole) {
            return;
        }

        const hashedPassword = await bcrypt.hash(hrPassword, 10);
        await this.usersService.create({
            email: hrEmail,
            password: hashedPassword,
            firstName: 'HR',
            lastName: 'Manager',
            username: 'hr',
            roles: [hrRole],
            isActive: true,
        });
    }

    private async ensureDefaultEvents() {
        const existing = await this.eventsService.findUpcoming();
        if (existing.length > 0) {
            return;
        }

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        await this.eventsService.create({
            title: 'Welcome Lunch',
            description: 'Join the team for a welcome lunch in the main lounge.',
            date: tomorrow.toISOString().split('T')[0],
        });

        await this.eventsService.create({
            title: 'Monthly Town Hall',
            description: 'Company-wide town hall to share updates and celebrate wins.',
            date: nextWeek.toISOString().split('T')[0],
        });
    }
}
