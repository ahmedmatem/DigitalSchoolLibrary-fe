import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';


import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { firstValueFrom } from 'rxjs';
import { AuthStateService } from './core/auth/services/auth-state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        // loadingInterceptor,
        // errorInterceptor,
      ])
    ),

    provideAppInitializer(() => {
      const authState = inject(AuthStateService);

      return firstValueFrom(authState.initialize());
    }),
    
    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 4000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
    }),
  ]
};
