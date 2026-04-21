import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { Applicant } from './entities/applicant.entity';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) {}

  async findAllJobs(): Promise<JobPosting[]> {
    return this.jobPostingRepository.find();
  }

  async createJob(jobData: Partial<JobPosting>): Promise<JobPosting> {
    const job = this.jobPostingRepository.create(jobData);
    return this.jobPostingRepository.save(job);
  }

  async findAllApplicants(): Promise<Applicant[]> {
    return this.applicantRepository.find({ relations: ['jobPosting'] });
  }

  async applyForJob(applicantData: Partial<Applicant>): Promise<Applicant> {
    const applicant = this.applicantRepository.create(applicantData);
    return this.applicantRepository.save(applicant);
  }
}
