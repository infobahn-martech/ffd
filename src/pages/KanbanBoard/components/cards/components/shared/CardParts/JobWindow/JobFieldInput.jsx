import { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * A single labeled Job-window field (see .cf-field/.cf-input in CardForm.css).
 * Auto-saves on blur, matching the rest of CardForm's per-field auto-save UX —
 * local edits are tracked until blur so typing doesn't fire a save per keystroke.
 */
function JobFieldInput({ label, value, onCommit, type = "text", disabled = false, readOnly = false }) {
  const [local, setLocal] = useState(value ?? "");

  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  const handleBlur = () => {
    if (readOnly || disabled) return;
    if (local !== (value ?? "")) {
      onCommit?.(local);
    }
  };

  return (
    <div className="cf-field">
      <label>{label}</label>
      <div className="cf-input">
        <input
          type={type}
          value={local}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}

JobFieldInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCommit: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default JobFieldInput;
