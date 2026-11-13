import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';

import { AuthStateService } from '../services/auth-state.service';

export const authGuard: CanActivateFn = (
  route,
  state
): boolean | UrlTree => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    if (
      authState.currentUser()?.mustChangePassword &&
      state.url !== '/change-password'
    ) {
      return router.createUrlTree(['/change-password']);
    }

    return true;
  }

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url,
      },
    }
  );
};
