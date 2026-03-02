import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { provideAuth0 } from '@auth0/auth0-angular';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideAuth0({
      domain: 'dev-e2c3vkx36p7pn2fl.us.auth0.com',
      clientId: 'qDzhn2fJeylcK6gdFlEycVvu9TMBhsag',
      authorizationParams: {
        redirect_uri: ''
      }
    })
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
