import { Routes } from '@angular/router';
import { FailedComponent } from './components/failed-login/failed-login.component';
import { HomeComponent } from './components/home/home.component';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [MsalGuard]
  },
  {
    path: 'login-failed',
    component: FailedComponent,
  },
];
