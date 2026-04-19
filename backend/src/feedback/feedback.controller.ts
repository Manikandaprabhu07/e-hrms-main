import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { EmployeesService } from '../employees/employees.service';

@Controller('feedback')
export class FeedbackController {
    constructor(
        private readonly feedbackService: FeedbackService,
        private readonly employeesService: EmployeesService,
    ) { }

    @Get()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('feedback.read')
    findAll(): Promise<Feedback[]> {
        return this.feedbackService.findAll();
    }

    @Post()
    @Roles('EMPLOYEE', 'SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
    @Permissions('feedback.write')
    async create(@Body() body: { employeeId?: string; message: string }, @Request() req: any): Promise<Feedback> {
        let employeeId = body.employeeId;
        if (!employeeId) {
            const employee = await this.employeesService.findByEmail(req.user.email);
            employeeId = employee?.id;
        }
        if (!employeeId) {
            throw new Error('Employee not found');
        }
        return this.feedbackService.create(employeeId, body.message);
    }
}
