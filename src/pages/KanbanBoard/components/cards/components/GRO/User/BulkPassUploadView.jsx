import PropTypes from "prop-types";
import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";

const PASS_META = {
  cg: {
    title: "Bulk Upload CG Pass",
    submitLabel: "Upload CG Pass",
  },
  zawil: {
    title: "Bulk Upload Zawil Pass",
    submitLabel: "Upload Zawil Pass",
  },
};

const PREVIEW_VESSEL_NAME = "MAG CLIO";
const PREVIEW_DATE = "2026/06/10";

const HANDWRITING_LABELS = ["Zawil No", "Iqama/Passport No", "Nationality", "Name"];

const EDITABLE_FIELDS = [
  { key: "crewName", label: "Crew Name" },
  { key: "nationality", label: "Nationality" },
  { key: "passportIqama", label: "Passport / Iqama No" },
  { key: "zawilNo", label: "Zawil No" },
];

export default function BulkPassUploadView({ passType, rows, onRowsChange, onBack, onSubmit }) {
  const meta = PASS_META[passType] ?? PASS_META.cg;

  const handleFieldChange = (rowId, field, value) => {
    onRowsChange(
      rows.map((row) => (String(row.id) === String(rowId) ? { ...row, [field]: value } : row))
    );
  };

  return (
    <div className="gro-crew-immigration-bulk">
      <div className="gro-crew-immigration-bulk-header">
        <button type="button" className="gro-crew-immigration-bulk-back" onClick={onBack}>
          <FiArrowLeft className="gro-crew-immigration-bulk-back-icon" />
          Back
        </button>
        <h3 className="gro-crew-immigration-bulk-heading">{meta.title}</h3>
      </div>

      <div className="gro-crew-immigration-bulk-body">
        <div className="gro-crew-immigration-bulk-left">
          <p className="gro-crew-immigration-bulk-section-title">Crew Details</p>
          <div className="gro-crew-immigration-bulk-table-wrap">
            <table className="gro-crew-immigration-bulk-table">
              <thead>
                <tr>
                  <th className="gro-crew-immigration-bulk-th-sl">Sl No</th>
                  {EDITABLE_FIELDS.map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={EDITABLE_FIELDS.length + 1} className="gro-crew-immigration-bulk-empty">
                      No crew selected.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={String(row.id)}>
                      <td className="gro-crew-immigration-bulk-td-sl">{index + 1}</td>
                      {EDITABLE_FIELDS.map((field) => (
                        <td key={field.key}>
                          <input
                            type="text"
                            className="gro-crew-immigration-bulk-input"
                            value={row[field.key] ?? ""}
                            onChange={(e) => handleFieldChange(row.id, field.key, e.target.value)}
                            placeholder={field.label}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gro-crew-immigration-bulk-right">
          <p className="gro-crew-immigration-bulk-section-title">Document Preview</p>
          <div
            className="bulk-pass-arabic-preview"
            aria-readonly="true"
            aria-label="Document preview (read only)"
          >
            <div className="bulk-pass-arabic-paper" dir="rtl">
              <div className="bulk-pass-arabic-meta">
                <span>التاريخ: {PREVIEW_DATE}</span>
                <span>اسم الباخرة: {PREVIEW_VESSEL_NAME}</span>
              </div>

              <div className="bulk-pass-arabic-title">
                <span>صعود بحار</span>
                <span>ميناء الجبيل التجاري</span>
              </div>

              <div className="bulk-pass-arabic-divider" />

              <p className="bulk-pass-arabic-paragraph">
                المكرم مدير إدارة خفر السواحل بميناء الجبيل التجاري المحترم
              </p>
              <p className="bulk-pass-arabic-paragraph">
                السلام عليكم ورحمة الله وبركاته، نأمل من سعادتكم التكرم بالموافقة على صعود
                البحارة المذكورين أدناه إلى الباخرة المشار إليها أعلاه، وذلك لمباشرة أعمالهم
                على متنها.
              </p>
              <p className="bulk-pass-arabic-paragraph">
                علماً بأن جميع البيانات الموضحة أدناه صحيحة ونتحمل كامل المسؤولية تجاهها،
                ولكم جزيل الشكر والتقدير.
              </p>

              <div className="bulk-pass-arabic-divider" />

              <div className="bulk-pass-handwriting-labels" dir="rtl">
                {HANDWRITING_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <table className="bulk-pass-arabic-table">
                <thead>
                  <tr>
                    <th>العدد</th>
                    <th>اسم البحار</th>
                    <th>الجنسية</th>
                    <th>رقم الجواز/إقامة</th>
                    <th>رقم زاول</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="bulk-pass-arabic-empty">
                        لا يوجد بحارة محددون.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={String(row.id)}>
                        <td>{index + 1}</td>
                        <td>{row.crewName || "—"}</td>
                        <td>{row.nationality || "—"}</td>
                        <td>{row.passportIqama || "—"}</td>
                        <td>{row.zawilNo || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="bulk-pass-arabic-divider" />

              <div className="bulk-pass-arabic-sign">
                <span>الختم</span>
                <span>التوقيع</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gro-crew-immigration-bulk-actions">
        <button
          type="button"
          className="gro-crew-immigration-bulk-submit"
          onClick={onSubmit}
          disabled={rows.length === 0}
        >
          <FiUploadCloud className="gro-crew-immigration-bulk-submit-icon" />
          {meta.submitLabel}
        </button>
      </div>
    </div>
  );
}

BulkPassUploadView.propTypes = {
  passType: PropTypes.oneOf(["cg", "zawil"]).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowsChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
