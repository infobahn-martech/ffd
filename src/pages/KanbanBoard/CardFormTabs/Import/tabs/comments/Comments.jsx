import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";
import "../../../../../../design/scss/invoice.scss";
import callFileService from "../../../../../../services/callFileService";
import kanbanBoardService from "../../../../../../services/kanbanBoardService";
import { unwrapListResponse } from "../../../../../../shared/helpers/callFileFormOptions";
import { notify } from "../../../../../../components/Toaster";

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
    const [localComments, setLocalComments] = useState([]);

    const cardId = getCardId(card);

    const comments = useMemo(
        () => [...(card?.comments ?? []), ...localComments],
        [card?.comments, localComments]
    );
    const hasComments = comments.length > 0;

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

    const handleSave = useCallback(async () => {
        if (isEmptyHtmlContent(commentText) || !cardId || isSaving) return;

        const formData = new FormData();
        formData.append("card_id", String(cardId));
        formData.append("comment_text", commentText);
        formData.append("mentions", JSON.stringify(selectedMentionUserIds));
        if (attachmentFile) formData.append("attachment", attachmentFile);

        setIsSaving(true);
        try {
            const { data } = await kanbanBoardService.addCardComment(formData);
            const created = data?.data;
            if (created) {
                setLocalComments((prev) => [
                    ...prev,
                    {
                        id: created.comment_id,
                        avatar: null,
                        content: created.comment_text,
                        attachment: created.attachment
                            ? { name: created.attachment, url: created.attachment_url ?? null }
                            : null,
                        created_date: created.created_date ?? null,
                    },
                ]);
            }
            notify(data?.message || "Comment added successfully.", "success");
            setCommentText("");
            setSelectedMentionUserIds([]);
            setAttachmentFile(null);
            closeMentionDropdown();
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to add comment.";
            notify(typeof msg === "string" ? msg : "Failed to add comment.", "error");
        } finally {
            setIsSaving(false);
        }
    }, [commentText, cardId, isSaving, selectedMentionUserIds, attachmentFile, closeMentionDropdown]);

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="comments-tab">
                <div className="comments-tab-layout">
                    <section className="comments-tab-editor" aria-label="Write a comment">
                        <div className="comments-tab-card comments-tab-card--editor">
                            <div className="comments-tab-editor-body">
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

                                <div className="comments-tab-attachment-row">
                                    {attachmentFile ? (
                                        <div className="subtasks-tab-doc-chip">
                                            <span className="subtasks-tab-doc-name" title={attachmentFile.name}>
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
                                        <label className="subtasks-tab-doc-upload" htmlFor="comment-attachment">
                                            <span>Attach a file</span>
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
                                </div>

                                <div className="comments-tab-save-row">
                                    <button
                                        type="button"
                                        className="comments-tab-save-btn"
                                        onClick={handleSave}
                                        disabled={isSaving || isEmptyHtmlContent(commentText)}
                                    >
                                        {isSaving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="comments-tab-list" aria-label="Comments">
                        <div className="comments-tab-card comments-tab-card--list">
                            <div className="comments-tab-list-scroll">
                                {!hasComments ? (
                                    <p className="comments-tab-empty">No comments added yet.</p>
                                ) : (
                                    <ul className="comments-tab-list-items">
                                        {comments.map((comment, index) => (
                                            <li className="comments-tab-comment-card" key={comment.id ?? index}>
                                                <div className="comments-tab-comment-avatar">
                                                    {comment.avatar ? (
                                                        <img src={comment.avatar} alt="avatar" />
                                                    ) : null}
                                                </div>
                                                <div className="comments-tab-comment-content">
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }} />
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
                                                    {comment.created_date ? (
                                                        <p className="notes-tab-note-updated">{comment.created_date}</p>
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
        </div>
    );
}

Comments.propTypes = {
    card: PropTypes.object,
};

export default Comments;
