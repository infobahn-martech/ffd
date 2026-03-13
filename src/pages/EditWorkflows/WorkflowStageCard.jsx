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
}) {
  const showInlineAddButtons = isSingleInCol;
  const isStacked = !isSingleInCol;

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
            <span className="stage-limit">Limit: {stage.limit ?? 0}</span>
            <span className="stage-cards-per-row">Cards per row: {stage.cardsPerRow ?? 1}</span>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowStageCard;
