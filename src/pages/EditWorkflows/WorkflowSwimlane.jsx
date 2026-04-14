import { useState, useEffect } from 'react';
import { getGlobalRowsForSwimlane, getStagesInColumn, isWorkflowStageChildColumn, rgbToHex } from './workflow.utils';
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
  onRenameSwimlane,
  onDeleteSwimlane,
  swimlaneIndex,
  mutationTargets = {},
}) {
  const globalRows = getGlobalRowsForSwimlane(swimlane, boardStructure);
  const [editingFieldKey, setEditingFieldKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingSwimlaneName, setEditingSwimlaneName] = useState(false);
  const [swimlaneNameValue, setSwimlaneNameValue] = useState(swimlane.name);

  useEffect(() => {
    if (!editingSwimlaneName) setSwimlaneNameValue(swimlane.name);
  }, [swimlane.name, editingSwimlaneName]);

  const handleStartEditSwimlaneName = () => {
    setEditingSwimlaneName(true);
    setSwimlaneNameValue(swimlane.name);
  };

  const handleSaveSwimlaneName = () => {
    const trimmed = swimlaneNameValue.trim();
    if (trimmed && onRenameSwimlane) {
      onRenameSwimlane(workflowId, swimlane.id, trimmed);
    }
    setEditingSwimlaneName(false);
  };

  const handleCancelEditSwimlaneName = () => {
    setEditingSwimlaneName(false);
    setSwimlaneNameValue(swimlane.name);
  };

  const slMutationPending = Boolean(mutationTargets[`sl:${swimlane.id}`]);
  const swimlaneAddTopPending = Boolean(mutationTargets[`swimlane-add:${workflowId}:${swimlaneIndex}`]);
  const swimlaneAddBottomPending = Boolean(mutationTargets[`swimlane-add:${workflowId}:${swimlaneIndex + 1}`]);

  const contentRow = (
    <div className="workflow-swimlane-row">
      <div className="workflow-swimlane-label-cell">
        {onAddSwimlane && (
          <>
            <button
              type="button"
              className={`workflow-swimlane-add-grid-bar workflow-swimlane-add-grid-bar--top${swimlaneAddTopPending ? ' workflow-swimlane-add-grid-bar--pending' : ''}`}
              disabled={swimlaneAddTopPending}
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
              className={`workflow-swimlane-add-grid-bar workflow-swimlane-add-grid-bar--bottom${swimlaneAddBottomPending ? ' workflow-swimlane-add-grid-bar--pending' : ''}`}
              disabled={swimlaneAddBottomPending}
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
        {editingSwimlaneName ? (
          <input
            type="text"
            className="workflow-swimlane-label-input"
            value={swimlaneNameValue}
            onChange={(e) => setSwimlaneNameValue(e.target.value)}
            onBlur={handleSaveSwimlaneName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveSwimlaneName();
              else if (e.key === 'Escape') handleCancelEditSwimlaneName();
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="workflow-swimlane-label-text">{swimlane.name}</span>
        )}
        <div className="workflow-swimlane-label-icons">
          {onRenameSwimlane && !editingSwimlaneName && (
            <button
              type="button"
              className="workflow-swimlane-icon-btn"
              title="Rename swimlane"
              aria-label="Rename swimlane"
              disabled={slMutationPending}
              onClick={(e) => {
                e.stopPropagation();
                handleStartEditSwimlaneName();
              }}
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.75 2.25C12.9468 2.05322 13.1794 1.89585 13.4349 1.78609C13.6904 1.67633 13.9642 1.61621 14.2417 1.60879C14.5192 1.60137 14.7958 1.64677 15.0571 1.74253C15.3184 1.83829 15.5596 1.98259 15.7685 2.16831C15.9774 2.35403 16.1501 2.57764 16.2784 2.82806C16.4067 3.07848 16.4882 3.35112 16.5188 3.63191C16.5494 3.9127 16.5285 4.19687 16.4573 4.46985C16.3861 4.74283 16.2659 5.00005 16.1025 5.22831L15.0825 6.75L11.25 2.9175L12.7717 1.8975C13 1.73412 13.2572 1.61393 13.5302 1.54272C13.8032 1.47152 14.0874 1.45062 14.3682 1.48122C14.649 1.51182 14.9216 1.59334 15.172 1.72162C15.4225 1.8499 15.6461 2.02264 15.8318 2.23153C16.0175 2.44042 16.1618 2.68164 16.2576 2.94294C16.3534 3.20424 16.3988 3.48079 16.3913 3.75831C16.3839 4.03583 16.3238 4.30964 16.214 4.56512C16.1043 4.8206 15.9469 5.05322 15.75 5.25L6.375 14.625L2.25 15.75L3.375 11.625L12.75 2.25Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <button type="button" className="workflow-swimlane-icon-btn" title="Color" aria-label="Color">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h12v8H2V4z" fill="currentColor" />
              <rect x="4" y="6" width="8" height="4" fill="white" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </button>
          {onDeleteSwimlane && (
            <button
              type="button"
              className="workflow-swimlane-icon-btn workflow-swimlane-icon-btn-delete"
              title="Delete swimlane"
              aria-label="Delete swimlane"
              disabled={slMutationPending}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSwimlane(workflowId, swimlane.id);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M3 4L3 13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
        {slMutationPending ? (
          <div className="workflow-swimlane-mutation-overlay" aria-busy="true">
            <span className="workflow-item-mutation-skeleton workflow-item-mutation-skeleton--pill" />
          </div>
        ) : null}
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
                const deepestRow = stagesInCol.length
                  ? Math.max(...stagesInCol.map((s) => s.row ?? 0))
                  : -1;
                const deepestInCol = stagesInCol.filter((s) => (s.row ?? 0) === deepestRow);
                const hideNestedAddHint = deepestInCol.some((s) => isWorkflowStageChildColumn(s));
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
                    style={
                      stage?.color
                        ? { '--workflow-swimlane-cell-bg': rgbToHex(stage.color) }
                        : undefined
                    }
                  >
                    <div className="workflow-swimlane-cell-fields">
                      <div className="workflow-swimlane-cell-field">
                        <span className="workflow-swimlane-cell-label">Limit:</span>
                        <span className="workflow-swimlane-cell-value-slot">
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
                        </span>
                      </div>
                    </div>
                    {!hideNestedAddHint ? (
                      <div className="workflow-swimlane-dashed-placeholder" />
                    ) : null}
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
              onDeleteStage={onDeleteStage}
              onStageLimitChange={onStageLimitChange}
              onStageCardsPerRowChange={onStageCardsPerRowChange}
              mutationTargets={mutationTargets}
            />
          );
        })}
      </div>
      {contentRow}
    </div>
  );
}

export default WorkflowSwimlane;
