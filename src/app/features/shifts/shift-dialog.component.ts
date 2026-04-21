import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ShiftType } from '../../core/services/shifts.service';

@Component({
  selector: 'app-shift-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <div class="bg-navy-900 text-white p-6 rounded-lg shadow-2xl border border-gray-700">
      <h2 mat-dialog-title class="text-2xl font-bold text-teal-400 mb-4">Assign Shift</h2>
      
      <mat-dialog-content>
        <form [formGroup]="shiftForm" class="flex flex-col gap-4 mt-2">
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label class="text-gray-300">Employee</mat-label>
            <mat-select formControlName="employeeId" class="text-white">
              <mat-option *ngFor="let emp of data.employees" [value]="emp.id">
                {{emp.firstName}} {{emp.lastName}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label class="text-gray-300">Shift Type</mat-label>
            <mat-select formControlName="shiftType" class="text-white">
              <mat-option *ngFor="let type of data.shiftTypes" [value]="type.id">
                {{type.name}} ({{type.startTime}} - {{type.endTime}})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label class="text-gray-300">Start Date</mat-label>
            <input matInput type="date" formControlName="startDate" class="text-white" style="color-scheme: dark;">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label class="text-gray-300">End Date (Optional)</mat-label>
            <input matInput type="date" formControlName="endDate" class="text-white" style="color-scheme: dark;">
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="mt-4">
        <button mat-button (click)="onCancel()" class="!text-gray-300 hover:!bg-white/10">Cancel</button>
        <button mat-raised-button color="primary" class="!bg-teal-500 !text-white" [disabled]="shiftForm.invalid" (click)="onSubmit()">
          Assign Shift
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface { background: transparent !important; box-shadow: none !important; }
    ::ng-deep .mat-mdc-form-field-outline { color: rgba(255,255,255,0.2) !important; }
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.2) !important; }
    ::ng-deep .mat-mdc-select-value { color: white !important; }
    ::ng-deep .mat-mdc-select-arrow { color: white !important; }
  `]
})
export class ShiftDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ShiftDialogComponent>);
  public data: { employees: any[], shiftTypes: ShiftType[] } = inject(MAT_DIALOG_DATA);

  shiftForm: FormGroup = this.fb.group({
    employeeId: ['', Validators.required],
    shiftType: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['']
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.shiftForm.valid) {
      this.dialogRef.close(this.shiftForm.value);
    }
  }
}
