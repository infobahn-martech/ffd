import { useState } from 'react';
import '../../design/scss/EditWorkflows.scss';
import CreateWorkflowModal from './CreateWorkflowModal';

function EditWorkflows() {
    const [boardName, setBoardName] = useState('Team workspace');
    const [description, setDescription] = useState('There is no description');
    const [defaultTemplates, setDefaultTemplates] = useState('Default template configurations: 0');
    const [customCardId, setCustomCardId] = useState('Repeating value');
    const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
    const [hoveredColumn, setHoveredColumn] = useState(null); // Format: 'workflowId-swimlaneId-stageId'
    const [nextStageId, setNextStageId] = useState(100); // Starting ID for new stages
    const [placeholderCounts, setPlaceholderCounts] = useState({}); // Format: { 'workflowId-swimlaneId': count }

    const [workflows, setWorkflows] = useState([
        {
            id: 1,
            name: 'Initiatives Workflow',
            swimlanes: [
                {
                    id: 1,
                    name: 'Portfolio Lane',
                    stages: [
                        { id: 1, name: 'Backlog', area: 'BACKLOG AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 2, name: 'Requested', area: 'REQUESTED AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 3, name: 'In Progress', area: 'IN PROGRESS AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 4, name: 'Done', area: 'DONE AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 5, name: 'Ready to Archive', area: 'READY TO ARCHIVE AREA', limit: 0, cardsPerRow: 1, row: 0 },
                    ],
                },
            ],
        },
        {
            id: 2,
            name: 'Cards workflow',
            swimlanes: [
                {
                    id: 1,
                    name: 'Default Swimlane',
                    stages: [
                        { id: 1, name: 'Backlog', area: 'BACKLOG AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 2, name: 'Requested', area: 'REQUESTED AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 3, name: 'In Progress', area: 'IN PROGRESS AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 4, name: 'Done', area: 'DONE AREA', limit: 0, cardsPerRow: 1, row: 0 },
                        { id: 5, name: 'Ready to Archive', area: 'READY TO ARCHIVE AREA', limit: 0, cardsPerRow: 1, row: 0 },
                    ],
                },
            ],
        },
    ]);

    const areaColors = {
        'BACKLOG AREA': '#9ca3af',
        'REQUESTED AREA': '#3b82f6',
        'IN PROGRESS AREA': '#f59e0b',
        'DONE AREA': '#10b981',
        'READY TO ARCHIVE AREA': '#8b5cf6',
    };

    // Generate unique column key for hover tracking
    const getColumnKey = (workflowId, swimlaneId, stageId) => {
        return `${workflowId}-${swimlaneId}-${stageId}`;
    };

    // Handle adding a new stage box in the same row (to the left)
    const handleAddColumnLeft = (workflowId, swimlaneId, stageId) => {
        setWorkflows(prevWorkflows => {
            return prevWorkflows.map(workflow => {
                if (workflow.id === workflowId) {
                    return {
                        ...workflow,
                        swimlanes: workflow.swimlanes.map(swimlane => {
                            if (swimlane.id === swimlaneId) {
                                const stageIndex = swimlane.stages.findIndex(s => s.id === stageId);
                                if (stageIndex !== -1) {
                                    const stageToDuplicate = swimlane.stages[stageIndex];
                                    // Find all stages with the same area and same row
                                    const sameRowStages = swimlane.stages.filter(
                                        s => s.area === stageToDuplicate.area && s.row === stageToDuplicate.row
                                    );
                                    const sameRowIndex = sameRowStages.findIndex(s => s.id === stageId);

                                    const newStage = {
                                        ...stageToDuplicate,
                                        id: nextStageId,
                                        name: `New Column`,
                                        row: stageToDuplicate.row,
                                    };

                                    // Find the index in the full stages array where to insert (before current stage in same row)
                                    const stagesInSameRow = swimlane.stages.filter(
                                        s => s.area === stageToDuplicate.area && s.row === stageToDuplicate.row
                                    );
                                    const firstStageInRow = stagesInSameRow[0];
                                    const firstStageIndex = swimlane.stages.findIndex(s => s.id === firstStageInRow.id);

                                    const newStages = [...swimlane.stages];
                                    newStages.splice(firstStageIndex + sameRowIndex, 0, newStage);
                                    setNextStageId(prev => prev + 1);
                                    return {
                                        ...swimlane,
                                        stages: newStages,
                                    };
                                }
                            }
                            return swimlane;
                        }),
                    };
                }
                return workflow;
            });
        });
    };

    // Handle adding a new stage box in the same row (to the right)
    const handleAddColumnRight = (workflowId, swimlaneId, stageId) => {
        setWorkflows(prevWorkflows => {
            return prevWorkflows.map(workflow => {
                if (workflow.id === workflowId) {
                    return {
                        ...workflow,
                        swimlanes: workflow.swimlanes.map(swimlane => {
                            if (swimlane.id === swimlaneId) {
                                const stageIndex = swimlane.stages.findIndex(s => s.id === stageId);
                                if (stageIndex !== -1) {
                                    const stageToDuplicate = swimlane.stages[stageIndex];
                                    // Find all stages with the same area and same row
                                    const sameRowStages = swimlane.stages.filter(
                                        s => s.area === stageToDuplicate.area && s.row === stageToDuplicate.row
                                    );
                                    const sameRowIndex = sameRowStages.findIndex(s => s.id === stageId);

                                    const newStage = {
                                        ...stageToDuplicate,
                                        id: nextStageId,
                                        name: `New Column`,
                                        row: stageToDuplicate.row,
                                    };

                                    // Find the index in the full stages array where to insert (after current stage in same row)
                                    const stagesInSameRow = swimlane.stages.filter(
                                        s => s.area === stageToDuplicate.area && s.row === stageToDuplicate.row
                                    );
                                    const firstStageInRow = stagesInSameRow[0];
                                    const firstStageIndex = swimlane.stages.findIndex(s => s.id === firstStageInRow.id);

                                    const newStages = [...swimlane.stages];
                                    newStages.splice(firstStageIndex + sameRowIndex + 1, 0, newStage);
                                    setNextStageId(prev => prev + 1);
                                    return {
                                        ...swimlane,
                                        stages: newStages,
                                    };
                                }
                            }
                            return swimlane;
                        }),
                    };
                }
                return workflow;
            });
        });
    };

    // Handle adding a new stage box in a new row (at the bottom)
    const handleAddColumnBottom = (workflowId, swimlaneId, stageId) => {
        setWorkflows(prevWorkflows => {
            return prevWorkflows.map(workflow => {
                if (workflow.id === workflowId) {
                    return {
                        ...workflow,
                        swimlanes: workflow.swimlanes.map(swimlane => {
                            if (swimlane.id === swimlaneId) {
                                const stageToDuplicate = swimlane.stages.find(s => s.id === stageId);
                                if (stageToDuplicate) {
                                    // Find the maximum row number for this area
                                    const stagesInSameArea = swimlane.stages.filter(s => s.area === stageToDuplicate.area);
                                    const maxRow = stagesInSameArea.length > 0
                                        ? Math.max(...stagesInSameArea.map(s => s.row || 0))
                                        : -1;

                                    const newStage = {
                                        ...stageToDuplicate,
                                        id: nextStageId,
                                        name: `New Column`,
                                        row: maxRow + 1,
                                    };
                                    setNextStageId(prev => prev + 1);
                                    return {
                                        ...swimlane,
                                        stages: [...swimlane.stages, newStage],
                                    };
                                }
                            }
                            return swimlane;
                        }),
                    };
                }
                return workflow;
            });
        });
    };

    // Handle adding a placeholder to all columns in a swimlane
    const handleAddPlaceholder = (workflowId, swimlaneId) => {
        const key = `${workflowId}-${swimlaneId}`;
        setPlaceholderCounts(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + 1
        }));
    };

    return (
        <div className="edit-workflows-container">
            <div className="edit-workflows-layout">
                {/* Right Section - Workflow Definitions */}
                <div className="workflows-content">
                    {workflows.map((workflow) => (
                        <div key={workflow.id} className="workflow-card">
                            <div className="workflow-header">
                                <div className="workflow-header-left">
                                    <button className="workflow-move-btn" type="button">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 5L10 2L13 5M13 15L10 18L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <h3 className="workflow-title">{workflow.name}</h3>
                                    <button className="workflow-edit-btn" type="button">
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
                                    <button className="workflow-info-btn" type="button">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                            <path d="M9 6V9M9 12H9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="workflow-header-right">
                                    <button className="workflow-action-link workflow-action-link-delete">Delete</button>
                                    <button className="workflow-action-link">Disable</button>
                                </div>
                            </div>

                            {workflow.swimlanes.map((swimlane) => {
                                // Group stages by area, then by row
                                const stagesByArea = swimlane.stages.reduce((acc, stage) => {
                                    if (!acc[stage.area]) {
                                        acc[stage.area] = {};
                                    }
                                    const row = stage.row || 0;
                                    if (!acc[stage.area][row]) {
                                        acc[stage.area][row] = [];
                                    }
                                    acc[stage.area][row].push(stage);
                                    return acc;
                                }, {});

                                return (
                                    <div key={swimlane.id} className="workflow-swimlane">
                                        <div className="swimlane-label">{swimlane.name}</div>
                                        <div className="workflow-columns">
                                            {Object.entries(stagesByArea).map(([area, rows]) => {
                                                const firstRowStages = Object.values(rows)[0];
                                                const firstStage = firstRowStages[0];
                                                const columnKey = getColumnKey(workflow.id, swimlane.id, firstStage.id);
                                                const isHovered = hoveredColumn === columnKey;

                                                return (
                                                    <div
                                                        key={area}
                                                        className="workflow-column"
                                                    >
                                                        <div
                                                            className="workflow-column-header"
                                                            style={{ backgroundColor: areaColors[area] }}
                                                            title={area}
                                                        >
                                                            {area}
                                                        </div>
                                                        <div className="workflow-stages-container">
                                                            {Object.entries(rows)
                                                                .sort(([a], [b]) => Number(a) - Number(b))
                                                                .map(([rowIndex, stages], rowArrayIndex, rowsArray) => {
                                                                    // Sort stages within row by their original order
                                                                    const sortedStages = [...stages].sort((a, b) => {
                                                                        const aIndex = swimlane.stages.findIndex(s => s.id === a.id);
                                                                        const bIndex = swimlane.stages.findIndex(s => s.id === b.id);
                                                                        return aIndex - bIndex;
                                                                    });

                                                                    return (
                                                                        <div key={rowIndex} className="workflow-stages-row">
                                                                            {sortedStages.map((stage, stageIndex) => {
                                                                                const stageColumnKey = getColumnKey(workflow.id, swimlane.id, stage.id);
                                                                                const isStageHovered = hoveredColumn === stageColumnKey;
                                                                                const isLastRow = rowArrayIndex === rowsArray.length - 1;
                                                                                const isLastStageInLastRow = isLastRow && stageIndex === stages.length - 1;

                                                                                return (
                                                                                    <div
                                                                                        key={stage.id}
                                                                                        className="workflow-stage-box"
                                                                                        style={{ position: 'relative' }}
                                                                                        onMouseEnter={() => setHoveredColumn(stageColumnKey)}
                                                                                        onMouseLeave={() => setHoveredColumn(null)}
                                                                                    >
                                                                                        {/* Left + Icon */}
                                                                                        {isStageHovered && (
                                                                                            <button
                                                                                                className="workflow-column-add-btn workflow-column-add-left"
                                                                                                type="button"
                                                                                                onClick={() => handleAddColumnLeft(workflow.id, swimlane.id, stage.id)}
                                                                                                title={`Add a new column before ${stage.name}`}
                                                                                            >
                                                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        )}

                                                                                        {/* Right + Icon */}
                                                                                        {isStageHovered && (
                                                                                            <button
                                                                                                className="workflow-column-add-btn workflow-column-add-right"
                                                                                                type="button"
                                                                                                onClick={() => handleAddColumnRight(workflow.id, swimlane.id, stage.id)}
                                                                                                title={`Add a new column after ${stage.name}`}
                                                                                            >
                                                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        )}

                                                                                        {/* Bottom + Icon - only show on last stage in last row */}
                                                                                        {isStageHovered && isLastStageInLastRow && (
                                                                                            <button
                                                                                                className="workflow-column-add-btn workflow-column-add-bottom"
                                                                                                type="button"
                                                                                                onClick={() => handleAddColumnBottom(workflow.id, swimlane.id, stage.id)}
                                                                                                title="Add a new column at the end"
                                                                                            >
                                                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        )}

                                                                                        <div className="stage-box-header">
                                                                                            <span className="stage-name" title={stage.name}>{stage.name}</span>
                                                                                        </div>
                                                                                        <div className="stage-box-details">
                                                                                            <span className="stage-limit">Limit: {stage.limit}</span>
                                                                                            <span className="stage-cards-per-row">Cards per row: {stage.cardsPerRow}</span>
                                                                                        </div>
                                                                                        <div className="stage-box-actions">
                                                                                            <button className="stage-action-btn" type="button" title="Settings">
                                                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                    <path
                                                                                                        d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth="1.5"
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                    />
                                                                                                    <path
                                                                                                        d="M1.33331 8.66667V7.33333C1.33331 6.89131 1.509 6.46738 1.82156 6.15482C2.13412 5.84226 2.55805 5.66667 2.99998 5.66667H3.33331C3.59853 5.66667 3.85289 5.57143 4.05295 5.37137C4.25301 5.17131 4.34831 4.91695 4.34831 4.65167V4.31833C4.34831 3.87631 4.524 3.45238 4.83656 3.13982C5.14912 2.82726 5.57305 2.65167 6.01498 2.65167H6.34831C6.61353 2.65167 6.86789 2.55643 7.06795 2.35637C7.26801 2.15631 7.36331 1.90195 7.36331 1.63667V1.33333"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth="1.5"
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                    />
                                                                                                    <path
                                                                                                        d="M14.6667 7.33333V8.66667C14.6667 9.10869 14.491 9.53262 14.1784 9.84518C13.8659 10.1577 13.4419 10.3333 13 10.3333H12.6667C12.4015 10.3333 12.1471 10.4286 11.9471 10.6286C11.747 10.8287 11.6517 11.083 11.6517 11.3483V11.6817C11.6517 12.1237 11.476 12.5476 11.1634 12.8602C10.8509 13.1727 10.4269 13.3483 9.985 13.3483H9.65167C9.38645 13.3483 9.13209 13.4436 8.93203 13.6436C8.73197 13.8437 8.63667 14.098 8.63667 14.3633V14.6667"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth="1.5"
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                    />
                                                                                                </svg>
                                                                                            </button>
                                                                                            <button className="stage-action-btn" type="button" title="Time tracking">
                                                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                                                                                    <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                                                </svg>
                                                                                            </button>
                                                                                            <button className="stage-action-btn" type="button" title="Card details">
                                                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                    <path
                                                                                                        d="M2 4H14M2 8H14M2 12H10"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth="1.5"
                                                                                                        strokeLinecap="round"
                                                                                                    />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                        {Array.from({ length: (placeholderCounts[`${workflow.id}-${swimlane.id}`] || 0) + 1 }).map((_, index) => (
                                                            <div key={index} className="workflow-stage-placeholder">
                                                                <span>Limit: 0</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="workflow-add-placeholder-container">
                                            <button
                                                className="workflow-add-placeholder-btn"
                                                type="button"
                                                onClick={() => handleAddPlaceholder(workflow.id, swimlane.id)}
                                                title="Add placeholder to all columns"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                {/* Right Sidebar - Board Configurations */}
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

                        {/* <div className="workflows-config-field">
                            <label className="workflows-config-label">
                                Default templates
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
                                value={defaultTemplates}
                                onChange={(e) => setDefaultTemplates(e.target.value)}
                            />
                        </div>

                        <div className="workflows-config-field">
                            <label className="workflows-config-label">Custom card ID</label>
                            <select
                                className="workflows-config-select"
                                value={customCardId}
                                onChange={(e) => setCustomCardId(e.target.value)}
                            >
                                <option>Repeating value</option>
                            </select>
                        </div> */}

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

            {/* Create Workflow Modal */}
            <CreateWorkflowModal
                show={showCreateWorkflowModal}
                onClose={() => setShowCreateWorkflowModal(false)}
                onSave={(workflowData) => {
                    // TODO: Implement save workflow functionality
                    console.log('Save workflow:', workflowData);
                    setShowCreateWorkflowModal(false);
                }}
            />
        </div>
    );
}

export default EditWorkflows;

