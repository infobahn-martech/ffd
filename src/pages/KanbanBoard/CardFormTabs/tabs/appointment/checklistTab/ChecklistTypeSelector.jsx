import PropTypes from "prop-types";
import ChecklistMultiSelect from "./ChecklistMultiSelect";
import ChecklistEmptyState from "./ChecklistEmptyState";
import ChecklistLoadingState from "./ChecklistLoadingState";

const CheckIcon = () => (
  <svg className="cl-type-card__check" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChecklistTypeSelector = ({
  value,
  onChange,
  options,
  loading,
  disabled,
  cardColor,
  prerequisiteReady,
  hasNoResults,
  errorText,
  multiSelectId = "cl-type-ms",
}) => {
  const handleCardClick = (optValue) => {
    if (disabled || loading) return;
    const next = value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue];
    onChange({ target: { value: next } });
  };

  return (
    <div className="cl-type-selector">
      <div className="cl-type-selector__head">
        <h4 className="cl-type-selector__title">Available checklists</h4>
        <span className="cl-type-selector__meta">{options.length} available</span>
      </div>

      {options.length > 0 && (
        <details className="cl-fallback-details">
          <summary>Fallback: list multi-select</summary>
          <ChecklistMultiSelect
            value={value}
            onChange={onChange}
            options={options}
            placeholder="Select checklist types…"
            cardColor={cardColor}
            disabled={disabled || loading}
            id={multiSelectId}
          />
        </details>
      )}

      {errorText ? <div className="cl-type-error">{errorText}</div> : null}

      {loading ? (
        <ChecklistLoadingState />
      ) : !prerequisiteReady ? (
        <ChecklistEmptyState
          variant="prerequisite"
          title="Prerequisites required"
          message="Select Call Type, Port, and Vessel/Barge Type to load available checklists."
        />
      ) : hasNoResults && options.length === 0 ? (
        <ChecklistEmptyState
          variant="noData"
          title="No checklists for this context"
          message="No checklist is available for the selected criteria. Adjust filters in the General tab or try again later."
        />
      ) : (
        <div className="cl-type-card-grid" role="group" aria-label="Checklist types">
          {options.map((opt) => {
            const selected = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className={`cl-type-card ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
                onClick={() => handleCardClick(opt.value)}
                disabled={disabled}
                style={{ "--card-color": cardColor }}
                aria-pressed={selected}
              >
                {selected && (
                  <span className="cl-type-card__icon">
                    <CheckIcon />
                  </span>
                )}
                <span className="cl-type-card__label">{opt.label}</span>
                <span className="cl-type-card__sub">Checklist type</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

ChecklistTypeSelector.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  cardColor: PropTypes.string,
  prerequisiteReady: PropTypes.bool,
  hasNoResults: PropTypes.bool,
  errorText: PropTypes.string,
  multiSelectId: PropTypes.string,
};

export default ChecklistTypeSelector;
