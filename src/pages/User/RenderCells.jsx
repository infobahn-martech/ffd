import { Tooltip } from 'react-tooltip';
import moment from 'moment';

import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';
import { getInitials } from '../../utils/utils';

export const RenderAction = ({ onEditClick, row, onDeleteClick, onToggleClick }) => {
  const isActive = row?.status === "Active";
  
  return (
    <>
      <Tooltip id="toggle" place="bottom" content={isActive ? "Deactivate" : "Activate"} />
      <Tooltip id="edit" place="bottom" content="Edit" />
      <Tooltip id="archive" place="bottom" content="Archive" />
      <div className="actions">
        <span 
          data-tooltip-id="toggle" 
          type="button" 
          className="toggle-action"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            marginRight: '8px',
            cursor: 'pointer'
          }}
        >
          <label 
            className="user-toggle-switch" 
            style={{ 
              margin: 0,
              position: 'relative',
              display: 'inline-block',
              width: '36px',
              height: '20px',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => onToggleClick(row)}
              style={{
                opacity: 0,
                width: 0,
                height: 0
              }}
            />
            <span 
              className="user-toggle-slider"
              style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isActive ? '#00368c' : '#d1d5db',
                transition: '0.3s',
                borderRadius: '20px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  height: '14px',
                  width: '14px',
                  left: isActive ? 'calc(100% - 17px)' : '3px',
                  top: '3px',
                  backgroundColor: 'white',
                  transition: '0.3s',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </span>
          </label>
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
