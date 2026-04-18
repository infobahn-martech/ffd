import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useLayoutView } from "../../../context/LayoutViewContext";
import Workspaces from "../../Workspaces";
import useSyncKanbanSidebarWorkflows from "../../../hooks/useSyncKanbanSidebarWorkflows";
import useKanbanAddCardFromSidebar from "../../../hooks/useKanbanAddCardFromSidebar";
import { getAddModeCardFormWorkflow } from "../../../helpers/kanbanSidebarWorkflow";
import KanbanBoardContent from "../components/board/KanbanBoardContent";
import CardForm from "../components/cards/CardForm";
import ContextMenu from "../components/menus/ContextMenu";
import AccordionMenu from "../components/menus/AccordionMenu";
import useKanbanBoardState from "../hooks/useKanbanBoardState";
import useWorkflowExpansion from "../hooks/useWorkflowExpansion";
import useWorkflowPinning from "../hooks/useWorkflowPinning";
import useColumnHeights from "../hooks/useColumnHeights";
import useKanbanDnD from "../hooks/useKanbanDnD";
import useKanbanRoleAccess from "../hooks/useKanbanRoleAccess";
import { createNewCardDraft } from "../utils/cardHelpers";
import { findWorkflowByCardId, resolveCardFormBoardId } from "../utils/boardHelpers";

export default function KanbanBoardPage() {
  const { boardId: boardIdParam } = useParams();
  const location = useLocation();
  const selectedBoardId = useMemo(() => {
    if (boardIdParam != null && boardIdParam !== "") return boardIdParam;
    const segments = location.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] === "operator" ? "operator" : null;
  }, [boardIdParam, location.pathname]);

  const isOperatorBoard = String(selectedBoardId ?? "").toLowerCase() === "operator";
  const { layoutView } = useLayoutView();
  const isClassicLayout = layoutView === "classic";
  const isModernLayout = layoutView === "modern";
  const isDarkMode = layoutView === "dark";

  const {
    workflows,
    setWorkflows,
    refetchBoard,
    boardLoading,
    boardLoadError,
    selectedCard,
    setSelectedCard,
    isAddMode,
    setIsAddMode,
    showWorkspaces,
    addTargetWorkflowId,
    setAddTargetWorkflowId,
    handleSelectCard,
    handleCloseCard,
  } = useKanbanBoardState(selectedBoardId);

  const {
    expandedWorkflows,
    expandedColumns,
    toggleWorkflow,
    expandWorkflow,
    collapseWorkflow,
    handleColumnHeaderClick,
  } = useWorkflowExpansion(workflows);

  const { pinnedWorkflows, toggleWorkflowPin } = useWorkflowPinning(
    workflows,
    setWorkflows
  );
  const { maxColumnHeights, handleColumnHeightChange } = useColumnHeights(workflows);
  const { findCardColumn, moveCardToColumn, createDragEndHandler } = useKanbanDnD(
    workflows,
    setWorkflows
  );

  useKanbanRoleAccess();

  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuColumn, setContextMenuColumn] = useState(null);
  const [accordionMenu, setAccordionMenu] = useState(null);
  const [accordionMenuWorkflowId, setAccordionMenuWorkflowId] = useState(null);

  useSyncKanbanSidebarWorkflows(workflows);
  useKanbanAddCardFromSidebar({
    setSelectedCard,
    setIsAddMode,
    setAddTargetWorkflowId,
  });

  const handleAccordionMenuClick = useCallback((event, workflowId) => {
    event.stopPropagation();
    setAccordionMenu({
      x: event.clientX,
      y: event.clientY,
    });
    setAccordionMenuWorkflowId(workflowId);
  }, []);

  const handleCloseAccordionMenu = useCallback(() => {
    setAccordionMenu(null);
    setAccordionMenuWorkflowId(null);
  }, []);

  const handleAccordionExpand = useCallback(() => {
    if (accordionMenuWorkflowId) {
      expandWorkflow(accordionMenuWorkflowId);
    }
  }, [accordionMenuWorkflowId, expandWorkflow]);

  const handleAccordionCollapse = useCallback(() => {
    if (accordionMenuWorkflowId) {
      collapseWorkflow(accordionMenuWorkflowId);
    }
  }, [accordionMenuWorkflowId, collapseWorkflow]);

  const handleTogglePin = useCallback(() => {
    if (!accordionMenuWorkflowId) return;
    toggleWorkflowPin(accordionMenuWorkflowId);
    handleCloseAccordionMenu();
  }, [accordionMenuWorkflowId, toggleWorkflowPin, handleCloseAccordionMenu]);

  const handleColumnContextMenu = useCallback((event, column) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuColumn(column);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
    setContextMenuColumn(null);
  }, []);

  const handleCreateCard = useCallback(() => {
    const newCard = createNewCardDraft(contextMenuColumn?.color);
    setSelectedCard(newCard);
    setIsAddMode(true);
    setAddTargetWorkflowId(null);
  }, [contextMenuColumn, setSelectedCard, setIsAddMode, setAddTargetWorkflowId]);

  const handleWorkflowColumnHeightChange = useCallback(
    (columnId, height, laneId) => {
      handleColumnHeightChange(workflows, columnId, height, laneId);
    },
    [handleColumnHeightChange, workflows]
  );

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        handleCloseContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
    return undefined;
  }, [contextMenu, handleCloseContextMenu]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (accordionMenu) {
        handleCloseAccordionMenu();
      }
    };

    if (accordionMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
    return undefined;
  }, [accordionMenu, handleCloseAccordionMenu]);

  const selectedCardWorkflow = useMemo(() => {
    if (!selectedCard) return null;
    return findWorkflowByCardId(workflows, selectedCard.id);
  }, [selectedCard, workflows]);

  const addModeCardWorkflow = useMemo(
    () =>
      getAddModeCardFormWorkflow(
        workflows,
        isAddMode,
        selectedCardWorkflow,
        addTargetWorkflowId
      ),
    [workflows, isAddMode, selectedCardWorkflow, addTargetWorkflowId]
  );

  const columnsForCardForm = addModeCardWorkflow?.columns;
  const columnOrderForCardForm = addModeCardWorkflow?.columnOrder;

  if (showWorkspaces) {
    return <Workspaces />;
  }

  return (
    <div
      className={
        isDarkMode ? "kanban-board-wrapper kanban-board-wrapper-dark" : "kanban-board-wrapper"
      }
    >
      {boardLoadError && !isOperatorBoard && (
        <div
          className="kanban-board-load-banner"
          role="status"
          style={{
            padding: "8px 16px",
            fontSize: 13,
            color: isDarkMode ? "#e0e0e0" : "#5c5c5c",
            background: isDarkMode ? "#2a2a2a" : "#fff3cd",
            borderBottom: `1px solid ${isDarkMode ? "#444" : "#ffc107"}`,
          }}
        >
          {boardLoadError}
        </div>
      )}
      <div style={{ position: "relative" }}>
        {boardLoading && !isOperatorBoard && (
          <div
            aria-busy="true"
            aria-live="polite"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isDarkMode ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.6)",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: 14, color: isDarkMode ? "#e0e0e0" : "#333" }}>
              Loading board…
            </span>
          </div>
        )}
        <KanbanBoardContent
          workflows={workflows}
          boardLoading={boardLoading}
          suppressEmptyMessage={isOperatorBoard}
          expandedWorkflows={expandedWorkflows}
          expandedColumns={expandedColumns}
          maxColumnHeights={maxColumnHeights}
          createDragEndHandler={createDragEndHandler}
          onSelectCard={handleSelectCard}
          onColumnHeaderClick={handleColumnHeaderClick}
          onContextMenu={handleColumnContextMenu}
          onHeightChange={handleWorkflowColumnHeightChange}
          onToggleWorkflow={toggleWorkflow}
          onAccordionMenuClick={handleAccordionMenuClick}
          isClassicLayout={isClassicLayout}
          isModernLayout={isModernLayout}
          isDarkMode={isDarkMode}
          layoutView={layoutView}
        />
      </div>

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
          boardId={resolveCardFormBoardId(addModeCardWorkflow)}
          onBoardRefresh={isOperatorBoard ? undefined : refetchBoard}
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
        isExpanded={
          accordionMenuWorkflowId ? expandedWorkflows[accordionMenuWorkflowId] : false
        }
        isPinned={
          accordionMenuWorkflowId ? pinnedWorkflows[accordionMenuWorkflowId] : false
        }
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}
