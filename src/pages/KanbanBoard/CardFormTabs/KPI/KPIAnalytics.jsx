import { useMemo } from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const KPIAnalytics = ({ kpiData, cardColor }) => {
  // Calculate data for pie chart (KPI performance distribution)
  const performanceData = useMemo(() => {
    const performanceCounts = {
      "On Target": 0,
      "Above Target": 0,
      "Below Target": 0,
      "Critical": 0,
    };

    kpiData.forEach((kpi) => {
      if (kpi.performance && Object.prototype.hasOwnProperty.call(performanceCounts, kpi.performance)) {
        performanceCounts[kpi.performance]++;
      }
    });

    return Object.entries(performanceCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [kpiData]);

  // Calculate data for bar chart (KPIs by category)
  const categoryData = useMemo(() => {
    // Define the order of categories - all 9 categories must be shown
    const categoryOrder = [
      "Appointment Acceptance",
      "Call file open",
      "Pre arrival report",
      "Arrival report",
      "Vessel inward formalities",
      "Daily report",
      "Outward clearance issue",
      "Outward clearance deliver",
      "Sailing Report"
    ];

    // Initialize all categories with 0 count
    const categoryCounts = {};
    categoryOrder.forEach((cat) => {
      categoryCounts[cat] = 0;
    });

    // Count KPIs for each category
    kpiData.forEach((kpi) => {
      const category = kpi.category || "Other";
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    // Ensure minimum count of 1 for all categories
    categoryOrder.forEach((cat) => {
      if (categoryCounts[cat] === 0) {
        categoryCounts[cat] = 1;
      }
    });

    // Return all categories in the specified order
    return categoryOrder.map((name) => ({
      name: name.length > 20 ? name.substring(0, 20) + "..." : name,
      fullName: name,
      value: categoryCounts[name] || 0,
    }));
  }, [kpiData]);


  // Color palette based on card color
  const COLORS = [
    cardColor || "#2A00FF",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const performanceColors = {
    "On Target": "#10b981",
    "Above Target": "#06b6d4",
    "Below Target": "#f59e0b",
    "Critical": "#ef4444",
  };

  return (
    <div className="kpi-analytics-section">
      <style>{`
        .kpi-analytics-chart-container *:focus,
        .kpi-analytics-chart-wrapper *:focus,
        .kpi-analytics-chart-container svg:focus,
        .kpi-analytics-chart-wrapper svg:focus,
        .kpi-analytics-chart-container svg *:focus,
        .kpi-analytics-chart-wrapper svg *:focus {
          outline: none !important;
          border: none !important;
        }
      `}</style>
      <div className="kpi-analytics-header">
        <h3 className="kpi-analytics-title">
          <span className="kpi-analytics-title-bar"></span>
          ANALYTICS
        </h3>
      </div>
      <div className="kpi-analytics-content">
        {/* Pie Chart - Performance Distribution */}
        <div className="kpi-analytics-chart-container">
          <div className="kpi-analytics-chart-wrapper">
            <h4 className="kpi-analytics-chart-title">Performance Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={performanceColors[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - KPIs by Category */}
        <div className="kpi-analytics-chart-container">
          <div className="kpi-analytics-chart-wrapper">
            <h4 className="kpi-analytics-chart-title">KPIs by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
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
                    const item = categoryData.find((d) => d.name === label);
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

KPIAnalytics.propTypes = {
  kpiData: PropTypes.array.isRequired,
  cardColor: PropTypes.string,
};

export default KPIAnalytics;

