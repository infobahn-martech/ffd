import { useState, useCallback, useMemo, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { initialData } from "../../helpers/data";
import Column from "./Column";
import CardForm from "./CardForm";
import Workspaces from "../Workspaces";
import "../../design/scss/common.scss";

export default function KanbanBoard() {
  const [data, setData] = useState(initialData);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const [isBoardExpanded, setIsBoardExpanded] = useState(true);

  const handleSelectCard = useCallback(card => {
    setSelectedCard(card);
    setIsAddMode(false);
  }, []);
  const handleCloseCard = useCallback(() => {
    setSelectedCard(null);
    setIsAddMode(false);
  }, []);

  // Listen for add card event from SideNav
  useEffect(() => {
    const handleAddCard = () => {
      // Create a new empty card object for add mode
      const newCard = {
        id: `new-${Date.now()}`,
        code: '',
        title: '',
        color: '#2A00FF',
      };
      setSelectedCard(newCard);
      setIsAddMode(true);
    };

    const handleShowWorkspaces = () => {
      setShowWorkspaces(true);
    };

    const handleHideWorkspaces = () => {
      setShowWorkspaces(false);
    };

    window.addEventListener('kanban:add-card', handleAddCard);
    window.addEventListener('kanban:show-workspaces', handleShowWorkspaces);
    window.addEventListener('kanban:hide-workspaces', handleHideWorkspaces);
    return () => {
      window.removeEventListener('kanban:add-card', handleAddCard);
      window.removeEventListener('kanban:show-workspaces', handleShowWorkspaces);
      window.removeEventListener('kanban:hide-workspaces', handleHideWorkspaces);
    };
  }, []);

  // Find which column contains a specific card
  const findCardColumn = useCallback((cardId) => {
    for (const colId of data.columnOrder) {
      const column = data.columns[colId];
      if (column.cardIds.includes(cardId)) {
        return column;
      }
    }
    return null;
  }, [data]);

  // Move card to a specific column by column ID
  const moveCardToColumn = useCallback((cardId, targetColumnId) => {
    const sourceColumn = findCardColumn(cardId);
    if (!sourceColumn) return;

    const targetColumn = data.columns[targetColumnId];
    if (!targetColumn) return;

    // If card is already in target column, do nothing
    if (sourceColumn.id === targetColumnId) return;

    const startCardIds = Array.from(sourceColumn.cardIds);
    const cardIndex = startCardIds.indexOf(cardId);
    if (cardIndex === -1) return;

    // Remove card from source column
    startCardIds.splice(cardIndex, 1);
    const newStart = { ...sourceColumn, cardIds: startCardIds };

    // Add card to beginning of target column (first position)
    const finishCardIds = Array.from(targetColumn.cardIds);
    finishCardIds.unshift(cardId);
    const newFinish = { ...targetColumn, cardIds: finishCardIds };

    setData(prevData => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  }, [data, findCardColumn]);

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

  const toggleBoard = useCallback(() => {
    setIsBoardExpanded(prev => !prev);
  }, []);

  // Show Workspaces view when Workspaces icon is clicked
  if (showWorkspaces) {
    return <Workspaces />;
  }

  return (
    <>
      <div className="kanban-accordion">
        <div
          className="kanban-accordion-header"
          onClick={toggleBoard}
        >
          <h2 className="kanban-accordion-title">Cards workflow</h2>
          <span className={`kanban-accordion-icon ${isBoardExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>

        {isBoardExpanded && (
          <div className="kanban-container">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="kanban-board">
                {columns}
              </div>
            </DragDropContext>
          </div>
        )}
      </div>

      {selectedCard && (
        <CardForm
          show={true}
          close={handleCloseCard}
          card={selectedCard}
          moveCardToColumn={moveCardToColumn}
          columns={data.columns}
          currentColumn={isAddMode ? null : findCardColumn(selectedCard.id)}
          isAddMode={isAddMode}
        />
      )}
    </>
  );
}
