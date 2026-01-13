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
import ReportManagement from "../pages/ReportManagement";
import Notification from "../pages/Notification";
import KPIDashboard from "../pages/KPIDashboard";
import AppointmentAcceptance from "../pages/AppointmentAcceptance";
import PreArrivalInformation from "../pages/PreArrivalInformation";
import Driver from "../pages/Driver";
import Vehicle from "../pages/Vehicle";
import CheckList from "../pages/CheckList";
import DriverVehicleMapping from "../pages/DriverVehicleMapping";
import Hotel from "../pages/Hotel";
import StatusManagement from "../pages/StatusManagement";
import MaterialType from "../pages/MaterialType";
import PackingType from "../pages/PackingType";
import LogisticsWarehouse from "../pages/LogisticsWarehouse";
import CustomFields from "../pages/CustomFields";
import JobStatusBE from "../pages/JobStatusBE";
import GroupEmailBE from "../pages/GroupEmailBE";
import BillingInstruction from "../pages/BillingInstruction";
import Captains from "../pages/Captains";
import FleetManagement from "../pages/Fleet";
import Location from "../pages/Location";
import ServiceProviders from "../pages/ServiceProviders";
import TransportParties from "../pages/TransportParties";
import WasteTypes from "../pages/WasteTypes";
import NotFound from "../pages/NotFound";
// 🔥 Set true to bypass auth temporarily
const TEST_MODE = true;

const router = createHashRouter([
  {
    element: <App />,
    errorElement: <NotFound />,

    children: [
      // Always available public pages
      { path: "/", element: <Login /> },
      { path: "/forget-password", element: <ForgetPassword /> },

      // Standalone KPI Dashboard (no layout, header, or sidebar)
      { path: "/kpi-dashboard", element: <KPIDashboard /> },
      { path: "/earning-history", element: <KPIDashboard /> },
      { path: "/tasks", element: <KPIDashboard /> },
      { path: "/team-leaderboard", element: <KPIDashboard /> },

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
              { path: "/report-management", element: <ReportManagement /> },
              { path: "/activity-log", element: <ActivityLog /> },
              { path: "/notification", element: <Notification /> },
              { path: "/appointment-acceptance", element: <AppointmentAcceptance /> },
              { path: "/pre-arrival-information", element: <PreArrivalInformation /> },
              { path: "/driver-management", element: <Driver /> },
              { path: "/vehicle-management", element: <Vehicle /> },
              { path: "/driver-vehicle-mapping", element: <DriverVehicleMapping /> },
              { path: "/check-list", element: <CheckList /> },
              { path: "/hotel-management", element: <Hotel /> },
              { path: "/material-type", element: <MaterialType /> },
              { path: "/packing-type", element: <PackingType /> },
              { path: "/logistics-warehouse", element: <LogisticsWarehouse /> },
              { path: "/status-management", element: <StatusManagement /> },
              { path: "/custom-fields", element: <CustomFields /> },
              { path: "/job-status", element: <JobStatusBE /> },
              { path: "/group-email", element: <GroupEmailBE /> },
              { path: "/billing-instruction", element: <BillingInstruction /> },
              { path: "/captains", element: <Captains /> },
              { path: "/fleet", element: <FleetManagement /> },
              { path: "/location", element: <Location /> },
              { path: "/service-providers", element: <ServiceProviders /> },
              { path: "/transport-parties", element: <TransportParties /> },
              { path: "/waste-types", element: <WasteTypes /> },
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
                  { path: "/job-status", element: <JobStatusBE /> },
                  { path: "/group-email", element: <GroupEmailBE /> },
                  { path: "/crew-management", element: <Crew /> },
                  { path: "/report-management", element: <ReportManagement /> },
                  { path: "/activity-log", element: <ActivityLog /> },
                  { path: "/notification", element: <Notification /> },
                  { path: "/packing-type", element: <PackingType /> },
                  { path: "/logistics-warehouse", element: <LogisticsWarehouse /> },
                  { path: "/status-management", element: <StatusManagement /> },
                  { path: "/custom-fields", element: <CustomFields /> },
                  { path: "/billing-instruction", element: <BillingInstruction /> },
                  { path: "/captains", element: <Captains /> },
                  { path: "/fleet", element: <FleetManagement /> },
                  { path: "/location", element: <Location /> },
                  { path: "/service-providers", element: <ServiceProviders /> },
                  { path: "/transport-parties", element: <TransportParties /> },
                  { path: "/appointment-acceptance", element: <AppointmentAcceptance /> },
                  { path: "/pre-arrival-information", element: <PreArrivalInformation /> },
                  { path: "/driver-management", element: <Driver /> },
                  { path: "/vehicle-management", element: <Vehicle /> },
                  { path: "/driver-vehicle-mapping", element: <DriverVehicleMapping /> },
                  { path: "/check-list", element: <CheckList /> },
                  { path: "/hotel-management", element: <Hotel /> },
                  { path: "/material-type", element: <MaterialType /> },
                  { path: "/packing-type", element: <PackingType /> },
                  { path: "/logistics-warehouse", element: <LogisticsWarehouse /> },
                  { path: "/status-management", element: <StatusManagement /> },
                  { path: "/custom-fields", element: <CustomFields /> },
                  { path: "/job-status", element: <JobStatusBE /> },
                  { path: "/group-email", element: <GroupEmailBE /> },
                  { path: "/billing-instruction", element: <BillingInstruction /> },
                  { path: "/captains", element: <Captains /> },
                  { path: "/fleet", element: <FleetManagement /> },
                  { path: "/location", element: <Location /> },
                  { path: "/service-providers", element: <ServiceProviders /> },
                  { path: "/transport-parties", element: <TransportParties /> },
                  { path: "/appointment-acceptance", element: <AppointmentAcceptance /> },
                  { path: "/pre-arrival-information", element: <PreArrivalInformation /> },
                  { path: "/driver-management", element: <Driver /> },
                  { path: "/vehicle-management", element: <Vehicle /> },
                  { path: "/driver-vehicle-mapping", element: <DriverVehicleMapping /> },
                  { path: "/check-list", element: <CheckList /> },
                  { path: "/hotel-management", element: <Hotel /> },
                  { path: "/material-type", element: <MaterialType /> },
                  { path: "/packing-type", element: <PackingType /> },
                  { path: "/logistics-warehouse", element: <LogisticsWarehouse /> },
                  { path: "/status-management", element: <StatusManagement /> },
                  { path: "/custom-fields", element: <CustomFields /> },
                  { path: "/job-status", element: <JobStatusBE /> },
                  { path: "/group-email", element: <GroupEmailBE /> },
                  { path: "/billing-instruction", element: <BillingInstruction /> },
                  { path: "/captains", element: <Captains /> },
                  { path: "/fleet", element: <FleetManagement /> },
                  { path: "/location", element: <Location /> },
                  { path: "/service-providers", element: <ServiceProviders /> },
                  { path: "/transport-parties", element: <TransportParties /> },
                  { path: "/appointment-acceptance", element: <AppointmentAcceptance /> },
                  { path: "/pre-arrival-information", element: <PreArrivalInformation /> },
                  { path: "/driver-management", element: <Driver /> },
                  { path: "/vehicle-management", element: <Vehicle /> },
                  { path: "/driver-vehicle-mapping", element: <DriverVehicleMapping /> },
                  { path: "/check-list", element: <CheckList /> },
                  { path: "/hotel-management", element: <Hotel /> },
                  { path: "/material-type", element: <MaterialType /> },
                  { path: "/packing-type", element: <PackingType /> },
                  { path: "/logistics-warehouse", element: <LogisticsWarehouse /> },
                  { path: "/status-management", element: <StatusManagement /> },
                  { path: "/custom-fields", element: <CustomFields /> },
                  { path: "/job-status", element: <JobStatusBE /> },
                  { path: "/group-email", element: <GroupEmailBE /> },
                  { path: "/billing-instruction", element: <BillingInstruction /> },
                  { path: "/captains", element: <Captains /> },
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
