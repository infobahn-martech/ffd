import { useState, useRef, useEffect } from 'react';
import { FiX, FiPlus, FiChevronDown } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
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

// Icon definitions - based on the image description
const ICON_SYMBOLS = [
    'paperclip', 'cloud', 'square', 'pen', 'question', 'gear', 'thumbs-down', 'no-entry',
    'bug', 'heart', 'triangle', 'clock', 'exclamation', 'sad', 'plus-square', 'envelope',
    'usb', 'refresh', 'chart', 'chat-plus', 'desktop', 'laptop', 'folder', 'folder-plus',
    'chat-bubbles', 'globe', 'info', 'wifi', 'dollar', 'droplet', 'download', 'happy',
    'lightbulb', 'bell', 'refresh-arrows', 'users', 'thumbs-up', 'arrow-up', 'calendar',
    'hourglass', 'hourglass-double', 'users-plus', 'image', 'diamond', 'text'
];

// Icon renderer component
const IconRenderer = ({ symbol, size = 20, color = '#000' }) => {
    const iconMap = {
        'paperclip': <><path d="M8 2v12M8 2l4 4M8 2L4 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'cloud': <><path d="M10 4C8.5 4 7 5 7 6.5C7 7 7.5 7.5 8 8C8.5 8.5 9 9 9 10C9 11 8 12 7 12H4C3 12 2 11 2 10C2 9 2.5 8.5 3 8C3.5 7.5 4 7 4 6.5C4 5 5 4 6 4" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'square': <><rect x="2" y="2" width="12" height="12" rx="1" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'pen': <><path d="M12 4L4 12M4 4l8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'question': <><path d="M8 12h.01M8 8a2 2 0 1 1 4 0c0 2-4 4-4 4" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'gear': <><circle cx="8" cy="8" r="2" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'thumbs-down': <><path d="M4 6v6M4 6l4-2M4 6l4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'no-entry': <><circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" /><path d="M4 4l8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'bug': <><circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" /><path d="M8 5v6M5 8h6" stroke={color} strokeWidth="1.5" /></>,
        'heart': <><path d="M8 12l-2-2C4 8 2 6 2 4c0-2 2-2 3 0 1-2 3-2 3 0 1-2 3-2 3 0 0 2-2 4-4 6l-2 2z" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'triangle': <><path d="M8 2l6 12H2L8 2z" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'clock': <><circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" /><path d="M8 4v4l3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'exclamation': <><path d="M8 4v4M8 10h.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'sad': <><circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="6" cy="7" r="0.5" fill={color} /><circle cx="10" cy="7" r="0.5" fill={color} /><path d="M6 10c1 1 2 1 4 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'plus-square': <><rect x="2" y="2" width="12" height="12" rx="1" stroke={color} strokeWidth="1.5" fill="none" /><path d="M8 5v6M5 8h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'envelope': <><rect x="2" y="4" width="12" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" /><path d="M2 6l6 4 6-4" stroke={color} strokeWidth="1.5" /></>,
        'usb': <><rect x="4" y="2" width="8" height="12" rx="1" fill={color} /><rect x="6" y="4" width="4" height="2" fill="white" /><rect x="6" y="10" width="4" height="2" fill="white" /></>,
        'refresh': <><path d="M3 8c0-3 3-5 5-5M13 8c0 3-3 5-5 5M8 3v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'chart': <><rect x="2" y="8" width="3" height="4" fill={color} /><rect x="6" y="6" width="3" height="6" fill={color} /><rect x="10" y="4" width="3" height="8" fill={color} /></>,
        'chat-plus': <><path d="M8 2c-3 0-5 2-5 5 0 2 2 4 5 4v2l3-2c2 0 4-2 4-4 0-3-2-5-5-5z" stroke={color} strokeWidth="1.5" fill="none" /><path d="M6 7h4M8 5v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'desktop': <><rect x="2" y="4" width="12" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" /><path d="M5 12h6M7 12v2" stroke={color} strokeWidth="1.5" /></>,
        'laptop': <><rect x="3" y="5" width="10" height="7" rx="1" stroke={color} strokeWidth="1.5" fill="none" /><path d="M2 12h12" stroke={color} strokeWidth="1.5" /></>,
        'folder': <><path d="M2 4h6l2 2h6v8H2V4z" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'folder-plus': <><path d="M2 4h6l2 2h6v8H2V4z" stroke={color} strokeWidth="1.5" fill="none" /><path d="M8 7v4M6 9h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'chat-bubbles': <><circle cx="5" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="11" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'globe': <><circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" /><path d="M3 8h10M8 3c2 1 3 3 3 5M8 13c-2-1-3-3-3-5" stroke={color} strokeWidth="1.5" /></>,
        'info': <><circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="8" cy="6" r="0.5" fill={color} /><path d="M8 8v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'wifi': <><path d="M2 6c4-4 8-4 12 0M4 8c3-3 5-3 8 0M6 10c2-2 3-2 4 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'dollar': <><circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" /><path d="M8 4v10M6 6h4M6 10h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'droplet': <><path d="M8 2c2 3 6 5 6 8 0 3-3 4-6 4-3 0-6-1-6-4 0-3 4-5 6-8z" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'download': <><path d="M8 2v8M8 10l3-3M8 10l-3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 12h12" stroke={color} strokeWidth="1.5" /></>,
        'happy': <><circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="6" cy="7" r="0.5" fill={color} /><circle cx="10" cy="7" r="0.5" fill={color} /><path d="M6 10c1-1 2-1 4 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'lightbulb': <><path d="M8 2v2M8 12v2M4 6h2M10 6h2M5 3l1 1M10 3l-1 1M6 10h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'bell': <><path d="M8 2v2c3 0 4 2 4 4v2h2v2H2v-2h2V8c0-2 1-4 4-4V2z" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'refresh-arrows': <><path d="M3 6l3-3 3 3M13 10l-3 3-3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
        'users': <><circle cx="6" cy="6" r="2" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="10" cy="6" r="2" stroke={color} strokeWidth="1.5" fill="none" /><path d="M2 12c1-1 2-1 4 0M12 12c-1-1-2-1-4 0" stroke={color} strokeWidth="1.5" /></>,
        'thumbs-up': <><path d="M4 6v6M4 6l4-2M4 6l4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" transform="rotate(180 8 8)" /></>,
        'arrow-up': <><path d="M8 2v10M8 2l-3 3M8 2l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
        'calendar': <><rect x="2" y="4" width="12" height="10" rx="1" stroke={color} strokeWidth="1.5" fill="none" /><path d="M2 8h12M6 2v4M10 2v4" stroke={color} strokeWidth="1.5" /></>,
        'hourglass': <><path d="M4 2h8M4 14h8M4 2l2 4 2-4M4 14l2-4 2 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="6" x2="8" y2="10" stroke={color} strokeWidth="1.5" /></>,
        'hourglass-double': <><path d="M4 2h8M4 14h8M4 2l2 2 2-2M4 14l2-2 2 2M4 6l2 2 2-2M4 10l2-2 2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'users-plus': <><circle cx="6" cy="6" r="2" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="10" cy="6" r="2" stroke={color} strokeWidth="1.5" fill="none" /><path d="M2 12c1-1 2-1 4 0M12 12c-1-1-2-1-4 0" stroke={color} strokeWidth="1.5" /><path d="M12 4v4M10 6h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'image': <><rect x="2" y="4" width="12" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="5" cy="7" r="1" fill={color} /><path d="M2 12l4-3 3 3 3-3 4 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
        'diamond': <><path d="M8 2l6 6-6 6-6-6 6-6z" stroke={color} strokeWidth="1.5" fill="none" /></>,
        'text': <><path d="M4 4h8M4 8h8M4 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>
    };

    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            {iconMap[symbol] || <circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" />}
        </svg>
    );
};

IconRenderer.propTypes = {
    symbol: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
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

const NewBlockerModal = ({ show, onClose, onSave }) => {
    const [selectedColor, setSelectedColor] = useState('rgb(239, 68, 68)'); // Red default
    const [selectedIcon, setSelectedIcon] = useState('no-entry');
    const [label, setLabel] = useState('');
    const [selectedBoards, setSelectedBoards] = useState([]);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const iconPickerRef = useRef(null);

    const handleSave = () => {
        if (onSave) {
            onSave({
                color: selectedColor,
                icon: selectedIcon,
                label,
                boards: selectedBoards,
            });
        }
        // Reset form
        setSelectedColor('rgb(239, 68, 68)');
        setSelectedIcon('no-entry');
        setLabel('');
        setSelectedBoards([]);
        onClose();
    };

    const handleColorSelect = (rgbColor) => {
        setSelectedColor(rgbColor);
        setIsColorPickerOpen(false);
    };

    const handleIconSelect = (iconSymbol) => {
        setSelectedIcon(iconSymbol);
        setIsIconPickerOpen(false);
    };

    const handleAddBoard = () => {
        // This would typically open a board selector modal
        // For now, just add a placeholder
        setSelectedBoards([...selectedBoards, 'New Board']);
    };

    // Close icon picker when clicking outside
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
                <Modal.Title className="new-blocker-modal-title">New Card Blocker</Modal.Title>
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
                    {/* Color, Icon, and Label in a row */}
                    <div className="new-blocker-row-fields">
                        {/* Color Field */}
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

                        {/* Icon Field */}
                        <div className="new-blocker-field">
                            <label className="new-blocker-label">Icon</label>
                            <div className="new-blocker-icon-wrapper">
                                <div className="new-blocker-icon-wrapper-inner" ref={iconPickerRef}>
                                    <button
                                        type="button"
                                        className="new-blocker-icon-preview"
                                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                                        style={{ backgroundColor: selectedColor }}
                                    >
                                        <IconRenderer symbol={selectedIcon} size={20} color={rgbToHex(selectedColor) === '#000000' || rgbToHex(selectedColor) === '#8B0000' ? '#ffffff' : '#000000'} />
                                    </button>
                                    {isIconPickerOpen && (
                                        <div className="new-blocker-icon-grid">
                                            {ICON_SYMBOLS.map((symbol) => (
                                                <button
                                                    key={symbol}
                                                    type="button"
                                                    className={`new-blocker-icon-item ${selectedIcon === symbol ? 'selected' : ''}`}
                                                    onClick={() => handleIconSelect(symbol)}
                                                    title={symbol}
                                                >
                                                    <IconRenderer symbol={symbol} size={20} color="#000" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Label Field */}
                        <div className="new-blocker-field new-blocker-field-full">
                            <label className="new-blocker-label">Label</label>
                            <input
                                type="text"
                                className="new-blocker-input"
                                placeholder="Enter blocker label"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Boards Section */}
                    <div className="new-blocker-field">
                        <p className="new-blocker-boards-text">The blocker is applied to the following boards</p>
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

NewBlockerModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func,
};

export default NewBlockerModal;

