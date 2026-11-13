import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { getDefaultRouteForRoles } from '../../navigation/default-route.util';
import { AuthStateService } from '../services/auth-state.service';

export const changePasswordGuard: CanActivateFn = (): boolean | UrlTree => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const user = authState.currentUser();
  if (user?.mustChangePassword) {
    return true;
  }

  return router.createUrlTree([
    getDefaultRouteForRoles(user?.roles ?? []),
  ]);
};
