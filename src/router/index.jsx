import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import PublicRoutes from './PublicRoute';
import PrivateRoutes from './PrivateRoute';
import Layout from '../structure/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Authentication';

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <h1>404</h1>,
    children: [
      {
        element: <PublicRoutes />,
        children: [{ path: '/', element: <Login /> }],
      },
      {
        element: <PrivateRoutes />,
        children: [
          {
            element: <Layout />,
            children: [
              {
                path: '/dashboard',
                id: 'dashboard',
                element: <Dashboard />,
              },
              {
                path: '/settings',
                id: 'settings',
                element: <h1>Settings</h1>,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
