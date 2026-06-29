import PropTypes from "prop-types";

const FALLBACK_TITLE = "صعود بحار";
const FALLBACK_DESCRIPTION =
  "المكرم مدير إدارة خفر السواحل بميناء الجبيل التجاري المحترم";
const FALLBACK_MORE_DESCRIPTION =
  "السلام عليكم ورحمة الله وبركاته، نأمل من سعادتكم التكرم بالموافقة على صعود البحارة المذكورين أدناه إلى الباخرة المشار إليها أعلاه، وذلك لمباشرة أعمالهم على متنها.\n\nعلماً بأن جميع البيانات الموضحة أدناه صحيحة ونتحمل كامل المسؤولية تجاهها، ولكم جزيل الشكر والتقدير.";

/** Read-only Arabic vessel boarding document preview. */
export default function VesselBoardingArabicPreview({
  rows,
  vesselName = "",
  date = "",
  templateData = null,
}) {
  const title = templateData?.template_name || FALLBACK_TITLE;
  const description = templateData?.description || FALLBACK_DESCRIPTION;
  const moreDescription = templateData?.more_description || FALLBACK_MORE_DESCRIPTION;

  return (
    <div
      className="bulk-pass-arabic-preview"
      aria-readonly="true"
      aria-label="Document preview (read only)"
    >
      <div className="bulk-pass-arabic-paper" dir="rtl">
        <div className="bulk-pass-arabic-meta">
          {date ? <span>التاريخ: {date}</span> : null}
          {vesselName ? <span>اسم الباخرة: {vesselName}</span> : null}
        </div>

        <div className="bulk-pass-arabic-title">
          <span>{title}</span>
          <span>ميناء الجبيل التجاري</span>
        </div>

        <div className="bulk-pass-arabic-divider" />

        {description.split("\n").filter(Boolean).map((para, i) => (
          <p key={i} className="bulk-pass-arabic-paragraph">{para}</p>
        ))}

        {moreDescription.split("\n").filter(Boolean).map((para, i) => (
          <p key={`more-${i}`} className="bulk-pass-arabic-paragraph">{para}</p>
        ))}

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
  templateData: PropTypes.shape({
    template_name: PropTypes.string,
    description: PropTypes.string,
    more_description: PropTypes.string,
  }),
};
