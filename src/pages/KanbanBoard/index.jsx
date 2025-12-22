import { useState, useCallback, useMemo, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { initialData } from "../../helpers/data";
import Column from "./Column";
import CardForm from "./CardForm";
import Workspaces from "../Workspaces";
import "../../design/scss/common.scss";

export default function KanbanBoard() {
  const [workflows, setWorkflows] = useState(initialData);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  // Track expanded state for each workflow
  const [expandedWorkflows, setExpandedWorkflows] = useState(() => {
    const state = {};
    initialData.forEach(workflow => {
      state[workflow.id] = true; // All workflows expanded by default
    });
    return state;
  });

  // Track expanded column for each workflow (columnId or null)
  const [expandedColumns, setExpandedColumns] = useState(() => {
    const state = {};
    initialData.forEach(workflow => {
      state[workflow.id] = null; // No column expanded by default
    });
    return state;
  });

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
    for (const workflow of workflows) {
      for (const colId of workflow.columnOrder) {
        const column = workflow.columns[colId];
        if (column.cardIds.includes(cardId)) {
          return column;
        }
      }
    }
    return null;
  }, [workflows]);

  // Move card to a specific column by column ID
  const moveCardToColumn = useCallback((cardId, targetColumnId) => {
    const sourceColumn = findCardColumn(cardId);
    if (!sourceColumn) return;

    // Find the workflow that contains the source column
    let sourceWorkflowIndex = -1;
    let sourceColumnKey = null;
    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      const foundKey = Object.keys(workflow.columns).find(key => workflow.columns[key].id === sourceColumn.id);
      if (foundKey) {
        sourceWorkflowIndex = i;
        sourceColumnKey = foundKey;
        break;
      }
    }

    // Find the workflow and target column by id property
    let targetColumn = null;
    let targetWorkflowIndex = -1;
    let targetColumnKey = null;
    
    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      const foundColumn = Object.values(workflow.columns).find(col => col.id === targetColumnId);
      if (foundColumn) {
        targetColumn = foundColumn;
        targetWorkflowIndex = i;
        targetColumnKey = Object.keys(workflow.columns).find(key => workflow.columns[key].id === targetColumnId);
        break;
      }
    }

    if (!targetColumn || targetWorkflowIndex === -1 || !targetColumnKey || sourceWorkflowIndex === -1 || !sourceColumnKey) return;

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

    setWorkflows(prevWorkflows => {
      const updated = [...prevWorkflows];
      
      // Update source workflow
      if (sourceWorkflowIndex === targetWorkflowIndex) {
        // Same workflow - update both columns
        updated[sourceWorkflowIndex] = {
          ...updated[sourceWorkflowIndex],
          columns: {
            ...updated[sourceWorkflowIndex].columns,
            [sourceColumnKey]: newStart,
            [targetColumnKey]: newFinish,
          },
        };
      } else {
        // Different workflows - update both
        updated[sourceWorkflowIndex] = {
          ...updated[sourceWorkflowIndex],
          columns: {
            ...updated[sourceWorkflowIndex].columns,
            [sourceColumnKey]: newStart,
          },
        };
        updated[targetWorkflowIndex] = {
          ...updated[targetWorkflowIndex],
          columns: {
            ...updated[targetWorkflowIndex].columns,
            [targetColumnKey]: newFinish,
          },
        };
      }
      return updated;
    });
  }, [workflows, findCardColumn]);

  // Create drag end handler for a specific workflow
  const createDragEndHandler = useCallback((workflowId) => {
    return (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      // Find columns by their id property (not by object key)
      const start = Object.values(workflow.columns).find(col => col.id === source.droppableId);
      const finish = Object.values(workflow.columns).find(col => col.id === destination.droppableId);

      if (!start || !finish) return;

      if (start === finish) {
        const newCardIds = Array.from(start.cardIds);
        newCardIds.splice(source.index, 1);
        newCardIds.splice(destination.index, 0, draggableId);

        const newColumn = { ...start, cardIds: newCardIds };

        // Find the column key to update
        const columnKey = Object.keys(workflow.columns).find(key => workflow.columns[key].id === newColumn.id);
        
        setWorkflows(prevWorkflows =>
          prevWorkflows.map(w =>
            w.id === workflowId
              ? { ...w, columns: { ...w.columns, [columnKey]: newColumn } }
              : w
          )
        );
        return;
      }

      const startCardIds = Array.from(start.cardIds);
      startCardIds.splice(source.index, 1);
      const newStart = { ...start, cardIds: startCardIds };

      const finishCardIds = Array.from(finish.cardIds);
      finishCardIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finish, cardIds: finishCardIds };

      // Find the column keys to update
      const startColumnKey = Object.keys(workflow.columns).find(key => workflow.columns[key].id === newStart.id);
      const finishColumnKey = Object.keys(workflow.columns).find(key => workflow.columns[key].id === newFinish.id);

      setWorkflows(prevWorkflows =>
        prevWorkflows.map(w =>
          w.id === workflowId
            ? { ...w, columns: { ...w.columns, [startColumnKey]: newStart, [finishColumnKey]: newFinish } }
            : w
        )
      );
    };
  }, [workflows]);

  // Toggle workflow expansion
  const toggleWorkflow = useCallback((workflowId) => {
    setExpandedWorkflows(prev => ({
      ...prev,
      [workflowId]: !prev[workflowId]
    }));
  }, []);

  // Handle column header click to expand/shrink
  const handleColumnHeaderClick = useCallback((workflowId, columnId) => {
    setExpandedColumns(prev => {
      const currentExpanded = prev[workflowId];
      // If clicking the same column, collapse it. Otherwise, expand the clicked column.
      return {
        ...prev,
        [workflowId]: currentExpanded === columnId ? null : columnId
      };
    });
  }, []);

  // Render columns for a workflow
  const renderWorkflowColumns = useCallback((workflow) => {
    const expandedColumnId = expandedColumns[workflow.id];
    return workflow.columnOrder.map(colId => {
      const column = workflow.columns[colId];
      const cards = column.cardIds.map(id => workflow.cards[id]);
      const isExpanded = expandedColumnId === column.id;
      const isShrunk = expandedColumnId !== null && expandedColumnId !== column.id;
      return (
        <Column
          key={column.id}
          column={column}
          cards={cards}
          setSelectedCard={handleSelectCard}
          isExpanded={isExpanded}
          isShrunk={isShrunk}
          onHeaderClick={() => handleColumnHeaderClick(workflow.id, column.id)}
        />
      );
    });
  }, [handleSelectCard, expandedColumns, handleColumnHeaderClick]);

  // Show Workspaces view when Workspaces icon is clicked
  if (showWorkspaces) {
    return <Workspaces />;
  }

  // Find the workflow that contains the selected card
  const getSelectedCardWorkflow = useCallback(() => {
    if (!selectedCard) return null;
    return workflows.find(workflow =>
      Object.values(workflow.cards).some(card => card.id === selectedCard.id)
    );
  }, [selectedCard, workflows]);

  const selectedCardWorkflow = getSelectedCardWorkflow();
  
  // For add mode, use the first workflow's columns if no workflow is found
  const columnsForCardForm = useMemo(() => {
    if (isAddMode && !selectedCardWorkflow && workflows.length > 0) {
      return workflows[0].columns;
    }
    return selectedCardWorkflow?.columns;
  }, [isAddMode, selectedCardWorkflow, workflows]);

  return (
    <>
      {workflows.map((workflow) => (
        <div key={workflow.id} className="kanban-accordion">
          <div
            className="kanban-accordion-header"
            onClick={() => toggleWorkflow(workflow.id)}
          >
            <h2 className="kanban-accordion-title">{workflow.title}</h2>
            <span className={`kanban-accordion-icon ${expandedWorkflows[workflow.id] ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>

          {expandedWorkflows[workflow.id] && (
            <div className="kanban-container">
              <DragDropContext onDragEnd={createDragEndHandler(workflow.id)}>
                <div className="kanban-board">
                  {renderWorkflowColumns(workflow)}
                </div>
              </DragDropContext>
            </div>
          )}
        </div>
      ))}

      {selectedCard && columnsForCardForm && (
        <CardForm
          show={true}
          close={handleCloseCard}
          card={selectedCard}
          moveCardToColumn={moveCardToColumn}
          columns={columnsForCardForm}
          currentColumn={isAddMode ? null : findCardColumn(selectedCard.id)}
          isAddMode={isAddMode}
        />
      )}
    </>
  );
}
