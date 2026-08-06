import { Tooltip } from 'react-tooltip';

import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';

export const RenderAction = ({ onEditClick, row, onDeleteClick }) => {
  return (
    <>
      <Tooltip id="edit-checklist" place="top" content="Edit" />
      <Tooltip id="delete-checklist" place="top" content="Delete" />
      <div className="actions">
        <span
          data-tooltip-id="edit-checklist"
          type="button"
          onClick={() => onEditClick(row)}
          className="edit"
        >
          <img src={edit} alt="edit" />
        </span>
        <span
          data-tooltip-id="delete-checklist"
          type="button"
          className="delete"
          onClick={() => onDeleteClick(row)}
        >
          <img src={trash} alt="delete" />
        </span>
      </div>
    </>
  );
};

