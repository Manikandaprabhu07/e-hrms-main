import { Component, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ShiftDialogComponent } from './shift-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ShiftsService, ShiftAssignment, ShiftType } from '../../core/services/shifts.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Subscription, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        <button mat-raised-button color="primary" class="!bg-teal-500 !text-white" *ngIf="isAdmin" (click)="openShiftDialog()">
          <mat-icon>add</mat-icon> Assign Shift
        </button>
      </div>

      <!-- Dashboard Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md border-l-4 border-teal-400">
          <mat-card-content class="p-6 flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm uppercase tracking-wider font-semibold">Total Assignments</p>
              <h3 class="text-3xl font-bold mt-1 text-white">{{ totalAssignments }}</h3>
            </div>
            <div class="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
              <mat-icon class="text-teal-400 text-2xl">people_alt</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md border-l-4 border-blue-400">
          <mat-card-content class="p-6 flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm uppercase tracking-wider font-semibold">Active Shift Types</p>
              <h3 class="text-3xl font-bold mt-1 text-white">{{ shiftTypes.length }}</h3>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <mat-icon class="text-blue-400 text-2xl">category</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>Employee Shifts</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          
          <mat-form-field class="w-full mb-4 !text-white" appearance="outline">
            <mat-label class="text-gray-300">Filter shifts</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Morning" #input class="text-white">
            <mat-icon matSuffix class="text-gray-400">search</mat-icon>
          </mat-form-field>

          <div class="overflow-x-auto rounded-lg border border-gray-700">
            <table mat-table [dataSource]="dataSource" matSort class="w-full bg-transparent">
              
              <!-- Shift Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Shift Name </th>
                <td mat-cell *matCellDef="let row" class="text-white !border-gray-700 font-medium"> {{row.shiftType?.name}} </td>
              </ng-container>

              <!-- Employee Column -->
              <ng-container matColumnDef="employee">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Employee ID </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700 font-mono text-sm"> {{row.employeeId}} </td>
              </ng-container>

              <!-- Start Time Column -->
              <ng-container matColumnDef="startTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Time Window </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-teal-400 text-sm w-4 h-4">schedule</mat-icon>
                    {{row.shiftType?.startTime}} - {{row.shiftType?.endTime}}
                  </div>
                </td>
              </ng-container>

              <!-- Start Date Column -->
              <ng-container matColumnDef="startDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Assigned Date </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700">
                  {{row.startDate | date}}
                  <span *ngIf="row.endDate"> to {{row.endDate | date}}</span>
                  <span *ngIf="!row.endDate" class="text-teal-400 text-xs ml-2">(Ongoing)</span>
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
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.2) !important; }
    ::ng-deep .mat-mdc-select-value { color: white !important; }
    ::ng-deep .mat-mdc-select-arrow { color: white !important; }
    ::ng-deep .mat-mdc-paginator-icon { fill: white !important; }
    ::ng-deep .mat-sort-header-arrow { color: white !important; }
  `]
})
export class ShiftsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'employee', 'startTime', 'startDate'];
  dataSource: MatTableDataSource<ShiftAssignment> = new MatTableDataSource([]);
  
  shiftTypes: ShiftType[] = [];
  employees: any[] = [];
  totalAssignments = 0;
  isAdmin = false;
  private sub?: Subscription;

  private dialog = inject(MatDialog);
  private shiftsService = inject(ShiftsService);
  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.isAdmin = this.authService.hasRole('ADMIN') || this.authService.hasRole('HR');
    this.loadData();

    // Listen for real-time updates
    this.sub = this.socketService.listen('notification').subscribe((notif: any) => {
      if (notif.title === 'New Shift Assigned') {
        this.loadData();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  loadData() {
    forkJoin({
      assignments: this.shiftsService.findAllAssignments(),
      types: this.shiftsService.findAllShiftTypes(),
      employees: this.employeeService.getEmployees()
    }).subscribe({
      next: (res: any) => {
        this.shiftTypes = res.types;
        this.employees = res.employees;
        this.totalAssignments = res.assignments.length;
        
        // Filter assignments for non-admins
        let data = res.assignments;
        if (!this.isAdmin) {
          const currentUserId = this.authService.currentUser()?.id;
          data = data.filter((a: any) => a.employeeId === currentUserId);
        }

        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openShiftDialog() {
    const dialogRef = this.dialog.open(ShiftDialogComponent, { 
      width: '500px',
      data: { shiftTypes: this.shiftTypes, employees: this.employees }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.shiftsService.assignShift(result).subscribe({
          next: () => {
            this.snackBar.open('Shift assigned successfully', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Shift conflict detected', 'Close', { duration: 5000, panelClass: ['bg-red-500', 'text-white'] });
          }
        });
      }
    });
  }
}
