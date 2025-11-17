
import { Modal } from 'react-bootstrap';

export default function CustomModal({
  className,
  dialgName,
  show,
  closeModal,
  body,
  footer,
  header,
  bodyClassname,
  createModal,
  disableCenter,
}) {
  return (
    <Modal
      className={className || ''}
      dialogClassName={dialgName || ''}
      show={show}
      onHide={closeModal}
      backdrop="static"
      centered={!disableCenter}
    >
      <Modal.Header closeButton>{header || null}</Modal.Header>
      {createModal ? (
        <Modal.Body className={bodyClassname || ''}>{body}</Modal.Body>
      ) : (
        body
      )}
      {footer || null}
    </Modal>
  );
}
