import { Tooltip } from 'react-tooltip';
import moment from 'moment';

import eye from '../../assets/images/eye.svg';
import edit from '../../assets/images/edit.svg';
import trash from '../../assets/images/delete.svg';
import { getInitials } from '../../shared/utils/utils';

export const RenderAction = ({ onEditClick, row, onDeleteClick, onStatusClick }) => {
    return (
        <>
            <Tooltip id="active" place="bottom" content="Active" />
            <Tooltip id="edit" place="bottom" content="Edit" />
            <Tooltip id="delete" place="bottom" content="Delete" />
            <div className="actions">
                <span
                    data-tooltip-id="edit"
                    type="button"
                    onClick={() => onEditClick(row)}
                    className="edit"
                >
                    <img src={edit} alt="edit" />
                </span>
                <span data-tooltip-id="active" type="button" className="view" onClick={() => onStatusClick(row)}>
                    <img src={eye} alt="eye" />
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

export const RenderName = ({ row }) => {
    const name = row?.captain_name ?? row?.captainName;
    return (
        <>
            <span className="name-letter bg-ltr">
                {getInitials(`${name}`)}
            </span>
            {name}
        </>
    );
};

export const DateFormat = ({ row, selector }) => {
    const formattedDate = moment(row[selector]).format('DD MMMM YYYY hh:mm a');
    return formattedDate;
};
