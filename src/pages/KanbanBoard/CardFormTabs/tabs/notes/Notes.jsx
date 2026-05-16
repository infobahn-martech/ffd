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

function Notes({ card }) {
    const [noteText, setNoteText] = useState("");
    const notes = card?.notes ?? [];
    const hasNotes = notes.length > 0;

    const handleSave = () => {
        if (isEmptyHtmlContent(noteText)) return;

        console.log({
            card_id: getCardId(card),
            note: noteText,
        });

        setNoteText("");
    };

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="notes-content-wrapper card-feed-tab">
                <div className="notes-list card-feed-list">
                    {!hasNotes ? (
                        <p className="card-feed-empty">No notes added yet.</p>
                    ) : (
                        notes.map((note, index) => (
                            <div className="note-item" key={index}>
                                <div className="note-img">
                                    <img src={note.avatar} alt="avatar" />
                                </div>
                                <div className="note-cont">
                                    <p className="txt">{note.content}</p>
                                    <p className="updated">{note.updated}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="card-feed-editor">
                    <div className="react-quill-wrapper card-feed-quill">
                        <ReactQuill
                            theme="snow"
                            value={noteText}
                            onChange={setNoteText}
                            modules={QUILL_MODULES}
                            formats={QUILL_FORMATS}
                            placeholder="Write a note..."
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

Notes.propTypes = {
    card: PropTypes.object,
};

export default Notes;
