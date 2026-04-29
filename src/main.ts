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
            uriMatcher: (uri) => uri.startsWith(environment.apiUrl),
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
