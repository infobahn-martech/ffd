import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import '../../design/scss/EditWorkflows.scss';
import CreateWorkflowModal from './CreateWorkflowModal';
import WorkflowBoard from './WorkflowBoard';
import {
  getColStackKey,
  buildCreateWorkflowColumnPayload,
  removeStage,
  normalizeWorkflowData,
  isWorkflowStageChildColumn,
} from './workflow.utils';

function isNodeInColumnZone(node, colStackKey) {
  if (!node || node.nodeType !== 1 || colStackKey == null) return false;
  let el = node;
  while (el) {
    if (el.getAttribute?.('data-col-stack-key') === colStackKey) return true;
    el = el.parentElement;
  }
  return false;
}
import useWorkFlowReducer from '../../store/WorkFlowReducer';
import useAlertReducer from '../../store/AlertReducer';

const DEFAULT_WORKFLOWS = [
  {
    id: 1,
    name: 'Default Workflow',
    swimlanes: [
      {
        id: 1,
        name: 'Default Swimlane',
        stages: [
          { id: 1, name: 'Backlog', area: 'BACKLOG AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0, colSpan: 1 },
          { id: 2, name: 'Requested', area: 'REQUESTED AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0, colSpan: 1 },
          { id: 3, name: 'In Progress', area: 'IN PROGRESS AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0, colSpan: 1 },
          { id: 4, name: 'Done', area: 'DONE AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0, colSpan: 1 },
          { id: 5, name: 'Ready to Archive', area: 'READY TO ARCHIVE AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0, colSpan: 1 },
        ],
      },
    ],
  },
];

function EditWorkflows() {
  const [searchParams] = useSearchParams();
  const {
    getWorkflowByBoard,
    renameWorkflow,
    deleteWorkflow,
    disableWorkflow,
    createWorkflow,
    createSwimlane,
    renameSwimlane,
    deleteSwimlane,
    createWorkflowColumn,
    renameWorkflowColumn,
    removeWorkflowColumn,
    workflows: apiWorkflows,
    isLoading,
    addEditLoader,
  } = useWorkFlowReducer();

  const { error: showError } = useAlertReducer();

  const [boardName, setBoardName] = useState('Team workspace');
  const [description, setDescription] = useState('There is no description');
  const [defaultTemplates, setDefaultTemplates] = useState('Default template configurations: 0');
  const [customCardId, setCustomCardId] = useState('Repeating value');
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [stackedRailMetrics, setStackedRailMetrics] = useState(null);
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [editingWorkflowName, setEditingWorkflowName] = useState('');
  const [editingStageId, setEditingStageId] = useState(null);
  const [editingStageName, setEditingStageName] = useState('');
  const [workflows, setWorkflows] = useState(DEFAULT_WORKFLOWS);
  const boardId = searchParams.get('boardId');

  useEffect(() => {
    if (boardId) {
      getWorkflowByBoard({ boardId });
    }
  }, [searchParams, getWorkflowByBoard, boardId]);

  useEffect(() => {
    if (apiWorkflows === null) {
      return;
    }

    const normalizedWorkflows = normalizeWorkflowData(apiWorkflows);
    setWorkflows(normalizedWorkflows);
    setHoveredColumn(null);
    setStackedRailMetrics(null);
  }, [apiWorkflows]);

  useEffect(() => {
    const clearHover = () => {
      setHoveredColumn(null);
      setStackedRailMetrics(null);
    };
    window.addEventListener('scroll', clearHover, true);
    return () => window.removeEventListener('scroll', clearHover, true);
  }, []);

  const handleStageBoxMouseEnter = (
    e,
    stageColumnKey,
    workflowId,
    swimlaneId,
    stageId,
    stageName,
    isStacked,
    area,
    stageCol,
    stageColSpan
  ) => {
    setHoveredColumn(stageColumnKey);
    if (isStacked && area != null && stageCol != null) {
      const areaBlock = e.currentTarget.closest('.workflow-area-block');
      const stageWrapper = e.currentTarget.closest('.workflow-stage-wrapper');
      const colStackKey = getColStackKey(workflowId, swimlaneId, area, stageCol);
      const colStack = areaBlock?.querySelector(`[data-col-stack-key="${colStackKey}"]`);
      if (colStack && stageWrapper) {
        const colRect = colStack.getBoundingClientRect();
        const stageRect = stageWrapper.getBoundingClientRect();
        setStackedRailMetrics({
          colStackKey,
          stageId,
          stageName,
          workflowId,
          swimlaneId,
          top: stageRect.top - colRect.top,
          height: colRect.bottom - stageRect.top,
          colSpan: stageColSpan ?? 1,
        });
      } else {
        setStackedRailMetrics(null);
      }
    } else if (!isStacked) {
      setStackedRailMetrics(null);
    }
  };

  const handleStageBoxMouseLeave = (e, stageColumnKey, colStackKey) => {
    const rt = e.relatedTarget;
    if (isNodeInColumnZone(rt, colStackKey)) return;
    setHoveredColumn((prev) => (prev === stageColumnKey ? null : prev));
    setStackedRailMetrics((prev) => {
      if (!prev || prev.colStackKey !== colStackKey) return prev;
      return null;
    });
  };

  const runCreateWorkflowColumn = (workflowId, swimlaneId, stageId, action) => {
    if (addEditLoader) return;
    setHoveredColumn(null);
    setStackedRailMetrics(null);
    if (!boardId) {
      showError('Open a board (boardId in URL) to add columns.');
      return;
    }
    const workflow = workflows.find((w) => w.id === workflowId || String(w.id) === String(workflowId));
    if (!workflow) return;
    const swimlane = workflow.swimlanes.find(
      (sl) => sl.id === swimlaneId || String(sl.id) === String(swimlaneId)
    );
    if (!swimlane) return;
    const built = buildCreateWorkflowColumnPayload(swimlane.stages, stageId, action);
    if (!built.ok) {
      showError(built.message);
      return;
    }
    createWorkflowColumn({
      body: built.payload,
      cb: () => getWorkflowByBoard({ boardId }),
    });
  };

  const handleAddColumnLeft = (workflowId, swimlaneId, stageId) =>
    runCreateWorkflowColumn(workflowId, swimlaneId, stageId, 'left');

  const handleAddColumnRight = (workflowId, swimlaneId, stageId) =>
    runCreateWorkflowColumn(workflowId, swimlaneId, stageId, 'right');

  const handleAddSubcolumn = (workflowId, swimlaneId, stageId) => {
    const workflow = workflows.find((w) => w.id === workflowId || String(w.id) === String(workflowId));
    const swimlane = workflow?.swimlanes.find(
      (sl) => sl.id === swimlaneId || String(sl.id) === String(swimlaneId)
    );
    const stage = swimlane?.stages.find((s) => s.id === stageId || String(s.id) === String(stageId));
    if (isWorkflowStageChildColumn(stage)) return;
    runCreateWorkflowColumn(workflowId, swimlaneId, stageId, 'subcolumn');
  };

  const handleStartEditWorkflow = (workflowId, currentName) => {
    setEditingWorkflowId(workflowId);
    setEditingWorkflowName(currentName);
  };

  const handleSaveWorkflowName = (workflowId) => {
    const trimmedName = editingWorkflowName.trim();
    if (trimmedName) {
      setWorkflows((prevWorkflows) =>
        prevWorkflows.map((workflow) =>
          workflow.id === workflowId ? { ...workflow, name: trimmedName } : workflow
        )
      );
      renameWorkflow({ workflow_id: workflowId, workflow_name: trimmedName });
    }
    setEditingWorkflowId(null);
    setEditingWorkflowName('');
  };

  const handleCancelEditWorkflow = () => {
    setEditingWorkflowId(null);
    setEditingWorkflowName('');
  };

  const handleWorkflowNameKeyPress = (e, workflowId) => {
    if (e.key === 'Enter') {
      handleSaveWorkflowName(workflowId);
    } else if (e.key === 'Escape') {
      handleCancelEditWorkflow();
    }
  };

  const handleStartEditStage = (stageId, currentName) => {
    setEditingStageId(stageId);
    setEditingStageName(currentName);
  };

  const handleSaveStageNameChange = (workflowId, swimlaneId, stageId) => {
    const trimmed = editingStageName.trim();
    if (!trimmed) {
      setEditingStageId(null);
      setEditingStageName('');
      return;
    }

    const workflow = workflows.find((w) => w.id === workflowId || String(w.id) === String(workflowId));
    const swimlane = workflow?.swimlanes.find(
      (sl) => sl.id === swimlaneId || String(sl.id) === String(swimlaneId)
    );
    const stage = swimlane?.stages.find((s) => s.id === stageId || String(s.id) === String(stageId));
    const columnId = stage?.columnId;

    if (boardId && columnId != null && String(columnId) !== '') {
      renameWorkflowColumn({
        column_id: columnId,
        column_name: trimmed,
        cb: () => getWorkflowByBoard({ boardId }),
      });
    } else {
      setWorkflows((prevWorkflows) =>
        prevWorkflows.map((w) => {
          if (w.id !== workflowId) return w;
          return {
            ...w,
            swimlanes: w.swimlanes.map((sl) => {
              if (sl.id !== swimlaneId) return sl;
              return {
                ...sl,
                stages: sl.stages.map((st) =>
                  st.id === stageId ? { ...st, name: trimmed } : st
                ),
              };
            }),
          };
        })
      );
    }

    setEditingStageId(null);
    setEditingStageName('');
  };

  const handleCancelEditStage = () => {
    setEditingStageId(null);
    setEditingStageName('');
  };

  const handleStageNameKeyPress = (e, workflowId, swimlaneId, stageId) => {
    if (e.key === 'Enter') {
      handleSaveStageNameChange(workflowId, swimlaneId, stageId);
    } else if (e.key === 'Escape') {
      handleCancelEditStage();
    }
  };

  const handleDeleteStage = (workflowId, swimlaneId, stageId) => {
    if (addEditLoader) return;

    const workflow = workflows.find((w) => w.id === workflowId || String(w.id) === String(workflowId));
    const swimlane = workflow?.swimlanes.find(
      (sl) => sl.id === swimlaneId || String(sl.id) === String(swimlaneId)
    );
    const stage = swimlane?.stages.find((s) => s.id === stageId || String(s.id) === String(stageId));
    const columnId = stage?.columnId;

    if (boardId && columnId != null && String(columnId) !== '') {
      removeWorkflowColumn({
        column_id: columnId,
        cb: () => getWorkflowByBoard({ boardId }),
      });
      return;
    }

    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((w) => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          swimlanes: w.swimlanes.map((sl) => {
            if (sl.id !== swimlaneId) return sl;
            return {
              ...sl,
              stages: removeStage(sl.stages, stageId),
            };
          }),
        };
      })
    );
  };

  const handleStageLimitChange = (workflowId, swimlaneId, stageId, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          swimlanes: workflow.swimlanes.map((swimlane) => {
            if (swimlane.id !== swimlaneId) return swimlane;
            return {
              ...swimlane,
              stages: swimlane.stages.map((stage) =>
                stage.id === stageId ? { ...stage, limit: num } : stage
              ),
            };
          }),
        };
      })
    );
  };

  const handleStageCardsPerRowChange = (workflowId, swimlaneId, stageId, value) => {
    const num = Math.max(1, parseInt(value, 10) || 1);
    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          swimlanes: workflow.swimlanes.map((swimlane) => {
            if (swimlane.id !== swimlaneId) return swimlane;
            return {
              ...swimlane,
              stages: swimlane.stages.map((stage) =>
                stage.id === stageId ? { ...stage, cardsPerRow: num } : stage
              ),
            };
          }),
        };
      })
    );
  };

  const handleStageColorChange = (workflowId, swimlaneId, stageId, rgbColor) => {
    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          swimlanes: workflow.swimlanes.map((swimlane) => {
            if (swimlane.id !== swimlaneId) return swimlane;
            return {
              ...swimlane,
              stages: swimlane.stages.map((stage) =>
                stage.id === stageId ? { ...stage, color: rgbColor } : stage
              ),
            };
          }),
        };
      })
    );
  };

  const refetchBoardWorkflows = () => {
    if (boardId) {
      getWorkflowByBoard({ boardId });
    }
  };

  const handleCreateWorkflow = ({ workflow_name }) => {
    if (!boardId || !workflow_name?.trim()) return;
    createWorkflow({
      board_id: boardId,
      workflow_name: workflow_name.trim(),
      cb: () => {
        refetchBoardWorkflows();
        setShowCreateWorkflowModal(false);
      },
    });
  };

  const handleDeleteWorkflow = (workflowId) => {
    if (!window.confirm('Delete this workflow? This cannot be undone.')) {
      return;
    }
    deleteWorkflow({
      workflow_id: workflowId,
      cb: refetchBoardWorkflows,
    });
  };

  const handleDisableWorkflow = (workflowId) => {
    disableWorkflow({
      workflow_id: workflowId,
      cb: (data) => {
        if (data && typeof data.is_active !== 'undefined') {
          const nextActive = data.is_active == 0 ? 0 : 1;
          setWorkflows((prev) =>
            prev.map((w) =>
              String(w.id) === String(workflowId) ? { ...w, is_active: nextActive } : w
            )
          );
        }
        refetchBoardWorkflows();
      },
    });
  };

  const handleAddSwimlane = (workflowId, insertAtIndex, swimlaneName = 'New Swimlane') => {
    createSwimlane({
      workflow_id: workflowId,
      swimlane_name: swimlaneName,
      cb: refetchBoardWorkflows,
    });
  };

  const handleRenameSwimlane = (workflowId, swimlaneId, newName) => {
    const trimmed = newName?.trim();
    if (!trimmed) return;
    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((w) => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          swimlanes: w.swimlanes.map((sl) =>
            sl.id === swimlaneId ? { ...sl, name: trimmed } : sl
          ),
        };
      })
    );
    renameSwimlane({
      swimlane_id: swimlaneId,
      swimlane_name: trimmed,
      cb: refetchBoardWorkflows,
    });
  };

  const handleDeleteSwimlane = (workflowId, swimlaneId) => {
    if (!window.confirm('Delete this swimlane? This cannot be undone.')) return;
    deleteSwimlane({
      swimlane_id: swimlaneId,
      cb: refetchBoardWorkflows,
    });
  };

  const showNoWorkflowEmptyState = Boolean(boardId) && !isLoading && workflows.length === 0;

  return (
    <div className="edit-workflows-container">
      <div
        className={`workflows-content${showNoWorkflowEmptyState ? ' workflows-content--empty-workflow' : ''}`}
      >
        <div className="workflows-page-toolbar">
          {/* <div className="workflows-board-config-card">
            <h3 className="workflows-config-title">Board Configurations</h3>
            <div className="workflows-board-config-fields">
              <div className="workflows-config-field">
                <label className="workflows-config-label">Board name</label>
                <input
                  type="text"
                  className="workflows-config-input"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                />
              </div>
              <div className="workflows-config-field">
                <label className="workflows-config-label">
                  Description
                  <button className="workflows-edit-icon" type="button">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11.3333 2.00004C11.5084 1.82488 11.7163 1.68601 11.9444 1.59128C12.1726 1.49655 12.4163 1.44775 12.6622 1.44775C12.9081 1.44775 13.1518 1.49655 13.38 1.59128C13.6081 1.68601 13.816 1.82488 13.9911 2.00004C14.1663 2.17519 14.3052 2.38313 14.3999 2.61126C14.4946 2.83939 14.5434 3.08309 14.5434 3.32904C14.5434 3.57499 14.4946 3.81869 14.3999 4.04682C14.3052 4.27495 14.1663 4.48289 13.9911 4.65804L5.32444 13.3247L1.33331 14.6667L2.67531 10.6756L11.3333 2.00004Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </label>
                <input
                  type="text"
                  className="workflows-config-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div> */}
          {!showNoWorkflowEmptyState ? (
            <div className="workflows-toolbar-actions">
              <button
                type="button"
                className="workflows-btn workflows-btn-create workflows-btn-create--toolbar"
                onClick={() => setShowCreateWorkflowModal(true)}
              >
                Create new workflow
              </button>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="workflows-loading">Loading workflow…</div>
        ) : showNoWorkflowEmptyState ? (
          <div className="workflows-not-found">
            <div className="workflows-not-found-card">
              <div className="workflows-not-found-icon" aria-hidden>
                <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="10" width="12" height="36" rx="2" stroke="currentColor" strokeWidth="1.75" />
                  <rect x="22" y="10" width="12" height="36" rx="2" stroke="currentColor" strokeWidth="1.75" />
                  <rect x="36" y="10" width="12" height="36" rx="2" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M11 18h6M29 18h6M43 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="workflows-not-found-copy">
                <h2 className="workflows-not-found-title">Create your first workflow</h2>
                <p className="workflows-not-found-text">
                  Add a workflow to define stages and swimlanes—then you can fine-tune columns and limits here.
                </p>
              </div>
              <div className="workflows-not-found-actions">
                <button
                  type="button"
                  className="workflows-btn workflows-btn-create workflows-not-found-cta"
                  onClick={() => setShowCreateWorkflowModal(true)}
                >
                  Create workflow
                </button>
              </div>
            </div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="workflows-empty">No workflow found. Add boardId to the URL to load a workflow.</div>
        ) : (
          workflows.map((workflow) => {
            const workflowIsDisabled = workflow.is_active == 0;
            return (
              <div
                key={workflow.id}
                className={`workflow-card${workflowIsDisabled ? ' workflow-card--disabled' : ''}`}
              >
                <div className="workflow-header">
                  <div className="workflow-header-left">
                    {workflowIsDisabled ? (
                      <h3 className="workflow-title">{workflow.name}</h3>
                    ) : (
                      <>
                        <button className="workflow-move-btn" type="button">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 5L10 2L13 5M13 15L10 18L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {editingWorkflowId === workflow.id ? (
                          <input
                            type="text"
                            className="workflow-title-input"
                            value={editingWorkflowName}
                            onChange={(e) => setEditingWorkflowName(e.target.value)}
                            onBlur={() => handleSaveWorkflowName(workflow.id)}
                            onKeyDown={(e) => handleWorkflowNameKeyPress(e, workflow.id)}
                            autoFocus
                          />
                        ) : (
                          <h3 className="workflow-title">{workflow.name}</h3>
                        )}
                        <button
                          className="workflow-edit-btn"
                          type="button"
                          onClick={() => handleStartEditWorkflow(workflow.id, workflow.name)}
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12.75 2.25C12.9468 2.05322 13.1794 1.89585 13.4349 1.78609C13.6904 1.67633 13.9642 1.61621 14.2417 1.60879C14.5192 1.60137 14.7958 1.64677 15.0571 1.74253C15.3184 1.83829 15.5596 1.98259 15.7685 2.16831C15.9774 2.35403 16.1501 2.57764 16.2784 2.82806C16.4067 3.07848 16.4882 3.35112 16.5188 3.63191C16.5494 3.9127 16.5285 4.19687 16.4573 4.46985C16.3861 4.74283 16.2659 5.00005 16.1025 5.22831L15.0825 6.75L11.25 2.9175L12.7717 1.8975C13 1.73412 13.2572 1.61393 13.5302 1.54272C13.8032 1.47152 14.0874 1.45062 14.3682 1.48122C14.649 1.51182 14.9216 1.59334 15.172 1.72162C15.4225 1.8499 15.6461 2.02264 15.8318 2.23153C16.0175 2.44042 16.1618 2.68164 16.2576 2.94294C16.3534 3.20424 16.3988 3.48079 16.3913 3.75831C16.3839 4.03583 16.3238 4.30964 16.214 4.56512C16.1043 4.8206 15.9469 5.05322 15.75 5.25L6.375 14.625L2.25 15.75L3.375 11.625L12.75 2.25Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <Tooltip
                          id={`workflow-info-${workflow.id}`}
                          place="bottom"
                          className="workflow-info-tooltip"
                          positionStrategy="fixed"
                        >
                          <div>
                            <div>Workflow: {workflow.name}</div>
                            <div>This workflow contains {workflow.swimlanes.length} swimlane(s) with multiple stages for organizing your work.</div>
                          </div>
                        </Tooltip>
                        <button className="workflow-info-btn" type="button" data-tooltip-id={`workflow-info-${workflow.id}`}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path d="M9 6V9M9 12H9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="workflow-header-right">
                    <button
                      type="button"
                      className="workflow-action-link workflow-action-link-delete"
                      disabled={addEditLoader}
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="workflow-action-link"
                      disabled={addEditLoader}
                      onClick={() => handleDisableWorkflow(workflow.id)}
                    >
                      {workflowIsDisabled ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                </div>

                {!workflowIsDisabled ? (
                  <div className="workflow-board">
                    <WorkflowBoard
                      workflow={workflow}
                      columnActionsDisabled={addEditLoader}
                      hoveredColumn={hoveredColumn}
                      stackedRailMetrics={stackedRailMetrics}
                      editingStageId={editingStageId}
                      editingStageName={editingStageName}
                      onStageMouseEnter={handleStageBoxMouseEnter}
                      onStageMouseLeave={handleStageBoxMouseLeave}
                      onAddColumnLeft={handleAddColumnLeft}
                      onAddColumnRight={handleAddColumnRight}
                      onAddSubcolumn={handleAddSubcolumn}
                      onStartEditStage={handleStartEditStage}
                      onEditingStageNameChange={setEditingStageName}
                      onSaveStageName={handleSaveStageNameChange}
                      onStageNameKeyPress={handleStageNameKeyPress}
                      onColorSelect={handleStageColorChange}
                      onDeleteStage={handleDeleteStage}
                      onStageLimitChange={handleStageLimitChange}
                      onStageCardsPerRowChange={handleStageCardsPerRowChange}
                      onAddSwimlane={handleAddSwimlane}
                      onRenameSwimlane={handleRenameSwimlane}
                      onDeleteSwimlane={handleDeleteSwimlane}
                    />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <CreateWorkflowModal
        show={showCreateWorkflowModal}
        onClose={() => setShowCreateWorkflowModal(false)}
        onSave={handleCreateWorkflow}
        isSaving={addEditLoader}
      />
    </div>
  );
}

export default EditWorkflows;
