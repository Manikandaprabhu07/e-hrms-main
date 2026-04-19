import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { Performance } from './entities/performance.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('performance')
@Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) { }

    @Get()
    @Permissions('performance.read')
    findAll(): Promise<Performance[]> {
        return this.performanceService.findAll();
    }

    @Get(':id')
    @Permissions('performance.read')
    findOne(@Param('id') id: string): Promise<Performance> {
        return this.performanceService.findOne(id);
    }

    @Post()
    @Permissions('performance.write')
    create(@Body() performanceData: Partial<Performance>): Promise<Performance> {
        return this.performanceService.create(performanceData);
    }

    @Patch(':id')
    @Permissions('performance.write')
    update(@Param('id') id: string, @Body() performanceData: Partial<Performance>): Promise<Performance> {
        return this.performanceService.update(id, performanceData);
    }

    @Delete(':id')
    @Permissions('performance.delete')
    remove(@Param('id') id: string): Promise<void> {
        return this.performanceService.remove(id);
    }
}
