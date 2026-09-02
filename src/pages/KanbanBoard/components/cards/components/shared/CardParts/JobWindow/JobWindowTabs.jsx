import PropTypes from "prop-types";

/** Tab bar dispatching between the Job window's sections — see .cardform-tabs/.tab in CardForm.css. */
function JobWindowTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="cardform-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          className={`tab${activeTab === tab.key ? " active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

JobWindowTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default JobWindowTabs;
