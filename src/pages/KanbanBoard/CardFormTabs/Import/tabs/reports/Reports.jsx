import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiMail, FiSend, FiUser, FiCalendar, FiFileText, FiInbox } from "react-icons/fi";
import reportsService from "../../../../../../services/reportsService";
import "../../../../../../design/scss/operations.scss";

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

const TYPE_TAG_COLORS = ["#00368C", "#0E7C7B", "#8552C6", "#C25E2E", "#2E7D32", "#B23B6B"];

const getTypeTagColor = (type) => {
  const source = type || "?";
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TYPE_TAG_COLORS[Math.abs(hash) % TYPE_TAG_COLORS.length];
};

const ReportDocRow = ({ report, accentColor, onDownload }) => {
  const title = report.subject || report.reportType || "Report";
  const ccStr = formatCcDisplay(report.ccEmails);

  return (
    <div className="reports-doc-row">
      <div className="reports-doc-icon" style={{ background: accentColor }}>
        <FiFileText size={16} />
      </div>
      <div className="reports-doc-content">
        <p className="reports-doc-title" title={title}>
          {title}
        </p>
        <div className="reports-doc-meta">
          <span className="reports-doc-meta-item">
            <FiCalendar size={11} />
            <span className="reports-doc-meta-text">
              {formatDateTime(report.createdAt)}
              {report.createdBy ? ` · ${report.createdBy}` : ""}
            </span>
          </span>
          {report.fromEmail ? (
            <span className="reports-doc-meta-item">
              <FiSend size={11} />
              <span className="reports-doc-meta-text" title={report.fromEmail}>
                {report.fromEmail}
              </span>
            </span>
          ) : null}
          {report.toEmail ? (
            <span className="reports-doc-meta-item">
              <FiUser size={11} />
              <span className="reports-doc-meta-text" title={report.toEmail}>
                {report.toEmail}
              </span>
            </span>
          ) : null}
          {ccStr ? (
            <span className="reports-doc-meta-item">
              <FiMail size={11} />
              <span className="reports-doc-meta-text" title={ccStr}>
                CC {ccStr}
              </span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="reports-doc-actions">
        <button
          type="button"
          className="reports-doc-action-btn"
          onClick={() => onDownload(report)}
          title="Download body as HTML"
          aria-label="Download report"
        >
          <FiDownload size={14} />
        </button>
      </div>
    </div>
  );
};

ReportDocRow.propTypes = {
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
  accentColor: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
};

const ReportsEmptyState = ({ message }) => (
  <div className="reports-empty-state">
    <span className="reports-empty-state-icon">
      <FiInbox size={26} />
    </span>
    <p className="reports-empty-state-text">{message}</p>
  </div>
);

ReportsEmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

const ReportsSkeleton = () => (
  <>
    {[0, 1].map((cardIdx) => (
      <div className="reports-section-card reports-skeleton-card" key={cardIdx} aria-hidden="true">
        <div className="reports-section-header">
          <span className="reports-skeleton-bar reports-skeleton-bar--label" />
          <span className="reports-skeleton-bar reports-skeleton-bar--count" />
        </div>
        <div className="reports-doc-list">
          {[0, 1].map((rowIdx) => (
            <div className="reports-doc-row" key={rowIdx}>
              <span className="reports-skeleton-icon" />
              <div className="reports-doc-content">
                <span className="reports-skeleton-bar reports-skeleton-bar--title" />
                <span className="reports-skeleton-bar reports-skeleton-bar--meta" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </>
);

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
      <div className="cardform-left-full reports-view" style={{ "--card-color": cardColor }}>
        {!callId ? (
          <ReportsEmptyState message="No call identifier available for reports." />
        ) : loading ? (
          <ReportsSkeleton />
        ) : error ? (
          <ReportsEmptyState message={error} />
        ) : reports.length === 0 ? (
          <ReportsEmptyState message="No reports available." />
        ) : (
          categoryKeys.map((category) => {
            const items = groupedByType[category];
            if (!items?.length) return null;
            const accentColor = getTypeTagColor(category);
            return (
              <div className="reports-section-card" key={category}>
                <div className="reports-section-header">
                  <h4 className="reports-section-label">{category}</h4>
                  <span className="reports-section-count">{items.length}</span>
                </div>
                <div className="reports-doc-list">
                  {items.map((report) => (
                    <ReportDocRow
                      key={report.id}
                      report={report}
                      accentColor={accentColor}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
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
