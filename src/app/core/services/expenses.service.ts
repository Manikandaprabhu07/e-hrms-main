import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  expenseType: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`;

  findAll(): Observable<ExpenseClaim[]> {
    return this.http.get<ExpenseClaim[]>(this.apiUrl);
  }

  create(data: Partial<ExpenseClaim>): Observable<ExpenseClaim> {
    return this.http.post<ExpenseClaim>(this.apiUrl, data);
  }

  updateStatus(id: string, status: string): Observable<ExpenseClaim> {
    return this.http.patch<ExpenseClaim>(`${this.apiUrl}/${id}/status`, { status });
  }
}
