import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getRuntimeEnv } from '../config/runtime-env';


const BASE = getRuntimeEnv().API_BASE_URL;


@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE}/feedback`;

  sendFeedback(message: string, employeeId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiUrl, { employeeId, message }).subscribe({
        next: (data) => resolve(data),
        error: (error) => reject(error)
      });
    });
  }

  getAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (data) => resolve(data || []),
        error: (error) => reject(error),
      });
    });
  }
}
