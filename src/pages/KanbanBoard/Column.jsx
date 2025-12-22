import { Droppable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import CardItem from "./CardItem";
import "../../design/css/Column.css";
import PriorityIcon from "../../assets/images/Priority.svg";

function Column({ column, cards, setSelectedCard, isExpanded = false, isShrunk = false, onHeaderClick }) {
  const columnColor = column.color || "#2A00FF";

  // Truncate title to 8 characters when shrunk
  const displayTitle = isShrunk && column.title.length > 8
    ? column.title.substring(0, 5) + "..."
    : column.title;
  const tooltipId = `column-title-${column.id}`;

  return (
    <div className={`column ${isExpanded ? 'column-expanded' : ''} ${isShrunk ? 'column-shrunk' : ''}`}>
      <div
        className="column-header"
        style={{ "--column-color": columnColor }}
        onClick={onHeaderClick}
      >
        <div className="column-left">
          <div className="column-count-box" style={{ background: columnColor }}>
            <span className="count-number">{cards.length}</span>
            <img src={PriorityIcon} alt="Priority" className="priority-icon" />
          </div>
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
            <h2 className="column-title">{displayTitle}</h2>
          )}
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`card-list ${snapshot.isDraggingOver ? "drag-over" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {cards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                setSelectedCard={setSelectedCard}
                isShrunk={isShrunk}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

Column.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
  }).isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  isShrunk: PropTypes.bool,
  onHeaderClick: PropTypes.func,
};

export default Column;
