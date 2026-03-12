import { getGlobalRowsForSwimlane } from './workflow.utils';
import WorkflowAreaGrid, { STAGE_CELL_WIDTH, STAGE_GAP } from './WorkflowAreaGrid';

/**
 * Single swimlane row: board body with area blocks.
 */
function WorkflowSwimlane({
  workflowId,
  swimlane,
  boardStructure,
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
  const globalRows = getGlobalRowsForSwimlane(swimlane, boardStructure);

  return (
    <div className="workflow-swimlane-row">
      <div className="workflow-board-body">
        {boardStructure.map(({ area, cols }) => {
          const areaStages = swimlane.stages.filter((s) => s.area === area);
          return (
            <WorkflowAreaGrid
              key={area}
              workflowId={workflowId}
              swimlane={swimlane}
              area={area}
              cols={cols}
              globalRows={globalRows}
              areaStages={areaStages}
              stageCellWidth={stageCellWidth}
              stageGap={stageGap}
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
          );
        })}
      </div>
    </div>
  );
}

export default WorkflowSwimlane;
