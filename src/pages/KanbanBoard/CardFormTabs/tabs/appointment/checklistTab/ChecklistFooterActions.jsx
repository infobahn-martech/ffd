import PropTypes from "prop-types";

const ChecklistFooterActions = ({
  onSaveConfirm,
  cardColor,
  disabled,
  loading = false,
  children,
  className = "",
}) => (
  <footer className={`cl-footer ${className}`.trim()}>
    {children}
    <div className="cl-footer__right">
      <button
        type="button"
        className="checklist-btn-primary cl-footer__primary"
        onClick={onSaveConfirm}
        style={{ "--card-color": cardColor }}
        disabled={disabled || loading}
        aria-busy={loading}
      >
        {loading ? "Saving..." : "Save and Confirm"}
      </button>
    </div>
  </footer>
);

ChecklistFooterActions.propTypes = {
  onSaveConfirm: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default ChecklistFooterActions;
