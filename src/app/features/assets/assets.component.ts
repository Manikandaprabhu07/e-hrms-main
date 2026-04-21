import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6 text-teal-300">Asset Management</h1>
      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>Company Assets</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <p>Track company assets and assignments here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AssetsComponent {}
