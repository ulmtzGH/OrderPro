import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface DashboardStats {
  totalSales: number;
  pendingOrders: number;
  inPreparationOrders: number;
  readyOrders: number;
}

export interface AnalyticsData {
  salesByHour: { hour: number, sales: number }[];
  orderStatusDistribution: { status: string, count: number }[];
  topSellingProducts: { name: string, quantity: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getAnalytics(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/analytics`);
  }
}
