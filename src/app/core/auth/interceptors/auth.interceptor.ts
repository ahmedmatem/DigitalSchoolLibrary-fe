import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const requestWithCredentials = req.clone({
    withCredentials: true,
  });

  return next(requestWithCredentials);
};