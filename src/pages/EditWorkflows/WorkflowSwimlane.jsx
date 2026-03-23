import { useState } from 'react';
import { getGlobalRowsForSwimlane, getStagesInColumn } from './workflow.utils';
import WorkflowAreaGrid, { STAGE_CELL_WIDTH, STAGE_GAP } from './WorkflowAreaGrid';

/**
 * Single swimlane: optionally stage row + swimlane content row (label + cells).
 * When contentRowOnly is true, only the swimlane content row is rendered (for LIVE: one shared stage row, then swimlane rows with add-grid between).
 */
function WorkflowSwimlane({
  workflowId,
  swimlane,
  boardStructure,
  stageCellWidth = STAGE_CELL_WIDTH,
  stageGap = STAGE_GAP,
  contentRowOnly = false,
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
  onAddSwimlane,
  swimlaneIndex,
}) {
  const globalRows = getGlobalRowsForSwimlane(swimlane, boardStructure);
  const [editingFieldKey, setEditingFieldKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  const contentRow = (
    <div className="workflow-swimlane-row">
      <div className="workflow-swimlane-label-cell">
        {onAddSwimlane && (
          <>
            <button
              type="button"
              className="workflow-swimlane-add-grid-bar workflow-swimlane-add-grid-bar--top"
              onClick={(e) => {
                e.stopPropagation();
                onAddSwimlane(workflowId, swimlaneIndex);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddSwimlane(workflowId, swimlaneIndex);
                }
              }}
              title="Add swimlane above"
              aria-label={`Add swimlane before row ${swimlaneIndex + 1}`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className="workflow-swimlane-add-grid-bar workflow-swimlane-add-grid-bar--bottom"
              onClick={(e) => {
                e.stopPropagation();
                onAddSwimlane(workflowId, swimlaneIndex + 1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddSwimlane(workflowId, swimlaneIndex + 1);
                }
              }}
              title="Add swimlane below"
              aria-label={`Add swimlane after row ${swimlaneIndex + 1}`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </>
        )}
        <span className="workflow-swimlane-label-text">{swimlane.name}</span>
        <div className="workflow-swimlane-label-icons">
          <button type="button" className="workflow-swimlane-icon-btn" title="Color" aria-label="Color">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h12v8H2V4z" fill="currentColor" />
              <rect x="4" y="6" width="8" height="4" fill="white" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </button>
          <button type="button" className="workflow-swimlane-icon-btn workflow-swimlane-icon-btn-delete" title="Delete" aria-label="Delete swimlane">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M3 4L3 13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="workflow-swimlane-content-row">
        {boardStructure.map(({ area, cols }) => {
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
                const cardsPerRow = stage?.cardsPerRow ?? 1;
                const limitKey = stage ? `${stage.id}-limit` : null;
                const cardsKey = stage ? `${stage.id}-cardsPerRow` : null;
                const isEditingLimit = editingFieldKey === limitKey;
                const isEditingCards = editingFieldKey === cardsKey;

                const saveLimit = () => {
                  const num = Math.max(0, parseInt(editValue, 10) || 0);
                  if (stage && onStageLimitChange) onStageLimitChange(workflowId, swimlane.id, stage.id, String(num));
                  setEditingFieldKey(null);
                };
                const saveCardsPerRow = () => {
                  const num = Math.max(1, parseInt(editValue, 10) || 1);
                  if (stage && onStageCardsPerRowChange) onStageCardsPerRowChange(workflowId, swimlane.id, stage.id, String(num));
                  setEditingFieldKey(null);
                };

                return (
                  <div
                    key={`${area}-${colIdx}`}
                    className="workflow-swimlane-content-cell"
                  >
                    <div className="workflow-swimlane-cell-fields">
                      <div className="workflow-swimlane-cell-field">
                        <span className="workflow-swimlane-cell-label">Limit:</span>
                        {isEditingLimit ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="workflow-swimlane-inline-input workflow-swimlane-inline-input-edit"
                            value={editValue}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === '' || /^\d+$/.test(v)) setEditValue(v);
                            }}
                            onBlur={saveLimit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveLimit();
                              else if (e.key === 'Escape') setEditingFieldKey(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="workflow-swimlane-cell-value"
                            onClick={(e) => { e.stopPropagation(); if (stage) { setEditingFieldKey(limitKey); setEditValue(String(limit)); } }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && stage) { e.preventDefault(); setEditingFieldKey(limitKey); setEditValue(String(limit)); } }}
                            title="Click to edit"
                          >
                            {limit}
                          </span>
                        )}
                      </div>
                      <div className="workflow-swimlane-cell-field">
                        <span className="workflow-swimlane-cell-label">Cards per row:</span>
                        {isEditingCards ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="workflow-swimlane-inline-input workflow-swimlane-inline-input-edit"
                            value={editValue}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === '' || /^\d+$/.test(v)) setEditValue(v);
                            }}
                            onBlur={saveCardsPerRow}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveCardsPerRow();
                              else if (e.key === 'Escape') setEditingFieldKey(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="workflow-swimlane-cell-value"
                            onClick={(e) => { e.stopPropagation(); if (stage) { setEditingFieldKey(cardsKey); setEditValue(String(cardsPerRow)); } }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && stage) { e.preventDefault(); setEditingFieldKey(cardsKey); setEditValue(String(cardsPerRow)); } }}
                            title="Click to edit"
                          >
                            {cardsPerRow}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="workflow-swimlane-dashed-placeholder" />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (contentRowOnly) {
    return contentRow;
  }

  return (
    <div className="workflow-swimlane-block">
      {/* Stage cards row - shared when contentRowOnly is used from board */}
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
            />
          );
        })}
      </div>
      {contentRow}
    </div>
  );
}

export default WorkflowSwimlane;
