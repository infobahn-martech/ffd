import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

/**
 * Single column title bar (workflow stage). Rendered once per column in the top header row.
 */
export default function ColumnHeader({
  column,
  wipDisplay,
  isShrunk = false,
  onHeaderClick,
  isClassicLayout = false,
  isModernLayout = false,
  isDarkMode = false,
}) {
  const columnColor = column.color || "#2A00FF";
  const displayTitle =
    isShrunk && column.title.length > 8 ? `${column.title.substring(0, 5)}...` : column.title;
  const tooltipId = `column-title-${column.id}`;

  return (
    <div
      className={`column-header ${isClassicLayout ? "column-header-classic" : ""} ${
        isModernLayout ? "column-header-modern" : ""
      } ${isDarkMode ? "column-header-dark" : ""}`}
      style={{ "--column-color": columnColor }}
      onClick={onHeaderClick}
    >
      <div className="column-left">
        {isShrunk && column.title.length > 8 ? (
          <>
            <h2
              className="column-title"
              data-tooltip-id={tooltipId}
              data-tooltip-content={column.title}
            >
              {displayTitle}
            </h2>
            <Tooltip id={tooltipId} place="top" />
          </>
        ) : (
          <h2 className="column-title">
            {isClassicLayout && column.wipLimit ? (
              <>
                {column.title}{" "}
                <span className="column-wip-badge">({wipDisplay})</span>
              </>
            ) : (
              displayTitle
            )}
          </h2>
        )}
      </div>
      {!isShrunk && !isClassicLayout && <span className="column-count">{wipDisplay}</span>}
    </div>
  );
}

ColumnHeader.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
    wipLimit: PropTypes.number,
  }).isRequired,
  wipDisplay: PropTypes.string.isRequired,
  isShrunk: PropTypes.bool,
  onHeaderClick: PropTypes.func,
  isClassicLayout: PropTypes.bool,
  isModernLayout: PropTypes.bool,
  isDarkMode: PropTypes.bool,
};
