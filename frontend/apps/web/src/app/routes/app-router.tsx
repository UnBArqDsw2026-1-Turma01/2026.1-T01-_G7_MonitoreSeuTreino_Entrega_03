import { createBrowserRouter } from 'react-router-dom';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { DashboardPage } = await import('../../features/dashboard/pages/dashboard-page');
      return { Component: DashboardPage };
    },
  },
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import('../../features/auth/pages/login-page');
      return { Component: LoginPage };
    },
  },
]);
