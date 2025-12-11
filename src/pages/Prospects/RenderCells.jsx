import Proptypes from 'prop-types';
import { Tooltip } from 'react-tooltip';
import moment from 'moment';

import eye from '../../assets/images/eye.svg';
import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';
import { getInitials } from '../../utils/utils';

export const RenderName = ({ row }) => {
  return (
    <>
      <span className="name-letter bg-ltr">{getInitials(row.name)}</span>
      {row.name}
    </>
  );
};

export const RenderAction = ({ onEditClick, row, onDeleteClick }) => {
  return (
    <>
      <Tooltip id="view" place="bottom" content="View" />
      <Tooltip id="edit" place="bottom" content="Edit" />
      <Tooltip id="delete" place="bottom" content="Delete" />
      <div className="actions">
        <span
          data-tooltip-id="view"
          type="button"
          className="view"
          onClick={() => onViewClick(row)}
        >
          <img src={eye} alt="eye" />
        </span>
        <span
          data-tooltip-id="edit"
          type="button"
          onClick={() => onEditClick(row)}
          className="edit"
        >
          <img src={edit} alt="edit" />
        </span>
        <span
          data-tooltip-id="delete"
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

export const changeStatus = ({ row, handleClick, Options }) => {
  return (
    <div className="cta">
      <div className="dropdown">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Active
        </button>
        <ul className="dropdown-menu">
          {Options?.filter(({ value }) => value !== 'active')?.map(
            ({ value, label }) => (
              <li key={label}>
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={() => handleClick(value)}
                >
                  <span className="img">
                    <img src={edit} alt="statue-btn" />
                  </span>{' '}
                  <span className="txt">{label}</span>
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
};
export const DateFormat = ({ row, selector }) => {
  const formattedDate = moment(row[selector]).format('DD MMMM YYYY hh:mm a');
  return formattedDate;
};

RenderAction.propTypes = {
  onEditClick: Proptypes.func,
  onDeleteClick: Proptypes.func,
  row: Proptypes.node,
};

RenderName.propTypes = {
  row: Proptypes.node,
};

changeStatus.propTypes = {
  row: Proptypes.node,
  handleClick: Proptypes.node,
  Options: Proptypes.node,
};
