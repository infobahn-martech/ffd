import { useState, useCallback, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { initialData } from "../../helpers/data";
import Column from "./Column";
import CardForm from "./CardForm";
import ZoomControls from "./ZoomControls";
import "../../design/scss/common.scss";

const MAX_ZOOM = 2;
const MIN_ZOOM = 0.5;
const ZOOM_STEP = 0.1;

export default function KanbanBoard() {
  const [data, setData] = useState(initialData);
  const [selectedCard, setSelectedCard] = useState(null);
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  const handleSelectCard = useCallback(card => setSelectedCard(card), []);
  const handleCloseCard = useCallback(() => setSelectedCard(null), []);

  const onDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newCardIds = Array.from(start.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, cardIds: newCardIds };

      setData(prevData => ({
        ...prevData,
        columns: { ...prevData.columns, [newColumn.id]: newColumn },
      }));
      return;
    }

    const startCardIds = Array.from(start.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = { ...start, cardIds: startCardIds };

    const finishCardIds = Array.from(finish.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, cardIds: finishCardIds };

    setData(prevData => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  }, [data]);

  const columns = useMemo(() =>
    data.columnOrder.map(colId => {
      const column = data.columns[colId];
      const cards = column.cardIds.map(id => data.cards[id]);
      return (
        <Column
          key={column.id}
          column={column}
          cards={cards}
          setSelectedCard={handleSelectCard}
        />
      );
    }), [data, handleSelectCard]
  );

  return (
    <>
      <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} resetZoom={resetZoom} />

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
              {columns}
            </div>
          </DragDropContext>
        </div>
      </div>

      {selectedCard && (
        <CardForm
          show={true}
          close={handleCloseCard}
          card={selectedCard}
        />
      )}
    </>
  );
}
