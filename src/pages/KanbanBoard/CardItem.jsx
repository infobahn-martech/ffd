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


const MaterialManagementIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const WasteDisposalIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LaunchHireIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 18H21L20 14H4L3 18ZM3 18L2 19H22L21 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M6 14L7 8H17L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M12 8V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M12 3L14 5H10L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Abstract Geometric Company Logos (no text)
const CompanyIcon1 = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4L4 12L8 16L12 12L12 8L8 4L4 4Z" fill="#333333" />
    <path d="M8 4L12 8L16 12L20 12L20 16L16 16L12 12L8 16L12 16L16 20L12 20L8 16Z" fill="#FF6B35" />
  </svg>
);

const CompanyIcon2 = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C8 4 8 8 8 12C8 16 12 20 12 20C12 20 16 16 16 12C16 8 16 4 12 4Z" fill="#333333" />
    <path d="M12 8C10 8 10 10 10 12C10 14 12 16 12 16C12 16 14 14 14 12C14 10 14 8 12 8Z" fill="#FF6B35" />
  </svg>
);

const CompanyIcon3 = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="6" width="6" height="12" rx="2" fill="#333333" />
    <rect x="13" y="6" width="6" height="12" rx="2" fill="#FF6B35" />
    <rect x="9" y="10" width="6" height="4" rx="1" fill="#333333" />
  </svg>
);

const CompanyIcon4 = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" fill="#FF6B35" />
    <path d="M8 12C8 10 10 8 12 8C14 8 16 10 16 12C16 14 14 16 12 16C10 16 8 14 8 12Z" fill="#333333" />
    <circle cx="12" cy="12" r="3" fill="#FF6B35" />
  </svg>
);

const CompanyIcon5 = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="4" height="4" rx="0.5" fill="#FF6B35" />
    <rect x="14" y="6" width="4" height="4" rx="0.5" fill="#FF6B35" />
    <rect x="6" y="14" width="4" height="4" rx="0.5" fill="#FF6B35" />
    <rect x="14" y="14" width="4" height="4" rx="0.5" fill="#FF6B35" />
    <path d="M10 8H14V10H10V8ZM10 12H14V14H10V12Z" fill="#333333" />
    <path d="M8 10V14H12V10H8Z" fill="#333333" />
    <path d="M12 10V14H16V10H12Z" fill="#333333" />
    <path d="M10 14V18H14V14H10Z" fill="#333333" />
    <path d="M14 14V18H18V14H14Z" fill="#333333" />
  </svg>
);

const CompanyIcon6 = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="8" height="8" rx="1" fill="#333333" />
    <circle cx="16" cy="8" r="6" fill="#FF6B35" />
    <path d="M14 8L16 6L18 8L16 10L14 8Z" fill="#333333" />
    <path d="M12 14L8 18L10 20L14 16L12 14Z" fill="#FF6B35" />
  </svg>
);

// Function to get company icon based on card id/name
const getCompanyIcon = (cardId, cardName) => {
  // Use a simple hash to consistently assign icons to cards
  const hash = cardId ? cardId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const iconIndex = hash % 6;

  const icons = [CompanyIcon1, CompanyIcon2, CompanyIcon3, CompanyIcon4, CompanyIcon5, CompanyIcon6];
  return icons[iconIndex];
};

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
              <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div
                  className="card-header-icon"
                  style={{ backgroundColor: cardColor }}
                >
                  {card.iconType === "inprogress" && <InprogressIcon />}
                  {card.iconType === "download" && <DownloadIcon />}
                  {card.iconType === "document" && <DownloadIcon />}
                </div>
                {card.name && (() => {
                  const tooltipId = `card-name-${card.id}`;
                  const CompanyIconComponent = getCompanyIcon(card.id, card.name);

                  return (
                    <>
                      <div
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={card.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          marginLeft: "auto",
                        }}
                      >
                        <CompanyIconComponent size={26} />
                      </div>
                      <Tooltip
                        id={tooltipId}
                        place="top"
                        className="card-name-tooltip"
                        offset={5}
                      />
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

              {/* Extra Details Section - Icons with status colors */}
              <div className="card-extra-details" style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "flex-start", padding: "8px 0" }}>
                {/* Transport Icon */}
                <>
                  <div
                    data-tooltip-id={`transport-${card.id}`}
                    data-tooltip-content="Transport"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <CarIcon
                      size={18}
                      color={card.transport === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected}
                    />
                  </div>
                  <Tooltip id={`transport-${card.id}`} place="top" />
                </>

                {/* Hotel Icon */}
                <>
                  <div
                    data-tooltip-id={`hotel-${card.id}`}
                    data-tooltip-content="Hotel"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <HotelIcon
                      size={18}
                      color={card.hotel === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected}
                    />
                  </div>
                  <Tooltip id={`hotel-${card.id}`} place="top" />
                </>

                {/* Medical Icon */}
                <>
                  <div
                    data-tooltip-id={`medical-${card.id}`}
                    data-tooltip-content="Medical"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <MedicalIcon
                      size={18}
                      color={card.medicalService === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected}
                    />
                  </div>
                  <Tooltip id={`medical-${card.id}`} place="top" />
                </>
                {/* Material Management Icon */}
                <>
                  <div
                    data-tooltip-id={`material-${card.id}`}
                    data-tooltip-content="Material Management"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <MaterialManagementIcon
                      size={18}
                      color={card.materialManagement === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected}
                    />
                  </div>
                  <Tooltip id={`material-${card.id}`} place="top" />
                </>

                {/* Waste Disposal Icon */}
                <>
                  <div
                    data-tooltip-id={`waste-${card.id}`}
                    data-tooltip-content="Waste Disposal"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <WasteDisposalIcon
                      size={18}
                      color={card.wasteDisposal === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected}
                    />
                  </div>
                  <Tooltip id={`waste-${card.id}`} place="top" />
                </>

                {/* Launch Hire Icon */}
                <>
                  <div
                    data-tooltip-id={`launch-${card.id}`}
                    data-tooltip-content="Launch Hire"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <LaunchHireIcon
                      size={18}
                      color={card.launchHire === "done" ? STATUS_COLORS.done : STATUS_COLORS.rejected}
                    />
                  </div>
                  <Tooltip id={`launch-${card.id}`} place="top" />
                </>
              </div>
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
    onStation: PropTypes.string,
    onStationCount: PropTypes.number,
    materialManagement: PropTypes.string,
    materialManagementCount: PropTypes.number,
    wasteDisposal: PropTypes.string,
    wasteDisposalCount: PropTypes.number,
    launchHire: PropTypes.string,
    launchHireCount: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isShrunk: PropTypes.bool,
};

export default CardItem;
