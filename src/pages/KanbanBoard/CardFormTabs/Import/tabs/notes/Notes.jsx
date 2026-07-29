import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import DOMPurify from "dompurify";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "react-quill/dist/quill.snow.css";
import "../../../../../../design/scss/invoice.scss";
import "../../../../../../design/scss/comments.scss";
import callFileService from "../../../../../../services/callFileService";
import kanbanBoardService from "../../../../../../services/kanbanBoardService";
import { unwrapListResponse } from "../../../../../../shared/helpers/callFileFormOptions";
import { notify } from "../../../../../../components/Toaster";
import DeleteConfirmationModal from "../../../../../../components/DeleteConfirmationModal";

const QUILL_MODULES = {
    toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const QUILL_FORMATS = ["bold", "italic", "underline", "list", "bullet", "link"];

const MENTION_TRIGGER_REGEX = /@([^\s@]*)$/;

const isEmptyHtmlContent = (html) => {
    if (!html) return true;
    const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return text.length === 0;
};

const getCardId = (card) => card?.id || card?.card_id || card?.call_id;

const mapNoteFromResponse = (row) => ({
    id: row.note_id,
    userName: row.created_by_name ?? "",
    content: row.note_text,
    created_date: row.created_date ?? null,
    updated_date: row.updated_date ?? null,
});

const mapManagersFromResponse = (rows) =>
    (rows || []).map((row) => ({
        user_id: row.user_id,
        user_name: row.user_name ?? "",
        avatar: row.avatar ?? null,
    }));

const getMentionContext = (editor) => {
    const selection = editor.getSelection();
    if (!selection) return null;

    const textBefore = editor.getText(0, selection.index);
    const match = textBefore.match(MENTION_TRIGGER_REGEX);
    if (!match) return null;

    return {
        search: match[1] || "",
        startIndex: selection.index - match[0].length,
        matchLength: match[0].length,
    };
};

function Notes({ card }) {
    const quillRef = useRef(null);
    const [noteText, setNoteText] = useState("");
    const [managers, setManagers] = useState([]);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [selectedMentionUserIds, setSelectedMentionUserIds] = useState([]);
    const [isManagersLoading, setIsManagersLoading] = useState(false);
    const [notes, setNotes] = useState([]);
    const [isNotesLoading, setIsNotesLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const cardId = getCardId(card);
    const hasNotes = notes.length > 0;

    const loadNotes = useCallback(async () => {
        if (!cardId) return;

        setIsNotesLoading(true);
        try {
            const { data } = await kanbanBoardService.getCardNotes(cardId);
            const rows = unwrapListResponse(data);
            setNotes(rows.map(mapNoteFromResponse));
        } catch {
            setNotes([]);
        } finally {
            setIsNotesLoading(false);
        }
    }, [cardId]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    useEffect(() => {
        let cancelled = false;

        const loadManagers = async () => {
            setIsManagersLoading(true);
            try {
                const { data } = await callFileService.getAllManagers();
                const list = unwrapListResponse(data);
                if (!cancelled) {
                    setManagers(mapManagersFromResponse(list));
                }
            } catch (error) {
                if (!cancelled) {
                    setManagers([]);
                }
            } finally {
                if (!cancelled) {
                    setIsManagersLoading(false);
                }
            }
        };

        loadManagers();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredManagers = useMemo(() => {
        const term = mentionSearch.trim().toLowerCase();
        if (!term) return managers;

        return managers.filter((manager) =>
            (manager.user_name || "").toLowerCase().includes(term)
        );
    }, [managers, mentionSearch]);

    const closeMentionDropdown = useCallback(() => {
        setMentionOpen(false);
        setMentionSearch("");
    }, []);

    const syncMentionState = useCallback(
        (editor) => {
            const context = getMentionContext(editor);
            if (context) {
                setMentionOpen(true);
                setMentionSearch(context.search);
                return;
            }
            closeMentionDropdown();
        },
        [closeMentionDropdown]
    );

    const handleNoteChange = useCallback(
        (html, _delta, _source, editor) => {
            setNoteText(html);
            syncMentionState(editor);
        },
        [syncMentionState]
    );

    const handleEditorBlur = useCallback(() => {
        closeMentionDropdown();
    }, [closeMentionDropdown]);

    const addMentionedUserId = useCallback((userId) => {
        setSelectedMentionUserIds((prev) => {
            if (prev.some((id) => String(id) === String(userId))) {
                return prev;
            }
            return [...prev, userId];
        });
    }, []);

    const handleSelectManager = useCallback(
        (manager) => {
            const editor = quillRef.current?.getEditor?.();
            if (!editor) return;

            const context = getMentionContext(editor);
            if (!context) return;

            const mentionText = `@${manager.user_name}`;
            editor.deleteText(context.startIndex, context.matchLength, "user");
            editor.insertText(context.startIndex, mentionText, "user");
            editor.setSelection(context.startIndex + mentionText.length, 0, "user");

            setNoteText(editor.root.innerHTML);
            addMentionedUserId(manager.user_id);
            closeMentionDropdown();
        },
        [addMentionedUserId, closeMentionDropdown]
    );

    const handleEditOpen = useCallback(
        (note) => {
            setEditingNoteId(note.id);
            setNoteText(note.content);
            closeMentionDropdown();
        },
        [closeMentionDropdown]
    );

    const handleEditCancel = useCallback(() => {
        setEditingNoteId(null);
        setNoteText("");
        setSelectedMentionUserIds([]);
        closeMentionDropdown();
    }, [closeMentionDropdown]);

    const handleSave = useCallback(async () => {
        if (isEmptyHtmlContent(noteText) || !cardId || isSaving) return;

        const isEditing = Boolean(editingNoteId);

        setIsSaving(true);
        try {
            const { data } = isEditing
                ? await kanbanBoardService.updateCardNote({
                      note_id: editingNoteId,
                      note_text: noteText,
                  })
                : await kanbanBoardService.addCardNote({
                      card_id: cardId,
                      note_text: noteText,
                  });
            await loadNotes();
            notify(
                data?.message || (isEditing ? "Note updated successfully." : "Note added successfully."),
                "success"
            );
            setEditingNoteId(null);
            setNoteText("");
            setSelectedMentionUserIds([]);
            closeMentionDropdown();
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                (editingNoteId ? "Failed to update note." : "Failed to add note.");
            notify(typeof msg === "string" ? msg : "Failed to save note.", "error");
        } finally {
            setIsSaving(false);
        }
    }, [noteText, cardId, isSaving, editingNoteId, closeMentionDropdown, loadNotes]);

    const handleDeleteOpen = useCallback((note) => {
        setSelectedNote(note);
        setShowDeleteModal(true);
    }, []);

    const handleDeleteCancel = useCallback(() => {
        if (isDeleting) return;
        setShowDeleteModal(false);
        setSelectedNote(null);
    }, [isDeleting]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedNote) return;

        setIsDeleting(true);
        try {
            const { data } = await kanbanBoardService.deleteCardNote(selectedNote.id);
            await loadNotes();
            notify(data?.message || "Note deleted successfully.", "success");
            if (editingNoteId === selectedNote.id) {
                handleEditCancel();
            }
            setShowDeleteModal(false);
            setSelectedNote(null);
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to delete note.";
            notify(typeof msg === "string" ? msg : "Failed to delete note.", "error");
        } finally {
            setIsDeleting(false);
        }
    }, [selectedNote, editingNoteId, handleEditCancel, loadNotes]);

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="comments-tab">
                <div className="comments-tab-layout">
                    <section className="comments-tab-editor" aria-label="Write a note">
                        <div className="comments-tab-card comments-tab-card--editor">
                            <div className="comments-tab-editor-body">
                                {editingNoteId ? (
                                    <div className="comments-tab-editing-banner">
                                        <button
                                            type="button"
                                            className="subtasks-tab-cancel-btn"
                                            onClick={handleEditCancel}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : null}
                                <div className="comments-tab-mention-host">
                                    <div className="react-quill-wrapper comments-tab-quill">
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={noteText}
                                            onChange={handleNoteChange}
                                            onBlur={handleEditorBlur}
                                            modules={QUILL_MODULES}
                                            formats={QUILL_FORMATS}
                                            placeholder="Write a note..."
                                        />
                                    </div>

                                    {mentionOpen && (
                                        <div
                                            className="comments-tab-mention-dropdown"
                                            role="listbox"
                                            aria-label="Mention a user"
                                        >
                                            {isManagersLoading ? (
                                                <p className="comments-tab-mention-status">
                                                    Loading users...
                                                </p>
                                            ) : filteredManagers.length === 0 ? (
                                                <p className="comments-tab-mention-status">
                                                    No users found
                                                </p>
                                            ) : (
                                                filteredManagers.map((manager) => (
                                                    <button
                                                        key={manager.user_id}
                                                        type="button"
                                                        className="comments-tab-mention-option"
                                                        role="option"
                                                        onMouseDown={(event) =>
                                                            event.preventDefault()
                                                        }
                                                        onClick={() =>
                                                            handleSelectManager(manager)
                                                        }
                                                    >
                                                        <span className="comments-tab-mention-avatar">
                                                            {manager.avatar ? (
                                                                <img
                                                                    src={manager.avatar}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <span className="comments-tab-mention-avatar-fallback">
                                                                    {(manager.user_name || "?")
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="comments-tab-mention-name">
                                                            {manager.user_name}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="comments-tab-save-row">
                                    <button
                                        type="button"
                                        className="comments-tab-save-btn"
                                        onClick={handleSave}
                                        disabled={isSaving || isEmptyHtmlContent(noteText)}
                                    >
                                        {editingNoteId
                                            ? (isSaving ? "Updating..." : "Update")
                                            : (isSaving ? "Saving..." : "Save")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="comments-tab-list" aria-label="Notes">
                        <div className="comments-tab-card comments-tab-card--list">
                            <div className="comments-tab-list-scroll">
                                {isNotesLoading ? (
                                    <p className="comments-tab-empty">Loading notes...</p>
                                ) : !hasNotes ? (
                                    <p className="comments-tab-empty">No notes added yet.</p>
                                ) : (
                                    <ul className="comments-tab-list-items">
                                        {notes.map((note, index) => (
                                            <li className="comments-tab-comment-card" key={note.id ?? index}>
                                                <div className="comments-tab-comment-avatar" />
                                                <div className="comments-tab-comment-content">
                                                    <div className="comments-tab-comment-header">
                                                        {note.userName ? (
                                                            <p className="comments-tab-comment-author">{note.userName}</p>
                                                        ) : <span />}
                                                        <div className="comments-tab-comment-actions">
                                                            <button
                                                                type="button"
                                                                className="subtasks-tab-edit-btn"
                                                                onClick={() => handleEditOpen(note)}
                                                                aria-label="Edit note"
                                                                disabled={isSaving}
                                                            >
                                                                <FiEdit2 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="subtasks-tab-edit-btn"
                                                                onClick={() => handleDeleteOpen(note)}
                                                                aria-label="Delete note"
                                                                disabled={isSaving}
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }} />
                                                    {note.updated_date || note.created_date ? (
                                                        <p className="notes-tab-note-updated">
                                                            {note.updated_date ?? note.created_date}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <DeleteConfirmationModal
                show={showDeleteModal}
                onCancel={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                deleteText="Are you sure you want to delete this note?"
            />
        </div>
    );
}

Notes.propTypes = {
    card: PropTypes.object,
};

export default Notes;
