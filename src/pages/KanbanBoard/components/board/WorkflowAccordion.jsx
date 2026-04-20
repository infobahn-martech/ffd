export default function WorkflowAccordion({
  workflow,
  isDarkMode,
  isExpanded,
  onToggle,
  onMenuClick,
  children,
}) {
  return (
    <div
      key={workflow.id}
      className={`kanban-accordion ${isDarkMode ? "kanban-dark-mode" : ""}`}
    >
      <div className="kanban-accordion-header" onClick={onToggle}>
        <div
          className="kanban-accordion-title-row"
          style={{ flex: 1, justifyContent: "center" }}
        >
          <h2 className="kanban-accordion-title" style={{ fontWeight: 700 }}>
            {workflow.title}
          </h2>
        </div>
        <div className="kanban-accordion-actions">
          <button
            type="button"
            className="accordion-menu-button"
            onClick={(event) => {
              event.stopPropagation();
              onMenuClick(event);
            }}
            aria-label="Menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="9" cy="4.5" r="1.5" fill="currentColor" />
              <circle cx="9" cy="9" r="1.5" fill="currentColor" />
              <circle cx="9" cy="13.5" r="1.5" fill="currentColor" />
            </svg>
          </button>
          <span className={`kanban-accordion-icon ${isExpanded ? "expanded" : ""}`}>
            ▼
          </span>
        </div>
      </div>
      {isExpanded && children}
    </div>
  );
}
