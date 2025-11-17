/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

import CustomModal from './CustomModal';
import clearIcon from '../../assets/img/Delete_red.svg';
import { Spinner } from 'react-bootstrap';

function CustomDeleteModal({
  showModal,
  closeModal,
  deleteTitle,
  discription,
  handleDelete,
  isLoading,
  timer,
}) {
  const [timeToSubmit, setTimeToSubmit] = useState(timer || null);
  const [timeState, setTimeState] = useState(null);
  useEffect(() => {
    if (timer) {
      const setTime = setInterval(() => {
        setTimeToSubmit((prev) => {
          if (prev === 0) {
            clearInterval(timeState);
            return 0;
          }
          return prev ? prev - 1 : timer;
        });
      }, 1000);
      setTimeState(setTime);
    }
    return () => {
      if (timeState) clearInterval(timeState);
    };
  }, []);
  const renderBody = () => (
    <div className="modal-body">
      <div className="modal-data-content">
        <div className="delete-modal-area">
          <img src={clearIcon} alt="clearIcon" />
          <h3>{deleteTitle}</h3>
          <p>{discription}.</p>
          <div className="btn-area">
            <button
              onClick={() => {
                closeModal(null);
              }}
              type="button"
              className="btn btn-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-save"
              onClick={handleDelete}
              disabled={isLoading || timeToSubmit}
            >
              {timeToSubmit ? `(${timeToSubmit}) ` : ''}{' '}
              {isLoading && (
                <Spinner
                  size="sm"
                  as="span"
                  animation="border"
                  variant="light"
                  aria-hidden="true"
                  className="custom-spinner"
                />
              )}
              &nbsp; Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <CustomModal
      className="modal delete-modal fade show modal_backdrop"
      dialgName="modal-dialog  modal-dialog-centered"
      createModal
      show={!!showModal}
      closeModal={() => {
        closeModal(false);
      }}
      body={renderBody()}
    />
  );
}

export default CustomDeleteModal;
