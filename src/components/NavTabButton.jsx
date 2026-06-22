import PropTypes from "prop-types";
import "../design/scss/components/NavTabButton.scss";

/**
 * Shared navigation tab: same visuals as a normal button with `active` when selected.
 * When locked (typically already on that destination), click is ignored and the control is non-interactive.
 * Pass `locked` explicitly when `active` is not the same as "already at target" (e.g. Master Module vs /dashboard).
 */
function NavTabButton({
  active = false,
  locked: lockedProp,
  onClick,
  className = "",
  disabled: disabledProp = false,
  children,
  ...rest
}) {
  const isLocked = lockedProp !== undefined ? lockedProp : active;

  const handleClick = (e) => {
    if (isLocked) return;
    onClick?.(e);
  };

  const mergedDisabled = Boolean(disabledProp) || isLocked;

  return (
    <button
      type="button"
      className={[className, active ? "active" : "", isLocked ? "nav-tab-locked" : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      disabled={mergedDisabled}
      aria-current={active ? "page" : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

NavTabButton.propTypes = {
  active: PropTypes.bool,
  locked: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  children: PropTypes.node,
};

export default NavTabButton;
