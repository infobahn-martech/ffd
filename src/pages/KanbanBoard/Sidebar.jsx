import React, { useState } from "react";
import "../assets/styles/Sidebar.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

// Import icons
import InboxIcon from "../assets/images/Inbox.svg";
import GroupIcon from "../assets/images/Group.svg";
import CalendarIcon from "../assets/images/Calendar.svg";
import AnalyticsIcon from "../assets/images/analytics 1.svg";
import ReportsIcon from "../assets/images/Reports.svg";
import SettingsIcon from "../assets/images/Settings.svg";

const icons = [
  { id: 1, icon: GroupIcon, label: "Add" },
  { id: 2, icon: AnalyticsIcon, label: "Analytics" },
  { id: 3, icon: InboxIcon, label: "Inbox" },
  { id: 4, icon: CalendarIcon, label: "Calendar" },
  { id: 5, icon: ReportsIcon, label: "Reports" },
  { id: 6, icon: SettingsIcon, label: "Settings" },
];

export default function Sidebar() {
  const [active, setActive] = useState(2); // Default active: Analytics

  return (
    <aside className="sidebar">
      {icons.map((item) => (
        <div
          key={item.id}
          className={`sidebar-icon ${active === item.id ? "active" : ""}`}
          onClick={() => setActive(item.id)}
          data-tooltip-id="sidebar-tooltip"
          data-tooltip-content={item.label}
        >
          <img src={item.icon} alt={item.label} />
        </div>
      ))}
      <Tooltip
        id="sidebar-tooltip"
        place="right"
        style={{
          backgroundColor: "#333",
          color: "#fff",
          fontSize: "0.85rem",
          borderRadius: "6px",
          padding: "6px 10px",
        }}
      />
    </aside>
  );
}
