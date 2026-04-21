import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6 text-teal-300">Expense Claims</h1>
      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>My Claims</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <p>Submit and track expense claims here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ExpensesComponent {}
