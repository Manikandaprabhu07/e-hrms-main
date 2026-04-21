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

export interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: string;
  assignedTo?: string;
}

const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'MacBook Pro M3 Max', category: 'Electronics', serialNumber: 'MBP-2026-001', status: 'Assigned', assignedTo: 'John Doe' },
  { id: '2', name: 'Dell UltraSharp 32" 4K Monitor', category: 'Electronics', serialNumber: 'MON-DELL-409', status: 'Available' },
  { id: '3', name: 'Herman Miller Aeron Chair', category: 'Furniture', serialNumber: 'HM-AER-112', status: 'Assigned', assignedTo: 'Jane Smith' },
  { id: '4', name: 'Standing Desk XL', category: 'Furniture', serialNumber: 'DESK-XL-099', status: 'Available' },
  { id: '5', name: 'iPad Pro 12.9"', category: 'Electronics', serialNumber: 'IPAD-PRO-554', status: 'Under Maintenance' },
];

@Component({
  selector: 'app-assets',
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
        <h1 class="text-3xl font-bold text-teal-300">Asset Management</h1>
        <button mat-raised-button color="primary" class="!bg-teal-500 !text-white">
          <mat-icon>add</mat-icon> Register Asset
        </button>
      </div>

      <mat-card class="bg-navy-800 text-white shadow-xl !bg-opacity-50 !backdrop-blur-md">
        <mat-card-header>
          <mat-card-title>Company Assets</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          
          <mat-form-field class="w-full mb-4 !text-white" appearance="outline">
            <mat-label class="text-gray-300">Filter assets</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. MacBook" #input class="text-white">
            <mat-icon matSuffix class="text-gray-400">search</mat-icon>
          </mat-form-field>

          <div class="overflow-x-auto rounded-lg border border-gray-700">
            <table mat-table [dataSource]="dataSource" matSort class="w-full bg-transparent">
              
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Asset Name </th>
                <td mat-cell *matCellDef="let row" class="text-white !border-gray-700 font-medium"> {{row.name}} </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Category </th>
                <td mat-cell *matCellDef="let row" class="text-gray-300 !border-gray-700"> {{row.category}} </td>
              </ng-container>

              <!-- Serial Number Column -->
              <ng-container matColumnDef="serialNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Serial Number </th>
                <td mat-cell *matCellDef="let row" class="text-gray-400 font-mono text-sm !border-gray-700"> {{row.serialNumber}} </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-gray-300 !border-gray-700"> Status </th>
                <td mat-cell *matCellDef="let row" class="!border-gray-700">
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-500/20 text-green-400': row.status === 'Available',
                      'bg-blue-500/20 text-blue-400': row.status === 'Assigned',
                      'bg-orange-500/20 text-orange-400': row.status === 'Under Maintenance',
                      'bg-red-500/20 text-red-400': row.status === 'Retired'
                    }">
                    {{row.status}}
                  </span>
                  <div *ngIf="row.assignedTo" class="text-xs text-gray-400 mt-1 ml-1">
                    ↳ {{row.assignedTo}}
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
                <td class="mat-cell p-4 text-center text-gray-400" colspan="5">No data matching the filter "{{input.value}}"</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of assets" class="bg-transparent text-gray-300 !border-t !border-gray-700"></mat-paginator>
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
export class AssetsComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'category', 'serialNumber', 'status', 'actions'];
  dataSource: MatTableDataSource<Asset>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(MOCK_ASSETS);
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
