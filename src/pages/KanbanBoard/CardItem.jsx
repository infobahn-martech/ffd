import { Draggable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { FiLayers } from "react-icons/fi";
import "../../design/css/CardItem.css";
import { DownloadIcon, InprogressIcon } from "../../assets/svgs";

function CardItem({ card, index, setSelectedCard, isShrunk = false }) {
  const cardColor = card.color || "#2A00FF";

  // Extract board ID count from card.id (e.g., "workflow-1-card-123" -> "123")
  const boardIdCount = card.id.includes('-card-')
    ? card.id.split('-card-')[1]
    : card.id.split('-').pop() || card.id;

  // Helper function to truncate text and add tooltip
  const TruncatedText = ({ text, maxLength = 20, tooltipId }) => {
    if (!text) return null;
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? text.substring(0, maxLength) + "..." : text;

    if (isTruncated) {
      return (
        <>
          <span data-tooltip-id={tooltipId} data-tooltip-content={text}>
            {displayText}
          </span>
          <Tooltip id={tooltipId} place="top" />
        </>
      );
    }
    return <span>{displayText}</span>;
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card ${snapshot.isDragging ? "dragging" : ""} ${card.priority ? "priority-blink" : ""} ${isShrunk ? "card-shrunk" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            "--card-color": cardColor,
          }}
        >
          {isShrunk ? (
            // Compact view for shrunk columns - Improved UI
            <>
              {/* Compact Header with Icon */}
              <div className="card-header-compact">
                <div
                  className="card-header-icon-compact"
                  style={{ backgroundColor: cardColor }}
                  data-tooltip-id={`icon-${card.id}`}
                  data-tooltip-content={`Card Type: ${card.iconType || 'default'}`}
                >
                  {card.iconType === "inprogress" && <InprogressIcon />}
                  {card.iconType === "download" && <DownloadIcon />}
                  {card.iconType === "document" && <DownloadIcon />}
                </div>
                <Tooltip id={`icon-${card.id}`} place="top" />
              </div>

              {/* Compact Title */}
              <div
                className="card-title-compact"
                onClick={() => setSelectedCard(card)}
                data-tooltip-id={`title-${card.id}`}
                data-tooltip-content={card.title}
              >
                {card.title.length > 10 ? card.title.substring(0, 10) + "..." : card.title}
              </div>
              <Tooltip id={`title-${card.id}`} place="top" />

              {/* Compact Info Row - Progress, Board ID */}
              <div className="card-info-row-compact">
                {/* Progress Bar */}
                <div className="card-progress-wrapper-compact">
                  <div className="progress-bar-compact">
                    <div
                      className="progress-fill-compact"
                      style={{
                        width: `${card.progress || 0}%`,
                        backgroundColor: cardColor
                      }}
                    />
                  </div>
                  <span
                    className="progress-text-compact"
                    data-tooltip-id={`progress-${card.id}`}
                    data-tooltip-content={`Progress: ${card.progress || 0}%`}
                  >
                    {card.progress || 0}%
                  </span>
                  <Tooltip id={`progress-${card.id}`} place="top" />
                </div>

                {/* Board ID Icon with Count */}
                <div
                  className="card-board-id-compact"
                  data-tooltip-id={`board-${card.id}`}
                  data-tooltip-content={`Board ID: ${card.id}`}
                >
                  <FiLayers className="board-icon-compact" />
                  <span className="board-id-text-compact">{boardIdCount}</span>
                </div>
                <Tooltip id={`board-${card.id}`} place="top" />
              </div>
            </>
          ) : (
            // Full view for normal/expanded columns
            <>
              {/* Header */}
              <div className="card-header">
                <div
                  className="card-header-icon"
                  style={{ backgroundColor: cardColor }}
                >
                  {card.iconType === "inprogress" && <InprogressIcon />}
                  {card.iconType === "download" && <DownloadIcon />}
                  {card.iconType === "document" && <DownloadIcon />}
                </div>
                {card.name && (() => {
                  const maxLength = 10;
                  const isTruncated = card.name.length > maxLength;
                  const displayText = isTruncated ? card.name.substring(0, maxLength) + "..." : card.name;
                  const tooltipId = `name-${card.id}`;

                  return (
                    <>
                      <span
                        className="card-name"
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={isTruncated ? card.name : undefined}
                      >
                        {displayText}
                      </span>
                      {isTruncated && <Tooltip id={tooltipId} place="top" />}
                    </>
                  );
                })()}
              </div>

              {/* Title */}
              <div className="card-title-row" style={{ position: "relative" }}>
                <h3
                  className="card-title"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedCard(card)}
                >
                  {card.title}
                </h3>
                {card.user && (
                  <div
                    className="card-avatar"
                    data-initial={card.user[0]?.toUpperCase() || ""}
                    style={{ "--card-color": cardColor }}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="card-footer">
                <span className="card-time-left">{card?.timeLeft}</span>
                <div className="footer-progress">
                  <div className="circular-progress">
                    <svg className="progress-svg">
                      <circle className="bg" cx="16" cy="16" r="14" />
                      <circle
                        className="progress"
                        cx="16"
                        cy="16"
                        r="14"
                        style={{
                          stroke: cardColor,
                          strokeDashoffset: `calc(88 - (88 * ${card.progress || 0}) / 100)`,
                        }}
                      />
                    </svg>
                    <div className="progress-text">{card.progress || 0}%</div>
                  </div>
                </div>
              </div>

              {/* Extra Details Section - VESSEL NAME only */}
              {card.vesselName && (
                <div className="card-extra-details">
                  <div className="card-detail-item">
                    <span className="detail-dot detail-dot-blue"></span>
                    <span className="detail-label">VESSEL NAME:</span>
                    <TruncatedText text={card.vesselName} maxLength={20} tooltipId={`vessel-${card.id}`} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}

CardItem.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    name: PropTypes.string,
    user: PropTypes.string,
    color: PropTypes.string,
    iconType: PropTypes.string,
    timeLeft: PropTypes.string,
    progress: PropTypes.number,
    priority: PropTypes.bool,
    vesselName: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isShrunk: PropTypes.bool,
};

export default CardItem;
