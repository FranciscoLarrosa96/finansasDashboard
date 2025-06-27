import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';


export const routes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
