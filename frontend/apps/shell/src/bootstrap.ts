import { bootstrapApplication } from '@angular/platform-browser';
import { appConfigPromise } from './app/app.config';
import { App } from './app/app';

appConfigPromise
  .then((appConfig) => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
