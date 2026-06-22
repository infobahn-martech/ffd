import PropTypes from "prop-types";
import {
  GRO_FILE_BADGE,
  getDocumentFileTypeIcon,
  getGroDocumentResolvedExtension,
} from "../../GRO/User/groCardUtils";

export function TaskDocumentFilePreview({ fileName, fileUrl, document }) {
  const kind = getDocumentFileTypeIcon(fileName, fileUrl, document);
  const resolvedExt = getGroDocumentResolvedExtension(fileName, fileUrl, document);
  let badge = GRO_FILE_BADGE[kind] ?? "";
  if (kind === "mail") {
    badge = resolvedExt === "eml" ? "EML" : "MSG";
  }

  const SheetBase = ({ children }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      {children}
    </svg>
  );

  let inner = (
    <SheetBase>
      <path d="M16 13H8M16 17H8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </SheetBase>
  );

  if (kind === "pdf") {
    inner = (
      <SheetBase>
        <path d="M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </SheetBase>
    );
  } else if (kind === "mail") {
    inner = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          d="M4 6.5h16v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5V6.5Z"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path d="M4 7l7.2 5.4a1.7 1.7 0 0 0 1.6 0L20 7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  } else if (kind === "excel") {
    inner = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.35" />
        <path d="M4 9h16M4 14h16M10 4v16M15 4v16" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  } else if (kind === "word") {
    inner = (
      <SheetBase>
        <path d="M10 11l2 6 2-6 2 6 2-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </SheetBase>
    );
  } else if (kind === "image") {
    inner = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.35" />
        <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
        <path d="M21 17l-5-5-4 4-2.5-2.5L4 17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const titleHint =
    [fileName, document?.file_name, fileUrl, document?.file_url].find((x) => x != null && String(x).trim() !== "") ?? "";

  return (
    <div className={`gro-document-preview-icon gro-document-preview-icon--${kind}`} title={titleHint}>
      <span className="gro-document-preview-icon-graphic">{inner}</span>
      {badge ? (
        <span className="gro-document-preview-icon-badge" aria-hidden>
          {badge}
        </span>
      ) : null}
    </div>
  );
}

TaskDocumentFilePreview.propTypes = {
  fileName: PropTypes.string,
  fileUrl: PropTypes.string,
  document: PropTypes.object,
};

export default TaskDocumentFilePreview;
