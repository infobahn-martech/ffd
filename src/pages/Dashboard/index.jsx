import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FiTrendingUp, FiUsers, FiCheckCircle, FiActivity, FiDollarSign } from "react-icons/fi";
import dashboardService from "../../services/dashboardService";
import "../../design/scss/dashboard.scss";
import "../../design/scss/pages/dashboard/dashboard-content.scss";

// Presentation metadata keyed by the stable `key` BE returns — API never sends icons/colors.
const STAT_META = {
  total_vessels: { icon: <FiActivity />, color: "#00368c" },
  active_crew: { icon: <FiUsers />, color: "#10b981" },
  completed_jobs: { icon: <FiCheckCircle />, color: "#3b82f6" },
  revenue: { icon: <FiDollarSign />, color: "#f59e0b" },
};

const SERVICE_COLORS = {
  transport: "#00368c",
  medical: "#10b981",
  hotel: "#3b82f6",
  launch_hire: "#f59e0b",
  warehouse: "#8b5cf6",
  customs: "#ef4444",
};

const JOB_STATUS_COLORS = {
  completed: "#10b981",
  in_progress: "#3b82f6",
  pending: "#f59e0b",
  on_hold: "#ef4444",
};

const formatStatValue = (key, value) => {
  if (key === "revenue") {
    return value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}M` : `$${value.toLocaleString()}`;
  }
  return value.toLocaleString();
};

const Dashboard = () => {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let isMounted = true;
    dashboardService.getDashboardOverview().then((response) => {
      if (isMounted) setOverview(response.data.data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () =>
      (overview?.stats ?? []).map((stat) => ({
        title: stat.label,
        value: formatStatValue(stat.key, stat.value),
        change: `${stat.change_percent > 0 ? "+" : ""}${stat.change_percent}%`,
        trend: stat.trend,
        icon: STAT_META[stat.key]?.icon,
        color: STAT_META[stat.key]?.color,
      })),
    [overview]
  );

  const vesselData = overview?.vessel_traffic ?? [];
  const revenueData = overview?.revenue_trend ?? [];
  const serviceRequestsData = overview?.service_requests_trend ?? [];

  const serviceData = useMemo(
    () => (overview?.services_by_type ?? []).map((s) => ({ ...s, color: SERVICE_COLORS[s.key] })),
    [overview]
  );

  const jobStatusData = useMemo(
    () => (overview?.job_status ?? []).map((s) => ({ ...s, color: JOB_STATUS_COLORS[s.key] })),
    [overview]
  );

  if (!overview) {
    return <div className="dashboard-container">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <p className="stat-title">{stat.title}</p>
                <h3 className="stat-value">{stat.value}</h3>
                <div className={`stat-change ${stat.trend}`}>
                  <FiTrendingUp />
                  <span>{stat.change}</span>
                  <span className="stat-period">vs last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Line Chart - Vessel Arrivals */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Vessel Arrivals & Departures</h3>
            <p className="chart-subtitle">Monthly overview</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vesselData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="arrivals"
                stroke="#00368c"
                strokeWidth={3}
                name="Arrivals"
                dot={{ fill: "#00368c", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="departures"
                stroke="#10b981"
                strokeWidth={3}
                name="Departures"
                dot={{ fill: "#10b981", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Services */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Services by Type</h3>
            <p className="chart-subtitle">Total services rendered</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Job Status */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Job Status Distribution</h3>
            <p className="chart-subtitle">Current job breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={jobStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {jobStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Monthly Service Requests */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Service Requests</h3>
            <p className="chart-subtitle">Service requests trend</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceRequestsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="requests" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart - Revenue */}
        <div className="chart-card chart-card-full">
          <div className="chart-header">
            <h3 className="chart-title">Revenue & Expenses Trend</h3>
            <p className="chart-subtitle">Monthly financial overview</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00368c" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00368c" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00368c"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
