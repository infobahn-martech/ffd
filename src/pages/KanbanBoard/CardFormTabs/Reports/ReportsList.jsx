import { useEffect } from "react";
import PropTypes from "prop-types";
import ReportsListView from "./ReportsListView";

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

const ReportsList = ({ formValues, handleChange }) => {
  const cardColor = "#00368c";
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
    // Modal is handled by ReportsListView component
  };

  const handleSaveReport = (report) => {
    console.log("Sending report:", report);
    
    // Create sent report object
    const sentReport = {
      ...report,
      status: "Sent",
      sentDate: new Date().toISOString(),
      sentTo: report.sentTo || "Default Recipient", // You can customize this
    };

    // Get current sent reports
    const currentSentReports = formValues.sentReports || [];
    
    // Check if report already exists in sent reports (by id)
    const existingIndex = currentSentReports.findIndex((r) => r.id === report.id);
    
    let updatedSentReports;
    if (existingIndex >= 0) {
      // Update existing sent report
      updatedSentReports = [...currentSentReports];
      updatedSentReports[existingIndex] = sentReport;
    } else {
      // Add new sent report
      updatedSentReports = [...currentSentReports, sentReport];
    }

    // Update form values
    const syntheticEvent = { target: { value: updatedSentReports } };
    handleChange("sentReports")(syntheticEvent);

    // Show success message
    alert(`Report "${report.reportName}" has been sent successfully!`);
  };

  const handleDownloadReport = (report) => {
    console.log("Download report:", report);
    // TODO: Implement download functionality
    alert(`Downloading report: ${report.reportName}`);
  };

  return (
    <div className="cardform-left-full reports-content-wrapper" style={{ "--card-color": cardColor }}>
      {/* Reports List View */}
      <ReportsListView
        reportsList={displayReportsList}
        cardColor={cardColor}
        onViewReport={handleViewReport}
        onSendReport={handleSaveReport}
        onDownloadReport={handleDownloadReport}
      />
    </div>
  );
};

ReportsList.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default ReportsList;

