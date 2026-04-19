import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
import { PermissionsService } from '../access/permissions.service';
import { ApprovalRequestsService } from '../approval-requests/approval-requests.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class EmployeesService {
    private employeesRepository;
    private usersService;
    private rolesService;
    private permissionsService;
    private approvalRequestsService;
    private auditLogsService;
    constructor(employeesRepository: Repository<Employee>, usersService: UsersService, rolesService: RolesService, permissionsService: PermissionsService, approvalRequestsService: ApprovalRequestsService, auditLogsService: AuditLogsService);
    findAll(): Promise<Employee[]>;
    findOne(id: string): Promise<Employee>;
    findByEmail(email: string): Promise<Employee | null>;
    findByUserId(userId: string): Promise<Employee | null>;
    uploadPreview(file?: {
        buffer?: Buffer;
    }): Partial<Employee>[];
    saveImportedEmployees(rows: any[]): Promise<{
        message: string;
        saved: number;
        skipped: number;
    }>;
    create(employeeData: Partial<Employee> & {
        user?: {
            username?: string;
            password?: string;
            roleName?: string;
            permissionActions?: string[];
        };
    }, actor?: {
        roles?: Array<string | {
            name?: string;
        }>;
    }): Promise<Employee>;
    update(id: string, employeeData: Partial<Employee> & {
        user?: {
            username?: string;
            password?: string;
            roleName?: string;
            permissionActions?: string[];
        };
    }, actor?: {
        id?: string;
        roles?: Array<string | {
            name?: string;
        }>;
    }): Promise<Employee>;
    remove(id: string): Promise<void>;
    requestDelete(id: string, actor: {
        id?: string;
        roles?: Array<string | {
            name?: string;
        }>;
    }): Promise<{
        message: string;
    }>;
    private mapImportRow;
    private normalizeImportedEmployee;
    private attachUserData;
    private hasRole;
    private hasAnyRole;
    private assertEmployeeManagementAllowed;
    private normalizeEmployeeData;
    private normalizeGender;
    private normalizePermissionActions;
    private resolvePermissionsForActions;
    private normalizeDateValue;
    private stringValue;
    private numberValue;
    private normalizeDate;
    private normalizeEmploymentType;
    private normalizeEmployeeStatus;
    private normalizeWorkLocation;
    private normalizeShift;
    private generateImportEmployeeId;
    private todayDate;
}
