import PropTypes from "prop-types";

/** Compact circular progress ring used in the card footer. Renders nothing when progress is absent — callers should gate with isValidProgress(). */
function ProgressIndicator({ progress }) {
  const pct = Math.min(100, Math.max(0, Number(progress)));
  return (
    <div className="card-progress-indicator" title={`${Math.round(pct)}% complete`}>
      <svg className="card-progress-indicator-svg" viewBox="0 0 26 26" aria-hidden>
        <circle className="card-progress-indicator-bg" cx="13" cy="13" r="11.5" />
        <circle
          className="card-progress-indicator-value"
          cx="13"
          cy="13"
          r="11.5"
          style={{ strokeDashoffset: `calc(72 - (72 * ${pct}) / 100)` }}
        />
      </svg>
      <span className="card-progress-indicator-text">{Math.round(pct)}%</span>
    </div>
  );
}

ProgressIndicator.propTypes = {
  progress: PropTypes.number.isRequired,
};

export default ProgressIndicator;
