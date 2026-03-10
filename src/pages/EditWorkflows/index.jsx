import { useState, useRef, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import '../../design/scss/EditWorkflows.scss';
import CreateWorkflowModal from './CreateWorkflowModal';

// Color palette (matching CardForm.jsx)
const COLOR_PALETTE = [
    { hex: '#FF00FF', rgb: 'rgb(255, 0, 255)', name: 'Fuchsia' },
    { hex: '#800080', rgb: 'rgb(128, 0, 128)', name: 'Purple' },
    { hex: '#4169E1', rgb: 'rgb(65, 105, 225)', name: 'Royal Blue' },
    { hex: '#008000', rgb: 'rgb(0, 128, 0)', name: 'Green' },
    { hex: '#FFFF00', rgb: 'rgb(255, 255, 0)', name: 'Yellow' },
    { hex: '#FFA500', rgb: 'rgb(255, 165, 0)', name: 'Orange' },
    { hex: '#8B0000', rgb: 'rgb(139, 0, 0)', name: 'Dark Red' },
    { hex: '#775649', rgb: 'rgb(119, 86, 73)', name: 'Brown' },
    { hex: '#D3D3D3', rgb: 'rgb(211, 211, 211)', name: 'Light Gray' },
    { hex: '#708090', rgb: 'rgb(112, 128, 144)', name: 'Slate Blue' },
    { hex: '#000000', rgb: 'rgb(0, 0, 0)', name: 'Black' },
    { hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', name: 'White' },
];

const rgbToHex = (rgb) => {
    if (!rgb) return '#f9fafb';
    if (rgb.startsWith('#')) return rgb.toUpperCase();
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '#f9fafb';
    return '#' + match.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
};

const normalizeRgb = (rgb) => {
    if (!rgb) return '';
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '';
    return `rgb(${match[0]}, ${match[1]}, ${match[2]})`;
};

const ColorPickerDropdown = ({ isOpen, onClose, selectedColor, onColorSelect }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    const handleColorClick = (color) => {
        onColorSelect(color.rgb);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="edit-workflows-color-picker-dropdown" ref={dropdownRef}>
            <div className="edit-workflows-color-picker-grid">
                {COLOR_PALETTE.map((color, index) => {
                    const selectedHex = rgbToHex(selectedColor);
                    const isSelected = selectedHex === color.hex || normalizeRgb(selectedColor) === normalizeRgb(color.rgb);
                    return (
                        <button
                            key={index}
                            type="button"
                            className={`edit-workflows-color-swatch ${isSelected ? 'selected' : ''} ${color.hex === '#FFFFFF' ? 'white-swatch' : ''}`}
                            style={{ backgroundColor: color.hex }}
                            onClick={() => handleColorClick(color)}
                            title={color.name}
                            aria-label={`Select ${color.name} color`}
                        >
                            {isSelected && (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="edit-workflows-color-checkmark">
                                    <path
                                        d="M13.3333 4L6 11.3333L2.66667 8"
                                        stroke={color.hex === '#000000' ? '#ffffff' : color.hex === '#FFFFFF' ? '#000000' : '#ffffff'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                            {color.hex === '#FFFFFF' && !isSelected && <div className="edit-workflows-color-swatch-outline" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

function EditWorkflows() {
    const [boardName, setBoardName] = useState('Team workspace');
    const [description, setDescription] = useState('There is no description');
    const [defaultTemplates, setDefaultTemplates] = useState('Default template configurations: 0');
    const [customCardId, setCustomCardId] = useState('Repeating value');
    const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
    const [hoveredColumn, setHoveredColumn] = useState(null); // Format: 'workflowId-swimlaneId-stageId'
    const [editingWorkflowId, setEditingWorkflowId] = useState(null); // Track which workflow is being edited
    const [editingWorkflowName, setEditingWorkflowName] = useState(''); // Temporary name while editing
    const [editingStageId, setEditingStageId] = useState(null); // Track which stage is being edited: 'workflowId-swimlaneId-stageId'
    const [editingStageName, setEditingStageName] = useState(''); // Temporary stage name while editing
    const [openColorPickerForStage, setOpenColorPickerForStage] = useState(null); // 'workflowId-swimlaneId-stageId' or null

    const [workflows, setWorkflows] = useState([
        {
            id: 1,
            name: 'Main work flow RT',
            swimlanes: [
                {
                    id: 1,
                    name: 'Default Swimlane',
                    stages: [
                        { id: 1, name: 'Backlog', area: 'BACKLOG AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0 },
                        { id: 2, name: 'Appointment Received', area: 'REQUESTED AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0 },
                        { id: 3, name: 'Ops In Progress', area: 'IN PROGRESS AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0 },
                        { id: 4, name: 'Dispatched', area: 'DONE AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0 },
                        { id: 5, name: 'Ready To Archive', area: 'READY TO ARCHIVE AREA', limit: 0, cardsPerRow: 1, row: 0, col: 0 }
                    ],
                },
            ],
        },
    ]);

    const AREA_ORDER = [
        "BACKLOG AREA",
        'REQUESTED AREA',
        'IN PROGRESS AREA',
        'DONE AREA',
        'READY TO ARCHIVE AREA',
    ];

    const areaColors = {
        'BACKLOG AREA': '#cfd8dc',
        'REQUESTED AREA': '#2666be',
        'IN PROGRESS AREA': '#f38a30',
        'DONE AREA': '#42af49',
        'READY TO ARCHIVE AREA': '#7333bd',
    };

    // Get next unique stage ID (avoids setState-in-callback issues)
    const getNextStageId = (workflow) => {
        const maxId = Math.max(0, ...workflow.swimlanes.flatMap((sl) => sl.stages.map((s) => s.id)));
        return maxId + 1;
    };

    // Build board column structure: { area, cols: number }[] - horizontal columns per area (max per row)
    // Subcolumns (vertical) do NOT affect header width
    const getBoardColumnStructure = (workflow) => {
        const colsPerArea = {};
        AREA_ORDER.forEach((area) => {
            let maxCols = 0;
            workflow.swimlanes.forEach((swimlane) => {
                const stagesInArea = swimlane.stages.filter((s) => s.area === area);
                const byRow = {};
                stagesInArea.forEach((s) => {
                    const row = s.row ?? 0;
                    if (!byRow[row]) byRow[row] = [];
                    byRow[row].push(s);
                });
                Object.values(byRow).forEach((rowStages) => {
                    const maxColInRow = rowStages.length
                        ? Math.max(...rowStages.map((s) => (s.col ?? 0))) + 1
                        : 0;
                    if (maxColInRow > maxCols) maxCols = maxColInRow;
                });
                if (maxCols > (colsPerArea[area] ?? 0)) colsPerArea[area] = maxCols;
            });
        });
        return AREA_ORDER.map((area) => ({ area, cols: colsPerArea[area] || 0 })).filter(
            (x) => x.cols > 0
        );
    };

    // Max row count for a swimlane across all areas (for grid alignment)
    const getMaxRowCount = (workflow, swimlane) => {
        const sl = workflow.swimlanes.find((s) => s.id === swimlane.id);
        if (!sl) return 1;
        const maxRow = Math.max(0, ...sl.stages.map((s) => s.row ?? 0));
        return Math.max(1, maxRow + 1);
    };

    // Build per-area matrix: { row: { col: stage } } - stage at (row, col)
    const getAreaMatrix = (swimlane, area) => {
        const matrix = {};
        swimlane.stages
            .filter((s) => s.area === area)
            .forEach((s) => {
                const row = s.row ?? 0;
                const col = s.col ?? 0;
                if (!matrix[row]) matrix[row] = {};
                matrix[row][col] = s;
            });
        return matrix;
    };

    // const areaColors = {
    //     'REQUESTED AREA': 'rgb(59, 130, 246)',
    //     'IN PROGRESS AREA': 'rgb(245, 158, 11)',
    //     'DONE AREA': 'rgb(16, 185, 129)',
    //     'READY TO ARCHIVE AREA': 'rgb(139, 92, 246)',
    // };

    // Generate unique column key for hover tracking
    const getColumnKey = (workflowId, swimlaneId, stageId) => {
        return `${workflowId}-${swimlaneId}-${stageId}`;
    };

    // Horizontal add (left): insert new sibling column in same row, same area; shift cols right
    const handleAddColumnLeft = (workflowId, swimlaneId, stageId) => {
        setWorkflows(prevWorkflows => {
            return prevWorkflows.map(workflow => {
                if (workflow.id !== workflowId) return workflow;
                const newId = getNextStageId(workflow);
                return {
                    ...workflow,
                    swimlanes: workflow.swimlanes.map(swimlane => {
                        if (swimlane.id !== swimlaneId) return swimlane;
                        const stage = swimlane.stages.find(s => s.id === stageId);
                        if (!stage) return swimlane;
                        const area = stage.area;
                        const targetRow = stage.row ?? 0;
                        const targetCol = stage.col ?? 0;

                        const newStage = {
                            ...stage,
                            id: newId,
                            name: 'New Column',
                            row: targetRow,
                            col: targetCol,
                        };

                        const newStages = swimlane.stages.map(s => {
                            if (s.area === area && s.row === targetRow && (s.col ?? 0) >= targetCol) {
                                return { ...s, col: (s.col ?? 0) + 1 };
                            }
                            return s;
                        });
                        newStages.push(newStage);
                        return { ...swimlane, stages: newStages };
                    }),
                };
            });
        });
    };

    // Vertical add (subcolumn): insert new stage below in same col; shift existing stages in column down
    const handleAddSubcolumn = (workflowId, swimlaneId, stageId) => {
        setWorkflows(prevWorkflows => {
            return prevWorkflows.map(workflow => {
                if (workflow.id !== workflowId) return workflow;
                const newId = getNextStageId(workflow);
                return {
                    ...workflow,
                    swimlanes: workflow.swimlanes.map(swimlane => {
                        if (swimlane.id !== swimlaneId) return swimlane;
                        const stage = swimlane.stages.find(s => s.id === stageId);
                        if (!stage) return swimlane;
                        const area = stage.area;
                        const currentRow = stage.row ?? 0;
                        const currentCol = stage.col ?? 0;
                        const insertRow = currentRow + 1;

                        const newStage = {
                            ...stage,
                            id: newId,
                            name: 'New Column',
                            area,
                            row: insertRow,
                            col: currentCol,
                            limit: stage.limit ?? 0,
                            cardsPerRow: stage.cardsPerRow ?? 1,
                        };

                        const newStages = swimlane.stages.map(s => {
                            if (s.area === area && s.col === currentCol && (s.row ?? 0) >= insertRow) {
                                return { ...s, row: (s.row ?? 0) + 1 };
                            }
                            return s;
                        });
                        newStages.push(newStage);
                        return { ...swimlane, stages: newStages };
                    }),
                };
            });
        });
    };

    // Horizontal add (right): insert new sibling column in same row, same area; shift cols right
    const handleAddColumnRight = (workflowId, swimlaneId, stageId) => {
        setWorkflows(prevWorkflows => {
            return prevWorkflows.map(workflow => {
                if (workflow.id !== workflowId) return workflow;
                const newId = getNextStageId(workflow);
                return {
                    ...workflow,
                    swimlanes: workflow.swimlanes.map(swimlane => {
                        if (swimlane.id !== swimlaneId) return swimlane;
                        const stage = swimlane.stages.find(s => s.id === stageId);
                        if (!stage) return swimlane;
                        const area = stage.area;
                        const targetRow = stage.row ?? 0;
                        const targetCol = (stage.col ?? 0) + 1;

                        const newStage = {
                            ...stage,
                            id: newId,
                            name: 'New Column',
                            row: targetRow,
                            col: targetCol,
                        };

                        const newStages = swimlane.stages.map(s => {
                            if (s.area === area && s.row === targetRow && (s.col ?? 0) >= targetCol) {
                                return { ...s, col: (s.col ?? 0) + 1 };
                            }
                            return s;
                        });
                        newStages.push(newStage);
                        return { ...swimlane, stages: newStages };
                    }),
                };
            });
        });
    };



    // Handle starting workflow name edit
    const handleStartEditWorkflow = (workflowId, currentName) => {
        setEditingWorkflowId(workflowId);
        setEditingWorkflowName(currentName);
    };

    // Handle saving workflow name
    const handleSaveWorkflowName = (workflowId) => {
        if (editingWorkflowName.trim()) {
            setWorkflows(prevWorkflows =>
                prevWorkflows.map(workflow =>
                    workflow.id === workflowId
                        ? { ...workflow, name: editingWorkflowName.trim() }
                        : workflow
                )
            );
        }
        setEditingWorkflowId(null);
        setEditingWorkflowName('');
    };

    // Handle canceling workflow name edit
    const handleCancelEditWorkflow = () => {
        setEditingWorkflowId(null);
        setEditingWorkflowName('');
    };

    // Handle key press in workflow name input
    const handleWorkflowNameKeyPress = (e, workflowId) => {
        if (e.key === 'Enter') {
            handleSaveWorkflowName(workflowId);
        } else if (e.key === 'Escape') {
            handleCancelEditWorkflow();
        }
    };

    // Handle starting stage name edit
    const handleStartEditStage = (stageId, currentName) => {
        setEditingStageId(stageId);
        setEditingStageName(currentName);
    };

    // Handle saving stage name
    const handleSaveStageNameChange = (workflowId, swimlaneId, stageId) => {
        if (editingStageName.trim()) {
            setWorkflows(prevWorkflows =>
                prevWorkflows.map(workflow => {
                    if (workflow.id === workflowId) {
                        return {
                            ...workflow,
                            swimlanes: workflow.swimlanes.map(swimlane => {
                                if (swimlane.id === swimlaneId) {
                                    return {
                                        ...swimlane,
                                        stages: swimlane.stages.map(stage =>
                                            stage.id === stageId
                                                ? { ...stage, name: editingStageName.trim() }
                                                : stage
                                        ),
                                    };
                                }
                                return swimlane;
                            }),
                        };
                    }
                    return workflow;
                })
            );
        }
        setEditingStageId(null);
        setEditingStageName('');
    };

    // Handle canceling stage name edit
    const handleCancelEditStage = () => {
        setEditingStageId(null);
        setEditingStageName('');
    };

    // Handle key press in stage name input
    const handleStageNameKeyPress = (e, workflowId, swimlaneId, stageId) => {
        if (e.key === 'Enter') {
            handleSaveStageNameChange(workflowId, swimlaneId, stageId);
        } else if (e.key === 'Escape') {
            handleCancelEditStage();
        }
    };

    // Handle stage color change
    const handleStageColorChange = (workflowId, swimlaneId, stageId, rgbColor) => {
        setWorkflows(prevWorkflows =>
            prevWorkflows.map(workflow => {
                if (workflow.id !== workflowId) return workflow;
                return {
                    ...workflow,
                    swimlanes: workflow.swimlanes.map(swimlane => {
                        if (swimlane.id !== swimlaneId) return swimlane;
                        return {
                            ...swimlane,
                            stages: swimlane.stages.map(stage =>
                                stage.id === stageId ? { ...stage, color: rgbColor } : stage
                            ),
                        };
                    }),
                };
            })
        );
        setOpenColorPickerForStage(null);
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
                                    <button
                                        className="workflow-info-btn"
                                        type="button"
                                        data-tooltip-id={`workflow-info-${workflow.id}`}
                                    >
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

                            <div className="workflow-board">
                                {(() => {
                                    const boardStructure = getBoardColumnStructure(workflow);
                                    const totalCols = boardStructure.reduce((sum, x) => sum + x.cols, 0);
                                    if (totalCols === 0) return null;

                                    const STAGE_CELL_WIDTH = 160;
                                    const STAGE_GAP = 8;

                                    const renderPlaceholderCell = (slId, area, rowIdx, colIdx) => (
                                        <div key={`ph-${slId}-${area}-${rowIdx}-${colIdx}`} className="workflow-stage-wrapper workflow-stage-placeholder-cell">
                                            <div className="workflow-stage-placeholder-spacer" aria-hidden="true" />
                                            <div className="workflow-stage-placeholder">
                                                <span>Limit: 0</span>
                                            </div>
                                        </div>
                                    );

                                    const renderStageCell = (stage, swimlaneRef, stageColumnKey, isStageHovered, isColorPickerOpen, showAddSubcolumn) => (
                                        <div
                                            key={stage.id}
                                            className={`workflow-stage-wrapper${isColorPickerOpen ? ' workflow-stage-wrapper-color-picker-open' : ''}`}
                                        >
                                            <div
                                                className="workflow-stage-box"
                                                style={{ position: 'relative' }}
                                                onMouseEnter={() => setHoveredColumn(stageColumnKey)}
                                                onMouseLeave={() => setHoveredColumn(null)}
                                            >
                                                {isStageHovered && (
                                                    <button
                                                        className="workflow-column-add-btn workflow-column-add-left"
                                                        type="button"
                                                        onClick={() => handleAddColumnLeft(workflow.id, swimlaneRef.id, stage.id)}
                                                        title={`Add a new column before ${stage.name}`}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {isStageHovered && (
                                                    <button
                                                        className="workflow-column-add-btn workflow-column-add-right"
                                                        type="button"
                                                        onClick={() => handleAddColumnRight(workflow.id, swimlaneRef.id, stage.id)}
                                                        title={`Add a new column after ${stage.name}`}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {isStageHovered && showAddSubcolumn && (
                                                    <button
                                                        className="workflow-column-add-btn workflow-column-add-below"
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddSubcolumn(workflow.id, swimlaneRef.id, stage.id);
                                                        }}
                                                        title="Add a new subcolumn"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <div className="stage-box-header">
                                                    {editingStageId === stageColumnKey ? (
                                                        <input
                                                            type="text"
                                                            className="stage-name-input"
                                                            value={editingStageName}
                                                            onChange={(e) => setEditingStageName(e.target.value)}
                                                            onBlur={() => handleSaveStageNameChange(workflow.id, swimlaneRef.id, stage.id)}
                                                            onKeyDown={(e) => handleStageNameKeyPress(e, workflow.id, swimlaneRef.id, stage.id)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span
                                                            className="stage-name"
                                                            title={stage.name}
                                                            onClick={() => handleStartEditStage(stageColumnKey, stage.name)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {stage.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="stage-box-details">
                                                    <span className="stage-limit">Limit: {stage.limit}</span>
                                                    <span className="stage-cards-per-row">Cards per row: {stage.cardsPerRow}</span>
                                                </div>
                                                <div className="stage-box-actions">
                                                    <button className="stage-action-btn" type="button" title="Settings">
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M1.33331 8.66667V7.33333C1.33331 6.89131 1.509 6.46738 1.82156 6.15482C2.13412 5.84226 2.55805 5.66667 2.99998 5.66667H3.33331C3.59853 5.66667 3.85289 5.57143 4.05295 5.37137C4.25301 5.17131 4.34831 4.91695 4.34831 4.65167V4.31833C4.34831 3.87631 4.524 3.45238 4.83656 3.13982C5.14912 2.82726 5.57305 2.65167 6.01498 2.65167H6.34831C6.61353 2.65167 6.86789 2.55643 7.06795 2.35637C7.26801 2.15631 7.36331 1.90195 7.36331 1.63667V1.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M14.6667 7.33333V8.66667C14.6667 9.10869 14.491 9.53262 14.1784 9.84518C13.8659 10.1577 13.4419 10.3333 13 10.3333H12.6667C12.4015 10.3333 12.1471 10.4286 11.9471 10.6286C11.747 10.8287 11.6517 11.083 11.6517 11.3483V11.6817C11.6517 12.1237 11.476 12.5476 11.1634 12.8602C10.8509 13.1727 10.4269 13.3483 9.985 13.3483H9.65167C9.38645 13.3483 9.13209 13.4436 8.93203 13.6436C8.73197 13.8437 8.63667 14.098 8.63667 14.3633V14.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                                            <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                    <div className="stage-action-color-picker-wrapper">
                                                        <button
                                                            className="stage-action-btn"
                                                            type="button"
                                                            title="Stage color"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenColorPickerForStage(openColorPickerForStage === stageColumnKey ? null : stageColumnKey);
                                                            }}
                                                            aria-label="Stage color"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M2 4h12v8H2V4z" fill="currentColor" />
                                                                <rect x="4" y="6" width="8" height="4" fill="white" stroke="currentColor" strokeWidth="0.5" />
                                                            </svg>
                                                        </button>
                                                        <ColorPickerDropdown
                                                            isOpen={openColorPickerForStage === stageColumnKey}
                                                            onClose={() => setOpenColorPickerForStage(null)}
                                                            selectedColor={stage.color || '#f9fafb'}
                                                            onColorSelect={(rgb) => handleStageColorChange(workflow.id, swimlaneRef.id, stage.id, rgb)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="workflow-stage-placeholder" style={{ backgroundColor: stage.color || '#f9fafb' }}>
                                                <span>Limit: 0</span>
                                            </div>
                                        </div>
                                    );

                                    const LABEL_WIDTH = 120;
                                    const boardMinWidth = LABEL_WIDTH + 12 + totalCols * STAGE_CELL_WIDTH + Math.max(0, totalCols - 1) * STAGE_GAP;

                                    return (
                                        <div
                                            className="workflow-board-inner"
                                            style={{
                                                minWidth: boardMinWidth,
                                                '--stage-cell-width': `${STAGE_CELL_WIDTH}px`,
                                                '--stage-gap': `${STAGE_GAP}px`,
                                            }}
                                        >
                                            {/* Board-level area headers - rendered once */}
                                            <div className="workflow-board-headers-row">
                                                <div className="workflow-board-header-spacer" />
                                                <div className="workflow-board-headers">
                                                    {boardStructure.map(({ area, cols }) => (
                                                        <div
                                                            key={area}
                                                            className="workflow-board-area-header"
                                                            style={{
                                                                width: cols * STAGE_CELL_WIDTH + Math.max(0, cols - 1) * STAGE_GAP,
                                                                backgroundColor: areaColors[area],
                                                            }}
                                                            title={area}
                                                        >
                                                            {area}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Swimlane rows */}
                                            {workflow.swimlanes.map((swimlane) => {
                                                const maxRows = getMaxRowCount(workflow, swimlane);
                                                return (
                                                    <div key={swimlane.id} className="workflow-swimlane-row">
                                                        <div className="workflow-swimlane-label-cell">
                                                            <span className="workflow-swimlane-name">{swimlane.name}</span>
                                                            <div className="workflow-swimlane-label-actions">
                                                                <button className="workflow-swimlane-action-btn" type="button" title="Members">
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M10.6667 14V12.6667C10.6667 11.9594 10.3857 11.2811 9.88562 10.781C9.38552 10.281 8.70725 10 8 10H4C3.29276 10 2.61448 10.281 2.11438 10.781C1.61428 11.2811 1.33333 11.9594 1.33333 12.6667V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M6.00001 7.33333C7.47276 7.33333 8.66667 6.13943 8.66667 4.66667C8.66667 3.19391 7.47276 2 6.00001 2C4.52725 2 3.33334 3.19391 3.33334 4.66667C3.33334 6.13943 4.52725 7.33333 6.00001 7.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </button>
                                                                <button className="workflow-swimlane-action-btn" type="button" title="Settings">
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </button>
                                                                <button className="workflow-swimlane-action-btn" type="button" title="Time tracking">
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                                                        <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="workflow-board-body">
                                                            {Array.from({ length: maxRows }, (_, rowIdx) => (
                                                                <div key={rowIdx} className="workflow-board-logical-row">
                                                                    {boardStructure.map(({ area, cols }) => {
                                                                        const matrix = getAreaMatrix(swimlane, area);
                                                                        return (
                                                                            <div
                                                                                key={area}
                                                                                className="workflow-area-row"
                                                                                style={{
                                                                                    width: cols * STAGE_CELL_WIDTH + Math.max(0, cols - 1) * STAGE_GAP,
                                                                                }}
                                                                            >
                                                                                {Array.from({ length: cols }, (_, colIdx) => {
                                                                                    const stage = matrix[rowIdx]?.[colIdx] || null;
                                                                                    if (stage) {
                                                                                        const stageColumnKey = getColumnKey(workflow.id, swimlane.id, stage.id);
                                                                                        const isStageHovered = hoveredColumn === stageColumnKey;
                                                                                        const isColorPickerOpen = openColorPickerForStage === stageColumnKey;
                                                                                        return renderStageCell(stage, swimlane, stageColumnKey, isStageHovered, isColorPickerOpen, true);
                                                                                    }
                                                                                    return renderPlaceholderCell(swimlane.id, area, rowIdx, colIdx);
                                                                                })}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
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

