import { useRef, useEffect } from 'react';
import { rgbToHex, normalizeRgb } from './workflow.utils';

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

const ColorPickerDropdown = ({ isOpen, onClose, selectedColor, onColorSelect, anchorRef }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          anchorRef?.current && !anchorRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorRef]);

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
          const isSelected =
            selectedHex === color.hex || normalizeRgb(selectedColor) === normalizeRgb(color.rgb);
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="edit-workflows-color-checkmark"
                >
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke={
                      color.hex === '#000000'
                        ? '#ffffff'
                        : color.hex === '#FFFFFF'
                          ? '#000000'
                          : '#ffffff'
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {color.hex === '#FFFFFF' && !isSelected && (
                <div className="edit-workflows-color-swatch-outline" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Single stage card with insertion rails, title editing, and color picker.
 */
function WorkflowStageCard({
  stage,
  swimlaneId,
  workflowId,
  stageColumnKey,
  isStageHovered,
  isColorPickerOpen,
  showAddSubcolumn,
  isSingleInCol,
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
  onColorPickerToggle,
  onColorSelect,
  onDeleteStage,
  onStageLimitChange,
  onStageCardsPerRowChange,
}) {
  const showInlineAddButtons = isSingleInCol;
  const isStacked = !isSingleInCol;
  const colorButtonRef = useRef(null);

  return (
    <div
      className={`workflow-stage-wrapper${isColorPickerOpen ? ' workflow-stage-wrapper-color-picker-open' : ''}${isSingleInCol ? ' workflow-stage-single' : ' workflow-stage-stacked'}`}
    >
      <div
        className="workflow-stage-box"
        style={{ position: 'relative' }}
        onMouseEnter={(e) =>
          onStageMouseEnter(
            e,
            stageColumnKey,
            workflowId,
            swimlaneId,
            stage.id,
            stage.name,
            isStacked,
            stage.area,
            stage.col ?? 0,
            stage.colSpan ?? 1
          )
        }
      >
        {isStageHovered && showInlineAddButtons && (
          <div className="workflow-insertion-rail workflow-insertion-rail-left">
            <button
              className="workflow-column-add-btn workflow-column-add-left"
              type="button"
              onClick={() => onAddColumnLeft(workflowId, swimlaneId, stage.id)}
              title={`Add a new column before ${stage.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {isStageHovered && showInlineAddButtons && (
          <div className="workflow-insertion-rail workflow-insertion-rail-right">
            <button
              className="workflow-column-add-btn workflow-column-add-right"
              type="button"
              onClick={() => onAddColumnRight(workflowId, swimlaneId, stage.id)}
              title={`Add a new column after ${stage.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {isStageHovered && showAddSubcolumn && (
          <div className="workflow-insertion-rail workflow-insertion-rail-bottom">
            <button
              className="workflow-column-add-btn workflow-column-add-below"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddSubcolumn(workflowId, swimlaneId, stage.id);
              }}
              title="Add a new subcolumn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="workflow-stage-box-content">
          <div className="stage-box-header">
            {editingStageId === stageColumnKey ? (
              <input
                type="text"
                className="stage-name-input"
                value={editingStageName}
                onChange={(e) => onEditingStageNameChange?.(e.target.value)}
                onBlur={() => onSaveStageName(workflowId, swimlaneId, stage.id)}
                onKeyDown={(e) => onStageNameKeyPress(e, workflowId, swimlaneId, stage.id)}
                autoFocus
              />
            ) : (
              <span
                className="stage-name"
                title={stage.name}
                onClick={() => onStartEditStage(stageColumnKey, stage.name)}
                style={{ cursor: 'pointer' }}
              >
                {stage.name}
              </span>
            )}
          </div>
          <div className="stage-box-details">
            <label className="stage-detail-row">
              <span className="stage-detail-label">Limit:</span>
              <input
                type="number"
                min={0}
                className="stage-inline-input"
                value={stage.limit ?? 0}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d+$/.test(v)) {
                    onStageLimitChange?.(workflowId, swimlaneId, stage.id, v === '' ? '0' : v);
                  }
                }}
                onBlur={(e) => {
                  const num = Math.max(0, parseInt(e.target.value, 10) || 0);
                  onStageLimitChange?.(workflowId, swimlaneId, stage.id, String(num));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </label>
            <label className="stage-detail-row">
              <span className="stage-detail-label">Cards per row:</span>
              <input
                type="number"
                min={1}
                className="stage-inline-input"
                value={stage.cardsPerRow ?? 1}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d+$/.test(v)) {
                    onStageCardsPerRowChange?.(workflowId, swimlaneId, stage.id, v === '' ? '1' : v);
                  }
                }}
                onBlur={(e) => {
                  const num = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onStageCardsPerRowChange?.(workflowId, swimlaneId, stage.id, String(num));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          </div>
          <div className="stage-box-actions">
            <div className="stage-action-color-picker-wrapper" ref={colorButtonRef}>
              <button
                className="stage-action-btn"
                type="button"
                title="Stage color"
                onClick={(e) => {
                  e.stopPropagation();
                  onColorPickerToggle(stageColumnKey);
                }}
                aria-label="Stage color"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12v8H2V4z" fill="currentColor" />
                  <rect x="4" y="6" width="8" height="4" fill="white" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </button>
              <ColorPickerDropdown
                isOpen={isColorPickerOpen}
                onClose={() => onColorPickerToggle(null)}
                selectedColor={stage.color || '#f9fafb'}
                onColorSelect={(rgb) => onColorSelect(workflowId, swimlaneId, stage.id, rgb)}
                anchorRef={colorButtonRef}
              />
            </div>
            <button
              className="stage-action-btn stage-action-btn-delete"
              type="button"
              title="Delete stage"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStage?.(workflowId, swimlaneId, stage.id);
              }}
              aria-label="Delete stage"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M3 4L3 13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowStageCard;
