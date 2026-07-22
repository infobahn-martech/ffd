import { useMemo } from "react";
import PropTypes from "prop-types";
import DOMPurify from "dompurify";
import { injectVesselRegFieldValues } from "./vesselRegTemplateFields";
import { formatGregorianDate, formatHijriDate } from "./groArabicDate";

const SANITIZE_CONFIG = {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus"],
  ALLOW_DATA_ATTR: false,
};

const FALLBACK_TITLE = "صعود بحار";
const FALLBACK_DESCRIPTION =
  "المكرم مدير إدارة خفر السواحل بميناء الجبيل التجاري المحترم";
const FALLBACK_MORE_DESCRIPTION =
  "السلام عليكم ورحمة الله وبركاته، نأمل من سعادتكم التكرم بالموافقة على صعود البحارة المذكورين أدناه إلى الباخرة المشار إليها أعلاه، وذلك لمباشرة أعمالهم على متنها.\n\nعلماً بأن جميع البيانات الموضحة أدناه صحيحة ونتحمل كامل المسؤولية تجاهها، ولكم جزيل الشكر والتقدير.";

/** Read-only Arabic vessel boarding document preview. */
export default function VesselBoardingArabicPreview({
  fieldValues = {},
  vesselName = "",
  date = "",
  templateData = null,
}) {
  const title = templateData?.template_name || FALLBACK_TITLE;
  const description = templateData?.description || FALLBACK_DESCRIPTION;
  // more_description is rich HTML from the template editor (a vessel-particulars table plus
  // closing paragraphs) when it comes from the API; the fallback is plain text, so wrap its
  // paragraphs in <p> to match before sanitizing.
  const moreDescriptionHtml = templateData?.more_description
    ? templateData.more_description
    : FALLBACK_MORE_DESCRIPTION.split("\n")
        .filter(Boolean)
        .map((para) => `<p>${para}</p>`)
        .join("");
  const sanitizedMoreDescription = useMemo(
    () =>
      DOMPurify.sanitize(injectVesselRegFieldValues(moreDescriptionHtml, fieldValues), SANITIZE_CONFIG),
    [moreDescriptionHtml, fieldValues]
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

        <div className="bulk-pass-arabic-sign">
          <span>الختم</span>
          <span>التوقيع</span>
        </div>
      </div>
    </div>
  );
}

VesselBoardingArabicPreview.propTypes = {
  fieldValues: PropTypes.objectOf(PropTypes.string),
  vesselName: PropTypes.string,
  date: PropTypes.string,
  templateData: PropTypes.shape({
    template_name: PropTypes.string,
    description: PropTypes.string,
    more_description: PropTypes.string,
  }),
};
