import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { UsersModule } from '../users/users.module';
import { AccessModule } from '../access/access.module';
import { ApprovalRequestsModule } from '../approval-requests/approval-requests.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { MessagesModule } from '../messages/messages.module';
import { forwardRef } from '@nestjs/common';
@Module({
  imports: [TypeOrmModule.forFeature([Employee]), forwardRef(() => MessagesModule), UsersModule, AccessModule, ApprovalRequestsModule, AuditLogsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule { }
