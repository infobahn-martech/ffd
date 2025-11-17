import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import PublicRoutes from './PublicRoute';
import PrivateRoutes from './PrivateRoute';
import Layout from '../structure/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Authentication';
import KanbanBoard from '../pages/KanbanBoard';
import Port from '../pages/Port';

// 🔥 Toggle this
const TEST_MODE = true; // true = all routes public (testing), false = real auth

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <h1>404</h1>,
    children: [
      // Always allow login page
      { path: '/', element: <Login /> },

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
