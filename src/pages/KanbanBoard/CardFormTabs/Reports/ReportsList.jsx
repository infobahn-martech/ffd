import { useEffect } from "react";
import PropTypes from "prop-types";
import ReportsCardView from "./ReportsCardView";

// Generate dummy reports data
const generateDummyReports = () => {
  const statuses = ["Generated", "Pending", "Failed", "In Progress"];
  const generatedBy = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Brown"];

  const reportNames = [
    "Reporting Format Report",
    "Appointment Acceptance Report",
    "Arrival Report",
    "Daily Report",
    "Departure Report",
    "Pre-arrival Report"
  ];

  const dummyReports = reportNames.map((reportName, index) => {
    const generatedDate = new Date();
    generatedDate.setDate(generatedDate.getDate() - Math.floor(Math.random() * 90));

    return {
      id: index + 1,
      reportName: reportName,
      reportType: reportName,
      generatedDate: generatedDate.toISOString().split('T')[0],
      generatedBy: generatedBy[Math.floor(Math.random() * generatedBy.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      fileSize: Math.floor(Math.random() * 5000 + 100), // KB
    };
  });

  return dummyReports;
};

const ReportsList = ({ formValues, handleChange, cardColor }) => {
  const reportsList = formValues.reportsList || [];

  // Initialize with dummy data on mount if empty
  useEffect(() => {
    if (!formValues.reportsList || formValues.reportsList.length === 0) {
      const dummyData = generateDummyReports();
      const syntheticEvent = { target: { value: dummyData } };
      handleChange("reportsList")(syntheticEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const displayReportsList = reportsList.length > 0 ? reportsList : generateDummyReports();

  const handleViewReport = (report) => {
    console.log("View report:", report);
    // TODO: Implement view functionality
  };

  const handleDownloadReport = (report) => {
    console.log("Download report:", report);
    // TODO: Implement download functionality
  };

  return (
    <div className="cardform-left-full reports-content-wrapper" style={{ "--card-color": cardColor }}>
      {/* Reports Card View */}
      <ReportsCardView
        reportsList={displayReportsList}
        cardColor={cardColor}
        onViewReport={handleViewReport}
        onDownloadReport={handleDownloadReport}
      />
    </div>
  );
};

ReportsList.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default ReportsList;

