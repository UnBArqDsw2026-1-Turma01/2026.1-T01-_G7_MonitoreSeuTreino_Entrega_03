import { createBrowserRouter } from 'react-router-dom';
import { AuthGuard } from '../../features/auth/guards/auth-guard';
import { RoutinesPage } from '../../features/routines/pages/routines-page';

export const appRouter = createBrowserRouter([
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        lazy: async () => {
          const { DashboardPage } = await import('../../features/dashboard/pages/dashboard-page');
          return { Component: DashboardPage };
        },
      },
      {
        path: '/onboarding',
        lazy: async () => {
          const { OnboardingPage } = await import('../../features/onboarding/pages/onboarding-page');
          return { Component: OnboardingPage };
        },
      },
      {
        path: '/onboarding/result',
        lazy: async () => {
          const { OnboardingResultPage } = await import('../../features/onboarding/pages/onboarding-result-page');
          return { Component: OnboardingResultPage };
        },
      },
      {
        path: '/exercises',
        lazy: async () => {
          const { ExercisesPage } = await import('../../features/exercises/pages/exercises-page');
          return { Component: ExercisesPage };
        },
      },
      {
        path: '/routines',
        element: <RoutinesPage />,
      },
    ],
  },
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import('../../features/auth/pages/login-page');
      return { Component: LoginPage };
    },
  },
  {
    path: '/cadastro',
    lazy: async () => {
      const { RegisterPage } = await import('../../features/auth/pages/register-page');
      return { Component: RegisterPage };
    },
  },
]);
