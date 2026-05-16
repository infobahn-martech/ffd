import { useState } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../../../design/scss/invoice.scss";

const QUILL_MODULES = {
    toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const QUILL_FORMATS = ["bold", "italic", "underline", "list", "bullet", "link"];

const isEmptyHtmlContent = (html) => {
    if (!html) return true;
    const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return text.length === 0;
};

const getCardId = (card) => card?.id || card?.card_id || card?.call_id;

function Comments({ card }) {
    const [commentText, setCommentText] = useState("");
    const comments = card?.comments ?? [];
    const hasComments = comments.length > 0;

    const handleSave = () => {
        if (isEmptyHtmlContent(commentText)) return;

        console.log({
            card_id: getCardId(card),
            comment: commentText,
        });

        setCommentText("");
    };

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="comments-content-wrapper card-feed-tab">
                <div className="comments-list card-feed-list">
                    {!hasComments ? (
                        <p className="card-feed-empty">No comments added yet.</p>
                    ) : (
                        comments.map((comment, index) => (
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
                        ))
                    )}
                </div>

                <div className="card-feed-editor">
                    <div className="react-quill-wrapper card-feed-quill">
                        <ReactQuill
                            theme="snow"
                            value={commentText}
                            onChange={setCommentText}
                            modules={QUILL_MODULES}
                            formats={QUILL_FORMATS}
                            placeholder="Write a comment..."
                        />
                    </div>
                    <div className="card-feed-save-row">
                        <button type="button" className="card-feed-save-btn" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

Comments.propTypes = {
    card: PropTypes.object,
};

export default Comments;
