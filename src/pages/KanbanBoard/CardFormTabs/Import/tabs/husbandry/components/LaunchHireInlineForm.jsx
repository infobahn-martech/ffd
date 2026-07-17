import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FiNavigation, FiCalendar, FiSend } from "react-icons/fi";

// `min` for the datetime-local input — local time, no timezone math — so
// neither the native picker nor a user typing manually can pick the past.
const getMinDateTimeLocal = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

// Compact inline scheduling panel for the Crew Summary "Request Launch
// Hire" action. Always mounted (even collapsed) so open/close can transition
// smoothly via max-height/opacity instead of mount/unmount.
const LaunchHireInlineForm = ({
  open,
  cardColor,
  value,
  error,
  isSubmitting,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isSubmitting, onCancel]);

  return (
    <div
      className={`crew-launch-hire-panel${open ? " crew-launch-hire-panel--open" : ""}`}
      style={{ "--card-color": cardColor }}
      aria-hidden={!open}
    >
      <div className="crew-launch-hire-panel__inner">
        <div className="crew-launch-hire-panel__info">
          <span className="crew-launch-hire-panel__icon" aria-hidden="true">
            <FiNavigation size={16} />
          </span>
          <span className="crew-launch-hire-panel__text">
            <span className="crew-launch-hire-panel__title">Schedule Launch Hire</span>
            <span className="crew-launch-hire-panel__hint">Choose the required launch date and time.</span>
          </span>
        </div>

        <div className="crew-launch-hire-panel__field">
          <label htmlFor="launchHireDateTime" className="crew-launch-hire-panel__label">
            Launch Date &amp; Time *
          </label>
          <div className={`crew-launch-hire-panel__input-wrap${error ? " is-invalid" : ""}`}>
            <FiCalendar size={14} className="crew-launch-hire-panel__input-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              id="launchHireDateTime"
              type="datetime-local"
              className="crew-launch-hire-panel__input"
              value={value}
              min={getMinDateTimeLocal()}
              disabled={isSubmitting}
              tabIndex={open ? 0 : -1}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          {error && <span className="crew-launch-hire-panel__error">{error}</span>}
        </div>

        <div className="crew-launch-hire-panel__actions">
          <button
            type="button"
            className="crew-launch-hire-panel__btn crew-launch-hire-panel__btn--cancel"
            disabled={isSubmitting}
            tabIndex={open ? 0 : -1}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="crew-launch-hire-panel__btn crew-launch-hire-panel__btn--submit"
            disabled={isSubmitting}
            tabIndex={open ? 0 : -1}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="crew-launch-hire-panel__spinner" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              <>
                Submit Request
                <FiSend size={14} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

LaunchHireInlineForm.propTypes = {
  open: PropTypes.bool.isRequired,
  cardColor: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string,
  isSubmitting: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default LaunchHireInlineForm;
