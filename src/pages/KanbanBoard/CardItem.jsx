import { Draggable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { FiLayers } from "react-icons/fi";
import "../../design/css/CardItem.css";
import PolygonIcon from "../../assets/images/PolygonIcon.svg";
import MessageIcon from "../../assets/images/MessageIcon.svg";
import ClockIcon from "../../assets/images/ClockIcon.svg";
import AttachmentIcon from "../../assets/images/Attachment.svg";
import { DownloadIcon, InprogressIcon } from "../../assets/svgs";

function CardItem({ card, index, setSelectedCard, isShrunk = false }) {
  const cardColor = card.color || "#2A00FF";
  const userInitial = card.user?.[0]?.toUpperCase() || "";

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
              {/* Compact Header with Icon and Code */}
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

                <div
                  className="card-code-compact"
                  data-tooltip-id={`code-${card.id}`}
                  data-tooltip-content={`Card Code: ${card.code}`}
                >
                  {card.code}
                </div>
                <Tooltip id={`code-${card.id}`} place="top" />
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

              {/* Compact Info Row - Days, Progress, Board ID */}
              <div className="card-info-row-compact">
                {/* Days with Clock Icon */}
                <div
                  className="card-days-wrapper-compact"
                  data-tooltip-id={`days-${card.id}`}
                  data-tooltip-content={`Days: ${card.days} days`}
                >
                  <img src={ClockIcon} alt="Days" className="card-clock-icon-compact" />
                  <span className="card-days-compact">{card.days}d</span>
                </div>
                <Tooltip id={`days-${card.id}`} place="top" />

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

              {/* Compact Status */}
              {card.status && (
                <div
                  className="card-status-compact"
                  style={{ color: cardColor }}
                  data-tooltip-id={`status-${card.id}`}
                  data-tooltip-content={`Status: ${card.status}`}
                >
                  ↑ {card.status.length > 10 ? card.status.substring(0, 10) + "..." : card.status}
                </div>
              )}
              {card.status && <Tooltip id={`status-${card.id}`} place="top" />}
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
                <span className="card-code">{card.code}</span>
                <span className="card-user">{card.user}</span>
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
                <div
                  className="card-avatar"
                  data-initial={userInitial}
                  style={{ "--card-color": cardColor }}
                />
              </div>

              {/* Days */}
              <div className="card-days">
                <div className="card-icons">
                  <img src={PolygonIcon} alt="Priority" className="icon" />
                  <img src={MessageIcon} alt="Message" className="icon" />
                  <img src={ClockIcon} alt="Clock" className="icon" />
                  <img src={AttachmentIcon} alt="Attachment" className="icon" />
                </div>
                <span className="days-text">{card.days}d</span>
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

              {/* Status */}
              <div className="card-status">
                <div
                  className="dot"
                  style={{ backgroundColor: cardColor }}
                />
                <span>Please confirm to move card</span>
              </div>

              {/* Optional Extra */}
              {card.status && (
                <div className="card-extra" style={{ color: cardColor }}>
                  <span>↑</span> {card.status}
                </div>
              )}

              {/* Last Moved Section */}
              {card.lastMoved && (() => {
                const fullText = `Last moved: ${card.lastMoved}`;
                const maxLength = 25;
                const isTruncated = fullText.length > maxLength;
                const displayText = isTruncated ? fullText.substring(0, maxLength) + "..." : fullText;
                const tooltipId = `last-moved-${card.id}`;

                return (
                  <div className="card-last-moved">
                    {isTruncated ? (
                      <>
                        <span data-tooltip-id={tooltipId} data-tooltip-content={fullText}>
                          {displayText}
                        </span>
                        <Tooltip id={tooltipId} place="top" />
                      </>
                    ) : (
                      <span>{displayText}</span>
                    )}
                  </div>
                );
              })()}

              {/* Extra Details Section */}
              {(card.sapSalesOrder || card.srtPoWbs || card.appointmentEmail || card.vesselName || card.serviceRequester) && (
                <div className="card-extra-details">
                  {card.sapSalesOrder && (
                    <div className="card-detail-item">
                      <span className="detail-dot detail-dot-grey"></span>
                      <span className="detail-label">SAP Sales Order No:</span>
                      <TruncatedText text={card.sapSalesOrder} maxLength={15} tooltipId={`sap-${card.id}`} />
                    </div>
                  )}
                  {card.srtPoWbs && (
                    <div className="card-detail-item">
                      <span className="detail-dot detail-dot-yellow"></span>
                      <span className="detail-label">SRT|PO|WBS:</span>
                      <TruncatedText text={card.srtPoWbs} maxLength={15} tooltipId={`srt-${card.id}`} />
                    </div>
                  )}
                  {card.appointmentEmail && (
                    <div className="card-detail-item">
                      <span className="detail-dot detail-dot-grey"></span>
                      <span className="detail-label">Appointment Email:</span>
                      <TruncatedText text={card.appointmentEmail} maxLength={20} tooltipId={`email-${card.id}`} />
                    </div>
                  )}
                  {card.vesselName && (
                    <div className="card-detail-item">
                      <span className="detail-dot detail-dot-blue"></span>
                      <span className="detail-label">VESSEL NAME:</span>
                      <TruncatedText text={card.vesselName} maxLength={20} tooltipId={`vessel-${card.id}`} />
                    </div>
                  )}
                  {card.serviceRequester && (
                    <div className="card-detail-item">
                      <span className="detail-dot detail-dot-green"></span>
                      <span className="detail-label">Service requester</span>
                      <TruncatedText text={card.serviceRequester} maxLength={20} tooltipId={`service-${card.id}`} />
                    </div>
                  )}
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
    code: PropTypes.string,
    user: PropTypes.string,
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
    iconType: PropTypes.string,
    days: PropTypes.number,
    timeLeft: PropTypes.string,
    progress: PropTypes.number,
    status: PropTypes.string,
    priority: PropTypes.bool,
    lastMoved: PropTypes.string,
    sapSalesOrder: PropTypes.string,
    srtPoWbs: PropTypes.string,
    appointmentEmail: PropTypes.string,
    vesselName: PropTypes.string,
    serviceRequester: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isShrunk: PropTypes.bool,
};

export default CardItem;
