import PropTypes from "prop-types";
import "../../../../../design/scss/invoice.scss";

function Notes({ card }) {
    return (
        <div className="cardform-body">
            <div className="notes-content-wrapper">
                <div className="notes-list">
                    {card?.notes?.map((note, index) => (
                        <div className="note-item" key={index}>
                            <div className="note-img">
                                <img src={note.avatar} alt="avatar" />
                            </div>
                            <div className="note-cont">
                                <p className="txt">{note.content}</p>
                                <p className="updated">{note.updated}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

Notes.propTypes = {
    card: PropTypes.object,
};

export default Notes;
