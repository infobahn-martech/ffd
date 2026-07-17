import PropTypes from 'prop-types';
import { FiMail, FiAlertCircle } from 'react-icons/fi';

const OutlookSignInPrompt = ({ isAuthenticating, authError, onSignIn }) => (
  <div className="outlook-sign-in-prompt">
    <div className="outlook-sign-in-icon">
      <FiMail size={32} aria-hidden />
    </div>
    <h3 className="outlook-sign-in-title">Connect your Microsoft account</h3>
    <p className="outlook-sign-in-subtitle">
      Sign in with Microsoft to view and send mail from your Outlook inbox.
    </p>

    {authError && (
      <div className="outlook-sign-in-error" role="alert">
        <FiAlertCircle size={16} aria-hidden />
        <span>{authError}</span>
      </div>
    )}

    <button
      type="button"
      className="outlook-sign-in-btn"
      onClick={onSignIn}
      disabled={isAuthenticating}
    >
      {isAuthenticating ? 'Signing in…' : 'Sign in with Microsoft'}
    </button>
  </div>
);

OutlookSignInPrompt.propTypes = {
  isAuthenticating: PropTypes.bool.isRequired,
  authError: PropTypes.string,
  onSignIn: PropTypes.func.isRequired,
};

OutlookSignInPrompt.defaultProps = {
  authError: null,
};

export default OutlookSignInPrompt;
