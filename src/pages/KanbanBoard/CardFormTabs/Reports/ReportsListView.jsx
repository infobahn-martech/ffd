import { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../components/CustomModal";
import { Modal } from "react-bootstrap";

const ReportsListView = ({ reportsList, cardColor, onViewReport, onSendReport }) => {
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

  const formatFileSize = (sizeInKB) => {
    if (!sizeInKB) return '0 KB';
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    }
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('generated')) return 'status-generated';
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('failed')) return 'status-failed';
    if (statusLower.includes('progress')) return 'status-in-progress';
    return 'status-pending';
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
                    <span className="report-size">{formatFileSize(report.fileSize)}</span>
                    <span className="report-separator">•</span>
                    <span className="report-date">{formatDate(report.generatedDate)}</span>
                    {report.generatedBy && (
                      <>
                        <span className="report-separator">•</span>
                        <span className="report-generator">by {report.generatedBy}</span>
                      </>
                    )}
                    {report.status && (
                      <>
                        <span className="report-separator">•</span>
                        <span className={`report-status ${getStatusClass(report.status)}`}>
                          {report.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="report-actions">
                  <button
                    className="report-action-btn view"
                    onClick={(e) => handleViewClick(e, report)}
                    type="button"
                    title="View"
                    style={{ "--card-color": cardColor }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 3C5 3 2.73 5.11 1 8.5C2.73 11.89 5 14 9 14C13 14 15.27 11.89 17 8.5C15.27 5.11 13 3 9 3ZM9 12.5C7.07 12.5 5.5 10.93 5.5 9C5.5 7.07 7.07 5.5 9 5.5C10.93 5.5 12.5 7.07 12.5 9C12.5 10.93 10.93 12.5 9 12.5ZM9 7C8.17 7 7.5 7.67 7.5 8.5C7.5 9.33 8.17 10 9 10C9.83 10 10.5 9.33 10.5 8.5C10.5 7.67 9.83 7 9 7Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
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
        dialgName="modal-dialog modal-dialog-centered modal-lg"
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
              <>
                <div className="reports-preview-info-section">
                  <div className="reports-preview-info-row">
                    <span className="reports-preview-label">Report Name:</span>
                    <span className="reports-preview-value">{previewReport.reportName || "N/A"}</span>
                  </div>
                  <div className="reports-preview-info-row">
                    <span className="reports-preview-label">Generated Date:</span>
                    <span className="reports-preview-value">{formatDate(previewReport.generatedDate)}</span>
                  </div>
                  {previewReport.generatedBy && (
                    <div className="reports-preview-info-row">
                      <span className="reports-preview-label">Generated By:</span>
                      <span className="reports-preview-value">{previewReport.generatedBy}</span>
                    </div>
                  )}
                  {previewReport.status && (
                    <div className="reports-preview-info-row">
                      <span className="reports-preview-label">Status:</span>
                      <span className={`reports-preview-value reports-preview-status ${getStatusClass(previewReport.status)}`}>
                        {previewReport.status}
                      </span>
                    </div>
                  )}
                  {previewReport.fileSize && (
                    <div className="reports-preview-info-row">
                      <span className="reports-preview-label">File Size:</span>
                      <span className="reports-preview-value">{formatFileSize(previewReport.fileSize)}</span>
                    </div>
                  )}
                </div>
                <div className="reports-preview-pdf-container">
                  <div className="pdf-document">
                    <div className="pdf-tab">
                      <span className="pdf-tab-text">PDF</span>
                    </div>
                    <div className="pdf-content">
                      <div className="pdf-line pdf-line-1"></div>
                      <div className="pdf-line pdf-line-2"></div>
                      <div className="pdf-line pdf-line-3"></div>
                      <div className="pdf-line pdf-line-4"></div>
                      <div className="pdf-line pdf-line-5"></div>
                      <div className="pdf-line pdf-line-6"></div>
                    </div>
                  </div>
                </div>
              </>
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
};

export default ReportsListView;

