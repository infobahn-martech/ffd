import WorkflowAccordion from "./WorkflowAccordion";
import WorkflowColumns from "./WorkflowColumns";

export default function KanbanBoardContent({
  workflows,
  expandedWorkflows,
  expandedColumns,
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
        expandedColumns={expandedColumns}
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
