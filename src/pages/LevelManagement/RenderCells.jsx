import { FiEdit2 } from 'react-icons/fi';

export const RenderEditAction = ({ onEditClick, row }) => (
  <button
    type="button"
    className="level-mgmt-table__edit-btn"
    onClick={() => onEditClick(row)}
    aria-label="Edit level"
  >
    <FiEdit2 />
  </button>
);
