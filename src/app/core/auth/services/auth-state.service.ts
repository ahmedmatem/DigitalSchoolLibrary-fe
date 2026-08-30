import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';

import { CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.models';
import { AuthApiService } from './auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly authApi = inject(AuthApiService);

  private readonly currentUserSignal = signal<CurrentUser | null>(null);
  private readonly initializedSignal = signal(false);
  private readonly loadingSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly isAuthenticated = computed(
    () => this.currentUserSignal() !== null
  );

  readonly roles = computed(
    () => this.currentUserSignal()?.roles ?? []
  );

  initialize(): Observable<boolean> {
    this.loadingSignal.set(true);

    return this.authApi.getMe().pipe(
      tap(user => {
        this.currentUserSignal.set(user);
      }),
      map(() => true),
      catchError(() => {
        this.currentUserSignal.set(null);
        return of(false);
      }),
      finalize(() => {
        this.initializedSignal.set(true);
        this.loadingSignal.set(false);
      })
    );
  }

  login(model: LoginRequest): Observable<CurrentUser> {
    this.loadingSignal.set(true);

    return this.authApi.login(model).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        this.initializedSignal.set(true);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  register(model: RegisterRequest): Observable<CurrentUser> {
    this.loadingSignal.set(true);

    return this.authApi.register(model).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        this.initializedSignal.set(true);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  logout(): Observable<void> {
    this.loadingSignal.set(true);

    return this.authApi.logout().pipe(
      tap(() => {
        this.currentUserSignal.set(null);
        this.initializedSignal.set(true);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}