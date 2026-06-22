import PropTypes from "prop-types";

const formatDisplayDate = (isoDate) => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return d && m && y ? `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}` : isoDate;
};

const formatDisplayTime = (time) => {
  if (!time) return "";
  const [h, min] = (time || "").split(":");
  if (!h) return time;
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${(min || "00").padStart(2, "0")} ${ampm}`;
};

/** MWP Board card view: Application No, Application Submitted, SADAD No, Approved, Issued, MWP copy, Expiry */
function MWPCardView({ card }) {
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const applicationNo = card?.applicationNo ?? "MWP-2025-0001";
  const applicationSubmittedDate = card?.applicationSubmittedDate ?? "2024-01-15";
  const applicationSubmittedTime = card?.applicationSubmittedTime ?? "10:30";
  const sadadNo = card?.sadadNo ?? "SADAD-123456";
  const approvedDate = card?.approvedDate ?? "2024-01-18";
  const approvedTime = card?.approvedTime ?? "14:00";
  const issuedDate = card?.issuedDate ?? "2024-01-20";
  const issuedTime = card?.issuedTime ?? "09:15";
  const mwpCopyFiles =
    Array.isArray(card?.mwpCopy) && card.mwpCopy.length > 0
      ? card.mwpCopy
      : [{ name: "mwp_copy.pdf", size: 1024000 }];
  const expiryDate = card?.expiryDate ?? "2025-01-20";
  const expiryTime = card?.expiryTime ?? "23:59";

  const FormField = ({ label, children }) => (
    <div className="mwp-field">
      {label && <label className="mwp-field-label">{label}</label>}
      {children}
    </div>
  );

  const DateTimeDisplay = ({ dateValue, timeValue }) => (
    <div className="mwp-datetime">
      <span className="mwp-datetime-date">{formatDisplayDate(dateValue)}</span>
      <span className="mwp-datetime-time">{formatDisplayTime(timeValue)}</span>
    </div>
  );

  const CounterCard = ({ label, value }) => (
    <div className="driver-card-counter">
      <div className="driver-card-counter-label">{label}</div>
      <div className="driver-card-counter-value">{value}</div>
    </div>
  );

  const billingEntity = card?.user ?? "—";
  const expiryDisplay = `${formatDisplayDate(expiryDate)} ${formatDisplayTime(expiryTime)}`;

  return (
    <div className="mwp-card-view">
      <div className="driver-card-counters">
        <CounterCard label="Billing Entity" value={billingEntity} />
        <CounterCard label="Application No" value={applicationNo} />
        <CounterCard label="SADAD No" value={sadadNo} />
        <CounterCard label="Expiry" value={expiryDisplay} />
      </div>
      <div className="mwp-card-view-grid">
        <div className="mwp-section">
          <h3 className="mwp-section-title">Application</h3>
          <FormField label="Application No.">
            <div className="mwp-value">{applicationNo}</div>
          </FormField>
          <FormField label="Application Submitted">
            <DateTimeDisplay dateValue={applicationSubmittedDate} timeValue={applicationSubmittedTime} />
          </FormField>
          <FormField label="SADAD No.">
            <div className="mwp-value">{sadadNo}</div>
          </FormField>
        </div>
        <div className="mwp-section">
          <h3 className="mwp-section-title">Status & Dates</h3>
          <FormField label="Approved">
            <DateTimeDisplay dateValue={approvedDate} timeValue={approvedTime} />
          </FormField>
          <FormField label="Issued">
            <DateTimeDisplay dateValue={issuedDate} timeValue={issuedTime} />
          </FormField>
          <FormField label="Expiry">
            <DateTimeDisplay dateValue={expiryDate} timeValue={expiryTime} />
          </FormField>
        </div>
      </div>
      <div className="mwp-section mwp-section-full">
        <h3 className="mwp-section-title">Document</h3>
        <FormField label="MWP copy">
          <div className="mwp-file-preview">
            {mwpCopyFiles.map((file, index) => (
              <div key={index} className="mwp-file-preview-item">
                <div className="mwp-file-preview-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mwp-file-preview-info">
                  <span className="mwp-file-preview-name">{file.name || file}</span>
                  <span className="mwp-file-preview-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  );
}

MWPCardView.propTypes = {
  card: PropTypes.object,
};

export default MWPCardView;
