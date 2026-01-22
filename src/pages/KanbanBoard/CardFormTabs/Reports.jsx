import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import ReportsList from "./Reports/ReportsList";
import ViewReport from "./Reports/ViewReport";
import "../../../design/scss/operations.scss";

// Constants
const REPORT_TABS = {
  SEND_REPORT: "sendReport",
  VIEW_REPORT: "viewReport",
};

// Sub-components
const ReportTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: REPORT_TABS.SEND_REPORT, label: "Send Report" },
    { id: REPORT_TABS.VIEW_REPORT, label: "View Report" },
  ];

  return (
    <div className="operation-left">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`op-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

ReportTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

function Reports({ card, formValues, handleChange, isDAModule = false }) {
  const [activeReportTab, setActiveReportTab] = useState(REPORT_TABS.SEND_REPORT);
  const cardColor = "#00368c";

  const handleTabChange = useCallback((tab) => {
    setActiveReportTab(tab);
  }, []);

  // Get sent reports - use sentReports array if available, otherwise filter from reportsList
  const sentReports = formValues.sentReports || [];
  
  // If no sentReports array exists, filter from reportsList by status
  const displaySentReports = sentReports.length > 0 
    ? sentReports.sort((a, b) => {
        // Sort by sent date (most recent first)
        const dateA = new Date(a.sentDate || a.generatedDate || 0);
        const dateB = new Date(b.sentDate || b.generatedDate || 0);
        return dateB - dateA;
      })
    : (formValues.reportsList || []).filter((report) => report.status === "Sent");

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <ReportTabs
          activeTab={activeReportTab}
          onTabChange={handleTabChange}
        />
        <div className="operation-right">
          {activeReportTab === REPORT_TABS.SEND_REPORT && (
            <ReportsList
              formValues={formValues}
              handleChange={handleChange}
              isDAModule={isDAModule}
            />
          )}
          {activeReportTab === REPORT_TABS.VIEW_REPORT && (
            <ViewReport
              sentReports={displaySentReports}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Reports.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
  isDAModule: PropTypes.bool,
};

export default Reports;

