import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getRuntimeEnv } from '../config/runtime-env';

const BASE = getRuntimeEnv().API_BASE_URL;

// Update the API URL to use BASE

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE}/dashboard`;
  
  getAdminDashboard(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.apiUrl}/admin`).subscribe({
        next: (data) => resolve(data),
        error: (error) => reject(error)
      });
    });
  }

  getEmployeeDashboard(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.apiUrl}/employee`).subscribe({
        next: (data) => resolve(data),
        error: (error) => reject(error)
      });
    });
  }
}
