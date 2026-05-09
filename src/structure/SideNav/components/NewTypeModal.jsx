import { useState, useRef, useEffect } from 'react';
import { FiX, FiPlus, FiSlash } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import DynamicIcon from './DynamicIcon';
import IconPicker from './IconPicker';
import '../../../design/scss/new-blocker-modal.scss';

// Color palette from CardForm.jsx
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

// Helper functions
const rgbToHex = (rgb) => {
    if (!rgb) return '#EF4444';
    if (rgb.startsWith('#')) return rgb.toUpperCase();
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '#EF4444';
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

// Color Picker Component (from CardForm.jsx)
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
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);

    const handleColorClick = (color) => {
        onColorSelect(color.rgb);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="color-picker-dropdown" ref={dropdownRef}>
            <div className="color-picker-grid">
                {COLOR_PALETTE.map((color, index) => {
                    const selectedHex = rgbToHex(selectedColor);
                    const isSelected = selectedHex === color.hex || normalizeRgb(selectedColor) === normalizeRgb(color.rgb);
                    return (
                        <button
                            key={index}
                            type="button"
                            className={`color-swatch ${isSelected ? 'selected' : ''} ${color.hex === '#FFFFFF' ? 'white-swatch' : ''}`}
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
                                    className="color-checkmark"
                                >
                                    <path
                                        d="M13.3333 4L6 11.3333L2.66667 8"
                                        stroke={color.hex === '#000000' ? '#ffffff' : color.hex === '#FFFFFF' ? '#000000' : '#ffffff'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                            {color.hex === '#FFFFFF' && !isSelected && (
                                <div className="color-swatch-outline"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

ColorPickerDropdown.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedColor: PropTypes.string.isRequired,
    onColorSelect: PropTypes.func.isRequired,
};

const NewTypeModal = ({ show, onClose, onSave, initialValues }) => {
    const [selectedColor, setSelectedColor] = useState('rgb(255, 255, 255)');
    const [selectedIconKey, setSelectedIconKey] = useState(null);
    const [label, setLabel] = useState('');
    const [selectedBoards, setSelectedBoards] = useState([]);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const iconPickerRef = useRef(null);

    useEffect(() => {
        if (!show) return;
        if (
            initialValues != null &&
            typeof initialValues === 'object' &&
            Object.keys(initialValues).length > 0
        ) {
            setSelectedColor(initialValues.color ?? 'rgb(255, 255, 255)');
            const raw = initialValues.icon;
            setSelectedIconKey(typeof raw === 'string' && raw.trim() ? raw.trim() : null);
            setLabel(initialValues.label ?? '');
            setSelectedBoards(Array.isArray(initialValues.boards) ? initialValues.boards : []);
        } else {
            setSelectedColor('rgb(255, 255, 255)');
            setSelectedIconKey(null);
            setLabel('');
            setSelectedBoards([]);
        }
    }, [show, initialValues]);

    const handleSave = () => {
        if (onSave) {
            onSave({
                color: selectedColor,
                icon: selectedIconKey ?? '',
                label,
                boards: selectedBoards,
            });
        }
        setSelectedColor('rgb(255, 255, 255)');
        setSelectedIconKey(null);
        setLabel('');
        setSelectedBoards([]);
        onClose();
    };

    const handleColorSelect = (rgbColor) => {
        setSelectedColor(rgbColor);
        setIsColorPickerOpen(false);
    };

    const handleIconSelect = (iconKey) => {
        setSelectedIconKey(iconKey);
        setIsIconPickerOpen(false);
    };

    const handleAddBoard = () => {
        setSelectedBoards([...selectedBoards, 'New Board']);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (iconPickerRef.current && !iconPickerRef.current.contains(event.target)) {
                setIsIconPickerOpen(false);
            }
        };

        if (isIconPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isIconPickerOpen]);

    return (
        <Modal
            show={show}
            onHide={onClose}
            className="new-blocker-modal"
            centered
            size="md"
            dialogClassName="new-blocker-modal-dialog"
        >
            <Modal.Header className="new-blocker-modal-header">
                <Modal.Title className="new-blocker-modal-title">New Card Type</Modal.Title>
                <button
                    type="button"
                    className="new-blocker-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <FiX size={20} />
                </button>
            </Modal.Header>
            <Modal.Body className="new-blocker-modal-body">
                <div className="new-blocker-form">
                    <div className="new-blocker-row-fields">
                        <div className="new-blocker-field">
                            <label className="new-blocker-label">Color</label>
                            <div className="new-blocker-color-wrapper">
                                <button
                                    type="button"
                                    className="new-blocker-color-swatch"
                                    style={{ backgroundColor: selectedColor }}
                                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                                />
                                <ColorPickerDropdown
                                    isOpen={isColorPickerOpen}
                                    onClose={() => setIsColorPickerOpen(false)}
                                    selectedColor={selectedColor}
                                    onColorSelect={handleColorSelect}
                                />
                            </div>
                        </div>

                        <div className="new-blocker-field">
                            <label className="new-blocker-label">Icon</label>
                            <div className="new-blocker-icon-wrapper">
                                <div className="new-blocker-icon-wrapper-inner" ref={iconPickerRef}>
                                    <button
                                        type="button"
                                        className="new-blocker-icon-preview"
                                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                                        aria-expanded={isIconPickerOpen}
                                        aria-haspopup="dialog"
                                    >
                                        {selectedIconKey ? (
                                            <DynamicIcon
                                                iconKey={selectedIconKey}
                                                size={22}
                                                color="#1a1a1a"
                                            />
                                        ) : (
                                            <FiSlash size={22} color="#9ca3af" aria-hidden />
                                        )}
                                    </button>
                                    <IconPicker
                                        isOpen={isIconPickerOpen}
                                        selectedIconKey={selectedIconKey}
                                        onSelect={handleIconSelect}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="new-blocker-field new-blocker-field-full">
                            <label className="new-blocker-label">Label</label>
                            <input
                                type="text"
                                className="new-blocker-input"
                                placeholder="Enter type label"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="new-blocker-field">
                        <p className="new-blocker-boards-text">The type is applied to the following boards</p>
                        <button
                            type="button"
                            className="new-blocker-add-board-btn"
                            onClick={handleAddBoard}
                            aria-label="Add board"
                        >
                            <FiPlus size={20} />
                        </button>
                        {selectedBoards.length > 0 && (
                            <div className="new-blocker-boards-list">
                                {selectedBoards.map((board, index) => (
                                    <span key={index} className="new-blocker-board-tag">
                                        {board}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="new-blocker-modal-footer">
                <button
                    type="button"
                    className="new-blocker-save-btn"
                    onClick={handleSave}
                >
                    Save
                </button>
            </Modal.Footer>
        </Modal>
    );
};

NewTypeModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    initialValues: PropTypes.shape({
        color: PropTypes.string,
        icon: PropTypes.string,
        label: PropTypes.string,
        boards: PropTypes.arrayOf(PropTypes.string),
    }),
};

export default NewTypeModal;
