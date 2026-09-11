import { Routes } from '@angular/router';

import { AUTH_ROLES } from '../../core/auth/constants/auth-roles';
import { roleGuard } from '../../core/auth/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivateChild: [roleGuard(AUTH_ROLES.Admin)],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'moderation' },
      {
        path: 'moderation',
        title: 'Модерация на ресурси',
        loadComponent: () => import('./pages/moderation-queue/moderation-queue')
          .then(m => m.ModerationQueue),
      },
      {
        path: 'moderation/:id',
        title: 'Преглед на ресурс',
        loadComponent: () => import('./pages/moderation-review/moderation-review')
          .then(m => m.ModerationReview),
      },
      {
        path: 'users',
        redirectTo: 'moderation',
      },
    ],
  },
];
