import { useEffect, useMemo, useState } from "react";
import {
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
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiInbox,
  FiFileText,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiPlusCircle,
  FiRepeat,
  FiSend,
  FiDollarSign,
  FiUpload,
  FiSearch,
} from "react-icons/fi";
import dashboardService from "../../services/dashboardService";
import { useThemeStore } from "../../shared/store/themeStore";
import { notify } from "../../components/Toaster";
import "../../design/scss/dashboard.scss";
import "../../design/scss/pages/dashboard/dashboard-content.scss";

// Presentation metadata keyed by the stable `key` BE returns — API never sends icons/colors.
// Colors below are hardcoded hex mirroring the FFD design tokens (src/design/scss/partials/
// _variables.scss / _theme.scss) — this file has no build-time access to Sass $vars, and the
// codebase has no existing pattern for reading CSS custom properties from JS, so the canonical
// values are duplicated here rather than introducing a new getComputedStyle-based approach.
const STAT_META = {
  new_inquiries: { icon: <FiInbox />, color: "#0F2A3D" }, // $ffd-navy
  pending_quotations: { icon: <FiFileText />, color: "#FFC107" }, // $status-warning
  jobs_in_progress: { icon: <FiActivity />, color: "#1976D2" }, // $status-info-text
  completed_jobs: { icon: <FiCheckCircle />, color: "#28A745" }, // $status-success
  alerts_followups: { icon: <FiAlertTriangle />, color: "#DC3545" }, // $status-danger
};

const MODE_COLORS = {
  air: "#0F2A3D", // $ffd-navy
  sea: "#4EC9A1", // $ffd-teal
  land: "#f59e0b",
};

// Mirrors the canonical $status-* SCSS tokens per the "Color Coding" note:
// Pending-Yellow, In Progress-Blue, Completed-Green, Delayed-Red.
const JOB_STATUS_COLORS = {
  pending: "#FFC107",
  in_progress: "#1976D2",
  completed: "#28A745",
  delayed: "#DC3545",
};

// Inquiry/job row status -> the same 4-color legend (Quotation Sent / Confirmed / In Transit
// bucket into "in progress" blue; Delivered buckets into "completed" green).
const ROW_STATUS = {
  pending: { label: "Pending", color: "#FFC107" },
  quotation_sent: { label: "Quotation Sent", color: "#1976D2" },
  confirmed: { label: "Confirmed", color: "#1976D2" },
  in_transit: { label: "In Transit", color: "#1976D2" },
  delivered: { label: "Delivered", color: "#28A745" },
};

const QUICK_ACTIONS = [
  { key: "new_inquiry", label: "New Inquiry", icon: <FiPlusCircle /> },
  { key: "convert_to_job", label: "Convert Inquiry to Job", icon: <FiRepeat /> },
  { key: "send_quotation", label: "Send Quotation", icon: <FiSend /> },
  { key: "generate_invoice", label: "Generate Invoice", icon: <FiDollarSign /> },
  { key: "upload_documents", label: "Upload Documents", icon: <FiUpload /> },
];

const ROW_ACTIONS = ["View", "Edit", "Convert to Job", "Send Quotation"];

const formatStatValue = (value) => value.toLocaleString();

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState({ field: "id", dir: "asc" });
  const isDark = useThemeStore((state) => state.isDark);
  const chartGridColor = isDark ? "#293548" : "#E2E5E7";
  const chartAxisColor = isDark ? "#8f9aaa" : "#667680";
  const chartTooltipStyle = {
    backgroundColor: isDark ? "#151f2e" : "#fff",
    border: `1px solid ${isDark ? "#293548" : "#E2E5E7"}`,
    borderRadius: "8px",
    color: isDark ? "#f5f7fa" : "#0F2A3D",
  };

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
        key: stat.key,
        title: stat.label,
        value: formatStatValue(stat.value),
        change: `${stat.change_percent > 0 ? "+" : ""}${stat.change_percent}%`,
        trend: stat.trend,
        icon: STAT_META[stat.key]?.icon,
        color: STAT_META[stat.key]?.color,
      })),
    [overview]
  );

  const modeData = useMemo(
    () => (overview?.mode_wise_inquiries ?? []).map((m) => ({ ...m, color: MODE_COLORS[m.key] })),
    [overview]
  );

  const jobStatusData = useMemo(
    () => (overview?.job_status ?? []).map((s) => ({ ...s, color: JOB_STATUS_COLORS[s.key] })),
    [overview]
  );

  const revenueData = overview?.revenue_trend ?? [];

  const handleSort = (field) => {
    setSort((prev) =>
      prev.field === field ? { field, dir: prev.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" }
    );
  };

  const inquiries = useMemo(() => {
    const rows = overview?.inquiries ?? [];
    const q = search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (modeFilter !== "all" && row.mode.toLowerCase() !== modeFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.customer.toLowerCase().includes(q) ||
        row.route.toLowerCase().includes(q)
      );
    });
    const sorted = [...filtered].sort((a, b) => {
      const av = String(a[sort.field] ?? "");
      const bv = String(b[sort.field] ?? "");
      const cmp = av.localeCompare(bv);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [overview, search, modeFilter, statusFilter, sort]);

  const handlePlaceholderAction = (label) => {
    notify(`${label} — coming soon.`, "info");
  };

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
        {stats.map((stat) => (
          <div key={stat.key} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <p className="stat-title">{stat.title}</p>
                <h3 className="stat-value">{stat.value}</h3>
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === "up" && <FiTrendingUp />}
                  {stat.trend === "down" && <FiTrendingDown />}
                  <span>{stat.change}</span>
                  <span className="stat-period">vs last week</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-panel">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            className="quick-action-tile"
            onClick={() => handlePlaceholderAction(action.label)}
          >
            <span className="quick-action-icon">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Analytics Widgets */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Mode-wise Inquiry Count</h3>
            <p className="chart-subtitle">Air / Sea / Land split</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={modeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                dataKey="value"
              >
                {modeData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Job Status Overview</h3>
            <p className="chart-subtitle">Pending / In Progress / Completed / Delayed</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={jobStatusData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="name" stroke={chartAxisColor} />
              <YAxis stroke={chartAxisColor} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {jobStatusData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue &amp; Quote Conversion Rate</h3>
            <p className="chart-subtitle">Monthly revenue trend</p>
          </div>
          <div className="conversion-rate-badge">
            <span className="conversion-rate-value">{overview.quote_conversion_rate}%</span>
            <span className="conversion-rate-label">quotes converted to jobs</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F2A3D" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0F2A3D" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="month" stroke={chartAxisColor} />
              <YAxis stroke={chartAxisColor} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0F2A3D" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Follow-ups &amp; Tasks</h3>
            <p className="chart-subtitle">Daily follow-ups and pending approvals</p>
          </div>
          <div className="followups-list">
            {(overview.follow_ups ?? []).map((item) => (
              <div key={item.id} className="followup-row">
                <span className="followup-label">{item.label}</span>
                <span className="followup-due">{item.due}</span>
              </div>
            ))}
          </div>
          <p className="followups-subheading">Pending Approvals</p>
          <div className="followups-list">
            {(overview.pending_approvals ?? []).map((item) => (
              <div key={item.id} className="followup-row">
                <span className="followup-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiry & Job Table */}
      <div className="inquiry-table-card">
        <div className="chart-header">
          <h3 className="chart-title">Inquiry &amp; Job Table</h3>
          <p className="chart-subtitle">Search, filter, and act on open inquiries and jobs</p>
        </div>

        <div className="inquiry-table-controls">
          <div className="inquiry-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by customer, job ID, or route"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
            <option value="all">All Modes</option>
            <option value="air">Air</option>
            <option value="sea">Sea</option>
            <option value="land">Land</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(ROW_STATUS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className="inquiry-table-wrap">
          <table className="inquiry-table">
            <thead>
              <tr>
                {[
                  ["id", "Job / Inquiry ID"],
                  ["customer", "Customer"],
                  ["mode", "Mode"],
                  ["type", "Type"],
                  ["cargo", "Cargo Details"],
                  ["route", "Origin – Destination"],
                  ["status", "Status"],
                  ["assigned_to", "Assigned To"],
                ].map(([field, label]) => (
                  <th key={field} onClick={() => handleSort(field)}>
                    {label}
                    {sort.field === field && <span className="sort-arrow">{sort.dir === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 && (
                <tr>
                  <td className="inquiry-table-empty" colSpan={9}>
                    No inquiries or jobs match your filters.
                  </td>
                </tr>
              )}
              {inquiries.map((row) => {
                const statusMeta = ROW_STATUS[row.status] ?? { label: row.status, color: "#667680" };
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.customer}</td>
                    <td>{row.mode}</td>
                    <td>{row.type}</td>
                    <td>{row.cargo}</td>
                    <td>{row.route}</td>
                    <td>
                      <span
                        className="job-status-badge"
                        style={{ color: statusMeta.color, borderColor: statusMeta.color }}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td>{row.assigned_to || "—"}</td>
                    <td className="inquiry-table-actions">
                      {ROW_ACTIONS.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => handlePlaceholderAction(`${action} — ${row.id}`)}
                        >
                          {action}
                        </button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
