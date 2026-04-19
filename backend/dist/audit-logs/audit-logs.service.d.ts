import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditLogsService {
    private auditLogsRepository;
    constructor(auditLogsRepository: Repository<AuditLog>);
    create(input: Partial<AuditLog>): Promise<AuditLog>;
    findAll(): Promise<AuditLog[]>;
}
