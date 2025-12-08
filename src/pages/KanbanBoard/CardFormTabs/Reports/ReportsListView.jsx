import { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../components/CustomModal";
import { Modal } from "react-bootstrap";

const ReportsListView = ({ reportsList, cardColor, onViewReport, onSendReport }) => {
  const [previewReport, setPreviewReport] = useState(null);

  const handleReportClick = (report) => {
    setPreviewReport(report);
    if (onViewReport) {
      onViewReport(report);
    }
  };

  const handleClosePreview = () => {
    setPreviewReport(null);
  };

  const handleSave = () => {
    if (previewReport && onSendReport) {
      onSendReport(previewReport);
    }
  };

  return (
    <>
      <div className="reports-card-view-section">
        <div className="reports-card-view-header">
          <h3 className="reports-card-view-title">
            <span className="reports-card-view-title-bar" style={{ backgroundColor: cardColor }}></span>
            REPORTS
          </h3>
        </div>
        <div className="reports-card-grid">
          {reportsList.map((report) => (
            <div
              key={report.id}
              className="reports-card"
              onClick={() => handleReportClick(report)}
              style={{ "--card-color": cardColor }}
            >
              <div className="reports-card-header">
                <div className="reports-card-name">{report.reportName || "N/A"}</div>
              </div>
            </div>
          ))}
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
              onClick={handleSave}
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

