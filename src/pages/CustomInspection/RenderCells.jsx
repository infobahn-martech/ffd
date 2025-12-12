import { Tooltip } from 'react-tooltip';
import moment from 'moment';

import eye from '../../assets/images/eye.svg';

export const RenderAction = ({ row, onViewClick }) => {
  return (
    <>
      <Tooltip id="view" place="bottom" content="View" />
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
      </div>
    </>
  );
};

export const DateFormat = ({ row, selector }) => {
  const formattedDate = moment(row[selector]).format('DD MMMM YYYY hh:mm a');
  return formattedDate;
};

export const EditableStatus = ({ row, onStatusChange }) => {
  const status = row?.status?.toLowerCase();
  const statusOptions = [
    { value: 'commenced', label: 'Commenced' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' },
  ];

  const statusConfig = {
    commenced: { label: 'Commenced', className: 'status-commenced' },
    passed: { label: 'Passed', className: 'status-passed' },
    failed: { label: 'Failed', className: 'status-failed' },
  };

  const config = statusConfig[status] || { label: status, className: 'status-default' };

  const handleChange = (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (onStatusChange && newStatus !== status) {
      onStatusChange(row, newStatus);
    }
  };

  return (
    <select
      className={`status-select status-badge ${config.className}`}
      value={status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const RenderStatus = ({ row }) => {
  const status = row?.status?.toLowerCase();
  const statusConfig = {
    commenced: { label: 'Commenced', className: 'status-commenced' },
    passed: { label: 'Passed', className: 'status-passed' },
    failed: { label: 'Failed', className: 'status-failed' },
  };

  const config = statusConfig[status] || { label: status, className: 'status-default' };

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

