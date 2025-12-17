import { useState } from 'react';
import { FiX, FiChevronUp, FiChevronDown, FiSettings, FiPlus } from 'react-icons/fi';
import '../../../design/scss/board-filter-panel.scss';

const BoardFilterPanel = ({ show, onClose }) => {
  const [quickFiltersExpanded, setQuickFiltersExpanded] = useState(true);
  const [advancedFilteringExpanded, setAdvancedFilteringExpanded] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="board-filter-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="board-filter-panel">
        {/* Header */}
        <div className="board-filter-header">
          <h2 className="board-filter-title">Board filter</h2>
          <button
            type="button"
            className="board-filter-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Filter Input */}
        <div className="board-filter-input-wrapper">
          <input
            type="text"
            className="board-filter-input"
            placeholder="Filter cards & initiatives"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <button
            type="button"
            className="board-filter-input-icon"
            aria-label="Filter settings"
          >
            <FiSettings size={18} />
          </button>
        </div>

        {/* Quick Filters Section */}
        <div className="board-filter-section">
          <button
            type="button"
            className="board-filter-section-header"
            onClick={() => setQuickFiltersExpanded(!quickFiltersExpanded)}
          >
            <div className="board-filter-section-title-wrapper">
              {quickFiltersExpanded ? (
                <FiChevronUp size={18} className="board-filter-chevron" />
              ) : (
                <FiChevronDown size={18} className="board-filter-chevron" />
              )}
              <h3 className="board-filter-section-title">Quick filters</h3>
            </div>
          </button>

          {quickFiltersExpanded && (
            <div className="board-filter-section-content">
              <button
                type="button"
                className="board-filter-new-button"
                onClick={() => {
                  // Handle new quick filter creation
                }}
              >
                <FiPlus size={18} />
                <span>New quick filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Advanced Filtering Section */}
        <div className="board-filter-section">
          <button
            type="button"
            className="board-filter-section-header"
            onClick={() => setAdvancedFilteringExpanded(!advancedFilteringExpanded)}
          >
            <div className="board-filter-section-title-wrapper">
              {advancedFilteringExpanded ? (
                <FiChevronUp size={18} className="board-filter-chevron" />
              ) : (
                <FiChevronDown size={18} className="board-filter-chevron" />
              )}
              <h3 className="board-filter-section-title">Advanced filtering</h3>
            </div>
            <button
              type="button"
              className="board-filter-section-icon"
              aria-label="Advanced filter settings"
            >
              <FiSettings size={18} />
            </button>
          </button>

          {advancedFilteringExpanded && (
            <div className="board-filter-section-content">
              {/* Advanced filtering content can be added here */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BoardFilterPanel;

