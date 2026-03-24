import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import '../../design/scss/EditWorkflows.scss';
import CreateWorkflowModal from './CreateWorkflowModal';
import WorkflowBoard from './WorkflowBoard';
import {
  getNextStageId,
  getColStackKey,
  insertColumnLeft,
  insertColumnRight,
  insertSubcolumnBelow,
  duplicateSwimlane,
  removeStage,
} from './workflow.utils';
import useWorkFlowReducer from '../../store/WorkFlowReducer';

const areaColors = {
  'BACKLOG AREA': '#cfd8dc',
  'REQUESTED AREA': '#2666be',
  'IN PROGRESS AREA': '#f38a30',
  'DONE AREA': '#42af49',
  'READY TO ARCHIVE AREA': '#7333bd',
};

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
    workflows: apiWorkflows,
    isLoading,
    addEditLoader,
  } = useWorkFlowReducer();

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

  useEffect(() => {
    const boardId = searchParams.get('boardId');
    if (boardId) {
      getWorkflowByBoard({ boardId });
    }
  }, [searchParams, getWorkflowByBoard]);

  useEffect(() => {
    if (apiWorkflows && Array.isArray(apiWorkflows) && apiWorkflows.length > 0) {
      setWorkflows(apiWorkflows);
    }
  }, [apiWorkflows]);

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
      }
    } else if (!isStacked) {
      setStackedRailMetrics(null);
    }
  };

  const handleAddColumnLeft = (workflowId, swimlaneId, stageId) => {
    // Reset hover / stacked rail state so insertion rails don't use stale metrics
    setHoveredColumn(null);
    setStackedRailMetrics(null);

    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        const newId = getNextStageId(workflow);
        return {
          ...workflow,
          swimlanes: workflow.swimlanes.map((swimlane) => {
            if (swimlane.id !== swimlaneId) return swimlane;
            const newStages = insertColumnLeft(swimlane.stages, stageId, newId);
            return { ...swimlane, stages: newStages };
          }),
        };
      })
    );
  };

  const handleAddColumnRight = (workflowId, swimlaneId, stageId) => {
    // Reset hover / stacked rail state so insertion rails don't use stale metrics
    setHoveredColumn(null);
    setStackedRailMetrics(null);

    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        const newId = getNextStageId(workflow);
        return {
          ...workflow,
          swimlanes: workflow.swimlanes.map((swimlane) => {
            if (swimlane.id !== swimlaneId) return swimlane;
            const newStages = insertColumnRight(swimlane.stages, stageId, newId);
            return { ...swimlane, stages: newStages };
          }),
        };
      })
    );
  };

  const handleAddSubcolumn = (workflowId, swimlaneId, stageId) => {
    // Reset hover / stacked rail state so insertion rails don't use stale metrics
    setHoveredColumn(null);
    setStackedRailMetrics(null);

    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        const newId = getNextStageId(workflow);
        return {
          ...workflow,
          swimlanes: workflow.swimlanes.map((swimlane) => {
            if (swimlane.id !== swimlaneId) return swimlane;
            const newStages = insertSubcolumnBelow(swimlane.stages, stageId, newId);
            return { ...swimlane, stages: newStages };
          }),
        };
      })
    );
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
    if (editingStageName.trim()) {
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
                  stage.id === stageId
                    ? { ...stage, name: editingStageName.trim() }
                    : stage
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
    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          swimlanes: workflow.swimlanes.map((swimlane) => {
            if (swimlane.id !== swimlaneId) return swimlane;
            return {
              ...swimlane,
              stages: removeStage(swimlane.stages, stageId),
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
    const boardId = searchParams.get('boardId');
    if (boardId) {
      getWorkflowByBoard({ boardId });
    }
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
      cb: refetchBoardWorkflows,
    });
  };

  const handleAddSwimlane = (workflowId, insertAtIndex) => {
    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        const sourceSwimlane = workflow.swimlanes[0] ?? workflow.swimlanes[insertAtIndex];
        if (!sourceSwimlane) return workflow;
        const newSwimlane = duplicateSwimlane(workflow, sourceSwimlane);
        const newSwimlanes = [
          ...workflow.swimlanes.slice(0, insertAtIndex),
          newSwimlane,
          ...workflow.swimlanes.slice(insertAtIndex),
        ];
        return { ...workflow, swimlanes: newSwimlanes };
      })
    );
  };

  return (
    <div className="edit-workflows-container">
      <div className="edit-workflows-layout">
        <div className="workflows-content">
          {isLoading ? (
            <div className="workflows-loading">Loading workflow…</div>
          ) : workflows.length === 0 ? (
            <div className="workflows-empty">No workflow found. Add boardId to the URL to load a workflow.</div>
          ) : (
            workflows.map((workflow) => (
              <div key={workflow.id} className="workflow-card">
                <div className="workflow-header">
                  <div className="workflow-header-left">
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
                      Disable
                    </button>
                  </div>
                </div>

                <div className="workflow-board">
                  <WorkflowBoard
                    workflow={workflow}
                    areaColors={areaColors}
                    hoveredColumn={hoveredColumn}
                    stackedRailMetrics={stackedRailMetrics}
                    editingStageId={editingStageId}
                    editingStageName={editingStageName}
                    onStageMouseEnter={handleStageBoxMouseEnter}
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
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="workflows-sidebar">
          <button
            className="workflows-btn workflows-btn-create"
            onClick={() => setShowCreateWorkflowModal(true)}
          >
            Create new workflow
          </button>

          <div className="workflows-config-section">
            <h3 className="workflows-config-title">Board Configurations</h3>

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

            <div className="workflows-undo-redo">
              <button className="workflows-btn workflows-btn-undo" disabled>
                Undo
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 2L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="workflows-btn workflows-btn-redo" disabled>
                Redo
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6L8 2L4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="workflows-actions-bottom">
            <button className="workflows-btn workflows-btn-discard">Discard</button>
            <button className="workflows-btn workflows-btn-save">Save</button>
          </div>
        </div>
      </div>

      <CreateWorkflowModal
        show={showCreateWorkflowModal}
        onClose={() => setShowCreateWorkflowModal(false)}
        onSave={(workflowData) => {
          console.log('Save workflow:', workflowData);
          setShowCreateWorkflowModal(false);
        }}
      />
    </div>
  );
}

export default EditWorkflows;
