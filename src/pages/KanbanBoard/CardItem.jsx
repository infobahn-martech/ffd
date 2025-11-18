/* eslint-disable no-unused-vars */
import { Draggable } from "@hello-pangea/dnd";
import "../../design/css/CardItem.css";
import PolygonIcon from "../../assets/images/PolygonIcon.svg";
import MessageIcon from "../../assets/images/MessageIcon.svg";
import ClockIcon from "../../assets/images/ClockIcon.svg";
import AttachmentIcon from "../../assets/images/Attachment.svg";
import  { DownloadIcon, InprogressIcon } from "../../assets/svgs";


export default function CardItem({ card, index ,setSelectedCard}) {
  return (
        <>
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card ${snapshot.isDragging ? "dragging" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // ✅ Pass card color as CSS variable
  style={{
        ...provided.draggableProps.style,
        "--card-color": card.color || "#2A00FF",
      }}
        >
          {/* Header */}
          <div className="card-header">
      <div
  className="card-header-icon"
  style={{ backgroundColor: card.color || "#2A00FF" }}
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
    <h3 className="card-title" style={{cursor:"pointer"}} onClick={() => setSelectedCard(card)}>
    {card.title}
</h3>

   <div
    className="card-avatar"
    data-initial={card.user?.[0]?.toUpperCase()}
    style={{ "--card-color": card.color }}
 />
</div>



          {/* Days */}
        <div className="card-days">
  <div className="card-icons">
    <img src={PolygonIcon} alt="Priority" className="icon" />
    <img src={MessageIcon} alt="Message" className="icon" />
    <img src={ClockIcon} alt="Clock" className="icon" />
    <img src={AttachmentIcon} alt="Clock" className="icon" />
  </div>
  <span className="days-text">{card.days}d</span>
</div>

<div className="card-footer">
  {card?.timeLeft}

  {/* Circular Progress moved here */}
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
    stroke: card.color || "#2A00FF",
    strokeDashoffset: `calc(88 - (88 * ${card.progress}) / 100)` // updated for r=14
  }}
/>

      </svg>

      <div className="progress-text">{card.progress}%</div>
    </div>
  </div>
</div>

          {/* Status */}
          <div className="card-status">
            <div
              className="dot"
              style={{ backgroundColor: card.color || "#2A00FF" }}
            ></div>
            <span>Please confirm to move card</span>
          </div>
          

          {/* Optional Extra */}
          {card.status && (
            <div className="card-extra" style={{ color: card.color || "#2A00FF" }}>
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
    </>
  );
}
