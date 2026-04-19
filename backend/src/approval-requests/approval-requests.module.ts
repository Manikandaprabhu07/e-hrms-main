import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequest } from './entities/approval-request.entity';
import { ApprovalRequestsService } from './approval-requests.service';
import { ApprovalRequestsController } from './approval-requests.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([ApprovalRequest]), NotificationsModule, UsersModule],
    providers: [ApprovalRequestsService],
    controllers: [ApprovalRequestsController],
    exports: [ApprovalRequestsService],
})
export class ApprovalRequestsModule { }
