import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout.component';
import { authGuard } from './guard/auth.guard';


export const routes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        component: LayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    }
];
