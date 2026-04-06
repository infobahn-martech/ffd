import { getBoardColumnStructure, getGlobalRowsForSwimlane } from './workflow.utils';
import WorkflowSwimlane from './WorkflowSwimlane';
import WorkflowAreaGrid, { STAGE_CELL_WIDTH, STAGE_GAP } from './WorkflowAreaGrid';

const FALLBACK_AREA_HEADER_COLOR = '#e5e7eb';

function getAreaHeaderColorFromStages(swimlane, area) {
  const stage = swimlane?.stages?.find((s) => s.area === area);
  if (stage?.color) return stage.color;
  return FALLBACK_AREA_HEADER_COLOR;
}

/**
 * Workflow board: area headers + swimlane rows with area blocks.
 */
function WorkflowBoard({
  workflow,
  columnActionsDisabled = false,
  stageCellWidth = STAGE_CELL_WIDTH,
  stageGap = STAGE_GAP,
  hoveredColumn,
  stackedRailMetrics,
  editingStageId,
  editingStageName,
  onStageMouseEnter,
  onAddColumnLeft,
  onAddColumnRight,
  onAddSubcolumn,
  onStartEditStage,
  onEditingStageNameChange,
  onSaveStageName,
  onStageNameKeyPress,
  onColorSelect,
  onDeleteStage,
  onStageLimitChange,
  onStageCardsPerRowChange,
  onAddSwimlane,
  onRenameSwimlane,
  onDeleteSwimlane,
}) {
  const boardStructure = getBoardColumnStructure(workflow);
  const totalCols = boardStructure.reduce((sum, x) => sum + x.cols, 0);

  if (totalCols === 0) return null;

  const firstSwimlane = workflow.swimlanes[0];

  const labelSpacerWidth = 170;
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
                backgroundColor: getAreaHeaderColorFromStages(firstSwimlane, area),
              }}
              title={area}
            >
              {area}
            </div>
          ))}
        </div>
      </div>
      {/* Single shared stage row (LIVE: one row of stage cards, then swimlane rows below) */}
      {workflow.swimlanes.length > 0 && (
        <div className="workflow-board-body workflow-stage-row">
          <div className="workflow-board-label-spacer" aria-hidden="true" />
          {boardStructure.map(({ area, cols }) => {
            const areaStages = firstSwimlane.stages.filter((s) => s.area === area);
            const globalRows = getGlobalRowsForSwimlane(firstSwimlane, boardStructure);
            return (
              <WorkflowAreaGrid
                key={area}
                workflowId={workflow.id}
                swimlane={firstSwimlane}
                area={area}
                cols={cols}
                globalRows={globalRows}
                areaStages={areaStages}
                stageCellWidth={stageCellWidth}
                stageGap={stageGap}
                hoveredColumn={hoveredColumn}
                stackedRailMetrics={stackedRailMetrics}
                editingStageId={editingStageId}
                editingStageName={editingStageName}
                onStageMouseEnter={onStageMouseEnter}
                onAddColumnLeft={onAddColumnLeft}
                onAddColumnRight={onAddColumnRight}
                onAddSubcolumn={onAddSubcolumn}
                onStartEditStage={onStartEditStage}
                onEditingStageNameChange={onEditingStageNameChange}
                onSaveStageName={onSaveStageName}
                onStageNameKeyPress={onStageNameKeyPress}
                onColorSelect={onColorSelect}
                onDeleteStage={onDeleteStage}
                onStageLimitChange={onStageLimitChange}
                onStageCardsPerRowChange={onStageCardsPerRowChange}
                columnActionsDisabled={columnActionsDisabled}
              />
            );
          })}
        </div>
      )}
      {/* Swimlane rows with add-grid bars inside each swimlane label card (visible on hover) */}
      {workflow.swimlanes.map((swimlane, index) => (
        <WorkflowSwimlane
          key={swimlane.id}
          workflowId={workflow.id}
          swimlane={swimlane}
          boardStructure={boardStructure}
          stageCellWidth={stageCellWidth}
          stageGap={stageGap}
          contentRowOnly
          hoveredColumn={hoveredColumn}
          stackedRailMetrics={stackedRailMetrics}
          editingStageId={editingStageId}
          editingStageName={editingStageName}
          onStageMouseEnter={onStageMouseEnter}
          onAddColumnLeft={onAddColumnLeft}
          onAddColumnRight={onAddColumnRight}
          onAddSubcolumn={onAddSubcolumn}
          onStartEditStage={onStartEditStage}
          onEditingStageNameChange={onEditingStageNameChange}
          onSaveStageName={onSaveStageName}
          onStageNameKeyPress={onStageNameKeyPress}
          onColorSelect={onColorSelect}
          onDeleteStage={onDeleteStage}
          onStageLimitChange={onStageLimitChange}
          onStageCardsPerRowChange={onStageCardsPerRowChange}
          onAddSwimlane={onAddSwimlane}
          onRenameSwimlane={onRenameSwimlane}
          onDeleteSwimlane={onDeleteSwimlane}
          swimlaneIndex={index}
        />
      ))}
    </div>
  );
}

export default WorkflowBoard;
export { STAGE_CELL_WIDTH, STAGE_GAP };
