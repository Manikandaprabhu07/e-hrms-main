import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6 text-teal-300">Recruitment</h1>
      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>Job Postings</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <p>Manage job postings and applicants here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RecruitmentComponent {}
