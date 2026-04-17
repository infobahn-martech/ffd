import PropTypes from "prop-types";
import "../../../../../design/scss/invoice.scss";

function SubTasks({ card }) {
    return (
        <div className="cardform-body">
            <div className="sub-tasks-content-wrapper">
                <div className="sub-tasks-list">
                    {card?.subTasks?.map((subTask, index) => (
                        <div className="sub-task-item" key={index}>
                            <div className="sub-task-item-header">
                                <div className="sub-task-item-header-left">
                                    <div className="sub-task-item-header-left-avatar">
                                        <img src={subTask.avatar} alt="avatar" />
                                    </div>
                                </div>
                            </div>
                            <div className="comment-item-body">
                                <div className="comment-item-body-content">
                                    <p>{subTask.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

SubTasks.propTypes = {
    card: PropTypes.object,
};

export default SubTasks;
