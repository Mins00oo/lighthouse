import { lazy } from 'react';
import { Navigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { mainRoutes } from './main';
import { dashboardRoutes } from './dashboard';
import { authRoutes, loginRoute } from './auth';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));

export const routesSection = [
  {
    path: '/',
    element: <Navigate to={paths.auth.jwt.signIn} replace />,
  },

  // Login
  ...loginRoute,

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // Main
  ...mainRoutes,

  // No match
  { path: '*', element: <Page404 /> },
];
