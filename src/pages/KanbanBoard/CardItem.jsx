import { Draggable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "../../design/css/CardItem.css";
import { DownloadIcon, InprogressIcon } from "../../assets/svgs";

// Status colors
const STATUS_COLORS = {
  done: "#28a745", // Green - Completed
  inProgress: "#ffc107", // Yellow - In Progress
  rejected: "#dc3545", // Red - Pending/Rejected
  pending: "#6c757d" // Gray (default)
};

// Icon components
const CarIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H5M5 17H19M5 17V19C5 19.5304 4.78929 20.0391 4.41421 20.4142C4.03914 20.7893 3.53043 21 3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V17M19 17H20C20.5304 17 21.0391 16.7893 21.4142 16.4142C21.7893 16.0391 22 15.5304 22 15V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H19M19 17V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V17M5 9L7 5H17L19 9M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const HotelIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 21H21M5 21V7L12 3L19 7V21M5 21H9M19 21H15M9 21V13H15V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const MedicalIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Status icon component
const StatusIcon = ({ status = "pending", IconComponent, size = 20 }) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <IconComponent size={size} color={color} />;
};

function CardItem({ card, index, setSelectedCard, isShrunk = false }) {
  const cardColor = card.color || "#2A00FF";

  // Helper function to truncate text
  const TruncatedText = ({ text, maxLength = 20 }) => {
    if (!text) return null;
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? text.substring(0, maxLength) + "..." : text;
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
            // Compact view for shrunk columns - Enhanced UI
            <>
              {/* Compact Content Container */}
              <div className="card-content-compact">
                {/* Icon with colored accent */}
                <div className="card-icon-wrapper-compact">
                  <div
                    className="card-header-icon-compact"
                    style={{ backgroundColor: cardColor }}
                  >
                    {card.iconType === "inprogress" && <InprogressIcon />}
                    {card.iconType === "download" && <DownloadIcon />}
                    {card.iconType === "document" && <DownloadIcon />}
                  </div>
                  {/* Colored accent line */}
                  <div
                    className="card-accent-line-compact"
                    style={{ backgroundColor: cardColor }}
                  />
                </div>

                {/* Title with better styling */}
                <div
                  className="card-title-compact"
                  onClick={() => setSelectedCard(card)}
                >
                  {(card.vesselName || card.title) && ((card.vesselName || card.title).length > 12 ? (card.vesselName || card.title).substring(0, 12) + "..." : (card.vesselName || card.title))}
                </div>
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
                  const tooltipId = `card-name-${card.id}`;

                  return (
                    <>
                      <span
                        className="card-name"
                        data-tooltip-id={isTruncated ? tooltipId : undefined}
                        data-tooltip-content={isTruncated ? card.name : undefined}
                      >
                        {displayText}
                      </span>
                      {isTruncated && (
                        <Tooltip
                          id={tooltipId}
                          place="top"
                          className="card-name-tooltip"
                          offset={5}
                        />
                      )}
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
                  {card.vesselName || card.title}
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
                      <circle className="bg" cx="13" cy="13" r="11.5" />
                      <circle
                        className="progress"
                        cx="13"
                        cy="13"
                        r="11.5"
                        style={{
                          stroke: cardColor,
                          strokeDashoffset: `calc(72 - (72 * ${card.progress || 0}) / 100)`,
                        }}
                      />
                    </svg>
                    <div className="progress-text">{card.progress || 0}%</div>
                  </div>
                </div>
              </div>

              {/* Extra Details Section - Transport, Hotel, Medical icons with counters */}
              {((card.transport !== undefined || card.transportCount !== undefined) ||
                (card.hotel !== undefined || card.hotelCount !== undefined) ||
                (card.medicalService !== undefined || card.medicalServiceCount !== undefined)) && (
                  <div className="card-extra-details" style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "flex-start", padding: "8px 0" }}>
                    {/* Transport Icon */}
                    {(card.transport !== undefined || card.transportCount !== undefined) && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <CarIcon size={18} color="#666" />
                        <span style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-8px",
                          backgroundColor: (card.transport === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected),
                          color: "#ffffff",
                          borderRadius: "10px",
                          minWidth: "16px",
                          height: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "9px",
                          fontWeight: "700",
                          padding: "0 4px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                          border: "2px solid #ffffff"
                        }}>
                          {card.transportCount || 0}
                        </span>
                      </div>
                    )}

                    {/* Hotel Icon */}
                    {(card.hotel !== undefined || card.hotelCount !== undefined) && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <HotelIcon size={18} color="#666" />
                        <span style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-8px",
                          backgroundColor: (card.hotel === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected),
                          color: "#ffffff",
                          borderRadius: "10px",
                          minWidth: "16px",
                          height: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "9px",
                          fontWeight: "700",
                          padding: "0 4px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                          border: "2px solid #ffffff"
                        }}>
                          {card.hotelCount || 0}
                        </span>
                      </div>
                    )}

                    {/* Medical Icon */}
                    {(card.medicalService !== undefined || card.medicalServiceCount !== undefined) && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <MedicalIcon size={18} color="#666" />
                        <span style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-8px",
                          backgroundColor: (card.medicalService === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected),
                          color: "#ffffff",
                          borderRadius: "10px",
                          minWidth: "16px",
                          height: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "9px",
                          fontWeight: "700",
                          padding: "0 4px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                          border: "2px solid #ffffff"
                        }}>
                          {card.medicalServiceCount || 0}
                        </span>
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
    title: PropTypes.string.isRequired,
    name: PropTypes.string,
    user: PropTypes.string,
    color: PropTypes.string,
    iconType: PropTypes.string,
    timeLeft: PropTypes.string,
    progress: PropTypes.number,
    priority: PropTypes.bool,
    vesselName: PropTypes.string,
    transport: PropTypes.string,
    transportCount: PropTypes.number,
    hotel: PropTypes.string,
    hotelCount: PropTypes.number,
    medicalService: PropTypes.string,
    medicalServiceCount: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isShrunk: PropTypes.bool,
};

export default CardItem;
