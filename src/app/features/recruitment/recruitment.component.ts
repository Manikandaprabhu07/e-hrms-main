import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  postedDate: string;
}

const MOCK_JOBS: JobPosting[] = [
  { id: '1', title: 'Senior Frontend Developer', department: 'Engineering', location: 'Remote', status: 'Open', postedDate: '2026-04-10' },
  { id: '2', title: 'HR Manager', department: 'Human Resources', location: 'New York, NY', status: 'Open', postedDate: '2026-04-15' },
  { id: '3', title: 'Backend Engineer', department: 'Engineering', location: 'Remote', status: 'Closed', postedDate: '2026-03-20' },
  { id: '4', title: 'Marketing Intern', department: 'Marketing', location: 'London, UK', status: 'Open', postedDate: '2026-04-18' },
  { id: '5', title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', status: 'Draft', postedDate: '2026-04-20' },
];

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-teal-300">Recruitment</h1>
        <button mat-raised-button color="primary" class="!bg-teal-500 !text-white">
          <mat-icon>add</mat-icon> New Job
        </button>
      </div>

      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>Job Postings</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          
          <mat-form-field class="w-full mb-4 !text-white" appearance="outline">
            <mat-label class="text-gray-300">Filter jobs</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Frontend" #input class="text-white">
            <mat-icon matSuffix class="text-gray-400">search</mat-icon>
          </mat-form-field>

          <div class="overflow-x-auto rounded-lg border border-gray-700">
            <table mat-table [dataSource]="dataSource" matSort class="w-full bg-transparent">
              
              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Job Title </th>
                <td mat-cell *matCellDef="let row" class="text-white !border-gray-700"> {{row.title}} </td>
              </ng-container>

              <!-- Department Column -->
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Department </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700"> {{row.department}} </td>
              </ng-container>

              <!-- Location Column -->
              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Location </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700"> {{row.location}} </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Status </th>
                <td mat-cell *matCellDef="let row" class="!border-gray-700">
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-500/20 text-green-400': row.status === 'Open',
                      'bg-red-500/20 text-red-400': row.status === 'Closed',
                      'bg-gray-500/20 text-gray-400': row.status === 'Draft'
                    }">
                    {{row.status}}
                  </span>
                </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="postedDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Posted Date </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700"> {{row.postedDate | date}} </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="text-gray-300 !border-gray-700"> Actions </th>
                <td mat-cell *matCellDef="let row" class="!border-gray-700">
                  <button mat-icon-button color="primary" class="!text-blue-400" aria-label="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" class="!text-red-400" aria-label="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-navy-900/50"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-white/5 transition-colors"></tr>

              <!-- Row shown when there is no matching data. -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell p-4 text-center text-gray-400" colspan="6">No data matching the filter "{{input.value}}"</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of jobs" class="bg-transparent text-gray-300 !border-t !border-gray-700"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
    /* Override Mat Input styles for dark mode */
    ::ng-deep .mat-mdc-form-field-outline { color: rgba(255,255,255,0.2) !important; }
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
        border-color: rgba(255,255,255,0.2) !important;
    }
    ::ng-deep .mat-mdc-select-value { color: white !important; }
    ::ng-deep .mat-mdc-select-arrow { color: white !important; }
    ::ng-deep .mat-mdc-paginator-icon { fill: white !important; }
    ::ng-deep .mat-sort-header-arrow { color: white !important; }
  `]
})
export class RecruitmentComponent implements AfterViewInit {
  displayedColumns: string[] = ['title', 'department', 'location', 'status', 'postedDate', 'actions'];
  dataSource: MatTableDataSource<JobPosting>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(MOCK_JOBS);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
