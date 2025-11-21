import { Droppable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import CardItem from "./CardItem";
import "../../design/css/Column.css";
import PriorityIcon from "../../assets/images/Priority.svg";

function Column({ column, cards, setSelectedCard }) {
  const columnColor = column.color || "#2A00FF";

  return (
    <div className="column">
      <div
        className="column-header"
        style={{ "--column-color": columnColor }}
      >
        <div className="column-left">
          <div className="column-count-box" style={{ background: columnColor }}>
            <span className="count-number">{cards.length}</span>
            <img src={PriorityIcon} alt="Priority" className="priority-icon" />
          </div>
          <h2 className="column-title">{column.title}</h2>
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
};

export default Column;
