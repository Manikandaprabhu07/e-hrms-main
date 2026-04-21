import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ShiftType } from './entities/shift-type.entity';
import { ShiftAssignment } from './entities/shift-assignment.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(ShiftType)
    private readonly shiftTypeRepository: Repository<ShiftType>,
    @InjectRepository(ShiftAssignment)
    private readonly shiftAssignmentRepository: Repository<ShiftAssignment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAllShiftTypes(): Promise<ShiftType[]> {
    return this.shiftTypeRepository.find();
  }

  async createShiftType(data: Partial<ShiftType>): Promise<ShiftType> {
    const shiftType = this.shiftTypeRepository.create(data);
    return this.shiftTypeRepository.save(shiftType);
  }

  async findAllAssignments(): Promise<ShiftAssignment[]> {
    return this.shiftAssignmentRepository.find({ relations: ['shiftType'] });
  }

  async assignShift(data: Partial<ShiftAssignment>): Promise<ShiftAssignment> {
    if (!data.employeeId || !data.startDate) {
      throw new BadRequestException('Employee ID and Start Date are required');
    }

    const query = this.shiftAssignmentRepository.createQueryBuilder('assignment')
      .where('assignment.employeeId = :employeeId', { employeeId: data.employeeId })
      .andWhere(new Brackets(qb => {
        qb.where('assignment.endDate IS NULL')
          .orWhere('assignment.endDate >= :startDate', { startDate: data.startDate });
      }));

    if (data.endDate) {
      query.andWhere('assignment.startDate <= :endDate', { endDate: data.endDate });
    }

    const existingAssignments = await query.getMany();

    if (existingAssignments.length > 0) {
      throw new BadRequestException('Shift conflict detected for this employee.');
    }

    const assignment = this.shiftAssignmentRepository.create(data);
    const saved = await this.shiftAssignmentRepository.save(assignment);

    try {
      await this.notificationsService.createForUser({
        userId: data.employeeId,
        type: 'system',
        title: 'New Shift Assigned',
        message: `You have been assigned a new shift starting ${data.startDate}.`,
        link: '/shifts'
      });
    } catch (e) {
      console.log('Failed to send shift notification', e);
    }

    return saved;
  }
}
