import { Tooltip } from 'react-tooltip';
import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';

export const RenderAction = ({ onEditClick, row, onDeleteClick }) => {
  return (
    <>
      <Tooltip id="vrt-edit" place="bottom" content="Edit" />
      <Tooltip id="vrt-delete" place="bottom" content="Delete" />
      <div className="actions">
        <span
          data-tooltip-id="vrt-edit"
          type="button"
          onClick={() => onEditClick(row)}
          className="edit"
        >
          <img src={edit} alt="edit" />
        </span>
        <span
          data-tooltip-id="vrt-delete"
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
