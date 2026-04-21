import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'account-settings',
        loadComponent: () => import('./features/account-settings/account-settings.component').then(m => m.AccountSettingsComponent)
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employees/employees.routes').then(m => m.EMPLOYEES_ROUTES)
      },
      {
        path: 'payroll',
        loadChildren: () => import('./features/payroll/payroll.routes').then(m => m.PAYROLL_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE'] }
      },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.routes').then(m => m.ATTENDANCE_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE'] }
      },
      {
        path: 'leave',
        loadChildren: () => import('./features/leave/leave.routes').then(m => m.LEAVE_ROUTES)
      },
      {
        path: 'performance',
        loadChildren: () => import('./features/performance/performance.routes').then(m => m.PERFORMANCE_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR'] }
      },
      {
        path: 'training',
        loadChildren: () => import('./features/training/training.routes').then(m => m.TRAINING_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE'] }
      },
      {
        path: 'feedback',
        loadComponent: () => import('./features/feedback/feedback-list.component').then(m => m.FeedbackListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR'] }
      },
      {
        path: 'activity',
        loadChildren: () => import('./features/activity/activity.routes').then(m => m.ACTIVITY_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR'] }
      },
      {
        path: 'events',
        loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
        canActivate: [AuthGuard]
      },
      {
        path: 'recruitment',
        loadChildren: () => import('./features/recruitment/recruitment.routes').then(m => m.RECRUITMENT_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR'] }
      },
      {
        path: 'shifts',
        loadChildren: () => import('./features/shifts/shifts.routes').then(m => m.SHIFTS_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE'] }
      },
      {
        path: 'expenses',
        loadChildren: () => import('./features/expenses/expenses.routes').then(m => m.EXPENSES_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE'] }
      },
      {
        path: 'assets',
        loadChildren: () => import('./features/assets/assets.routes').then(m => m.ASSETS_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR'] }
      }
    ]
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./shared/components/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
