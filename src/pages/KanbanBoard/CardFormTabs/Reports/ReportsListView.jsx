import { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../components/CustomModal";
import { Modal } from "react-bootstrap";

const ReportsListView = ({ reportsList, cardColor, onViewReport, onSendReport, onDownloadReport }) => {
  const [previewReport, setPreviewReport] = useState(null);

  const handleViewClick = (e, report) => {
    e.stopPropagation();
    setPreviewReport(report);
    if (onViewReport) {
      onViewReport(report);
    }
  };

  const handleSendClick = (e, report) => {
    e.stopPropagation();
    if (onSendReport) {
      onSendReport(report);
    }
  };

  const handleDownloadClick = (e, report) => {
    e.stopPropagation();
    if (onDownloadReport) {
      onDownloadReport(report);
    }
  };

  const handleClosePreview = () => {
    setPreviewReport(null);
  };

  const handleSendFromModal = () => {
    if (previewReport && onSendReport) {
      onSendReport(previewReport);
      setPreviewReport(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <>
      <div className="reports-list-view-section">
        <div className="reports-list-view-header">
          <h3 className="reports-list-view-title">
            <span className="reports-list-view-title-bar" style={{ backgroundColor: cardColor }}></span>
            REPORTS
          </h3>
        </div>
        <div className="reports-list-items">
          {reportsList.length === 0 ? (
            <div className="cf-empty-row">
              <p>No reports available.</p>
            </div>
          ) : (
            reportsList.map((report) => (
              <div
                key={report.id}
                className="report-item"
                style={{ "--card-color": cardColor }}
              >
                <div className="report-icon-wrapper">
                  <div className="report-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="32" height="32" rx="6" fill="#DC2626" />
                      <text x="16" y="22" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">PDF</text>
                    </svg>
                  </div>
                </div>
                <div className="report-details">
                  <div className="report-name">{report.reportName || "N/A"}</div>
                  <div className="report-meta">
                    <span className="report-date">{formatDate(report.generatedDate)}</span>
                    {report.generatedBy && (
                      <>
                        <span className="report-separator">•</span>
                        <span className="report-generator">by {report.generatedBy}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="report-actions">
                  <button
                    className="report-action-btn generate"
                    onClick={(e) => handleViewClick(e, report)}
                    type="button"
                    title="Generate"
                    style={{ "--card-color": cardColor }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 4.5L14.25 2.25L12 0"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M0 9C0 12.7279 3.27208 16 7 16H14.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 13.5L3.75 15.75L6 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.25 2H7C3.27208 2 0 5.27208 0 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="report-action-btn download"
                    onClick={(e) => handleDownloadClick(e, report)}
                    type="button"
                    title="Download"
                    style={{ "--card-color": cardColor }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 12V3M9 12L6 9M9 12L12 9M3 15H15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="report-action-btn send"
                    onClick={(e) => handleSendClick(e, report)}
                    type="button"
                    title="Send"
                    style={{ "--card-color": cardColor }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15.75 2.25L8.25 9.75M15.75 2.25L12 15.75L8.25 9.75M15.75 2.25L2.25 6L8.25 9.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <CustomModal
        className="reports-preview-modal"
        dialgName="modal-dialog modal-dialog-centered reports-preview-modal-dialog"
        show={!!previewReport}
        closeModal={handleClosePreview}
        header={
          <div className="reports-preview-modal-header">
            <h3 className="reports-preview-modal-title">
              <span className="reports-preview-modal-title-bar" style={{ backgroundColor: cardColor }}></span>
              PREVIEW: {previewReport?.reportName || ""}
            </h3>
          </div>
        }
        body={
          <div className="reports-preview-content">
            {previewReport && (
              <div className="reports-preview-pdf-container">
                <div className="pdf-document-template">
                  <div className="pdf-badge">PDF</div>
                  <div className="pdf-folded-corner"></div>
                  <div className="pdf-content-template">
                    <div className="pdf-line pdf-line-1"></div>
                    <div className="pdf-line pdf-line-2"></div>
                    <div className="pdf-line pdf-line-3"></div>
                    <div className="pdf-line pdf-line-4"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        footer={
          <Modal.Footer className="reports-preview-modal-footer">
            <button
              type="button"
              className="reports-preview-modal-btn secondary"
              onClick={handleClosePreview}
            >
              Close
            </button>
            <button
              type="button"
              className="reports-preview-modal-btn primary"
              onClick={handleSendFromModal}
              style={{ backgroundColor: cardColor }}
            >
              Send
            </button>
          </Modal.Footer>
        }
        createModal={true}
        bodyClassname="reports-preview-modal-body"
      />
    </>
  );
};

ReportsListView.propTypes = {
  reportsList: PropTypes.array.isRequired,
  cardColor: PropTypes.string,
  onViewReport: PropTypes.func,
  onSendReport: PropTypes.func,
  onDownloadReport: PropTypes.func,
};

export default ReportsListView;

