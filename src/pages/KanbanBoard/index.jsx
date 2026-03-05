import { useState, useCallback, useMemo, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { FiLayers } from "react-icons/fi";
import { initialData } from "../../helpers/data";
import { useLayoutView } from "../../context/LayoutViewContext";
import Column from "./Column";
import CardForm from "./CardForm";
import ContextMenu from "./ContextMenu";
import AccordionMenu from "./AccordionMenu";
import Workspaces from "../Workspaces";
import "../../design/scss/common.scss";

export default function KanbanBoard() {
  const { layoutView } = useLayoutView();
  const isClassicLayout = layoutView === 'classic';
  const isModernLayout = layoutView === 'modern';
  const isDarkMode = layoutView === 'dark';
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

  // Track pinned workflows (true means pinned)
  const [pinnedWorkflows, setPinnedWorkflows] = useState(() => {
    const state = {};
    initialData.forEach(workflow => {
      state[workflow.id] = false;
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

  // Control expand/shrink functionality
  const [enableExpandShrink, setEnableExpandShrink] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuColumn, setContextMenuColumn] = useState(null);

  // Accordion menu state
  const [accordionMenu, setAccordionMenu] = useState(null);
  const [accordionMenuWorkflowId, setAccordionMenuWorkflowId] = useState(null);

  // Track column heights per workflow
  const [columnHeights, setColumnHeights] = useState(() => {
    const state = {};
    initialData.forEach(workflow => {
      state[workflow.id] = {};
    });
    return state;
  });

  // Track max height per workflow
  const [maxColumnHeights, setMaxColumnHeights] = useState(() => {
    const state = {};
    initialData.forEach(workflow => {
      state[workflow.id] = 0;
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

  // Expand workflow
  const expandWorkflow = useCallback((workflowId) => {
    setExpandedWorkflows(prev => ({
      ...prev,
      [workflowId]: true
    }));
  }, []);

  // Collapse workflow
  const collapseWorkflow = useCallback((workflowId) => {
    setExpandedWorkflows(prev => ({
      ...prev,
      [workflowId]: false
    }));
  }, []);

  // Handle accordion menu button click
  const handleAccordionMenuClick = useCallback((e, workflowId) => {
    e.stopPropagation(); // Prevent accordion toggle
    setAccordionMenu({
      x: e.clientX,
      y: e.clientY,
    });
    setAccordionMenuWorkflowId(workflowId);
  }, []);

  // Close accordion menu
  const handleCloseAccordionMenu = useCallback(() => {
    setAccordionMenu(null);
    setAccordionMenuWorkflowId(null);
  }, []);

  // Keep pinned workflows at the top while preserving order within groups
  const reorderWorkflows = useCallback((pinState, currentWorkflows) => {
    const pinned = currentWorkflows.filter(w => pinState[w.id]);
    const unpinned = currentWorkflows.filter(w => !pinState[w.id]);
    return [...pinned, ...unpinned];
  }, []);

  // Handle expand from accordion menu
  const handleAccordionExpand = useCallback(() => {
    if (accordionMenuWorkflowId) {
      expandWorkflow(accordionMenuWorkflowId);
    }
  }, [accordionMenuWorkflowId, expandWorkflow]);

  // Handle collapse from accordion menu
  const handleAccordionCollapse = useCallback(() => {
    if (accordionMenuWorkflowId) {
      collapseWorkflow(accordionMenuWorkflowId);
    }
  }, [accordionMenuWorkflowId, collapseWorkflow]);

  // Handle pin/unpin from accordion menu
  const handleTogglePin = useCallback(() => {
    if (!accordionMenuWorkflowId) return;

    setPinnedWorkflows(prev => {
      const updated = {
        ...prev,
        [accordionMenuWorkflowId]: !prev[accordionMenuWorkflowId]
      };
      setWorkflows(prevWorkflows => reorderWorkflows(updated, prevWorkflows));
      return updated;
    });

    handleCloseAccordionMenu();
  }, [accordionMenuWorkflowId, reorderWorkflows, handleCloseAccordionMenu]);

  // Close accordion menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (accordionMenu) {
        handleCloseAccordionMenu();
      }
    };

    if (accordionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [accordionMenu, handleCloseAccordionMenu]);

  // Handle column header click to expand/shrink
  const handleColumnHeaderClick = useCallback((workflowId, columnId) => {
    if (!enableExpandShrink) return; // Disable functionality when false
    setExpandedColumns(prev => {
      const currentExpanded = prev[workflowId];
      // If clicking the same column, collapse it. Otherwise, expand the clicked column.
      return {
        ...prev,
        [workflowId]: currentExpanded === columnId ? null : columnId
      };
    });
  }, [enableExpandShrink]);

  // Handle column context menu (right-click)
  const handleColumnContextMenu = useCallback((e, column) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
    setContextMenuColumn(column);
  }, []);

  // Close context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
    setContextMenuColumn(null);
  }, []);

  // Context menu actions
  const handleCreateCard = useCallback(() => {
    const newCard = {
      id: `new-${Date.now()}`,
      title: '',
      color: contextMenuColumn?.color || '#2A00FF',
    };
    setSelectedCard(newCard);
    setIsAddMode(true);
    // If we have a column, we could potentially set the initial column for the card
  }, [contextMenuColumn]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        handleCloseContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu, handleCloseContextMenu]);


  // Handle column height change with batching for better performance
  const handleColumnHeightChange = useCallback((columnId, height) => {
    // Find which workflow contains this column
    const workflow = workflows.find(w =>
      Object.values(w.columns).some(col => col.id === columnId)
    );

    if (!workflow) return;

    // Use functional update to batch state changes
    setColumnHeights(prev => {
      const newHeights = {
        ...prev,
        [workflow.id]: {
          ...prev[workflow.id],
          [columnId]: height
        }
      };

      // Calculate max height for this workflow
      const heights = Object.values(newHeights[workflow.id]);
      const maxHeight = heights.length > 0 ? Math.max(...heights) : 0;

      // Only update if max height actually changed to avoid unnecessary re-renders
      setMaxColumnHeights(prevMax => {
        if (prevMax[workflow.id] === maxHeight) {
          return prevMax; // No change, return same object
        }
        return {
          ...prevMax,
          [workflow.id]: maxHeight
        };
      });

      return newHeights;
    });
  }, [workflows]);

  // Render columns for a workflow
  const renderWorkflowColumns = useCallback((workflow) => {
    const expandedColumnId = expandedColumns[workflow.id];
    const maxHeight = maxColumnHeights[workflow.id] || 0;

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
          onContextMenu={handleColumnContextMenu}
          columnHeight={maxHeight > 0 ? maxHeight : undefined}
          onHeightChange={handleColumnHeightChange}
          isClassicLayout={isClassicLayout}
          isModernLayout={isModernLayout}
          isDarkMode={isDarkMode}
        />
      );
    });
  }, [handleSelectCard, expandedColumns, handleColumnHeaderClick, handleColumnContextMenu, maxColumnHeights, handleColumnHeightChange, isClassicLayout, isModernLayout, isDarkMode]);

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

  const columnOrderForCardForm = useMemo(() => {
    if (isAddMode && !selectedCardWorkflow && workflows.length > 0) {
      return workflows[0].columnOrder;
    }
    return selectedCardWorkflow?.columnOrder;
  }, [isAddMode, selectedCardWorkflow, workflows]);

  return (
    <div className={isDarkMode ? 'kanban-board-wrapper kanban-board-wrapper-dark' : 'kanban-board-wrapper'}>
      {workflows.map((workflow) => (
        <div key={workflow.id} className={`kanban-accordion ${isDarkMode ? 'kanban-dark-mode' : ''}`}>
          <div
            className="kanban-accordion-header"
            onClick={() => toggleWorkflow(workflow.id)}
          >
            <div className="kanban-accordion-title-row">
              <FiLayers className="kanban-accordion-title-icon" aria-hidden />
              <h2 className="kanban-accordion-title">{workflow.title}</h2>
            </div>
            <div className="kanban-accordion-actions">
              <button
                className="accordion-menu-button"
                onClick={(e) => handleAccordionMenuClick(e, workflow.id)}
                aria-label="Menu"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="4.5" r="1.5" fill="currentColor" />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                  <circle cx="9" cy="13.5" r="1.5" fill="currentColor" />
                </svg>
              </button>
              <span className={`kanban-accordion-icon ${expandedWorkflows[workflow.id] ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
          </div>

          {expandedWorkflows[workflow.id] && (
            <div
              className={`kanban-container ${isClassicLayout ? 'kanban-classic-layout' : ''
                } ${isModernLayout ? 'kanban-modern-layout' : ''} ${layoutView === 'normal' ? 'kanban-normal-layout' : ''
                }`}
              key={layoutView}
            >
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
          columnOrder={columnOrderForCardForm}
          currentColumn={isAddMode ? null : findCardColumn(selectedCard.id)}
          isAddMode={isAddMode}
        />
      )}

      <ContextMenu
        position={contextMenu}
        onClose={handleCloseContextMenu}
        onCreateCard={handleCreateCard}
      />

      <AccordionMenu
        position={accordionMenu}
        onClose={handleCloseAccordionMenu}
        onExpand={handleAccordionExpand}
        onCollapse={handleAccordionCollapse}
        isExpanded={accordionMenuWorkflowId ? expandedWorkflows[accordionMenuWorkflowId] : false}
        isPinned={accordionMenuWorkflowId ? pinnedWorkflows[accordionMenuWorkflowId] : false}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}
