/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import DeleteConfirmIcon from '../assets/images/dlete.svg';
import '../design/scss/modal-designs.scss';
import '../design/scss/prospect-modal.scss';
import CustomModal from './CustomModal';

const DeleteConfirmationModal = ({
  onCancel,
  onConfirm,
  deleteText,
  show,
  isLoading,
}) => {
  return (
    <CustomModal
      className="modal change-pass fade employee-modal 
      logout-modal"
      show={show}
      closeModal={onCancel}
      body={
        <div className="modal-body">
          <div className="profile-img">
            <img src={DeleteConfirmIcon} alt="sign" />
          </div>
          <div className="popup-title">{deleteText}</div>
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
              className="save btn-common green-btn"
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

DeleteConfirmationModal.propTypes = {
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  deleteText: PropTypes.string,
  show: PropTypes.bool,
};

export default DeleteConfirmationModal;
