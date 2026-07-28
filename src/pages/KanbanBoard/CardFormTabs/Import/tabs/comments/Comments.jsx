import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import DOMPurify from "dompurify";
import { FiEdit2, FiTrash2, FiPaperclip } from "react-icons/fi";
import "react-quill/dist/quill.snow.css";
import "../../../../../../design/scss/invoice.scss";
import "../../../../../../design/scss/comments.scss";
import callFileService from "../../../../../../services/callFileService";
import kanbanBoardService from "../../../../../../services/kanbanBoardService";
import { unwrapListResponse } from "../../../../../../shared/helpers/callFileFormOptions";
import { notify } from "../../../../../../components/Toaster";
import DeleteConfirmationModal from "../../../../../../components/DeleteConfirmationModal";
import useAuthReducer from "../../../../../../store/AuthReducer";

const QUILL_MODULES = {
    toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link", "image"],
        ["clean"],
    ],
};

const QUILL_FORMATS = [
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "bullet",
    "blockquote",
    "link",
    "image",
];

const MENTION_TRIGGER_REGEX = /@([^\s@]*)$/;

const stripHtmlContent = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
};

const isEmptyHtmlContent = (html) => stripHtmlContent(html).length === 0;

const getInitial = (name) => (name || "?").trim().charAt(0).toUpperCase() || "?";

const getCardId = (card) => card?.id || card?.card_id || card?.call_id;

const mapCommentFromResponse = (row) => ({
    id: row.comment_id,
    userName: row.user_name ?? "",
    content: row.comment_text,
    mentions: row.mentions ?? [],
    attachment: row.attachment
        ? { name: row.attachment, url: row.attachment_url ?? null }
        : null,
    created_date: row.created_date ?? null,
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

function Comments({ card }) {
    const quillRef = useRef(null);
    const [commentText, setCommentText] = useState("");
    const [managers, setManagers] = useState([]);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [selectedMentionUserIds, setSelectedMentionUserIds] = useState([]);
    const [isManagersLoading, setIsManagersLoading] = useState(false);
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [comments, setComments] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [commentFilter, setCommentFilter] = useState("");
    const [expandAll, setExpandAll] = useState(false);
    const [sendAsEmail, setSendAsEmail] = useState(false);

    const fromEmail = useAuthReducer((state) => state.profileData?.email);

    const cardId = getCardId(card);
    const hasComments = comments.length > 0;

    const mentionedNames = useMemo(
        () =>
            managers
                .filter((manager) =>
                    selectedMentionUserIds.some((id) => String(id) === String(manager.user_id))
                )
                .map((manager) => manager.user_name)
                .filter(Boolean),
        [managers, selectedMentionUserIds]
    );

    const filteredComments = useMemo(() => {
        const term = commentFilter.trim().toLowerCase();
        if (!term) return comments;

        return comments.filter(
            (comment) =>
                (comment.userName || "").toLowerCase().includes(term) ||
                stripHtmlContent(comment.content).toLowerCase().includes(term)
        );
    }, [comments, commentFilter]);

    const loadComments = useCallback(async () => {
        if (!cardId) return;

        setIsCommentsLoading(true);
        try {
            const { data } = await kanbanBoardService.getCardComments(cardId);
            const rows = unwrapListResponse(data);
            setComments(rows.map(mapCommentFromResponse));
        } catch {
            setComments([]);
        } finally {
            setIsCommentsLoading(false);
        }
    }, [cardId]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

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
            } catch {
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

    const handleCommentChange = useCallback(
        (html, _delta, _source, editor) => {
            setCommentText(html);
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

            setCommentText(editor.root.innerHTML);
            addMentionedUserId(manager.user_id);
            closeMentionDropdown();
        },
        [addMentionedUserId, closeMentionDropdown]
    );

    const handleEditOpen = useCallback(
        (comment) => {
            setEditingCommentId(comment.id);
            setCommentText(comment.content);
            setSelectedMentionUserIds((comment.mentions || []).map((mention) => mention.user_id));
            setAttachmentFile(null);
            closeMentionDropdown();
        },
        [closeMentionDropdown]
    );

    const handleEditCancel = useCallback(() => {
        setEditingCommentId(null);
        setCommentText("");
        setSelectedMentionUserIds([]);
        setAttachmentFile(null);
        closeMentionDropdown();
    }, [closeMentionDropdown]);

    const handleSave = useCallback(async () => {
        if (isEmptyHtmlContent(commentText) || !cardId || isSaving) return;

        const isEditing = Boolean(editingCommentId);
        const formData = new FormData();
        if (isEditing) {
            formData.append("comment_id", String(editingCommentId));
        } else {
            formData.append("card_id", String(cardId));
        }
        formData.append("comment_text", commentText);
        formData.append("mentions", JSON.stringify(selectedMentionUserIds));
        if (attachmentFile) formData.append("attachment", attachmentFile);

        setIsSaving(true);
        try {
            const { data } = isEditing
                ? await kanbanBoardService.updateCardComment(formData)
                : await kanbanBoardService.addCardComment(formData);
            await loadComments();
            notify(
                data?.message || (isEditing ? "Comment updated successfully." : "Comment added successfully."),
                "success"
            );
            setEditingCommentId(null);
            setCommentText("");
            setSelectedMentionUserIds([]);
            setAttachmentFile(null);
            closeMentionDropdown();
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                (editingCommentId ? "Failed to update comment." : "Failed to add comment.");
            notify(typeof msg === "string" ? msg : "Failed to save comment.", "error");
        } finally {
            setIsSaving(false);
        }
    }, [commentText, cardId, isSaving, selectedMentionUserIds, attachmentFile, editingCommentId, closeMentionDropdown, loadComments]);

    const handleDeleteOpen = useCallback((comment) => {
        setSelectedComment(comment);
        setShowDeleteModal(true);
    }, []);

    const handleDeleteCancel = useCallback(() => {
        if (isDeleting) return;
        setShowDeleteModal(false);
        setSelectedComment(null);
    }, [isDeleting]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedComment) return;

        setIsDeleting(true);
        try {
            const { data } = await kanbanBoardService.deleteCardComment(selectedComment.id);
            await loadComments();
            notify(data?.message || "Comment deleted successfully.", "success");
            if (editingCommentId === selectedComment.id) {
                handleEditCancel();
            }
            setShowDeleteModal(false);
            setSelectedComment(null);
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to delete comment.";
            notify(typeof msg === "string" ? msg : "Failed to delete comment.", "error");
        } finally {
            setIsDeleting(false);
        }
    }, [selectedComment, editingCommentId, handleEditCancel, loadComments]);

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="comments-tab">
                <div className="comments-tab-layout">
                    <section className="comments-tab-list" aria-label="Comments">
                        <div className="comments-tab-card comments-tab-card--list">
                            <div className="comments-tab-list-scroll">
                                {isCommentsLoading ? (
                                    <p className="comments-tab-empty">Loading comments...</p>
                                ) : !hasComments ? (
                                    <p className="comments-tab-empty">No comments added yet.</p>
                                ) : filteredComments.length === 0 ? (
                                    <p className="comments-tab-empty">No comments match your filter.</p>
                                ) : (
                                    <ul className="comments-tab-list-items">
                                        {filteredComments.map((comment, index) => (
                                            <li className="comments-tab-comment-card" key={comment.id ?? index}>
                                                <div className="comments-tab-comment-avatar">
                                                    <span className="comments-tab-comment-avatar-fallback">
                                                        {getInitial(comment.userName)}
                                                    </span>
                                                </div>
                                                <div className="comments-tab-comment-content">
                                                    <div className="comments-tab-comment-header">
                                                        <div className="comments-tab-comment-meta">
                                                            {comment.userName ? (
                                                                <p className="comments-tab-comment-author">{comment.userName}</p>
                                                            ) : <span />}
                                                            {comment.created_date ? (
                                                                <p className="notes-tab-note-updated">{comment.created_date}</p>
                                                            ) : null}
                                                        </div>
                                                        <div className="comments-tab-comment-actions">
                                                            <button
                                                                type="button"
                                                                className="subtasks-tab-edit-btn"
                                                                onClick={() => handleEditOpen(comment)}
                                                                aria-label="Edit comment"
                                                                disabled={isSaving}
                                                            >
                                                                <FiEdit2 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="subtasks-tab-edit-btn"
                                                                onClick={() => handleDeleteOpen(comment)}
                                                                aria-label="Delete comment"
                                                                disabled={isSaving}
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`comments-tab-comment-bubble${expandAll ? "" : " comments-tab-comment-bubble--clamped"}`}
                                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
                                                    />
                                                    {comment.attachment ? (
                                                        comment.attachment.url ? (
                                                            <a
                                                                className="subtasks-tab-task-doc"
                                                                href={comment.attachment.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title={comment.attachment.name}
                                                            >
                                                                {comment.attachment.name}
                                                            </a>
                                                        ) : (
                                                            <span className="subtasks-tab-task-doc" title={comment.attachment.name}>
                                                                {comment.attachment.name}
                                                            </span>
                                                        )
                                                    ) : null}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="comments-tab-editor" aria-label="Write a comment">
                        <div className="comments-tab-card comments-tab-card--editor">
                            <div className="comments-tab-editor-body">
                                {sendAsEmail && (
                                    <div className="comments-tab-email-fields">
                                        <div className="comments-tab-email-field">
                                            <span className="comments-tab-email-label">From</span>
                                            <span className="comments-tab-email-value">
                                                {fromEmail || "You"}
                                            </span>
                                        </div>
                                        <div className="comments-tab-email-field">
                                            <span className="comments-tab-email-label">To</span>
                                            <span className="comments-tab-email-value">
                                                {mentionedNames.length > 0
                                                    ? mentionedNames.join(", ")
                                                    : "Mention a user with @ to notify them"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="comments-tab-mention-host">
                                    <div className="react-quill-wrapper comments-tab-quill">
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={commentText}
                                            onChange={handleCommentChange}
                                            onBlur={handleEditorBlur}
                                            modules={QUILL_MODULES}
                                            formats={QUILL_FORMATS}
                                            placeholder="Write a comment..."
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

                                <div className="comments-tab-action-row">
                                    {attachmentFile ? (
                                        <div className="comments-tab-doc-chip">
                                            <span className="comments-tab-doc-name" title={attachmentFile.name}>
                                                {attachmentFile.name}
                                            </span>
                                            <button
                                                type="button"
                                                className="subtasks-tab-doc-remove"
                                                onClick={() => setAttachmentFile(null)}
                                                aria-label="Remove attachment"
                                                disabled={isSaving}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            className="comments-tab-attach-btn"
                                            htmlFor="comment-attachment"
                                            aria-label="Attach a file"
                                            title="Attach a file"
                                        >
                                            <FiPaperclip size={15} />
                                            <input
                                                id="comment-attachment"
                                                type="file"
                                                className="subtasks-tab-doc-input"
                                                onChange={(event) =>
                                                    setAttachmentFile(event.target.files?.[0] ?? null)
                                                }
                                                disabled={isSaving}
                                            />
                                        </label>
                                    )}

                                    <label className="comments-tab-send-email-toggle">
                                        <input
                                            type="checkbox"
                                            className="comments-tab-send-email-checkbox"
                                            checked={sendAsEmail}
                                            onChange={(event) => setSendAsEmail(event.target.checked)}
                                        />
                                        <span className="comments-tab-send-email-track">
                                            <span className="comments-tab-send-email-thumb" />
                                        </span>
                                        <span className="comments-tab-send-email-text">Send as email</span>
                                    </label>
                                    {editingCommentId && (
                                        <button
                                            type="button"
                                            className="comments-tab-cancel-btn"
                                            onClick={handleEditCancel}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="comments-tab-save-btn"
                                        onClick={handleSave}
                                        disabled={isSaving || isEmptyHtmlContent(commentText)}
                                    >
                                        {editingCommentId
                                            ? (isSaving ? "Updating..." : "Update")
                                            : (isSaving ? "Adding..." : "Add Comment")}
                                    </button>
                                </div>
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
                deleteText="Are you sure you want to delete this comment?"
            />
        </div>
    );
}

Comments.propTypes = {
    card: PropTypes.object,
};

export default Comments;
