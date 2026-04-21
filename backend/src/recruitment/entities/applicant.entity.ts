import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { JobPosting } from './job-posting.entity';

@Entity('applicants')
export class Applicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ default: 'Applied' }) // Applied, Interviewing, Offered, Rejected, Hired
  status: string;

  @ManyToOne(() => JobPosting, (jobPosting) => jobPosting.id, { onDelete: 'CASCADE' })
  jobPosting: JobPosting;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
