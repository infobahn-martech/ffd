import { useState, useEffect } from 'react';
import CustomModal from '../../components/CustomModal';
import BoardsListModal from './BoardsListModal';
import '../../design/scss/Workspaces.scss';

const AddBoardModal = ({ show, onClose, onSave, workspaceId }) => {
  const [boardName, setBoardName] = useState('');
  const [linkedBoards, setLinkedBoards] = useState([]);
  const [showBoardsListModal, setShowBoardsListModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(true);

  useEffect(() => {
    if (show) {
      setShowAddBoardModal(true);
      setShowBoardsListModal(false);
      setBoardName('');
      setLinkedBoards([]);
    }
  }, [show]);

  const handleAddLinkedBoards = () => {
    setShowAddBoardModal(false);
    setShowBoardsListModal(true);
  };

  const handleBoardsListClose = () => {
    setShowBoardsListModal(false);
    setShowAddBoardModal(true);
  };

  const handleBoardsSelect = (selectedBoards) => {
    setLinkedBoards(selectedBoards);
    setShowBoardsListModal(false);
    setShowAddBoardModal(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        workspaceId,
        boardName,
        linkedBoards,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setBoardName('');
    setLinkedBoards([]);
    setShowBoardsListModal(false);
    setShowAddBoardModal(true);
    onClose();
  };

  return (
    <>
      <CustomModal
        show={show && showAddBoardModal}
        closeModal={handleClose}
        className="add-board-modal"
        dialgName="add-board-modal-dialog"
        createModal={false}
        body={
          <div className="add-board-modal-content">
            {/* Header */}
            <div className="add-board-modal-header">
              <h2 className="add-board-modal-title">Board</h2>
              <button
                type="button"
                className="add-board-modal-close"
                onClick={handleClose}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Description Section */}
            <div className="add-board-description">
              <div className="add-board-description-content">
                <p>
                  The Management Board connects to one or more Team workflows and allows you to easily manage work across multiple team boards. The Management Board usually represents a Project or Product that you manage.
                </p>
                <div className="add-board-illustration">
                  <div className="add-board-illustration-hierarchy">
                    <div className="add-board-illustration-top-row">
                      <div className="add-board-illustration-board board-blue"></div>
                      <div className="add-board-illustration-board board-orange"></div>
                      <div className="add-board-illustration-board board-green"></div>
                    </div>
                    <div className="add-board-illustration-link-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 11C13.5705 10.4259 13.0226 9.95085 12.3934 9.60707C11.7643 9.26329 11.0685 9.05886 10.3533 9.00766C9.63816 8.95646 8.92037 9.05972 8.24874 9.31026C7.57711 9.5608 6.96705 9.95301 6.46002 10.46L3.46002 13.46C2.54923 14.403 2.04525 15.6661 2.05664 16.977C2.06803 18.288 2.59387 19.5421 3.52091 20.4691C4.44795 21.3962 5.70202 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="add-board-illustration-bottom-row">
                      <div className="add-board-illustration-board board-blue"></div>
                      <div className="add-board-illustration-board board-orange"></div>
                      <div className="add-board-illustration-board board-green"></div>
                      <div className="add-board-illustration-board board-purple"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="add-board-form-fields">
              <div className="add-board-form-field">
                <label className="add-board-form-label">
                  Board name
                </label>
                <input
                  type="text"
                  className="add-board-form-input"
                  placeholder="Enter board name"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                />
              </div>

              <div className="add-board-form-field">
                <label className="add-board-form-label">
                  Linked boards
                  <span className="add-board-form-info-icon" title="Add team boards to link to this board">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      <path d="M8 5V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </label>
                {linkedBoards.length > 0 ? (
                  <div className="add-board-linked-boards-list">
                    {linkedBoards.map((board) => (
                      <div key={board.id} className="add-board-linked-board-item">
                        <span className="add-board-linked-board-name">{board.name}</span>
                        <button
                          type="button"
                          className="add-board-linked-board-remove"
                          onClick={() => {
                            setLinkedBoards(linkedBoards.filter((b) => b.id !== board.id));
                          }}
                          aria-label="Remove board"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12 4L4 12M4 4L12 12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-board-add-linked-board-small"
                      onClick={handleAddLinkedBoards}
                      title="Add more boards"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="add-board-add-linked-board"
                    onClick={handleAddLinkedBoards}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="add-board-form-actions">
              <button
                type="button"
                className="add-board-form-btn add-board-form-btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="add-board-form-btn add-board-form-btn-save"
                onClick={handleSave}
                disabled={!boardName}
              >
                Save
              </button>
            </div>
          </div>
        }
      />
      <BoardsListModal
        show={showBoardsListModal}
        onClose={handleBoardsListClose}
        onSelect={handleBoardsSelect}
      />
    </>
  );
};

export default AddBoardModal;

