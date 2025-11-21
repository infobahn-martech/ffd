import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import PublicRoutes from './PublicRoute';
import PrivateRoutes from './PrivateRoute';
import Layout from '../structure/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Authentication';
import ForgetPassword from '../pages/ForgetPassword';
import KanbanBoard from '../pages/KanbanBoard';
import Port from '../pages/Port';
import Role from '../pages/Role';
import Permission from '../pages/Permission';
import User from '../pages/User';
import VesselType from '../pages/VesselType';
import BillingEntity from '../pages/BillingEntity';
import Vessel from '../pages/Vessel';

// 🔥 Toggle this
const TEST_MODE = true; // true = all routes public (testing), false = real auth

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <h1>404</h1>,
    children: [
      // Always allow login page
      { path: '/', element: <Login /> },
      {
        path: "/forget-password", element: <ForgetPassword />
      },


      // 🟢 TEST MODE → No Auth Guards
      ...(TEST_MODE
        ? [
          {
            element: <Layout />,
            children: [
              {
                path: '/dashboard',
                id: 'dashboard',
                element: <Dashboard />,
              },
              {
                path: '/roles',
                id: '/roles',
                element: <Role />,

              },
              {
                path: '/permissions',
                id: '/permissions',
                element: <Permission />
              },
              {
                path: '/users',
                id: '/users',
                element: <User />
              },
              {
                path: '/kanban-board',
                id: 'kanban-board',
                element: <KanbanBoard />,
              },
              {
                path: '/port-management',
                id: 'port',
                element: <Port />,
              },
              {
                path: '/vessel-typess',
                id: 'vessel-type',
                element: <VesselType />,
              },
              {
                path: '/vessel-onboardings',
                id: 'vessel-onboarding',
                element: <Vessel />,
              },
              {
                path: '/billing-entitys',
                id: 'billing-entity',
                element: <BillingEntity />,
              },
              {
                path: '/settings',
                id: 'settings',
                element: <h1>Settings</h1>,
              },
            ],
          },
        ]
        : [
          // 🔒 PRODUCTION MODE → With Public & Private Guards
          {
            element: <PublicRoutes />,
            children: [{
              path: '/', element: <Login />
            }, {
              path: "/forget-password", element: <ForgetPassword />
            }],
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
                    path: '/kanban-board',
                    id: 'kanban-board',
                    element: <KanbanBoard />,
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
        ]),
    ],
  },
]);

export default router;

// import { createBrowserRouter } from 'react-router-dom';
// import App from '../App';
// import PublicRoutes from './PublicRoute';
// import PrivateRoutes from './PrivateRoute';
// import Layout from '../structure/Layout';
// import Dashboard from '../pages/Dashboard';
// import Login from '../pages/Authentication';

// const router = createBrowserRouter([
//   {
//     element: <App />,
//     errorElement: <h1>404</h1>,
//     children: [
//       {
//         element: <PublicRoutes />,
//         children: [{ path: '/', element: <Login /> }],
//       },
//       {
//         element: <PrivateRoutes />,
//         children: [
//           {
//             element: <Layout />,
//             children: [
//               {
//                 path: '/dashboard',
//                 id: 'dashboard',
//                 element: <Dashboard />,
//               },
//               {
//                 path: '/settings',
//                 id: 'settings',
//                 element: <h1>Settings</h1>,
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ]);

// export default router;
