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

export interface ExpenseClaim {
  id: string;
  expenseType: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  date: string;
}

const MOCK_EXPENSES: ExpenseClaim[] = [
  { id: '1', expenseType: 'Travel', amount: 450.00, currency: 'USD', description: 'Flight to NYC for conference', status: 'Approved', date: '2026-04-12' },
  { id: '2', expenseType: 'Meals', amount: 65.50, currency: 'USD', description: 'Client dinner', status: 'Pending', date: '2026-04-14' },
  { id: '3', expenseType: 'Supplies', amount: 120.00, currency: 'USD', description: 'Office monitor stand', status: 'Paid', date: '2026-03-25' },
  { id: '4', expenseType: 'Travel', amount: 35.00, currency: 'USD', description: 'Uber to airport', status: 'Rejected', date: '2026-04-12' },
  { id: '5', expenseType: 'Training', amount: 299.00, currency: 'USD', description: 'Angular advanced course', status: 'Pending', date: '2026-04-20' },
];

@Component({
  selector: 'app-expenses',
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
        <h1 class="text-3xl font-bold text-teal-300">Expense Claims</h1>
        <button mat-raised-button color="primary" class="!bg-teal-500 !text-white">
          <mat-icon>add</mat-icon> New Claim
        </button>
      </div>

      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>My Claims</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          
          <mat-form-field class="w-full mb-4 !text-white" appearance="outline">
            <mat-label class="text-gray-300">Filter expenses</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Travel" #input class="text-white">
            <mat-icon matSuffix class="text-gray-400">search</mat-icon>
          </mat-form-field>

          <div class="overflow-x-auto rounded-lg border border-gray-700">
            <table mat-table [dataSource]="dataSource" matSort class="w-full bg-transparent">
              
              <!-- Type Column -->
              <ng-container matColumnDef="expenseType">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Expense Type </th>
                <td mat-cell *matCellDef="let row" class="text-white !border-gray-700 font-medium"> {{row.expenseType}} </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Amount </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700"> 
                  {{row.currency}} {{row.amount | number:'1.2-2'}} 
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Description </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700 max-w-xs truncate" [title]="row.description"> 
                  {{row.description}} 
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Status </th>
                <td mat-cell *matCellDef="let row" class="!border-gray-700">
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-500/20 text-green-400': row.status === 'Approved' || row.status === 'Paid',
                      'bg-yellow-500/20 text-yellow-400': row.status === 'Pending',
                      'bg-red-500/20 text-red-400': row.status === 'Rejected'
                    }">
                    {{row.status}}
                  </span>
                </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Date </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700"> {{row.date | date}} </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="text-gray-300 !border-gray-700"> Actions </th>
                <td mat-cell *matCellDef="let row" class="!border-gray-700">
                  <button mat-icon-button color="primary" class="!text-blue-400" aria-label="Edit">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" class="!text-red-400" aria-label="Delete" [disabled]="row.status === 'Paid'">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-navy-900/50"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-white/5 transition-colors"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell p-4 text-center text-gray-400" colspan="6">No data matching the filter "{{input.value}}"</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of expenses" class="bg-transparent text-gray-300 !border-t !border-gray-700"></mat-paginator>
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
export class ExpensesComponent implements AfterViewInit {
  displayedColumns: string[] = ['expenseType', 'amount', 'description', 'status', 'date', 'actions'];
  dataSource: MatTableDataSource<ExpenseClaim>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(MOCK_EXPENSES);
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
