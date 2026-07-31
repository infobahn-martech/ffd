const ChecklistLoadingState = () => (
  <div className="cl-loading" aria-busy="true" aria-label="Loading checklists">
    <div className="cl-loading-spinner">
      <svg className="cl-loading-ring" viewBox="0 0 48 48" fill="none">
        <circle className="cl-loading-ring-track" cx="24" cy="24" r="20" />
        <circle className="cl-loading-ring-arc" cx="24" cy="24" r="20" />
      </svg>
      <svg className="cl-loading-check" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <p className="cl-loading-text">
      Loading checklist
      <span className="cl-loading-dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </p>

    <div className="cl-skel-grid">
      {[0, 1, 2].map((i) => (
        <div key={i} className="cl-skel-card" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  </div>
);

export default ChecklistLoadingState;
