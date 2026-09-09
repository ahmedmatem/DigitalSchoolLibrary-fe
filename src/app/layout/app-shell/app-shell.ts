import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AppHeader } from '../app-header/app-header';
import { MobileNavigation } from '../mobile-navigation/mobile-navigation';
import { AuthStateService } from '../../core/auth/services/auth-state.service';
import { AuthRole, AUTH_ROLES } from '../../core/auth/constants/auth-roles';
import { finalize } from 'rxjs';

@Component({
  selector: 'sl-app-shell',
  imports: [
    RouterOutlet,
    AppHeader,
    MobileNavigation,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly loggingOut = signal(false);

  readonly authenticated = this.authState.isAuthenticated;
  readonly currentUser = this.authState.currentUser;
  readonly mobileMenuOpen = signal(false);

  readonly displayName = computed(
    () => this.currentUser()?.fullName ?? null
  );

  readonly role = computed<AuthRole | null>(() => {
    const roles = this.currentUser()?.roles ?? [];

    if (roles.includes(AUTH_ROLES.Admin)) {
      return AUTH_ROLES.Admin;
    }

    if (roles.includes(AUTH_ROLES.Teacher)) {
      return AUTH_ROLES.Teacher;
    }

    if (roles.includes(AUTH_ROLES.Student)) {
      return AUTH_ROLES.Student;
    }

    return null;
  });

  openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);

    this.authState
      .logout()
      .pipe(
        finalize(() => {
          this.loggingOut.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.closeMobileMenu();

          void this.router.navigate(['/']);
        },

        error: () => {
          this.closeMobileMenu();
        },
      });
  }
}