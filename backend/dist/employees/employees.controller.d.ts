import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    findAll(): Promise<Employee[]>;
    me(req: any): Promise<Employee>;
    findOne(id: string): Promise<Employee>;
    create(employeeData: Partial<Employee> & {
        user?: {
            username?: string;
            password?: string;
            roleName?: string;
            permissionActions?: string[];
        };
    }, req: any): Promise<Employee>;
    uploadPreview(file: any): Partial<Employee>[];
    saveImportedEmployees(employees: any[]): Promise<{
        message: string;
        saved: number;
        skipped: number;
    }>;
    update(id: string, employeeData: Partial<Employee> & {
        user?: {
            username?: string;
            password?: string;
            roleName?: string;
            permissionActions?: string[];
        };
    }, req: any): Promise<Employee>;
    remove(id: string, req: any): Promise<void>;
    requestDelete(id: string, req: any): Promise<{
        message: string;
    }>;
}
