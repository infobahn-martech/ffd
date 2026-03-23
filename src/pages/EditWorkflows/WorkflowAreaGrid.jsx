import {
  getStagesInColumn,
  getColStackKey,
  isCellOccupied,
  getColumnKey,
} from './workflow.utils';
import WorkflowStageCard from './WorkflowStageCard';

const STAGE_CELL_WIDTH = 220;
const STAGE_GAP = 14;

/**
 * Single area block with grid layout, col-stacks for rails, empty placeholders, and stage cards.
 */
function WorkflowAreaGrid({
  workflowId,
  swimlane,
  area,
  cols,
  globalRows,
  areaStages,
  stageCellWidth = STAGE_CELL_WIDTH,
  stageGap = STAGE_GAP,
  hoveredColumn,
  stackedRailMetrics,
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
  onColorSelect,
  onDeleteStage,
  onStageLimitChange,
  onStageCardsPerRowChange,
}) {
  const blockWidth = cols * stageCellWidth + Math.max(0, cols - 1) * stageGap;

  return (
    <div
      className="workflow-area-block workflow-area-block-grid"
      style={{
        width: blockWidth,
        minHeight: globalRows * 125 + (globalRows - 1) * stageGap,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(${stageCellWidth}px, 1fr))`,
        gridTemplateRows: `repeat(${globalRows}, minmax(125px, 1fr))`,
        gap: `var(--stage-gap, ${stageGap}px)`,
      }}
    >
      {/* Col-stacks for rail positioning (behind stages) */}
      {Array.from({ length: cols }, (_, colIdx) => {
        const stagesInCol = getStagesInColumn(swimlane, area, colIdx);
        const isSingle = stagesInCol.length <= 1;
        const colStackKey = getColStackKey(workflowId, swimlane.id, area, colIdx);
        const showStackedRails = !isSingle && stackedRailMetrics?.colStackKey === colStackKey;
        const stackedColSpan =
          showStackedRails && stackedRailMetrics?.colSpan ? stackedRailMetrics.colSpan : 1;
        const colStackGridColumn =
          stackedColSpan > 1 ? `${colIdx + 1} / span ${stackedColSpan}` : `${colIdx + 1}`;
        return (
          <div
            key={`col-${area}-${colIdx}`}
            className={`workflow-area-col-stack${showStackedRails ? ' workflow-area-col-stack--stacked-rails' : ''}`}
            data-col-stack-key={colStackKey}
            onMouseLeave={onStageMouseLeave}
            style={{
              gridColumn: colStackGridColumn,
              gridRow: `1 / span ${globalRows}`,
            }}
          >
            {showStackedRails && stackedRailMetrics && (
              <>
                <div
                  className="workflow-insertion-rail workflow-insertion-rail-left"
                  style={{
                    top: stackedRailMetrics.top,
                    height: stackedRailMetrics.height,
                  }}
                >
                  <button
                    className="workflow-column-add-btn workflow-column-add-left"
                    type="button"
                    onClick={() =>
                      onAddColumnLeft(
                        stackedRailMetrics.workflowId,
                        stackedRailMetrics.swimlaneId,
                        stackedRailMetrics.stageId
                      )
                    }
                    title={`Add a new column before ${stackedRailMetrics.stageName || ''}`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 3V13M3 8H13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  className="workflow-insertion-rail workflow-insertion-rail-right"
                  style={{
                    top: stackedRailMetrics.top,
                    height: stackedRailMetrics.height,
                  }}
                >
                  <button
                    className="workflow-column-add-btn workflow-column-add-right"
                    type="button"
                    onClick={() =>
                      onAddColumnRight(
                        stackedRailMetrics.workflowId,
                        stackedRailMetrics.swimlaneId,
                        stackedRailMetrics.stageId
                      )
                    }
                    title={`Add a new column after ${stackedRailMetrics.stageName || ''}`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 3V13M3 8H13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
      {/* Empty placeholder cells for unoccupied grid positions */}
      {Array.from({ length: globalRows }, (_, rowIdx) =>
        Array.from({ length: cols }, (_, colIdx) => {
          if (isCellOccupied(areaStages, rowIdx, colIdx, globalRows)) return null;
          return (
            <div
              key={`empty-${swimlane.id}-${area}-${rowIdx}-${colIdx}`}
              className="workflow-stage-grid-item workflow-stage-empty-placeholder"
              style={{
                gridColumn: `${colIdx + 1}`,
                gridRow: `${rowIdx + 1}`,
              }}
              aria-hidden="true"
            >
              <div className="workflow-stage-wrapper workflow-stage-empty-cell workflow-stage-single" />
            </div>
          );
        })
      )
        .flat()
        .filter(Boolean)}
      {/* Stages with grid positioning */}
      {areaStages.map((stage) => {
        const stageCol = stage.col ?? 0;
        const stageRow = stage.row ?? 0;
        const stageColSpan = stage.colSpan ?? 1;
        const stagesInCol = getStagesInColumn(swimlane, area, stageCol);
        const isSingleInCol = stagesInCol.length <= 1;
        const sortedStagesInCol = [...stagesInCol].sort((a, b) => (a.row ?? 0) - (b.row ?? 0));
        const isTopStackedCard = !isSingleInCol && sortedStagesInCol[0]?.id === stage.id;
        const stageGridRow = isSingleInCol ? `1 / span ${globalRows}` : `${stageRow + 1}`;
        const stageColumnKey = getColumnKey(workflowId, swimlane.id, stage.id);
        const isStageHovered = hoveredColumn === stageColumnKey;
        const showAddSubcolumn = isSingleInCol ? true : !isTopStackedCard;

        return (
          <div
            key={stage.id}
            className="workflow-stage-grid-item"
            style={{
              gridColumn: `${stageCol + 1} / span ${stageColSpan}`,
              gridRow: stageGridRow,
              height: '100%',
              minHeight: 0,
            }}
          >
            <WorkflowStageCard
              stage={stage}
              swimlaneId={swimlane.id}
              workflowId={workflowId}
              stageColumnKey={stageColumnKey}
              isStageHovered={isStageHovered}
              showAddSubcolumn={showAddSubcolumn}
              isSingleInCol={isSingleInCol}
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
              onColorSelect={onColorSelect}
              onDeleteStage={onDeleteStage}
              onStageLimitChange={onStageLimitChange}
              onStageCardsPerRowChange={onStageCardsPerRowChange}
            />
          </div>
        );
      })}
    </div>
  );
}

export default WorkflowAreaGrid;
export { STAGE_CELL_WIDTH, STAGE_GAP };
