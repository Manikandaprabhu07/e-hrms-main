import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftType: ShiftType;
  startDate: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/shifts`;

  findAllShiftTypes(): Observable<ShiftType[]> {
    return this.http.get<ShiftType[]>(`${this.apiUrl}/types`);
  }

  createShiftType(data: Partial<ShiftType>): Observable<ShiftType> {
    return this.http.post<ShiftType>(`${this.apiUrl}/types`, data);
  }

  findAllAssignments(): Observable<ShiftAssignment[]> {
    return this.http.get<ShiftAssignment[]>(`${this.apiUrl}/assignments`);
  }

  assignShift(data: Partial<ShiftAssignment>): Observable<ShiftAssignment> {
    return this.http.post<ShiftAssignment>(`${this.apiUrl}/assignments`, data);
  }
}
