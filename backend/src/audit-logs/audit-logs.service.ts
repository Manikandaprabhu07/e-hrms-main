import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogsRepository: Repository<AuditLog>,
    ) { }

    create(input: Partial<AuditLog>): Promise<AuditLog> {
        const log = this.auditLogsRepository.create(input);
        return this.auditLogsRepository.save(log);
    }

    findAll(): Promise<AuditLog[]> {
        return this.auditLogsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
}
