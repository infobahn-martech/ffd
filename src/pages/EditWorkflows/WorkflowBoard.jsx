import { getBoardColumnStructure } from './workflow.utils';
import WorkflowSwimlane from './WorkflowSwimlane';
import { STAGE_CELL_WIDTH, STAGE_GAP } from './WorkflowAreaGrid';

const DEFAULT_AREA_COLORS = {
  'BACKLOG AREA': '#cfd8dc',
  'REQUESTED AREA': '#2666be',
  'IN PROGRESS AREA': '#f38a30',
  'DONE AREA': '#42af49',
  'READY TO ARCHIVE AREA': '#7333bd',
};

/**
 * Workflow board: area headers + swimlane rows with area blocks.
 */
function WorkflowBoard({
  workflow,
  areaColors = DEFAULT_AREA_COLORS,
  stageCellWidth = STAGE_CELL_WIDTH,
  stageGap = STAGE_GAP,
  hoveredColumn,
  stackedRailMetrics,
  openColorPickerForStage,
  editingStageId,
  editingStageName,
  onStageMouseEnter,
  onStageMouseLeave,
  onAddColumnLeft,
  onAddColumnRight,
  onAddSubcolumn,
  onStartEditStage,
  onEditingStageNameChange,
  onSaveStageName,
  onStageNameKeyPress,
  onColorPickerToggle,
  onColorSelect,
}) {
  const boardStructure = getBoardColumnStructure(workflow);
  const totalCols = boardStructure.reduce((sum, x) => sum + x.cols, 0);

  if (totalCols === 0) return null;

  const labelSpacerWidth = 200;
  const boardMinWidth =
    labelSpacerWidth + stageGap +
    totalCols * stageCellWidth + Math.max(0, totalCols - 1) * stageGap;

  return (
    <div
      className="workflow-board-inner"
      style={{
        minWidth: boardMinWidth,
        '--stage-cell-width': `${stageCellWidth}px`,
        '--stage-gap': `${stageGap}px`,
      }}
    >
      {/* Board-level area headers - rendered once */}
      <div className="workflow-board-headers-row">
        <div className="workflow-board-label-spacer" aria-hidden="true" />
        <div className="workflow-board-headers">
          {boardStructure.map(({ area, cols }) => (
            <div
              key={area}
              className="workflow-board-area-header"
              style={{
                width: cols * stageCellWidth + Math.max(0, cols - 1) * stageGap,
                backgroundColor: areaColors[area] ?? '#e5e7eb',
              }}
              title={area}
            >
              {area}
            </div>
          ))}
        </div>
      </div>
      {/* Swimlane rows */}
      {workflow.swimlanes.map((swimlane) => (
        <WorkflowSwimlane
          key={swimlane.id}
          workflowId={workflow.id}
          swimlane={swimlane}
          boardStructure={boardStructure}
          stageCellWidth={stageCellWidth}
          stageGap={stageGap}
          areaColors={areaColors}
          hoveredColumn={hoveredColumn}
          stackedRailMetrics={stackedRailMetrics}
          openColorPickerForStage={openColorPickerForStage}
          editingStageId={editingStageId}
          editingStageName={editingStageName}
          onStageMouseEnter={onStageMouseEnter}
          onStageMouseLeave={onStageMouseLeave}
          onAddColumnLeft={onAddColumnLeft}
          onAddColumnRight={onAddColumnRight}
          onAddSubcolumn={onAddSubcolumn}
          onStartEditStage={onStartEditStage}
          onEditingStageNameChange={onEditingStageNameChange}
          onSaveStageName={onSaveStageName}
          onStageNameKeyPress={onStageNameKeyPress}
          onColorPickerToggle={onColorPickerToggle}
          onColorSelect={onColorSelect}
        />
      ))}
    </div>
  );
}

export default WorkflowBoard;
export { STAGE_CELL_WIDTH, STAGE_GAP };
