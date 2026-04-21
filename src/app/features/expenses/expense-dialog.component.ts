import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-expense-dialog',
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
      <h2 mat-dialog-title class="text-2xl font-bold text-teal-400 mb-4">New Expense Claim</h2>
      
      <mat-dialog-content>
        <form [formGroup]="expenseForm" class="flex flex-col gap-4 mt-2">
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label class="text-gray-300">Expense Type</mat-label>
            <mat-select formControlName="expenseType" class="text-white">
              <mat-option value="Travel">Travel</mat-option>
              <mat-option value="Meals">Meals</mat-option>
              <mat-option value="Supplies">Supplies</mat-option>
              <mat-option value="Training">Training</mat-option>
              <mat-option value="Other">Other</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label class="text-gray-300">Amount (INR)</mat-label>
            <input matInput type="number" formControlName="amount" placeholder="0.00" class="text-white">
            <span matPrefix class="text-gray-400 mr-2">₹</span>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label class="text-gray-300">Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Explain the expense..." class="text-white"></textarea>
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="mt-4">
        <button mat-button (click)="onCancel()" class="!text-gray-300 hover:!bg-white/10">Cancel</button>
        <button mat-raised-button color="primary" class="!bg-teal-500 !text-white" [disabled]="expenseForm.invalid" (click)="onSubmit()">
          Submit Claim
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
export class ExpenseDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ExpenseDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  expenseForm: FormGroup = this.fb.group({
    expenseType: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]],
    description: ['', Validators.required]
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.dialogRef.close(this.expenseForm.value);
    }
  }
}
