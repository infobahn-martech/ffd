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
import "../../design/scss/dashboard.scss";
import "./dashboard-content.scss";

const Dashboard = () => {
  // Static data for stat cards
  const stats = [
    {
      title: "Total Vessels",
      value: "142",
      change: "+12%",
      trend: "up",
      icon: <FiActivity />,
      color: "#00368c",
    },
    {
      title: "Active Crew",
      value: "1,234",
      change: "+8%",
      trend: "up",
      icon: <FiUsers />,
      color: "#10b981",
    },
    {
      title: "Completed Jobs",
      value: "856",
      change: "+15%",
      trend: "up",
      icon: <FiCheckCircle />,
      color: "#3b82f6",
    },
    {
      title: "Revenue",
      value: "$2.4M",
      change: "+22%",
      trend: "up",
      icon: <FiDollarSign />,
      color: "#f59e0b",
    },
  ];

  // Line chart data - Vessel arrivals over time
  const vesselData = [
    { month: "Jan", arrivals: 45, departures: 38 },
    { month: "Feb", arrivals: 52, departures: 45 },
    { month: "Mar", arrivals: 48, departures: 42 },
    { month: "Apr", arrivals: 61, departures: 55 },
    { month: "May", arrivals: 55, departures: 48 },
    { month: "Jun", arrivals: 67, departures: 60 },
    { month: "Jul", arrivals: 72, departures: 65 },
    { month: "Aug", arrivals: 68, departures: 62 },
    { month: "Sep", arrivals: 75, departures: 70 },
    { month: "Oct", arrivals: 80, departures: 75 },
    { month: "Nov", arrivals: 85, departures: 78 },
    { month: "Dec", arrivals: 90, departures: 82 },
  ];

  // Bar chart data - Services by type
  const serviceData = [
    { name: "Transport", value: 320, color: "#00368c" },
    { name: "Medical", value: 180, color: "#10b981" },
    { name: "Hotel", value: 245, color: "#3b82f6" },
    { name: "Launch Hire", value: 150, color: "#f59e0b" },
    { name: "Warehouse", value: 195, color: "#8b5cf6" },
    { name: "Customs", value: 220, color: "#ef4444" },
  ];

  // Pie chart data - Job status distribution
  const jobStatusData = [
    { name: "Completed", value: 45, color: "#10b981" },
    { name: "In Progress", value: 30, color: "#3b82f6" },
    { name: "Pending", value: 15, color: "#f59e0b" },
    { name: "On Hold", value: 10, color: "#ef4444" },
  ];

  // Area chart data - Revenue trend
  const revenueData = [
    { month: "Jan", revenue: 180000, expenses: 120000 },
    { month: "Feb", revenue: 195000, expenses: 125000 },
    { month: "Mar", revenue: 210000, expenses: 130000 },
    { month: "Apr", revenue: 225000, expenses: 135000 },
    { month: "May", revenue: 240000, expenses: 140000 },
    { month: "Jun", revenue: 255000, expenses: 145000 },
    { month: "Jul", revenue: 270000, expenses: 150000 },
    { month: "Aug", revenue: 285000, expenses: 155000 },
    { month: "Sep", revenue: 300000, expenses: 160000 },
    { month: "Oct", revenue: 315000, expenses: 165000 },
    { month: "Nov", revenue: 330000, expenses: 170000 },
    { month: "Dec", revenue: 345000, expenses: 175000 },
  ];

  const COLORS = ["#00368c", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

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
