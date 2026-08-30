import { Routes } from '@angular/router';

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
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page')
        .then(m => m.LoginPage),
  },
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
