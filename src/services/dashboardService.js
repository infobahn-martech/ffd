// Mock implementation of GET /api/dashboard/get_overview.
// Swap the body of getDashboardOverview for:
//   Gateway.get('dashboard/get_overview', { params })
// once BE ships the endpoint — response shape below matches the agreed contract.

const MOCK_OVERVIEW = {
  stats: [
    { key: "new_inquiries", label: "New Inquiries", value: 8, change_percent: 14, trend: "up" },
    { key: "pending_quotations", label: "Pending Quotations", value: 5, change_percent: -6, trend: "down" },
    { key: "jobs_in_progress", label: "Jobs In Progress", value: 23, change_percent: 9, trend: "up" },
    { key: "completed_jobs", label: "Completed Jobs", value: 142, change_percent: 18, trend: "up" },
    { key: "alerts_followups", label: "Alerts / Follow-ups", value: 4, change_percent: 0, trend: "flat" },
  ],

  // Mode-wise Inquiry Count (pie)
  mode_wise_inquiries: [
    { key: "air", name: "Air", value: 34 },
    { key: "sea", name: "Sea", value: 52 },
    { key: "land", name: "Land", value: 19 },
  ],

  // Job Status Overview (bar) — colors follow the spec's status legend:
  // Pending-Yellow, In Progress-Blue, Completed-Green, Delayed-Red.
  job_status: [
    { key: "pending", name: "Pending", value: 18 },
    { key: "in_progress", name: "In Progress", value: 23 },
    { key: "completed", name: "Completed", value: 142 },
    { key: "delayed", name: "Delayed", value: 6 },
  ],

  revenue_trend: [
    { month: "Jan", revenue: 180000 },
    { month: "Feb", revenue: 195000 },
    { month: "Mar", revenue: 210000 },
    { month: "Apr", revenue: 225000 },
    { month: "May", revenue: 240000 },
    { month: "Jun", revenue: 255000 },
  ],

  quote_conversion_rate: 62,

  // Inquiry & Job Table (central section)
  inquiries: [
    {
      id: "INQ-1042",
      customer: "ABC Traders",
      mode: "Air",
      type: "Import",
      cargo: "Electronics, 150kg",
      route: "Riyadh → Jeddah",
      status: "quotation_sent",
      assigned_to: "Alex Johnson",
    },
    {
      id: "RFQ-1041",
      customer: "Nova Logistics",
      mode: "Sea",
      type: "Export",
      cargo: "Machinery, 4.2t",
      route: "Jeddah → Dubai",
      status: "pending",
      assigned_to: "Priya Patel",
    },
    {
      id: "SED-AIR-0123",
      customer: "Gulf Freight Co.",
      mode: "Air",
      type: "DAP",
      cargo: "Auto parts, 80kg",
      route: "Dammam → Riyadh",
      status: "confirmed",
      assigned_to: "Sam Lee",
    },
    {
      id: "SED-SEA-0118",
      customer: "Al Rashid Trading",
      mode: "Sea",
      type: "Import",
      cargo: "Furniture, 12t",
      route: "Shanghai → Jeddah",
      status: "in_transit",
      assigned_to: "Jordan Smith",
    },
    {
      id: "SED-LAND-0091",
      customer: "Desert Rose LLC",
      mode: "Land",
      type: "DDP",
      cargo: "Textiles, 900kg",
      route: "Riyadh → Dubai",
      status: "delivered",
      assigned_to: "Alex Johnson",
    },
    {
      id: "RFQ-1039",
      customer: "BGP Arabia Co.",
      mode: "Sea",
      type: "Export",
      cargo: "Steel coils, 8t",
      route: "Jeddah → Rotterdam",
      status: "pending",
      assigned_to: "Priya Patel",
    },
  ],

  follow_ups: [
    { id: "fu-1", label: "Follow up quote — Nova Logistics", due: "Today", customer: "Nova Logistics", mode: "Sea" },
    { id: "fu-2", label: "Confirm pickup slot — Al Rashid Trading", due: "Tomorrow", customer: "Al Rashid Trading", mode: "Sea" },
    { id: "fu-3", label: "Rate expiry reminder — BGP Arabia Co.", due: "In 2 days", customer: "BGP Arabia Co.", mode: "Sea" },
  ],

  pending_approvals: [
    { id: "pa-1", label: "Quotation approval — ABC Traders (margin 9%)" },
    { id: "pa-2", label: "Job confirmation — Gulf Freight Co." },
  ],
};

const getDashboardOverview = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ data: { data: MOCK_OVERVIEW } }), 400);
  });

export default {
  getDashboardOverview,
};
