import { Tooltip } from 'react-tooltip';

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

