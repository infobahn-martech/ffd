import { Tooltip } from 'react-tooltip';
import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';

export const RenderAction = ({ onEditClick, row, onDeleteClick }) => {
  return (
    <>
      <Tooltip id="cg-edit" place="bottom" content="Edit" />
      <Tooltip id="cg-delete" place="bottom" content="Delete" />
      <div className="actions">
        <span
          data-tooltip-id="cg-edit"
          type="button"
          onClick={() => onEditClick(row)}
          className="edit"
        >
          <img src={edit} alt="edit" />
        </span>
        <span
          data-tooltip-id="cg-delete"
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
