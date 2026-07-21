import { useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { KANBAN_DND_DISABLED } from "../../../../shared/constants/kanbanConfig";
import ColumnHeader from "./ColumnHeader";
import SwimlaneColumnCell from "./SwimlaneColumnCell";
import {
  countCardsInColumn,
  getSwimlaneColumnCards,
  getColumnHeaderGroups,
} from "../../utils/columnHelpers";
import { BOARD_COLUMN_GAP_PX, getBoardGridTemplateColumns } from "../../utils/boardGridHelpers";
import { sanitizeSwimlaneColorCode, pickForegroundOnSwimlaneBackground } from "../../../EditWorkflows/workflow.utils";
import "../../../../design/scss/pages/kanban-board/swimlaneBoard.scss";

export default function WorkflowColumns({
  workflow,
  expandedColumns,
  maxColumnHeights,
  onDragEnd,
  onSelectCard,
  onColumnHeaderClick,
  onContextMenu,
  onHeightChange,
  isClassicLayout,
  isModernLayout,
  isDarkMode,
  layoutView,
}) {
  const expandedColumnId = expandedColumns[workflow.id];
  const maxHeight = maxColumnHeights[workflow.id] || 0;

  const swimlaneOrder = workflow.swimlaneOrder?.length
    ? workflow.swimlaneOrder
    : ["lane-default"];

  const shouldShowSwimlaneTitle = swimlaneOrder.length > 1;

  /* Outer board grid: one fixed-px track per column (see getColumnWidth / getBoardGridTemplateColumns) */
  const boardGridTemplateColumns = useMemo(
    () =>
      getBoardGridTemplateColumns(
        workflow.columns,
        workflow.columnOrder,
        expandedColumnId,
        layoutView
      ),
    [workflow.columns, workflow.columnOrder, expandedColumnId, layoutView]
  );

  const headerGroups = useMemo(
    () => getColumnHeaderGroups(workflow),
    [workflow.columns, workflow.columnOrder]
  );

  const boardRowGridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: boardGridTemplateColumns,
      gap: `${BOARD_COLUMN_GAP_PX}px`,
      width: "max-content",
      minWidth: "100%",
      alignItems: "stretch",
    }),
    [boardGridTemplateColumns]
  );

  return (
    <div
      className={`kanban-container kanban-container--board-hscroll ${isClassicLayout ? "kanban-classic-layout" : ""} ${isModernLayout ? "kanban-modern-layout" : ""
        } ${layoutView === "normal" ? "kanban-normal-layout" : ""}`}
      key={layoutView}
    >
      <DragDropContext onDragEnd={KANBAN_DND_DISABLED ? () => {} : onDragEnd}>
        <div
          className={`kanban-board kanban-board--swimlanes ${!shouldShowSwimlaneTitle ? "kanban-board--single-swimlane" : ""}`}
        >
          {/* --- Column headers (workflow stages): same grid tracks as swimlane rows below --- */}
          <div className="kanban-board__header-row" style={boardRowGridStyle}>
            {headerGroups.map((group) => {
              const firstColumn = workflow.columns[group.colKeys[0]];
              const isGrouped = group.colKeys.length > 1;
              const displayColumn = isGrouped
                ? {
                    id: firstColumn.id,
                    title: firstColumn.parentTitle || firstColumn.title,
                    color: firstColumn.color,
                    wipLimit: null,
                  }
                : firstColumn;

              const groupColumnIds = group.colKeys.map((k) => workflow.columns[k].id);
              const isExpanded = groupColumnIds.includes(expandedColumnId);
              const isShrunk = expandedColumnId !== null && !isExpanded;
              const cardCount = group.colKeys.reduce(
                (sum, k) => sum + countCardsInColumn(workflow, k),
                0
              );
              const wipDisplay = String(cardCount);

              return (
                <div
                  key={group.key}
                  className={`kanban-board__header-slot ${isExpanded ? "kanban-board__header-slot--expanded" : ""} ${isShrunk ? "kanban-board__header-slot--shrunk" : ""
                    }`}
                  style={isGrouped ? { gridColumn: `span ${group.colKeys.length}` } : undefined}
                >
                  <ColumnHeader
                    column={displayColumn}
                    wipDisplay={wipDisplay}
                    isShrunk={isShrunk}
                    onHeaderClick={() => onColumnHeaderClick(workflow.id, firstColumn.id)}
                    isClassicLayout={isClassicLayout}
                    isModernLayout={isModernLayout}
                    isDarkMode={isDarkMode}
                  />
                </div>
              );
            })}
          </div>

          {/* --- Swimlane rows: each lane is a full-width band; one droppable cell per column --- */}
          {swimlaneOrder.map((laneId) => {
            const lane = workflow.swimlanes?.[laneId];
            if (!lane) return null;

            /* Only real (non-default) swimlane colors get the colored title band — see workflow-swimlane-label-cell / board-minimap-lane-label for the same convention */
            const laneColorHex = sanitizeSwimlaneColorCode(lane.color);
            const hasLaneColor = Boolean(laneColorHex) && laneColorHex !== "#ffffff";

            return (
              <section
                className={`kanban-swimlane ${!shouldShowSwimlaneTitle ? "kanban-swimlane--single" : ""}`}
                key={laneId}
                aria-label={lane.title}
                style={
                  !shouldShowSwimlaneTitle && hasLaneColor
                    ? { borderLeft: `3px solid ${laneColorHex}` }
                    : undefined
                }
              >
                {shouldShowSwimlaneTitle && (
                  <div
                    className="kanban-swimlane__title"
                    style={
                      hasLaneColor
                        ? {
                            backgroundColor: laneColorHex,
                            color: pickForegroundOnSwimlaneBackground(laneColorHex),
                          }
                        : undefined
                    }
                  >
                    {lane.title}
                  </div>
                )}
                {/* Same gridTemplateColumns as header row — keeps headers and cells aligned */}
                <div className="kanban-swimlane__columns" style={boardRowGridStyle}>
                  {workflow.columnOrder.map((colKey) => {
                    const column = workflow.columns[colKey];
                    const cards = getSwimlaneColumnCards(workflow, laneId, colKey);
                    const isExpanded = expandedColumnId === column.id;
                    const isShrunk = expandedColumnId !== null && expandedColumnId !== column.id;

                    return (
                      <SwimlaneColumnCell
                        key={`${laneId}-${column.id}`}
                        laneId={laneId}
                        column={column}
                        cards={cards}
                        setSelectedCard={onSelectCard}
                        isExpanded={isExpanded}
                        isShrunk={isShrunk}
                        onContextMenu={onContextMenu}
                        columnHeight={maxHeight > 0 ? maxHeight : undefined}
                        onHeightChange={onHeightChange}
                        isClassicLayout={isClassicLayout}
                        isModernLayout={isModernLayout}
                        isDarkMode={isDarkMode}
                        layoutView={layoutView}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
