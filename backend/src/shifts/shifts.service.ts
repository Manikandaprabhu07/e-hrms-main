import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftType } from './entities/shift-type.entity';
import { ShiftAssignment } from './entities/shift-assignment.entity';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(ShiftType)
    private readonly shiftTypeRepository: Repository<ShiftType>,
    @InjectRepository(ShiftAssignment)
    private readonly shiftAssignmentRepository: Repository<ShiftAssignment>,
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
    const assignment = this.shiftAssignmentRepository.create(data);
    return this.shiftAssignmentRepository.save(assignment);
  }
}
