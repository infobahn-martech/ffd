import { Tooltip } from 'react-tooltip';

import edit from '../../assets/images/edit.svg';

export const RenderEditAction = ({ row, onEditClick }) => {
    return (
        <>
            <Tooltip id="kpi-task-edit" place="top" content="Edit" />
            <div className="actions">
                <span
                    data-tooltip-id="kpi-task-edit"
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditClick?.(row);
                    }}
                    className="edit"
                >
                    <img src={edit} alt="edit" />
                </span>
            </div>
        </>
    );
};
