import { Droppable } from "@hello-pangea/dnd";
import CardItem from "./CardItem";
import "../assets/styles/Column.css";
import PriorityIcon from "../assets/images/Priority.svg";

export default function Column({ column, cards,setSelectedCard}) {

  return (
    <div className="column">
      <div
        className="column-header"
        style={{ "--column-color": column.color || "#2A00FF" }}
      >
        <div className="column-left">
          {/* Number + Icon stacked vertically */}
          <div className="column-count-box" style={{ background: column.color }}>
            <span className="count-number">{cards.length}</span>
            <img src={PriorityIcon} alt="Priority" className="priority-icon" />
          </div>

          {/* Title */}
          <h2 className="column-title">{column.title}</h2>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`card-list ${
              snapshot.isDraggingOver ? "drag-over" : ""
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {cards.map((card, index) => (
              <CardItem key={card.id} card={card} index={index}  setSelectedCard={setSelectedCard}/>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
