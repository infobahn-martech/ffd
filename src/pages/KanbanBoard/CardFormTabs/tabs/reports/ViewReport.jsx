import PropTypes from "prop-types";

// Generate dummy sent reports data
const generateDummySentReports = () => {
  const recipients = [
    "operations@maritime.com",
    "manager@shipping.com",
    "admin@portservices.com",
    "reports@logistics.com",
    "info@vesselmanagement.com"
  ];

  const generatedBy = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Brown"];

  const reportNames = [
    "Pre-arrival Report",
    "Arrival Report",
    "Departure Report",
    "Daily Report",
    "Appointment Acceptance Report",
    "Reporting Format Report"
  ];

  const dummyReports = reportNames.map((reportName, index) => {
    const sentDate = new Date();
    sentDate.setDate(sentDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
    sentDate.setHours(Math.floor(Math.random() * 24));
    sentDate.setMinutes(Math.floor(Math.random() * 60));

    return {
      id: `sent-${index + 1}`,
      reportName: reportName,
      reportType: reportName,
      sentDate: sentDate.toISOString(),
      generatedDate: sentDate.toISOString(),
      generatedBy: generatedBy[Math.floor(Math.random() * generatedBy.length)],
      sentTo: recipients[Math.floor(Math.random() * recipients.length)],
      status: "Sent",
      fileSize: Math.floor(Math.random() * 5000 + 100), // KB
    };
  });

  // Sort by sent date (most recent first)
  return dummyReports.sort((a, b) => {
    const dateA = new Date(a.sentDate);
    const dateB = new Date(b.sentDate);
    return dateB - dateA;
  });
};

const ViewReport = ({ sentReports = [] }) => {
  const cardColor = "#00368c";

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${year} at ${hours}:${minutes}`;
  };

  // Use dummy data if no sent reports
  const displaySentReports = sentReports.length > 0 ? sentReports : generateDummySentReports();

  return (
    <div className="cardform-left-full view-report-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="view-report-section">
        <div className="view-report-header">
          <h3 className="view-report-title">
            <span className="view-report-title-bar" style={{ backgroundColor: cardColor }}></span>
            SENT REPORTS
          </h3>
        </div>
        <div className="view-report-activity-log">
          {displaySentReports.length === 0 ? (
            <div className="cf-empty-row">
              <p>No reports have been sent yet.</p>
            </div>
          ) : (
            <div className="activity-log-list">
              {displaySentReports.map((report, index) => (
                <div key={report.id || index} className="activity-log-item">
                  <div className="activity-log-timeline">
                    <div className="activity-log-dot" style={{ backgroundColor: cardColor }}></div>
                    {index < displaySentReports.length - 1 && (
                      <div className="activity-log-line"></div>
                    )}
                  </div>
                  <div className="activity-log-content">
                    <div className="activity-log-header">
                      <div className="activity-log-title">
                        <span className="activity-log-report-name">{report.reportName || "N/A"}</span>
                        <span className="activity-log-status sent">Sent</span>
                      </div>
                      <div className="activity-log-date">{formatDate(report.sentDate || report.generatedDate)}</div>
                    </div>
                    <div className="activity-log-details">
                      <div className="activity-log-meta">
                        {report.sentTo && (
                          <span className="activity-log-meta-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M2 4L8 8L14 4M2 4H14M2 4V12C2 12.5304 2.21071 13.0391 2.58579 13.4142C2.96086 13.7893 3.46957 14 4 14H12C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12V4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            To: {report.sentTo}
                          </span>
                        )}
                        {report.generatedBy && (
                          <span className="activity-log-meta-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 14C2 11.7909 4.79086 10 8 10C11.2091 10 14 11.7909 14 14"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            By: {report.generatedBy}
                          </span>
                        )}
                        {report.fileSize && (
                          <span className="activity-log-meta-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M5.33333 2H10.6667L14 5.33333V13.3333C14 13.687 13.8595 14.0261 13.6095 14.2761C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.687 2 13.3333V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H5.33333Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 2V5.33333H14"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {report.fileSize} KB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ViewReport.propTypes = {
  sentReports: PropTypes.array,
};

export default ViewReport;

