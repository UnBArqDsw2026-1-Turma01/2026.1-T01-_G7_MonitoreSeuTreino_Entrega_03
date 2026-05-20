import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './app/providers/query-provider';
import { appRouter } from './app/routes/app-router';

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={appRouter} />
    </QueryProvider>
  );
}

export default App;
