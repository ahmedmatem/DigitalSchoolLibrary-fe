import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../config/api.config';
import { AdminUserDetails, AdminUsersQuery, AdminUsersResponse } from '../models/admin-user.models';

@Injectable({ providedIn: 'root' })
export class AdminUsersApiService {
  private readonly http = inject(HttpClient);

  getUsers(query: AdminUsersQuery): Observable<AdminUsersResponse> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('sortBy', query.sortBy ?? 'name')
      .set('sortDescending', query.sortDescending ?? false);

    if (query.search) params = params.set('search', query.search);
    if (query.role) params = params.set('role', query.role);
    if (query.isActive !== undefined) params = params.set('isActive', query.isActive);
    if (query.gradeLevelId !== undefined) params = params.set('gradeLevelId', query.gradeLevelId);
    if (query.schoolClassId) params = params.set('schoolClassId', query.schoolClassId);

    return this.http.get<AdminUsersResponse>(
      `${API_CONFIG.baseUrl}/admin/users`,
      { params }
    );
  }

  getUser(id: string): Observable<AdminUserDetails> {
    return this.http.get<AdminUserDetails>(
      `${API_CONFIG.baseUrl}/admin/users/${id}`
    );
  }
}
