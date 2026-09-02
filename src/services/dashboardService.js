// Mock implementation of GET /api/dashboard/get_overview.
// Reads the same in-memory board state the Kanban mocks render (src/mocks/ffd) so
// every Dashboard row carries a real board_id/card_id — see getAllCardsFlat. This
// file has no real backend endpoint yet, so unlike the other services it isn't
// behind the isMockDataEnabled switch; its body just reads shared mock state
// instead of a private hardcoded object. Swap the body of getDashboardOverview for:
//   Gateway.get('dashboard/get_overview', { params })
// once BE ships the endpoint — response shape below matches the agreed contract.

import { getAllCardsFlat, getPendingApprovals } from "../mocks/ffd";

// Mirrors the 4-color status legend used board-wide (Pending-Yellow, In
// Progress-Blue, Completed-Green, Delayed-Red — see JOB_STATUS_COLORS in
// src/pages/Dashboard/index.jsx).
const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  delayed: "Delayed",
};

const REVENUE_TREND = [
  { month: "Jan", revenue: 180000 },
  { month: "Feb", revenue: 195000 },
  { month: "Mar", revenue: 210000 },
  { month: "Apr", revenue: 225000 },
  { month: "May", revenue: 240000 },
  { month: "Jun", revenue: 255000 },
];

const FOLLOW_UPS = [
  { id: "fu-1", label: "Follow up quote — Nova Logistics", due: "Today", customer: "Nova Logistics", mode: "Sea" },
  { id: "fu-2", label: "Confirm pickup slot — Al Rashid Trading", due: "Tomorrow", customer: "Al Rashid Trading", mode: "Sea" },
  { id: "fu-3", label: "Rate expiry reminder — BGP Arabia Co.", due: "In 2 days", customer: "BGP Arabia Co.", mode: "Sea" },
];

function buildOverview() {
  const rows = getAllCardsFlat();

  const statusCounts = {};
  const modeCounts = {};
  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    if (row.mode) modeCounts[row.mode] = (modeCounts[row.mode] || 0) + 1;
  }

  const newInquiries = rows.filter(
    (r) => r.workflow_name === "FFD Commercials" && r.status === "pending"
  ).length;
  const pendingQuotations = rows.filter(
    (r) => r.workflow_name === "FFD Commercials" && (r.status === "in_progress" || r.status === "pending")
  ).length;
  const jobsInProgress = rows.filter(
    (r) => r.workflow_name === "FFD Operations Board" && r.status !== "completed" && r.status !== "delayed"
  ).length;
  const completedJobs = rows.filter((r) => r.status === "completed").length;
  const alertsFollowups = rows.filter((r) => r.status === "delayed").length;

  return {
    stats: [
      { key: "new_inquiries", label: "New Inquiries", value: newInquiries, change_percent: 14, trend: "up" },
      { key: "pending_quotations", label: "Pending Quotations", value: pendingQuotations, change_percent: -6, trend: "down" },
      { key: "jobs_in_progress", label: "Jobs In Progress", value: jobsInProgress, change_percent: 9, trend: "up" },
      { key: "completed_jobs", label: "Completed Jobs", value: completedJobs, change_percent: 18, trend: "up" },
      { key: "alerts_followups", label: "Alerts / Follow-ups", value: alertsFollowups, change_percent: 0, trend: "flat" },
    ],

    mode_wise_inquiries: Object.entries(modeCounts).map(([mode, value]) => ({
      key: mode.toLowerCase(),
      name: mode,
      value,
    })),

    job_status: Object.entries(STATUS_LABELS).map(([key, name]) => ({
      key,
      name,
      value: statusCounts[key] || 0,
    })),

    revenue_trend: REVENUE_TREND,
    quote_conversion_rate: 62,

    inquiries: rows.map((r) => ({
      id: r.id,
      customer: r.customer,
      mode: r.mode,
      type: r.type,
      cargo: r.cargo,
      route: r.route,
      status: r.status,
      assigned_to: r.assigned_to,
      board_id: r.board_id,
      card_id: r.card_id,
    })),

    // Mock login (mockUserProfile in src/mocks/ffd/index.js) has no real link to
    // card assignee names, so "my tasks" here illustrates the widget against one
    // representative assignee rather than a genuinely resolvable "current user".
    my_tasks: rows.filter((r) => r.assigned_to === "Alex Johnson"),

    follow_ups: FOLLOW_UPS,
    pending_approvals: getPendingApprovals().map((a) => ({ id: a.document_id, label: a.label })),
  };
}

const getDashboardOverview = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ data: { data: buildOverview() } }), 400);
  });

export default {
  getDashboardOverview,
};
