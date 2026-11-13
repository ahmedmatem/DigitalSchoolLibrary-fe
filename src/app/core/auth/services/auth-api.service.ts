import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../config/api.config';
import {
  ChangePasswordRequest,
  CurrentUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(model: LoginRequest): Observable<CurrentUser> {
    return this.http.post<CurrentUser>(
      `${API_CONFIG.baseUrl}/auth/login`,
      model
    );
  }

  register(model: RegisterRequest): Observable<CurrentUser> {
    return this.http.post<CurrentUser>(
      `${API_CONFIG.baseUrl}/auth/register`,
      model
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${API_CONFIG.baseUrl}/auth/logout`,
      null
    );
  }

  getMe(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(
      `${API_CONFIG.baseUrl}/auth/me`
    );
  }

  forgotPassword(
    model: ForgotPasswordRequest
  ): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${API_CONFIG.baseUrl}/auth/forgot-password`,
      model
    );
  }

  resetPassword(model: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${API_CONFIG.baseUrl}/auth/reset-password`,
      model
    );
  }

  changePassword(model: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${API_CONFIG.baseUrl}/auth/change-password`,
      model
    );
  }
}
