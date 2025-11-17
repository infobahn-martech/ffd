import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { initialData } from "../../utils/data";
import Column from "../Column";
import CardForm from "../../pages/KanbanBoard/CardForm";

export default function KanbanBoard() {
  const [data, setData] = useState(initialData);
  const [selectedCard, setSelectedCard] = useState(null);

  // 🔥 Zoom state
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 2)); // max 200%
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5)); // min 50%
  const resetZoom = () => setZoom(1);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newCardIds = Array.from(start.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, cardIds: newCardIds };

      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    const startCardIds = Array.from(start.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = { ...start, cardIds: startCardIds };

    const finishCardIds = Array.from(finish.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, cardIds: finishCardIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  return (
    <>
      {/* 🔥 Zoom Buttons */}
      <div className="zoom-controls">
        <button onClick={zoomOut}>−</button>
        <button onClick={zoomIn}>+</button>
        <button onClick={resetZoom}>Reset</button>
      </div>

      <div className="kanban-container">
        <div
          className="kanban-zoom-wrapper"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            transition: "transform 0.2s ease",
          }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {data.columnOrder.map((colId) => {
                const column = data.columns[colId];
                const cards = column.cardIds.map((id) => data.cards[id]);
                return (
                  <Column
                    key={column.id}
                    column={column}
                    cards={cards}
                    setSelectedCard={setSelectedCard}
                  />
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      {selectedCard && (
        <CardForm
          show={!!selectedCard}
          close={() => setSelectedCard(null)}
          card={selectedCard}
        />
      )}
    </>
  );
}
