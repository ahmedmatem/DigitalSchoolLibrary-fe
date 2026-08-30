import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';

import { AuthRole } from '../constants/auth-roles';
import { AuthStateService } from '../services/auth-state.service';

export function roleGuard(...allowedRoles: AuthRole[]): CanActivateFn {
  return (
    route,
    state
  ): boolean | UrlTree => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    if (!authState.isAuthenticated()) {
      return router.createUrlTree(
        ['/login'],
        {
          queryParams: {
            returnUrl: state.url,
          },
        }
      );
    }

    const hasAllowedRole = allowedRoles.some(role =>
      authState.hasRole(role)
    );

    if (hasAllowedRole) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
}