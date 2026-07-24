import WorkflowAccordion from "./WorkflowAccordion";
import WorkflowColumns from "./WorkflowColumns";

export default function KanbanBoardContent({
  workflows,
  boardLoading = false,
  suppressEmptyMessage = false,
  expandedWorkflows,
  collapsedColumns,
  maxColumnHeights,
  createDragEndHandler,
  onSelectCard,
  onColumnHeaderClick,
  onContextMenu,
  onHeightChange,
  onToggleWorkflow,
  onAccordionMenuClick,
  isClassicLayout,
  isModernLayout,
  isDarkMode,
  layoutView,
}) {
  if (!boardLoading && workflows.length === 0 && !suppressEmptyMessage) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          fontSize: 14,
          color: isDarkMode ? "#bdbdbd" : "#616161",
        }}
      >
        No workflows to display for this board.
      </div>
    );
  }

  return workflows.map((workflow) => (
    <WorkflowAccordion
      key={workflow.id}
      workflow={workflow}
      isDarkMode={isDarkMode}
      isExpanded={expandedWorkflows[workflow.id]}
      onToggle={() => onToggleWorkflow(workflow.id)}
      onMenuClick={(event) => onAccordionMenuClick(event, workflow.id)}
    >
      <WorkflowColumns
        workflow={workflow}
        collapsedColumns={collapsedColumns}
        maxColumnHeights={maxColumnHeights}
        onDragEnd={createDragEndHandler(workflow.id)}
        onSelectCard={onSelectCard}
        onColumnHeaderClick={onColumnHeaderClick}
        onContextMenu={onContextMenu}
        onHeightChange={onHeightChange}
        isClassicLayout={isClassicLayout}
        isModernLayout={isModernLayout}
        isDarkMode={isDarkMode}
        layoutView={layoutView}
      />
    </WorkflowAccordion>
  ));
}
