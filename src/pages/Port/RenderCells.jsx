import { Tooltip } from 'react-tooltip';
import moment from 'moment';

// import eye from '../../assets/images/eye.svg';
// import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';
import { getInitials } from '../../shared/utils/utils';

export const RenderAction = ({  row, onDeleteClick }) => {
  return (
    <>
      <Tooltip id="delete" place="bottom" content="Delete" />
      <div className="actions">
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

export const RenderEmptyField = ({ row, selector }) => {
  const value = row[selector];
  return value && value.trim() !== '' ? value : '-';
};
