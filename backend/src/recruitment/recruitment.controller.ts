import { Controller, Get, Post, Body } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { JobPosting } from './entities/job-posting.entity';
import { Applicant } from './entities/applicant.entity';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('jobs')
  findAllJobs(): Promise<JobPosting[]> {
    return this.recruitmentService.findAllJobs();
  }

  @Post('jobs')
  createJob(@Body() jobData: Partial<JobPosting>): Promise<JobPosting> {
    return this.recruitmentService.createJob(jobData);
  }

  @Get('applicants')
  findAllApplicants(): Promise<Applicant[]> {
    return this.recruitmentService.findAllApplicants();
  }

  @Post('applicants')
  applyForJob(@Body() applicantData: Partial<Applicant>): Promise<Applicant> {
    return this.recruitmentService.applyForJob(applicantData);
  }
}
