// Mock implementation of GET /api/dashboard/get_overview.
// Swap the body of getDashboardOverview for:
//   Gateway.get('dashboard/get_overview', { params })
// once BE ships the endpoint — response shape below matches the agreed contract.

const MOCK_OVERVIEW = {
  stats: [
    { key: "total_vessels", label: "Total Vessels", value: 142, change_percent: 12, trend: "up" },
    { key: "active_crew", label: "Active Crew", value: 1234, change_percent: 8, trend: "up" },
    { key: "completed_jobs", label: "Completed Jobs", value: 856, change_percent: 15, trend: "up" },
    { key: "revenue", label: "Revenue", value: 2400000, change_percent: 22, trend: "up" },
  ],

  vessel_traffic: [
    { month: "Jan", month_number: 1, arrivals: 45, departures: 38 },
    { month: "Feb", month_number: 2, arrivals: 52, departures: 45 },
    { month: "Mar", month_number: 3, arrivals: 48, departures: 42 },
    { month: "Apr", month_number: 4, arrivals: 61, departures: 55 },
    { month: "May", month_number: 5, arrivals: 55, departures: 48 },
    { month: "Jun", month_number: 6, arrivals: 67, departures: 60 },
    { month: "Jul", month_number: 7, arrivals: 72, departures: 65 },
    { month: "Aug", month_number: 8, arrivals: 68, departures: 62 },
    { month: "Sep", month_number: 9, arrivals: 75, departures: 70 },
    { month: "Oct", month_number: 10, arrivals: 80, departures: 75 },
    { month: "Nov", month_number: 11, arrivals: 85, departures: 78 },
    { month: "Dec", month_number: 12, arrivals: 90, departures: 82 },
  ],

  services_by_type: [
    { key: "transport", name: "Transport", value: 320 },
    { key: "medical", name: "Medical", value: 180 },
    { key: "hotel", name: "Hotel", value: 245 },
    { key: "launch_hire", name: "Launch Hire", value: 150 },
    { key: "warehouse", name: "Warehouse", value: 195 },
    { key: "customs", name: "Customs", value: 220 },
  ],

  job_status: [
    { key: "completed", name: "Completed", value: 450 },
    { key: "in_progress", name: "In Progress", value: 300 },
    { key: "pending", name: "Pending", value: 150 },
    { key: "on_hold", name: "On Hold", value: 100 },
  ],

  service_requests_trend: [
    { month: "Jan", month_number: 1, requests: 285 },
    { month: "Feb", month_number: 2, requests: 310 },
    { month: "Mar", month_number: 3, requests: 295 },
    { month: "Apr", month_number: 4, requests: 340 },
    { month: "May", month_number: 5, requests: 325 },
    { month: "Jun", month_number: 6, requests: 380 },
    { month: "Jul", month_number: 7, requests: 395 },
    { month: "Aug", month_number: 8, requests: 375 },
    { month: "Sep", month_number: 9, requests: 410 },
    { month: "Oct", month_number: 10, requests: 435 },
    { month: "Nov", month_number: 11, requests: 450 },
    { month: "Dec", month_number: 12, requests: 475 },
  ],

  revenue_trend: [
    { month: "Jan", month_number: 1, revenue: 180000, expenses: 120000 },
    { month: "Feb", month_number: 2, revenue: 195000, expenses: 125000 },
    { month: "Mar", month_number: 3, revenue: 210000, expenses: 130000 },
    { month: "Apr", month_number: 4, revenue: 225000, expenses: 135000 },
    { month: "May", month_number: 5, revenue: 240000, expenses: 140000 },
    { month: "Jun", month_number: 6, revenue: 255000, expenses: 145000 },
    { month: "Jul", month_number: 7, revenue: 270000, expenses: 150000 },
    { month: "Aug", month_number: 8, revenue: 285000, expenses: 155000 },
    { month: "Sep", month_number: 9, revenue: 300000, expenses: 160000 },
    { month: "Oct", month_number: 10, revenue: 315000, expenses: 165000 },
    { month: "Nov", month_number: 11, revenue: 330000, expenses: 170000 },
    { month: "Dec", month_number: 12, revenue: 345000, expenses: 175000 },
  ],
};

const getDashboardOverview = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ data: { data: MOCK_OVERVIEW } }), 400);
  });

export default {
  getDashboardOverview,
};
