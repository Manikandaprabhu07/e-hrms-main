import { Controller, Get } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-logs')
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) { }

    @Get()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN')
    findAll() {
        return this.auditLogsService.findAll();
    }
}
