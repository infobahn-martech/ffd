// src/routes/index.jsx

import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import PublicRoutes from "./PublicRoute";
import PrivateRoutes from "./PrivateRoute";
import RouteGuard from "./RouteGuard";
import PermissionRoute from "./PermissionRoute";
import { PERMISSION_MODULES, PERMISSION_ACTIONS, PERMISSION_SUBMODULES } from "../shared/constants/permissions";
import Layout from "../structure/Layout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Authentication";
import ForgetPassword from "../pages/ForgetPassword";
import ResetPassword from "../pages/ResetPassword";
import KanbanBoard from "../pages/KanbanBoard";
import KanbanAnalytics from "../pages/KanbanBoard/pages/AnalyticsPage";
import Workspaces from "../pages/Workspaces";
import EditWorkflows from "../pages/EditWorkflows";
import Role from "../pages/Role";
import Permission from "../pages/Permission";
import User from "../pages/User";
import ActivityLog from "../pages/ActivityLog";
import Notification from "../pages/Notification";
import NotFound from "../pages/NotFound";
import { ROUTE_PATHS } from "./paths";

const router = createBrowserRouter(
  [
    {
      element: <App />,
      errorElement: <NotFound />,

      children: [
        // Always available public pages
        { path: "/", element: <Login /> },
        { path: "/forget-password", element: <ForgetPassword /> },
        { path: "/users/reset_password_form", element: <ResetPassword /> },

        // PUBLIC ROUTES (only login, forgot password)
        {
          element: <PublicRoutes />,
          children: [
            { path: "/", element: <Login /> },
            { path: "/forget-password", element: <ForgetPassword /> },
            { path: "/reset-password", element: <ResetPassword /> },
          ],
        },

        // PRIVATE ROUTES (must be logged in)
        {
          element: <PrivateRoutes />,
          children: [
            {
              element: <Layout />,
              children: [
                // Dashboard - All roles
                { path: ROUTE_PATHS.DASHBOARD, element: <RouteGuard><Dashboard /></RouteGuard> },
                // Kanban Board — dynamic board id
                { path: "/kanban-board/operator", element: <RouteGuard><KanbanBoard /></RouteGuard> },
                // Kanban Board Analytics
                { path: "/kanban-board/:id/analytics", element: <RouteGuard><KanbanAnalytics /></RouteGuard> },
                { path: "/kanban-board/analytics", element: <RouteGuard><KanbanAnalytics /></RouteGuard> },
                { path: "/kanban-board/:boardId", element: <RouteGuard><KanbanBoard /></RouteGuard> },
                // Workspaces — fully migrated feature: the permission response is
                // authoritative here (permissionOnly), the legacy role table is not consulted.
                {
                  path: "/workspaces",
                  element: (
                    <PermissionRoute
                      moduleKey={PERMISSION_MODULES.KANBAN_WORKSPACE}
                      actionKey={PERMISSION_ACTIONS.VIEW_WORKSPACE}
                      permissionOnly
                    >
                      <Workspaces />
                    </PermissionRoute>
                  ),
                },
                {
                  path: "/workspaces/dashboard/:dashboardId",
                  element: (
                    <PermissionRoute
                      moduleKey={PERMISSION_MODULES.KANBAN_WORKSPACE}
                      actionKey={PERMISSION_ACTIONS.VIEW_WORKSPACE}
                      permissionOnly
                    >
                      <Workspaces />
                    </PermissionRoute>
                  ),
                },
                // Edit Workflow
                {
                  path: "/edit-workflow",
                  element: (
                    <PermissionRoute
                      moduleKey={PERMISSION_MODULES.KANBAN_WORKFLOW}
                      actionKey={PERMISSION_ACTIONS.VIEW_WORKFLOW}
                      permissionOnly
                    >
                      <EditWorkflows />
                    </PermissionRoute>
                  ),
                },
                // Role Management - Super Admin, Admin only
                { path: "/roles", element: <RouteGuard><Role /></RouteGuard> },
                { path: "/permissions", element: <RouteGuard><Permission /></RouteGuard> },
                // User Management
                {
                  path: "/users",
                  element: (
                    // Fully migrated feature: the permission response is authoritative
                    // here (permissionOnly), the legacy role table is not consulted.
                    <PermissionRoute
                      moduleKey={PERMISSION_MODULES.USER_MANAGEMENT}
                      submoduleKey={PERMISSION_SUBMODULES.USERS}
                      actionKey={PERMISSION_ACTIONS.VIEW}
                      permissionOnly
                    >
                      <User />
                    </PermissionRoute>
                  ),
                },
                // Activity Log
                { path: "/activity-log", element: <RouteGuard><ActivityLog /></RouteGuard> },
                // Notification
                { path: "/notification", element: <RouteGuard><Notification /></RouteGuard> },
                // Settings
                { path: "/settings", element: <RouteGuard><h1>Settings</h1></RouteGuard> },
              ],
            },
          ],
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
  }
);

export default router;
