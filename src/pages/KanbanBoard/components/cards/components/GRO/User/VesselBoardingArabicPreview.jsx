import PropTypes from "prop-types";

const PREVIEW_VESSEL_NAME = "MAG CLIO";
const PREVIEW_DATE = "2026/06/10";

/** Read-only Arabic vessel boarding ("صعود بحار") document preview. */
export default function VesselBoardingArabicPreview({
  rows,
  vesselName = PREVIEW_VESSEL_NAME,
  date = PREVIEW_DATE,
}) {
  return (
    <div
      className="bulk-pass-arabic-preview"
      aria-readonly="true"
      aria-label="Document preview (read only)"
    >
      <div className="bulk-pass-arabic-paper" dir="rtl">
        <div className="bulk-pass-arabic-meta">
          <span>التاريخ: {date}</span>
          <span>اسم الباخرة: {vesselName}</span>
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
  );
}

VesselBoardingArabicPreview.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  vesselName: PropTypes.string,
  date: PropTypes.string,
};
