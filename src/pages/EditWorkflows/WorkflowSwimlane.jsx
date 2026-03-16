import { getGlobalRowsForSwimlane, getStagesInColumn } from './workflow.utils';
import WorkflowAreaGrid, { STAGE_CELL_WIDTH, STAGE_GAP } from './WorkflowAreaGrid';

/**
 * Single swimlane: stage row + swimlane content row (Default Swimlane label + cells).
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
    <div className="workflow-swimlane-block">
      {/* Stage cards row */}
      <div className="workflow-board-body workflow-stage-row">
        <div className="workflow-board-label-spacer" aria-hidden="true" />
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
      {/* Swimlane content row: Default Swimlane label + cells with Limit + dashed placeholder */}
      <div className="workflow-swimlane-row">
        <div className="workflow-swimlane-label-cell">
          <span className="workflow-swimlane-label-text">{swimlane.name}</span>
          <div className="workflow-swimlane-label-icons">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="workflow-swimlane-icon" title="Settings">
              <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.33331 8.66667V7.33333C1.33331 6.89131 1.509 6.46738 1.82156 6.15482C2.13412 5.84226 2.55805 5.66667 2.99998 5.66667H3.33331C3.59853 5.66667 3.85289 5.57143 4.05295 5.37137C4.25301 5.17131 4.34831 4.91695 4.34831 4.65167V4.31833C4.34831 3.87631 4.524 3.45238 4.83656 3.13982C5.14912 2.82726 5.57305 2.65167 6.01498 2.65167H6.34831C6.61353 2.65167 6.86789 2.55643 7.06795 2.35637C7.26801 2.15631 7.36331 1.90195 7.36331 1.63667V1.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.6667 7.33333V8.66667C14.6667 9.10869 14.491 9.53262 14.1784 9.84518C13.8659 10.1577 13.4419 10.3333 13 10.3333H12.6667C12.4015 10.3333 12.1471 10.4286 11.9471 10.6286C11.747 10.8287 11.6517 11.083 11.6517 11.3483V11.6817C11.6517 12.1237 11.476 12.5476 11.1634 12.8602C10.8509 13.1727 10.4269 13.3483 9.985 13.3483H9.65167C9.38645 13.3483 9.13209 13.4436 8.93203 13.6436C8.73197 13.8437 8.63667 14.098 8.63667 14.3633V14.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="workflow-swimlane-icon" title="Time">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="workflow-swimlane-icon" title="Card details">
              <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="workflow-swimlane-content-row">
          {boardStructure.map(({ area, cols }, areaIndex) => {
            const blockWidth = cols * stageCellWidth + Math.max(0, cols - 1) * stageGap;
            return (
              <div
                key={area}
                className="workflow-swimlane-content-area"
                style={{ width: blockWidth, minWidth: blockWidth }}
              >
                {Array.from({ length: cols }, (_, colIdx) => {
                  const stagesInCol = getStagesInColumn(swimlane, area, colIdx);
                  const stage = stagesInCol[0];
                  const limit = stage?.limit ?? 0;
                  const isFirstCell = areaIndex === 0 && colIdx === 0;
                  return (
                    <div
                      key={`${area}-${colIdx}`}
                      className="workflow-swimlane-content-cell"
                    >
                      <span className="workflow-swimlane-cell-limit">Limit: {limit}</span>
                      {isFirstCell && (
                        <div className="workflow-swimlane-cell-icons">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="workflow-swimlane-cell-icon" title="Settings">
                            <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M1.33331 8.66667V7.33333C1.33331 6.89131 1.509 6.46738 1.82156 6.15482C2.13412 5.84226 2.55805 5.66667 2.99998 5.66667H3.33331C3.59853 5.66667 3.85289 5.57143 4.05295 5.37137C4.25301 5.17131 4.34831 4.91695 4.34831 4.65167V4.31833C4.34831 3.87631 4.524 3.45238 4.83656 3.13982C5.14912 2.82726 5.57305 2.65167 6.01498 2.65167H6.34831C6.61353 2.65167 6.86789 2.55643 7.06795 2.35637C7.26801 2.15631 7.36331 1.90195 7.36331 1.63667V1.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14.6667 7.33333V8.66667C14.6667 9.10869 14.491 9.53262 14.1784 9.84518C13.8659 10.1577 13.4419 10.3333 13 10.3333H12.6667C12.4015 10.3333 12.1471 10.4286 11.9471 10.6286C11.747 10.8287 11.6517 11.083 11.6517 11.3483V11.6817C11.6517 12.1237 11.476 12.5476 11.1634 12.8602C10.8509 13.1727 10.4269 13.3483 9.985 13.3483H9.65167C9.38645 13.3483 9.13209 13.4436 8.93203 13.6436C8.73197 13.8437 8.63667 14.098 8.63667 14.3633V14.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="workflow-swimlane-cell-icon" title="Menu">
                            <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                      <div className="workflow-swimlane-dashed-placeholder" />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WorkflowSwimlane;
