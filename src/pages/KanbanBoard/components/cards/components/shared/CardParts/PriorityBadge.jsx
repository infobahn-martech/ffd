import PropTypes from "prop-types";
import { FiFlag } from "react-icons/fi";

/**
 * Header-right priority pill. `card.priority` is currently a boolean on the
 * live data model (see CardItem.propTypes) — true renders an urgent/coral
 * badge, anything falsy renders nothing. Accepts a `label` override so mock
 * data with richer priority levels (e.g. "High") can still render through
 * the same component without changing the underlying field.
 */
function PriorityBadge({ priority, label }) {
  if (!priority) return null;

  return (
    <span className="card-priority-badge" title={label || "Priority"}>
      <FiFlag size={11} />
      <span>{label || "Priority"}</span>
    </span>
  );
}

PriorityBadge.propTypes = {
  priority: PropTypes.bool,
  label: PropTypes.string,
};

export default PriorityBadge;
