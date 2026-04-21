import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { ShiftType } from './entities/shift-type.entity';
import { ShiftAssignment } from './entities/shift-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftType, ShiftAssignment])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
