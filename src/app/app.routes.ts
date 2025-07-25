import type { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tickets',
    pathMatch: 'full',
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./pages/tickets/tickets.component').then((m) => m.TicketsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'create-ticket',
    loadComponent: () =>
      import('./pages/create-ticket/create-ticket.component').then(
        (m) => m.CreateTicketComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'resolve-ticket/:id',
    loadComponent: () =>
      import('./pages/resolve-ticket/resolve-ticket.component').then(
        (m) => m.ResolveTicketComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
{
  path: 'register',
  loadComponent: () =>
    import('./auth/register/register.component').then((m) => m.RegisterComponent),
  canActivate: [AdminGuard]
},
];
