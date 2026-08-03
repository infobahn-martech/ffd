import PropTypes from "prop-types";

function TaskDocumentList({
  isLoading = false,
  loadingMessage = "Loading documents…",
  isEmpty = false,
  emptyMessage = null,
  listClassName = "",
  children,
}) {
  return (
    <div className={`gro-document-list ${listClassName}`.trim()}>
      {isLoading ? <div className="gro-document-loading">{loadingMessage}</div> : null}
      {!isLoading && isEmpty && emptyMessage ? (
        <div className="gro-supervisor-doc-empty" role="status">
          {emptyMessage}
        </div>
      ) : null}
      {!isLoading && !isEmpty ? children : null}
    </div>
  );
}

TaskDocumentList.propTypes = {
  isLoading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  isEmpty: PropTypes.bool,
  emptyMessage: PropTypes.string,
  listClassName: PropTypes.string,
  children: PropTypes.node,
};

export default TaskDocumentList;
