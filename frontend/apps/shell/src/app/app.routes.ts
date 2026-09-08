import { Route } from '@angular/router';
import { ShellLayoutComponent } from './layout/shell-layout';
import { FoundationHomeComponent } from './features/foundation-home/foundation-home';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellLayoutComponent,
    children: [
      {
        path: '',
        component: FoundationHomeComponent,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
