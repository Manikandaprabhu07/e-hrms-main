import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApprovalRequestsService } from './approval-requests.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('approval-requests')
export class ApprovalRequestsController {
    constructor(private readonly approvalRequestsService: ApprovalRequestsService) { }

    @Get()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN')
    findAll() {
        return this.approvalRequestsService.findAll();
    }

    @Post()
    @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HR')
    create(@Body() body: any) {
        return this.approvalRequestsService.create(body);
    }

    @Post(':id/approve')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN')
    approve(@Param('id') id: string, @Request() req: any, @Body() body: any) {
        return this.approvalRequestsService.approve(id, req.user.id, body?.remarks);
    }

    @Post(':id/reject')
    @Roles('SUPER_ADMIN', 'SUB_ADMIN')
    reject(@Param('id') id: string, @Request() req: any, @Body() body: any) {
        return this.approvalRequestsService.reject(id, req.user.id, body?.remarks);
    }
}
