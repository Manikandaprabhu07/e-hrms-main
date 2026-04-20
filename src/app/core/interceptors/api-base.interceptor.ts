import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { getRuntimeEnv } from '../config/runtime-env';

@Injectable()
export class ApiBaseInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only rewrite API calls that are written as relative "/api/..." URLs.
    if (!request.url.startsWith('/api')) {
      return next.handle(request);
    }

    // Keep SSR safe: if window isn't available, fall back to the original URL.
    try {
      const { API_BASE_URL } = getRuntimeEnv();
      const url = `${API_BASE_URL}${request.url}`;
      return next.handle(request.clone({ url }));
    } catch {
      return next.handle(request);
    }
  }
}

