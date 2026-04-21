import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { JobPosting } from './entities/job-posting.entity';
import { Applicant } from './entities/applicant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting, Applicant])],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
