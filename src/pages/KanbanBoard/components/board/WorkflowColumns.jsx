import { DragDropContext } from "@hello-pangea/dnd";
import ColumnHeader from "./ColumnHeader";
import SwimlaneColumnCell from "./SwimlaneColumnCell";
import {
  countCardsInColumn,
  getSwimlaneColumnCards,
} from "../../utils/columnHelpers";
import "../../styles/swimlaneBoard.scss";

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

  return (
    <div
      className={`kanban-container ${isClassicLayout ? "kanban-classic-layout" : ""} ${
        isModernLayout ? "kanban-modern-layout" : ""
      } ${layoutView === "normal" ? "kanban-normal-layout" : ""}`}
      key={layoutView}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board kanban-board--swimlanes">
          {/* --- Column headers (workflow stages): one header per column, single top row --- */}
          <div className="kanban-board__header-row">
            {workflow.columnOrder.map((colKey) => {
              const column = workflow.columns[colKey];
              const isExpanded = expandedColumnId === column.id;
              const isShrunk = expandedColumnId !== null && expandedColumnId !== column.id;
              const cardCount = countCardsInColumn(workflow, colKey);
              const wipLimit = column.wipLimit;
              const wipDisplay = wipLimit ? `${cardCount} / ${wipLimit}` : String(cardCount);

              return (
                <div
                  key={column.id}
                  className={`kanban-board__header-slot ${isExpanded ? "kanban-board__header-slot--expanded" : ""} ${
                    isShrunk ? "kanban-board__header-slot--shrunk" : ""
                  }`}
                >
                  <ColumnHeader
                    column={column}
                    wipDisplay={wipDisplay}
                    isShrunk={isShrunk}
                    onHeaderClick={() => onColumnHeaderClick(workflow.id, column.id)}
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

            return (
              <section className="kanban-swimlane" key={laneId} aria-label={lane.title}>
                <div className="kanban-swimlane__title">{lane.title}</div>
                <div className="kanban-swimlane__columns">
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
                        cardsPerRow={column.cardsPerRow}
                        setSelectedCard={onSelectCard}
                        isExpanded={isExpanded}
                        isShrunk={isShrunk}
                        onContextMenu={onContextMenu}
                        columnHeight={maxHeight > 0 ? maxHeight : undefined}
                        onHeightChange={onHeightChange}
                        isClassicLayout={isClassicLayout}
                        isModernLayout={isModernLayout}
                        isDarkMode={isDarkMode}
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
