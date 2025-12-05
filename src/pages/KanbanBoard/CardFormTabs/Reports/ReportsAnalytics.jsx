import { useMemo } from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const ReportsAnalytics = ({ reportsList, cardColor }) => {
  // Calculate data for pie chart (status distribution)
  const statusData = useMemo(() => {
    const statusCounts = {
      Generated: 0,
      Pending: 0,
      Failed: 0,
      "In Progress": 0,
    };

    reportsList.forEach((report) => {
      if (report.status && Object.prototype.hasOwnProperty.call(statusCounts, report.status)) {
        statusCounts[report.status]++;
      }
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [reportsList]);

  // Calculate data for bar chart (reports by type)
  const typeData = useMemo(() => {
    const typeCounts = {};

    reportsList.forEach((report) => {
      const type = report.reportType || "Other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([name, value]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        fullName: name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 report types
  }, [reportsList]);

  // Color palette based on card color
  const COLORS = [
    cardColor || "#2A00FF",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const statusColors = {
    Generated: "#10b981",
    Pending: "#f59e0b",
    Failed: "#ef4444",
    "In Progress": "#8b5cf6",
  };

  return (
    <div className="reports-analytics-section">
      <div className="reports-analytics-header">
        <h3 className="reports-analytics-title">
          <span className="reports-analytics-title-bar"></span>
          ANALYTICS
        </h3>
      </div>
      <div className="reports-analytics-content">
        {/* Pie Chart - Status Distribution */}
        <div className="reports-analytics-chart-container">
          <div className="reports-analytics-chart-wrapper">
            <h4 className="reports-analytics-chart-title">Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Reports by Type */}
        <div className="reports-analytics-chart-container">
          <div className="reports-analytics-chart-wrapper">
            <h4 className="reports-analytics-chart-title">Reports by Type</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [value, "Count"]}
                  labelFormatter={(label) => {
                    const item = typeData.find((d) => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill={cardColor || "#2A00FF"} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

ReportsAnalytics.propTypes = {
  reportsList: PropTypes.array.isRequired,
  cardColor: PropTypes.string,
};

export default ReportsAnalytics;

