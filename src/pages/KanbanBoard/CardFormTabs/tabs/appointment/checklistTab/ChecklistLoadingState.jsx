const ChecklistLoadingState = () => (
  <div className="cl-skel-grid" aria-busy="true" aria-label="Loading checklists">
    {[0, 1, 2].map((i) => (
      <div key={i} className="cl-skel-card" />
    ))}
  </div>
);

export default ChecklistLoadingState;
