import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AccountLayout } from 'src/sections/account/account-layout';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
// Health
const HealthPage = lazy(() => import('src/pages/dashboard/health'));
// Metrics
const MetricsPage = lazy(() => import('src/pages/dashboard/metrics'));
// Business
const BusinessPage = lazy(() => import('src/pages/dashboard/business'));
// Alerts
const AlertsPage = lazy(() => import('src/pages/dashboard/alerts'));
// Logs
const LogListPage = lazy(() => import('src/pages/dashboard/logs/list'));
const LogDetailsPage = lazy(() => import('src/pages/dashboard/logs/details'));
// Server Instances
const ServerInstanceListPage = lazy(() => import('src/pages/dashboard/server-instances/list'));
const ServerInstanceDetailsPage = lazy(
  () => import('src/pages/dashboard/server-instances/details')
);
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// Account
const AccountGeneralPage = lazy(() => import('src/pages/dashboard/user/account/general'));
const AccountNotificationsPage = lazy(
  () => import('src/pages/dashboard/user/account/notifications')
);
const AccountChangePasswordPage = lazy(
  () => import('src/pages/dashboard/user/account/change-password')
);
// Test render page by role
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// Blank page
const ParamsPage = lazy(() => import('src/pages/dashboard/params'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

const accountLayout = () => (
  <AccountLayout>
    <SuspenseOutlet />
  </AccountLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <IndexPage /> },
      {
        path: 'user',
        children: [
          { index: true, element: <UserProfilePage /> },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          {
            path: 'account',
            element: accountLayout(),
            children: [
              { index: true, element: <AccountGeneralPage /> },
              { path: 'notifications', element: <AccountNotificationsPage /> },
              { path: 'change-password', element: <AccountChangePasswordPage /> },
            ],
          },
        ],
      },
      {
        path: 'logs',
        children: [
          { index: true, element: <LogListPage /> },
          { path: 'list', element: <LogListPage /> },
          { path: ':id', element: <LogDetailsPage /> },
        ],
      },
      {
        path: 'server-instances',
        children: [
          { index: true, element: <ServerInstanceListPage /> },
          { path: 'list', element: <ServerInstanceListPage /> },
          { path: ':id', element: <ServerInstanceDetailsPage /> },
        ],
      },
      { path: 'health', element: <HealthPage /> },
      { path: 'metrics', element: <MetricsPage /> },
      { path: 'business', element: <BusinessPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'params', element: <ParamsPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
