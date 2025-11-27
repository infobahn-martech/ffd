import { Draggable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import "../../design/css/CardItem.css";
import PolygonIcon from "../../assets/images/PolygonIcon.svg";
import MessageIcon from "../../assets/images/MessageIcon.svg";
import ClockIcon from "../../assets/images/ClockIcon.svg";
import AttachmentIcon from "../../assets/images/Attachment.svg";
import { DownloadIcon, InprogressIcon } from "../../assets/svgs";

function CardItem({ card, index, setSelectedCard }) {
  const cardColor = card.color || "#2A00FF";
  const userInitial = card.user?.[0]?.toUpperCase() || "";

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card ${snapshot.isDragging ? "dragging" : ""} ${card.priority ? "priority-blink" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            "--card-color": cardColor,
          }}
        >
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
            {card?.timeLeft}
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

          {card.customer && (
            <div className="card-meta blue">
              <span>●</span> Customer Name: {card.customer}
            </div>
          )}

          {card.vessel && (
            <div className="card-meta purple">
              <span>●</span> Vessel Name: {card.vessel}
            </div>
          )}

          {/* Footer */}
          <div className="card-tasks">
            New subtask
          </div>
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
    customer: PropTypes.string,
    vessel: PropTypes.string,
    priority: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
};

export default CardItem;
