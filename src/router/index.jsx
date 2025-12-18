// src/routes/index.jsx

import { createHashRouter } from "react-router-dom";
import App from "../App";
import PublicRoutes from "./PublicRoute";
import PrivateRoutes from "./PrivateRoute";
import Layout from "../structure/Layout";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Authentication";
import ForgetPassword from "../pages/ForgetPassword";
import KanbanBoard from "../pages/KanbanBoard";
import Workspaces from "../pages/Workspaces";
import EditWorkflows from "../pages/EditWorkflows";
import Port from "../pages/Port";
import Role from "../pages/Role";
import Permission from "../pages/Permission";
import User from "../pages/User";
import VesselType from "../pages/VesselType";
import BillingEntity from "../pages/BillingEntity";
import Vessel from "../pages/Vessel";
import CustomerPricing from "../pages/CustomerPricing";
import BargeType from "../pages/BargeType";
import CustomInspection from "../pages/CustomInspection";
import Crew from "../pages/Crew";
import ActivityLog from "../pages/ActivityLog";

// 🔥 Set true to bypass auth temporarily
const TEST_MODE = true;

const router = createHashRouter([
  {
    element: <App />,
    errorElement: <h1>In-Progress</h1>,

    children: [
      // Always available public pages
      { path: "/", element: <Login /> },
      { path: "/forget-password", element: <ForgetPassword /> },

      // If TEST MODE, bypass all auth guards
      ...(TEST_MODE
        ? [
          {
            element: <Layout />,
            children: [
              { path: "/dashboard", element: <Dashboard /> },
              { path: "/roles", element: <Role /> },
              { path: "/permissions", element: <Permission /> },
              { path: "/users", element: <User /> },
              { path: "/customer-pricing", element: <CustomerPricing /> },
              { path: "/kanban-board", element: <KanbanBoard /> },
              { path: "/workspaces", element: <Workspaces /> },
              { path: "/edit-workflow", element: <EditWorkflows /> },
              { path: "/port-management", element: <Port /> },
              { path: "/vessel-types", element: <VesselType /> },
              { path: "/barge-types", element: <BargeType /> },
              { path: "/vessel-onboarding", element: <Vessel /> },
              { path: "/billing-entity", element: <BillingEntity /> },
              { path: "/custom-inspection", element: <CustomInspection /> },
              { path: "/crew-management", element: <Crew /> },
              { path: "/activity-log", element: <ActivityLog /> },
              { path: "/settings", element: <h1>Settings</h1> },
            ],
          },
        ]
        : [
          // PUBLIC ROUTES (only login, forgot password)
          {
            element: <PublicRoutes />,
            children: [
              { path: "/", element: <Login /> },
              { path: "/forget-password", element: <ForgetPassword /> },
            ],
          },

          // PRIVATE ROUTES (must be logged in)
          {
            element: <PrivateRoutes />,
            children: [
              {
                element: <Layout />,
                children: [
                  { path: "/dashboard", element: <Dashboard /> },
                  { path: "/kanban-board", element: <KanbanBoard /> },
                  { path: "/workspaces", element: <Workspaces /> },
                  { path: "/edit-workflow", element: <EditWorkflows /> },
                  { path: "/custom-inspection", element: <CustomInspection /> },
                  { path: "/crew-management", element: <Crew /> },
                  { path: "/activity-log", element: <ActivityLog /> },
                  { path: "/settings", element: <h1>Settings</h1> },
                ],
              },
            ],
          },
        ]),
    ],
  },
]);

export default router;
