import PropTypes from "prop-types";
import { formatFileSizeBytes } from "./checklistFormat";

const ChecklistFilePreviewCompact = ({ file, onRemove, isDAModule = false }) => {
  if (!file) return null;

  const getFileType = (fileName) => {
    if (!fileName) return "";
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ext || "";
  };

  const fileName = file?.name || file?.fileName || "Untitled";
  const fileType = getFileType(fileName);
  const isPDF = fileType === "pdf";
  const isWord = ["doc", "docx"].includes(fileType);
  const sizeLabel = formatFileSizeBytes(file?.size);

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (file?.url || file?.link) {
      const url = file.url || file.link;
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (file?.blob) {
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <div className="checklist-table-file-chip-inner cl-file-chip-inner">
      <div className="checklist-table-file-chip-left" aria-hidden>
        {isPDF && (
          <div className="cl-file-ico cl-file-ico--pdf" title="PDF">
            <span>PDF</span>
          </div>
        )}
        {isWord && !isPDF && <div className="cl-file-ico cl-file-ico--word">W</div>}
        {!isPDF && !isWord && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="checklist-table-file-chip-main">
        <div className="checklist-table-file-chip-name" title={fileName}>
          {fileName}
        </div>
        {sizeLabel ? <div className="checklist-table-file-chip-meta">{sizeLabel}</div> : null}
      </div>
      {onRemove ? (
        <button type="button" className="checklist-table-file-chip-btn" onClick={handleRemoveClick} title="Remove file">
          ×
        </button>
      ) : (
        <button
          type="button"
          className="checklist-table-file-chip-btn"
          onClick={handleDownloadClick}
          title="View / download"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 15V3M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

ChecklistFilePreviewCompact.propTypes = {
  file: PropTypes.object,
  onRemove: PropTypes.func,
  isDAModule: PropTypes.bool,
};

export default ChecklistFilePreviewCompact;
