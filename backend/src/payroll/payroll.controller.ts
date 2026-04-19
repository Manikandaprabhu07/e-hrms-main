import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { Payroll } from './entities/payroll.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('payroll')
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Get()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('payroll.read')
    findAll(): Promise<Payroll[]> {
        return this.payrollService.findAll();
    }

    @Get('my')
    @Roles('EMPLOYEE')
    @Permissions('payroll.read')
    my(@Request() req: any): Promise<Payroll[]> {
        return this.payrollService.findForUser(req.user.id);
    }

    @Get(':id')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('payroll.read')
    findOne(@Param('id') id: string): Promise<Payroll> {
        return this.payrollService.findOne(id);
    }

    @Post()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('payroll.write')
    create(@Body() payrollData: any): Promise<Payroll> {
        return this.payrollService.createForEmployee(payrollData);
    }

    @Patch(':id')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('payroll.write')
    update(@Param('id') id: string, @Body() payrollData: Partial<Payroll>): Promise<Payroll> {
        return this.payrollService.update(id, payrollData);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('payroll.delete')
    remove(@Param('id') id: string): Promise<void> {
        return this.payrollService.remove(id);
    }
}
