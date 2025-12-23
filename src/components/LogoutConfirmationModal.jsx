import PropTypes from 'prop-types';
import { FiLogOut } from 'react-icons/fi';
import '../design/scss/modal-designs.scss';
import '../design/scss/prospect-modal.scss';
import CustomModal from './CustomModal';

const LogoutConfirmationModal = ({
  onCancel,
  onConfirm,
  logoutText,
  show,
  isLoading,
}) => {
  return (
    <CustomModal
      createModal
      className="modal change-pass fade employee-modal logout-modal"
      show={show}
      closeModal={onCancel}
      body={
        <div className="modal-body">
          <div className="profile-img">
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fc',
                borderRadius: '50%',
              }}
            >
              <FiLogOut
                size={60}
                style={{
                  color: '#00368c',
                }}
              />
            </div>
          </div>
          <div className="popup-title">{logoutText}</div>
          <div className="two-btn logout-btn">
            <button
              type="submit"
              className="btn-common close"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save btn-common red-btn"
              onClick={onConfirm}
            >
              {isLoading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      }
    />
  );
};

LogoutConfirmationModal.propTypes = {
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  logoutText: PropTypes.string,
  show: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default LogoutConfirmationModal;

