import PropTypes from "prop-types";

function TaskDocumentHeader({ title = "Task Documents", className = "" }) {
  const heading = String(title || "").trim() || "Task Documents";

  return (
    <div className={`gro-document-header ${className}`.trim()}>
      <h3 className="gro-documents-heading">{heading}</h3>
    </div>
  );
}

TaskDocumentHeader.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
};

export default TaskDocumentHeader;
