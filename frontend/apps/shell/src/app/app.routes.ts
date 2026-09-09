import { Route } from '@angular/router';
import { authGuard, guestGuard } from '@erp/core';
import { ShellLayoutComponent } from './layout/shell-layout';
import { FoundationHomeComponent } from './features/foundation-home/foundation-home';
import { LoginPageComponent } from './features/auth/login/login';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: FoundationHomeComponent,
      },
    ],
  },
  {
    path: '**',
    canActivate: [authGuard],
    redirectTo: '',
  },
];
