import { useMemo } from "react";
import PropTypes from "prop-types";
import DOMPurify from "dompurify";

const SANITIZE_CONFIG = {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus"],
  ALLOW_DATA_ATTR: false,
};

function formatGregorianDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function formatHijriDate(date) {
  const parts = new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}/${get("month")}/${get("day")}`;
}

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
  // more_description is rich HTML from the template editor (tables, <p>, <strong> …) when it comes
  // from the API; the fallback is plain text, so wrap its paragraphs in <p> to match before sanitizing.
  const moreDescriptionHtml = templateData?.more_description
    ? templateData.more_description
    : FALLBACK_MORE_DESCRIPTION.split("\n")
        .filter(Boolean)
        .map((para) => `<p>${para}</p>`)
        .join("");
  const sanitizedMoreDescription = useMemo(
    () => DOMPurify.sanitize(moreDescriptionHtml, SANITIZE_CONFIG),
    [moreDescriptionHtml]
  );

  const today = new Date();
  const gregorianDate = formatGregorianDate(today);
  const hijriDate = formatHijriDate(today);

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

        <div className="bulk-pass-arabic-date-box">
          <div>التاريخ : {hijriDate} هـ</div>
          <div>الموافق : {gregorianDate} م</div>
        </div>

        {description.split("\n").filter(Boolean).map((para, i) => (
          <p key={i} className="bulk-pass-arabic-paragraph">{para}</p>
        ))}

        <div
          className="bulk-pass-arabic-more-description"
          dangerouslySetInnerHTML={{ __html: sanitizedMoreDescription }}
        />

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
