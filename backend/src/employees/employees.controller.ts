import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Request,
    NotFoundException,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE')
    @Permissions('employees.read')
    findAll(): Promise<Employee[]> {
        return this.employeesService.findAll();
    }

    @Get('me')
    @Roles('EMPLOYEE')
    async me(@Request() req: any): Promise<Employee> {
        const employee = await this.employeesService.findByUserId(req.user.id);
        if (!employee) {
            throw new NotFoundException('Employee profile not found for this user.');
        }
        return employee;
    }

    @Get(':id')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE')
    @Permissions('employees.read')
    findOne(@Param('id') id: string): Promise<Employee> {
        return this.employeesService.findOne(id);
    }

    @Post()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('employees.write')
    create(@Body() employeeData: Partial<Employee> & { user?: { username?: string; password?: string; roleName?: string; permissionActions?: string[] } }, @Request() req: any): Promise<Employee> {
        return this.employeesService.create(employeeData, req.user);
    }

    @Post('upload-preview')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN')
    @UseInterceptors(FileInterceptor('file'))
    uploadPreview(@UploadedFile() file: any) {
        return this.employeesService.uploadPreview(file);
    }

    @Post('save-import')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN')
    saveImportedEmployees(@Body() employees: any[]) {
        return this.employeesService.saveImportedEmployees(employees);
    }

    @Patch(':id')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('employees.write')
    update(@Param('id') id: string, @Body() employeeData: Partial<Employee> & { user?: { username?: string; password?: string; roleName?: string; permissionActions?: string[] } }, @Request() req: any): Promise<Employee> {
        return this.employeesService.update(id, employeeData, req.user);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('employees.delete')
    remove(@Param('id') id: string, @Request() req: any): Promise<void> {
        return this.employeesService.remove(id);
    }

    @Post(':id/delete-request')
    @Roles('HR')
    @Permissions('employees.write')
    requestDelete(@Param('id') id: string, @Request() req: any) {
        return this.employeesService.requestDelete(id, req.user);
    }
}
