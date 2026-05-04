import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import CustomModal from "../../../../../components/CustomModal";
import reportsService from "../../../../../services/reportsService";
import "../../../../../design/scss/attachments.scss";
import "../../../../../design/scss/operations.scss";

const mapReportRow = (raw, index) => ({
  id: raw.email_log_id ?? raw.emailLogId ?? `report-${index}`,
  reportType: String(raw.report_type ?? raw.reportType ?? "").trim() || "Other",
  reportTypeId: raw.report_type_id ?? raw.reportTypeId,
  subject: String(raw.subject ?? "").trim(),
  body: raw.body != null ? String(raw.body) : "",
  fromEmail: String(raw.from_email ?? raw.fromEmail ?? "").trim(),
  toEmail: String(raw.to_email ?? raw.toEmail ?? "").trim(),
  ccEmails: raw.cc_emails ?? raw.ccEmails ?? "",
  createdAt: raw.created_at ?? raw.createdAt ?? "",
  createdBy: String(raw.created_by ?? raw.createdBy ?? "").trim(),
});

const extractReportsArray = (body) => {
  if (!body || typeof body !== "object") return [];
  const data = body.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.reports)) {
    return data.reports;
  }
  if (Array.isArray(body.reports)) {
    return body.reports;
  }
  return [];
};

const formatCcDisplay = (cc) => {
  if (cc == null || cc === "") return "";
  if (Array.isArray(cc)) return cc.filter(Boolean).join(", ");
  return String(cc);
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const normalized =
    typeof dateString === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(dateString)
      ? dateString.replace(" ", "T")
      : dateString;
  const date = new Date(/** @type {string|number|Date} */ (normalized));
  if (Number.isNaN(date.getTime())) return "N/A";
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${month} ${day}, ${year}, ${time}`;
};

const sanitizeFilename = (name) => {
  const base = name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").trim() || "report";
  return base.slice(0, 120);
};

const ReportIcon = () => (
  <div className="file-icon-default">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#2563EB" />
      <path
        d="M8 10h16M8 16h12M8 22h14"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const ReportRow = ({ report, cardColor, onView, onDownload }) => {
  const title = report.subject || report.reportType || "Report";
  const ccStr = formatCcDisplay(report.ccEmails);
  const metaParts = [
    formatDateTime(report.createdAt),
    report.createdBy ? `by ${report.createdBy}` : null,
    report.fromEmail ? `From ${report.fromEmail}` : null,
    report.toEmail ? `To ${report.toEmail}` : null,
    ccStr ? `CC ${ccStr}` : null,
  ].filter(Boolean);

  return (
    <div className="attachment-item">
      <div className="attachment-icon-wrapper">
        <ReportIcon />
      </div>
      <div className="attachment-details">
        <div className="attachment-name">{title}</div>
        <div className="attachment-meta">
          {metaParts.map((part, i) => (
            <span key={`${part}-${i}`}>
              {i > 0 ? <span className="attachment-separator">•</span> : null}
              <span className="attachment-date">{part}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="attachment-actions">
        <button
          type="button"
          className="attachment-action-btn view"
          title="View report"
          style={{ "--card-color": cardColor }}
          onClick={() => onView(report)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 4C5 4 2.27 6.11 1 9C2.27 11.89 5 14 9 14C13 14 15.73 11.89 17 9C15.73 6.11 13 4 9 4Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <button
          type="button"
          className="attachment-action-btn download"
          title="Download body as HTML"
          style={{ "--card-color": cardColor }}
          onClick={() => onDownload(report)}
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
      </div>
    </div>
  );
};

ReportRow.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reportType: PropTypes.string,
    subject: PropTypes.string,
    body: PropTypes.string,
    fromEmail: PropTypes.string,
    toEmail: PropTypes.string,
    ccEmails: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    createdAt: PropTypes.string,
    createdBy: PropTypes.string,
  }).isRequired,
  cardColor: PropTypes.string,
  onView: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

const bodyLooksLikeHtml = (text) => /<[a-z][\s\S]*>/i.test(text);

function Reports({ card, formValues }) {
  const cardColor = card?.color || "#2A00FF";

  const callId = useMemo(() => {
    const raw = card?.call_id ?? formValues?.call_id ?? card?.callId;
    if (raw === undefined || raw === null) return "";
    return String(raw).trim();
  }, [card?.call_id, card?.callId, formValues?.call_id]);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!callId) {
      setReports([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    reportsService
      .getReports(callId)
      .then((res) => {
        if (cancelled) return;
        const body = res?.data;
        if (body?.status !== true) {
          setReports([]);
          setError(body?.message || "Failed to load reports.");
          return;
        }
        const rawList = extractReportsArray(body);
        setReports(rawList.map((row, i) => mapReportRow(row && typeof row === "object" ? row : {}, i)));
      })
      .catch((err) => {
        if (cancelled) return;
        setReports([]);
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load reports."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [callId]);

  const groupedByType = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      const key = r.reportType || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
      });
    });
    return map;
  }, [reports]);

  const categoryKeys = useMemo(() => Object.keys(groupedByType).sort((a, b) => a.localeCompare(b)), [groupedByType]);

  const handleDownload = (report) => {
    const html = report.body || "";
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(report.subject || report.reportType || "report")}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cardform-body">
      <div className="cardform-left-full attachments-content-wrapper" style={{ "--card-color": cardColor }}>
        <div className="attachments-list-header">
          <h3 className="attachments-list-title">
            <span className="attachments-list-title-bar" />
            REPORT LIST
          </h3>
        </div>
        {!callId ? (
          <div className="cf-empty-row">
            <p>No call identifier available for reports.</p>
          </div>
        ) : loading ? (
          <div className="cf-empty-row">
            <p>Loading reports…</p>
          </div>
        ) : error ? (
          <div className="cf-empty-row">
            <p>{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="cf-empty-row">
            <p>No reports available.</p>
          </div>
        ) : (
          <div className="attachments-list">
            <div className="attachments-categories">
              {categoryKeys.map((category) => {
                const items = groupedByType[category];
                if (!items?.length) return null;
                return (
                  <div className="attachment-category" key={category}>
                    <div className="attachment-category-header">
                      <h4 className="attachment-category-label">{category}</h4>
                      <span className="attachment-category-count">({items.length})</span>
                    </div>
                    <div className="attachments-items">
                      {items.map((report) => (
                        <ReportRow
                          key={report.id}
                          report={report}
                          cardColor={cardColor}
                          onView={setPreview}
                          onDownload={handleDownload}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CustomModal
        className="reports-preview-modal"
        dialgName="modal-dialog modal-dialog-centered modal-lg"
        show={!!preview}
        closeModal={() => setPreview(null)}
        header={
          <div className="reports-preview-modal-header">
            <h3 className="reports-preview-modal-title">
              <span className="reports-preview-modal-title-bar" style={{ backgroundColor: cardColor }} />
              {preview?.subject || preview?.reportType || "Report"}
            </h3>
          </div>
        }
        body={
          preview ? (
            <div className="reports-email-detail" style={{ padding: "8px 4px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ fontSize: 13, color: "#444", marginBottom: 12, display: "grid", gap: 6 }}>
                {preview.reportType ? (
                  <div>
                    <strong>Type:</strong> {preview.reportType}
                  </div>
                ) : null}
                {preview.fromEmail ? (
                  <div>
                    <strong>From:</strong> {preview.fromEmail}
                  </div>
                ) : null}
                {preview.toEmail ? (
                  <div>
                    <strong>To:</strong> {preview.toEmail}
                  </div>
                ) : null}
                {formatCcDisplay(preview.ccEmails) ? (
                  <div>
                    <strong>CC:</strong> {formatCcDisplay(preview.ccEmails)}
                  </div>
                ) : null}
                <div>
                  <strong>Sent:</strong> {formatDateTime(preview.createdAt)}
                  {preview.createdBy ? ` · ${preview.createdBy}` : ""}
                </div>
              </div>
              <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
                {bodyLooksLikeHtml(preview.body) ? (
                  <div className="reports-email-body-html" dangerouslySetInnerHTML={{ __html: preview.body }} />
                ) : (
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 13,
                      fontFamily: "inherit",
                    }}
                  >
                    {preview.body || "—"}
                  </pre>
                )}
              </div>
            </div>
          ) : null
        }
        footer={
          <Modal.Footer className="reports-preview-modal-footer">
            <button type="button" className="reports-preview-modal-btn secondary" onClick={() => setPreview(null)}>
              Close
            </button>
            {preview ? (
              <button
                type="button"
                className="reports-preview-modal-btn primary"
                style={{ backgroundColor: cardColor }}
                onClick={() => {
                  handleDownload(preview);
                }}
              >
                Download
              </button>
            ) : null}
          </Modal.Footer>
        }
        createModal
        bodyClassname="reports-preview-modal-body"
      />
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
