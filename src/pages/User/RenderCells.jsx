import { Tooltip } from 'react-tooltip';
import moment from 'moment';

import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';
import { getInitials } from '../../utils/utils';
import '../../design/scss/managers-modal.scss';

export const RenderAction = ({ onEditClick, row, onDeleteClick, onToggleClick }) => {
  const isActive = row?.status === "Active";
  
  return (
    <>
      <Tooltip id="edit" place="bottom" content="Edit" />
      <Tooltip id="toggle" place="bottom" content={isActive ? "Deactivate" : "Activate"} />
      <Tooltip id="archive" place="bottom" content="Archive" />
      <div className="actions">
        <span
          data-tooltip-id="edit"
          type="button"
          onClick={() => onEditClick(row)}
          className="edit"
        >
          <img src={edit} alt="edit" />
        </span>
        <span 
          data-tooltip-id="toggle" 
          type="button" 
          className="toggle-action"
          style={{ display: 'inline-flex', alignItems: 'center', marginRight: '8px' }}
        >
          <label className="managers-toggle-switch" style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => onToggleClick(row)}
            />
            <span className="managers-toggle-slider"></span>
          </label>
        </span>
        <span
          data-tooltip-id="archive"
          type="button"
          className="delete"
          onClick={() => onDeleteClick(row)}
        >
          <img src={trash} alt="archive" />
        </span>
      </div>
    </>
  );
};

export const RenderName = ({ row }) => {
  return (
    <>
      <span className="name-letter bg-ltr">
        {getInitials(`${row?.firstName} ${row?.lastName}`)}
      </span>
      {row?.firstName}&nbsp;
      {row?.lastName}
    </>
  );
};

export const DateFormat = ({ row, selector }) => {
  const formattedDate = moment(row[selector]).format('DD MMMM YYYY hh:mm a');
  return formattedDate;
};
