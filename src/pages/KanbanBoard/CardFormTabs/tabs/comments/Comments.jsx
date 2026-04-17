import PropTypes from "prop-types";
import "../../../../../design/scss/invoice.scss";

function Comments({ card }) {
    return (
        <div className="cardform-body">
            <div className="comments-content-wrapper">
                <div className="comments-list">
                    {card?.comments?.map((comment, index) => (
                        <div className="comment-item" key={index}>
                            <div className="comment-item-header">
                                <div className="comment-item-header-left">
                                    <div className="comment-item-header-left-avatar">
                                        <img src={comment.avatar} alt="avatar" />
                                    </div>
                                </div>
                            </div>
                            <div className="comment-item-body">
                                <div className="comment-item-body-content">
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

Comments.propTypes = {
    card: PropTypes.object,
};

export default Comments;
