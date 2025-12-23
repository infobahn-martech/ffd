import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './ContextMenu.css';

function ContextMenu({ position, onClose, onSelectCell, onSelectColumn, onSelectLane, onCreateCard, onOrderCards, onAICoach }) {
    if (!position) return null;

    const handleClick = (e) => {
        e.stopPropagation();
    };

    const handleMenuItemClick = (action) => {
        if (action) {
            action();
        }
        onClose();
    };

    // Calculate position to keep menu within viewport
    const getMenuPosition = () => {
        if (!position) return { x: 0, y: 0 };

        const menuWidth = 200;
        const menuHeight = 280; // Approximate height
        const padding = 10;

        let x = position.x;
        let y = position.y;

        // Adjust if menu would go off right edge
        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - padding;
        }

        // Adjust if menu would go off bottom edge
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - padding;
        }

        // Ensure menu doesn't go off left or top edges
        x = Math.max(padding, x);
        y = Math.max(padding, y);

        return { x, y };
    };

    const menuPosition = getMenuPosition();

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <>
            <div
                className="context-menu-overlay"
                onClick={onClose}
                onContextMenu={(e) => e.preventDefault()}
            />
            <div
                className="context-menu"
                style={{
                    left: `${menuPosition.x}px`,
                    top: `${menuPosition.y}px`,
                }}
                onClick={handleClick}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="context-menu-item" onClick={() => handleMenuItemClick(onCreateCard)}>
                    <span className="context-menu-icon">+</span>
                    <span className="context-menu-text">Create new card</span>
                </div>

                <div className="context-menu-divider"></div>

                <div className="context-menu-item-group">
                    <div className="context-menu-item" onClick={() => handleMenuItemClick(onSelectCell)}>
                        <span className="context-menu-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="5" height="5" fill="currentColor" opacity="0.3" />
                                <rect x="9" y="2" width="5" height="5" fill="currentColor" opacity="0.1" />
                                <rect x="2" y="9" width="5" height="5" fill="currentColor" opacity="0.1" />
                                <rect x="9" y="9" width="5" height="5" fill="currentColor" opacity="0.1" />
                            </svg>
                        </span>
                        <span className="context-menu-text">Select cell</span>
                    </div>

                    <div className="context-menu-item" onClick={() => handleMenuItemClick(onSelectColumn)}>
                        <span className="context-menu-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="5" height="5" fill="currentColor" opacity="0.3" />
                                <rect x="9" y="2" width="5" height="5" fill="currentColor" opacity="0.3" />
                                <rect x="2" y="9" width="5" height="5" fill="currentColor" opacity="0.1" />
                                <rect x="9" y="9" width="5" height="5" fill="currentColor" opacity="0.1" />
                            </svg>
                        </span>
                        <span className="context-menu-text">Select column</span>
                    </div>

                    <div className="context-menu-item" onClick={() => handleMenuItemClick(onSelectLane)}>
                        <span className="context-menu-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="5" height="5" fill="currentColor" opacity="0.3" />
                                <rect x="9" y="2" width="5" height="5" fill="currentColor" opacity="0.1" />
                                <rect x="2" y="9" width="5" height="5" fill="currentColor" opacity="0.3" />
                                <rect x="9" y="9" width="5" height="5" fill="currentColor" opacity="0.1" />
                            </svg>
                        </span>
                        <span className="context-menu-text">Select lane</span>
                    </div>
                </div>

                <div className="context-menu-divider"></div>

                <div className="context-menu-item" onClick={() => handleMenuItemClick(onOrderCards)}>
                    <span className="context-menu-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="2" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="2" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" />
                            <polygon points="12,6 14,8 12,10" fill="currentColor" />
                        </svg>
                    </span>
                    <span className="context-menu-text">Order cards</span>
                </div>

                <div className="context-menu-item" onClick={() => handleMenuItemClick(onAICoach)}>
                    <span className="context-menu-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2C4.7 2 2 4.7 2 8C2 9.2 2.4 10.3 3.1 11.2L2 14L4.8 12.9C5.7 13.6 6.8 14 8 14C11.3 14 14 11.3 14 8C14 4.7 11.3 2 8 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="8" cy="6" r="0.8" fill="currentColor" />
                            <circle cx="8" cy="9" r="0.8" fill="currentColor" />
                        </svg>
                    </span>
                    <span className="context-menu-text">AI coach</span>
                </div>
            </div>
        </>
    );
}

ContextMenu.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
    }),
    onClose: PropTypes.func.isRequired,
    onSelectCell: PropTypes.func,
    onSelectColumn: PropTypes.func,
    onSelectLane: PropTypes.func,
    onCreateCard: PropTypes.func,
    onOrderCards: PropTypes.func,
    onAICoach: PropTypes.func,
};

export default ContextMenu;

