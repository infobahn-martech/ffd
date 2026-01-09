import CustomModal from '../../components/CustomModal';
import '../../design/scss/common.scss';
import './NotificationsModal.scss';



function NotificationsModal({ show, onClose }) {


  return (
    <CustomModal
      className="modal fade show notifications-modal"
      dialgName="modal-dialog modal-dialog-centered modal-xl"
      show={show}
      closeModal={onClose} />
  );
}

export default NotificationsModal;

