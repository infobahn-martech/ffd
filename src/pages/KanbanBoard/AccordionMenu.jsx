import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './AccordionMenu.css';

function AccordionMenu({ position, onClose, onExpand, onCollapse, isExpanded }) {
  if (!position) return null;

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handleExpand = () => {
    if (onExpand) {
      onExpand();
    }
    onClose();
  };

  const handleCollapse = () => {
    if (onCollapse) {
      onCollapse();
    }
    onClose();
  };

  // Calculate position to keep menu within viewport
  const getMenuPosition = () => {
    if (!position) return { x: 0, y: 0 };

    const menuWidth = 180;
    const menuHeight = 100; // Approximate height
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
        className="accordion-menu-overlay"
        onClick={onClose}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div
        className="accordion-menu"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }}
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        {isExpanded ? (
          <div className="accordion-menu-item" onClick={handleCollapse}>
            <span className="accordion-menu-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1"/>
                <path d="M2 2L4 4M12 2L10 4M2 14L4 12M12 14L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="accordion-menu-text">Collapse</span>
          </div>
        ) : (
          <div className="accordion-menu-item" onClick={handleExpand}>
            <span className="accordion-menu-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1"/>
                <path d="M4 2L4 4M12 2L12 4M4 14L4 12M12 14L12 12M2 4L4 4M14 4L12 4M2 12L4 12M14 12L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="accordion-menu-text">Expand</span>
          </div>
        )}
      </div>
    </>
  );
}

AccordionMenu.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onExpand: PropTypes.func,
  onCollapse: PropTypes.func,
  isExpanded: PropTypes.bool,
};

export default AccordionMenu;

