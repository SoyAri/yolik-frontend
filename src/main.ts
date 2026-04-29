import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideAuth0 } from '@auth0/auth0-angular';
import { mergeApplicationConfig } from '@angular/core';
import { environment } from './environments/environment';

const auth0Config = mergeApplicationConfig(appConfig, {
  providers: [
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
        audience: environment.auth0.audience,
      },
      httpInterceptor: {
        allowedList: [
          {
            // Rutas protegidas: todas las del backend EXCEPTO las públicas de productos.
            // GET /api/products y GET /api/products/:id no requieren token.
            uriMatcher: (uri) => {
              if (!uri.startsWith(environment.apiUrl)) return false;
              const path = uri.slice(environment.apiUrl.length).split('?')[0];
              if (path === '/api/products') return false;
              if (/^\/api\/products\/[^/]+$/.test(path)) return false;
              return true;
            },
            tokenOptions: {
              authorizationParams: { audience: environment.auth0.audience }
            }
          }
        ]
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    })
  ]
});

bootstrapApplication(App, auth0Config)
  .catch((err) => console.error(err));
