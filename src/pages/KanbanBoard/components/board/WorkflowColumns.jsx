import { DragDropContext } from "@hello-pangea/dnd";
import Column from "../../Column";
import { getColumnCards } from "../../utils/columnHelpers";

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

  return (
    <div
      className={`kanban-container ${isClassicLayout ? "kanban-classic-layout" : ""} ${
        isModernLayout ? "kanban-modern-layout" : ""
      } ${layoutView === "normal" ? "kanban-normal-layout" : ""}`}
      key={layoutView}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {workflow.columnOrder.map((colId) => {
            const column = workflow.columns[colId];
            const cards = getColumnCards(workflow, column);
            const isExpanded = expandedColumnId === column.id;
            const isShrunk =
              expandedColumnId !== null && expandedColumnId !== column.id;

            return (
              <Column
                key={column.id}
                column={column}
                cards={cards}
                setSelectedCard={onSelectCard}
                isExpanded={isExpanded}
                isShrunk={isShrunk}
                onHeaderClick={() => onColumnHeaderClick(workflow.id, column.id)}
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
      </DragDropContext>
    </div>
  );
}
