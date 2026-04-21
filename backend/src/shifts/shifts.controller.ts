import { Controller, Get, Post, Body } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftType } from './entities/shift-type.entity';
import { ShiftAssignment } from './entities/shift-assignment.entity';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get('types')
  findAllShiftTypes(): Promise<ShiftType[]> {
    return this.shiftsService.findAllShiftTypes();
  }

  @Post('types')
  createShiftType(@Body() data: Partial<ShiftType>): Promise<ShiftType> {
    return this.shiftsService.createShiftType(data);
  }

  @Get('assignments')
  findAllAssignments(): Promise<ShiftAssignment[]> {
    return this.shiftsService.findAllAssignments();
  }

  @Post('assignments')
  assignShift(@Body() data: Partial<ShiftAssignment>): Promise<ShiftAssignment> {
    return this.shiftsService.assignShift(data);
  }
}
