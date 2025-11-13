import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";

import { initialData } from "../../utils/data";
import Column from "../Column";

export default function KanbanBoard() {
  const [data, setData] = useState(initialData);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);

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
    <div className="kanban-container">
      <div style={{ overflow: 'visible', position: 'relative', height: '100%' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {data.columnOrder.map((colId) => {
            const column = data.columns[colId];
            const cards = column.cardIds.map((id) => data.cards[id]);
            return <Column key={column.id} column={column} cards={cards} isCardFormOpen={isCardFormOpen} setIsCardFormOpen={setIsCardFormOpen} />;
          })}
        </div>
      </DragDropContext>
      </div>
    </div>
  );
}
