import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FiBriefcase,
  FiRepeat,
  FiSend,
  FiDollarSign,
  FiUpload,
  FiSearch,
} from "react-icons/fi";
import dashboardService from "../../services/dashboardService";
import kanbanBoardService from "../../services/kanbanBoardService";
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

// Inquiry/job row status badges reuse the same 4-color legend as the Job Status
// Overview chart (JOB_STATUS_COLORS above) — one status vocabulary board-wide.
const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  delayed: "Delayed",
};

const QUICK_ACTIONS = [
  { key: "new_inquiry", label: "New Inquiry", icon: <FiPlusCircle /> },
  { key: "create_job", label: "Create a Job", icon: <FiBriefcase /> },
  { key: "convert_to_job", label: "Convert Inquiry to Job", icon: <FiRepeat /> },
  { key: "send_quotation", label: "Send Quotation", icon: <FiSend /> },
  { key: "generate_invoice", label: "Generate Invoice", icon: <FiDollarSign /> },
  { key: "upload_documents", label: "Upload Documents", icon: <FiUpload /> },
];

const ROW_ACTIONS = ["View", "Edit", "Convert to Job", "Send Quotation"];

const formatStatValue = (value) => value.toLocaleString();

const Dashboard = () => {
  const navigate = useNavigate();
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

  const myTasksData = useMemo(() => {
    const counts = { pending: 0, in_progress: 0, completed: 0 };
    for (const row of overview?.my_tasks ?? []) {
      if (row.status === "pending") counts.pending += 1;
      else if (row.status === "completed") counts.completed += 1;
      else counts.in_progress += 1; // in_progress + delayed both read as "ongoing" here
    }
    return [
      { key: "pending", name: "Pending", value: counts.pending, color: JOB_STATUS_COLORS.pending },
      { key: "in_progress", name: "Ongoing", value: counts.in_progress, color: JOB_STATUS_COLORS.in_progress },
      { key: "completed", name: "Completed", value: counts.completed, color: JOB_STATUS_COLORS.completed },
    ].filter((slice) => slice.value > 0);
  }, [overview]);

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

  const handleViewRow = (row) => {
    if (!row.board_id || !row.card_id) {
      notify("This row has no linked board card yet.", "error");
      return;
    }
    navigate(`/kanban-board/${row.board_id}?openCard=${encodeURIComponent(row.card_id)}`);
  };

  const handleRowAction = (action, row) => {
    if (action === "View") {
      handleViewRow(row);
      return;
    }
    handlePlaceholderAction(`${action} — ${row.id}`);
  };

  const handleCreateInquiry = async () => {
    try {
      const res = await kanbanBoardService.createCard({
        board_id: "ffd-board-commercials",
        column_id: "col-rfq",
        card_name: "New inquiry",
        number_kind: "RFQ",
      });
      const data = res?.data?.data;
      if (!data?.card_id) throw new Error("No card id returned.");
      notify(`Inquiry ${data.rfq_number ?? ""} created.`, "success");
      navigate(`/kanban-board/ffd-board-commercials?openCard=${encodeURIComponent(data.card_id)}`);
    } catch {
      notify("Could not create a new inquiry.", "error");
    }
  };

  const handleCreateJob = async () => {
    try {
      const res = await kanbanBoardService.createCard({
        board_id: "ffd-board-ops",
        column_id: "col-ops-quoted",
        swimlane_id: "priority",
        card_name: "New job",
        number_kind: "JOB",
        mode: "GEN",
      });
      const data = res?.data?.data;
      if (!data?.card_id) throw new Error("No card id returned.");
      notify(`Job ${data.job_number ?? ""} created.`, "success");
      navigate(`/kanban-board/ffd-board-ops?openCard=${encodeURIComponent(data.card_id)}`);
    } catch {
      notify("Could not create a new job.", "error");
    }
  };

  const handleQuickAction = (action) => {
    if (action.key === "new_inquiry") return handleCreateInquiry();
    if (action.key === "create_job") return handleCreateJob();
    return handlePlaceholderAction(action.label);
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
            onClick={() => handleQuickAction(action)}
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
            <h3 className="chart-title">My Tasks</h3>
            <p className="chart-subtitle">Pending, ongoing, and completed — circular overview</p>
          </div>
          {myTasksData.length === 0 ? (
            <p className="followups-subheading">No tasks assigned.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={myTasksData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {myTasksData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
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
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
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
                const statusLabel = STATUS_LABELS[row.status] ?? row.status;
                const statusColor = JOB_STATUS_COLORS[row.status] ?? "#667680";
                return (
                  <tr key={`${row.board_id}:${row.card_id}`}>
                    <td>{row.id}</td>
                    <td>{row.customer || "—"}</td>
                    <td>{row.mode || "—"}</td>
                    <td>{row.type || "—"}</td>
                    <td>{row.cargo || "—"}</td>
                    <td>{row.route || "—"}</td>
                    <td>
                      <span className="job-status-badge" style={{ color: statusColor, borderColor: statusColor }}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>{row.assigned_to || "—"}</td>
                    <td className="inquiry-table-actions">
                      {ROW_ACTIONS.map((action) => (
                        <button key={action} type="button" onClick={() => handleRowAction(action, row)}>
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

      <div className="dashboard-footer">
        <button type="button" onClick={() => handlePlaceholderAction("Documentation")}>
          Documentation
        </button>
        <button type="button" onClick={() => handlePlaceholderAction("Help")}>
          Help
        </button>
        <button type="button" onClick={() => navigate("/settings")}>
          Settings
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
