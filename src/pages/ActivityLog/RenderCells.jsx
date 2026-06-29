import { Tooltip } from 'react-tooltip';
import moment from 'moment';

import eye from '../../assets/images/eye.svg';
import deleteIcon from '../../assets/images/delete.svg';

export const RenderAction = ({ row, onViewClick, onDeleteClick }) => {
  return (
    <>
      <Tooltip id="view" place="bottom" content="View" />
      <Tooltip id="delete" place="bottom" content="Delete" />
      <div className="actions">
        <span
          data-tooltip-id="view"
          type="button"
          className="view"
          onClick={(e) => {
            e.stopPropagation();
            onViewClick && onViewClick(row);
          }}
        >
          <img src={eye} alt="view" />
        </span>
        <span
          data-tooltip-id="delete"
          type="button"
          className="delete"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick && onDeleteClick(row);
          }}
        >
          <img src={deleteIcon} alt="delete" />
        </span>
      </div>
    </>
  );
};

export const DateFormat = ({ row, selector }) => {
  const formattedDate = moment(row[selector]).format('DD MMMM YYYY hh:mm a');
  return formattedDate;
};

