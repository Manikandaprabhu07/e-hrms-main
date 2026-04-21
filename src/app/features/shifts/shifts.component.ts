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

export interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

const MOCK_SHIFTS: ShiftType[] = [
  { id: '1', name: 'Morning Shift', startTime: '06:00 AM', endTime: '02:00 PM' },
  { id: '2', name: 'General Shift', startTime: '09:00 AM', endTime: '06:00 PM' },
  { id: '3', name: 'Evening Shift', startTime: '02:00 PM', endTime: '10:00 PM' },
  { id: '4', name: 'Night Shift', startTime: '10:00 PM', endTime: '06:00 AM' },
];

@Component({
  selector: 'app-shifts',
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
        <h1 class="text-3xl font-bold text-teal-300">Shifts & Scheduling</h1>
        <button mat-raised-button color="primary" class="!bg-teal-500 !text-white">
          <mat-icon>add</mat-icon> New Shift
        </button>
      </div>

      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>Shift Management</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          
          <mat-form-field class="w-full mb-4 !text-white" appearance="outline">
            <mat-label class="text-gray-300">Filter shifts</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Morning" #input class="text-white">
            <mat-icon matSuffix class="text-gray-400">search</mat-icon>
          </mat-form-field>

          <div class="overflow-x-auto rounded-lg border border-gray-700">
            <table mat-table [dataSource]="dataSource" matSort class="w-full bg-transparent">
              
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Shift Name </th>
                <td mat-cell *matCellDef="let row" class="text-white !border-gray-700 font-medium"> {{row.name}} </td>
              </ng-container>

              <!-- Start Time Column -->
              <ng-container matColumnDef="startTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Start Time </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-teal-400 text-sm w-4 h-4">schedule</mat-icon>
                    {{row.startTime}}
                  </div>
                </td>
              </ng-container>

              <!-- End Time Column -->
              <ng-container matColumnDef="endTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> End Time </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-teal-400 text-sm w-4 h-4">schedule</mat-icon>
                    {{row.endTime}}
                  </div>
                </td>
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

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell p-4 text-center text-gray-400" colspan="4">No data matching the filter "{{input.value}}"</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of shifts" class="bg-transparent text-gray-300 !border-t !border-gray-700"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
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
export class ShiftsComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'startTime', 'endTime', 'actions'];
  dataSource: MatTableDataSource<ShiftType>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(MOCK_SHIFTS);
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
