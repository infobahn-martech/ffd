import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import '../../../design/scss/outlook-modal.scss';

const OutlookModal = ({ show, onClose }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      className="outlook-modal"
      centered
      size="xl"
    >
      <Modal.Header className="outlook-modal-header">
        <Modal.Title className="outlook-modal-title">Outlook</Modal.Title>
        <button
          type="button"
          className="outlook-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>

      <Modal.Body className="outlook-modal-body">
        {show && (
          <iframe
            src="https://outlook.office.com/mail/"
            title="Outlook"
            className="outlook-modal-iframe"
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

OutlookModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OutlookModal;
