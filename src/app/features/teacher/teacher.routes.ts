import { Routes } from '@angular/router';

import { roleGuard } from '../../core/auth/guards/role.guard';
import { AUTH_ROLES } from '../../core/auth/constants/auth-roles';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    canActivateChild: [
      roleGuard(AUTH_ROLES.Teacher, AUTH_ROLES.Admin),
    ],
    children: [
      {
        path: '',
        title: 'Моите ресурси',
        loadComponent: () => import('./pages/my-resources/my-resources')
          .then(m => m.MyResources),
      },
      {
        path: 'resources/new',
        title: 'Добавяне на ресурс',
        loadComponent: () => import('./pages/add-resource/add-resource')
          .then(m => m.AddResource),
      },
    ],
  },
];
