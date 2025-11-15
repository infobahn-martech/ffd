import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import PublicRoutes from './PublicRoute';
import PrivateRoutes from './PrivateRoute';
import Layout from '../structure/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Authentication';
import Prospects from '../pages/Prospects';
import ChangePassword from '../pages/ChangePassword';
import Worker from '../pages/worker';
import Employee from '../pages/Employee';
import Profile from '../pages/Profle';
import EditProfile from '../pages/Profle/EditProfile';
import WorkerTypes from '../pages/WorkerType';
import Permission from '../pages/Permission';

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
                path: '/prospect',
                id: 'prospect',
                element: <Prospects />,
              },
              {
                path: '/workers',
                id: 'workers',
                element: <Worker />,
              },
              {
                path: '/workers-type',
                id: 'workers-type',
                element: <WorkerTypes />,
              },
              {
                path: '/employee',
                id: 'employee',
                element: <Employee />,
              },
              {
                path: '/permission',
                id: 'permission',
                element: <Permission />,
              },
              {
                path: '/settings',
                id: 'settings',
                element: <h1>Settings</h1>,
              },
              {
                path: '/userprofile',
                id: 'userprofile',
                element: <Profile />,
              },
              {
                path: '/userprofile-edit',
                id: 'userprofile-edit',
                element: <EditProfile />,
              },
              {
                path: '/change-password',
                id: 'change-password',
                element: <ChangePassword />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
