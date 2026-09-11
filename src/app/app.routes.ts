import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guards/guest.guard';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/catalog/catalog.routes')
        .then(m => m.CATALOG_ROUTES),
  },
  {
    path: 'resources/:id',
    loadComponent: () =>
      import('./features/resource-details/pages/resource-details-page/resource-details-page')
        .then(m => m.ResourceDetailsPage),
  },
  {
    path: 'resources/:id/view',
    loadComponent: () =>
      import('./features/resource-viewer/pages/resource-viewer-page/resource-viewer-page')
        .then(m => m.ResourceViewerPage),
  },
  /* =========================
     AUTH
  ========================= */
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page')
        .then(m => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page')
        .then(m => m.RegisterPage),
  },
  /* =========================
     STUDENT
  ========================= */
  {
    path: 'for-me',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/student/pages/for-me/for-me')
        .then(m => m.ForMe),
  },
  {
    path: 'my-library',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/student/pages/my-library/my-library')
        .then(m => m.MyLibrary),
  },

  /* =========================
     TEACHER
  ========================= */
  {
    path: 'teacher',
    loadChildren: () => import('./features/teacher/teacher.routes')
        .then(m => m.TEACHER_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES),
  },

  /* =========================
     SYSTEM
  ========================= */
  {
    path: 'access-denied',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./system/access-denied/access-denied')
        .then(m => m.AccessDenied),
  },
  /* =========================
     DEVELOPMENT
  ========================= */
  {
    path: 'ui-preview',
    loadComponent: () =>
      import('./features/ui-preview/ui-preview')
        .then(m => m.UiPreview),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
