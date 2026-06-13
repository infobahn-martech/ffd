import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { FiX } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../design/scss/pages/taskCard.scss";
import "../../design/scss/invoice.scss";
import callFileService from "../../services/callFileService";
import { unwrapListResponse } from "../../shared/helpers/callFileFormOptions";

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

const mapManagersFromResponse = (rows) =>
    (rows || []).map((row) => ({
        user_id: row.user_id,
        user_name: row.user_name ?? "",
        avatar: row.avatar ?? null,
    }));

function TaskCardDetailView({ card, onClose }) {
    const quillRef = useRef(null);
    const fileInputRef = useRef(null);

    const [commentText, setCommentText] = useState("");
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [managers, setManagers] = useState([]);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [selectedMentionUserIds, setSelectedMentionUserIds] = useState([]);
    const [isManagersLoading, setIsManagersLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setIsManagersLoading(true);
        callFileService.getAllManagers()
            .then(({ data }) => {
                const list = unwrapListResponse(data);
                if (!cancelled) setManagers(mapManagersFromResponse(list));
            })
            .catch(() => { if (!cancelled) setManagers([]); })
            .finally(() => { if (!cancelled) setIsManagersLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filteredManagers = useMemo(() => {
        const term = mentionSearch.trim().toLowerCase();
        if (!term) return managers;
        return managers.filter((m) => (m.user_name || "").toLowerCase().includes(term));
    }, [managers, mentionSearch]);

    const closeMentionDropdown = useCallback(() => {
        setMentionOpen(false);
        setMentionSearch("");
    }, []);

    const syncMentionState = useCallback((editor) => {
        const context = getMentionContext(editor);
        if (context) {
            setMentionOpen(true);
            setMentionSearch(context.search);
        } else {
            closeMentionDropdown();
        }
    }, [closeMentionDropdown]);

    const handleCommentChange = useCallback((html, _delta, _source, editor) => {
        setCommentText(html);
        syncMentionState(editor);
    }, [syncMentionState]);

    const addMentionedUserId = useCallback((userId) => {
        setSelectedMentionUserIds((prev) =>
            prev.some((id) => String(id) === String(userId)) ? prev : [...prev, userId]
        );
    }, []);

    const handleSelectManager = useCallback((manager) => {
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
    }, [addMentionedUserId, closeMentionDropdown]);

    const handleSave = useCallback(() => {
        if (isEmptyHtmlContent(commentText)) return;
        console.log({
            card_id: card?.id,
            comment: commentText,
            mentioned_users: selectedMentionUserIds,
        });
        setCommentText("");
        setSelectedMentionUserIds([]);
        closeMentionDropdown();
    }, [card?.id, commentText, selectedMentionUserIds, closeMentionDropdown]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="subtasks-tab">
                <div className="subtasks-tab-layout">
                    <section className="subtasks-tab-editor">
                        <div className="subtasks-tab-card subtasks-tab-card--editor">
                            <div className="subtasks-tab-editor-body">

                                <div className="subtasks-tab-field-row">
                                    <div className="subtasks-tab-field">
                                        <label className="subtasks-tab-label">Task Name</label>
                                        <div className="st-readonly-field">{card?.taskName || card?.title || "—"}</div>
                                    </div>
                                    <div className="subtasks-tab-field st-due-date-field">
                                        <label className="subtasks-tab-label">Due Date</label>
                                        <div className="st-readonly-field">{card?.dueDate || "—"}</div>
                                    </div>
                                </div>

                                <div className="subtasks-tab-field">
                                    <label className="subtasks-tab-label">Comments</label>
                                    <div className="comments-tab-mention-host">
                                        <div className="react-quill-wrapper comments-tab-quill">
                                            <ReactQuill
                                                ref={quillRef}
                                                theme="snow"
                                                value={commentText}
                                                onChange={handleCommentChange}
                                                onBlur={closeMentionDropdown}
                                                modules={QUILL_MODULES}
                                                formats={QUILL_FORMATS}
                                                placeholder="Write a comment... (type @ to mention)"
                                            />
                                        </div>

                                        {mentionOpen && (
                                            <div
                                                className="comments-tab-mention-dropdown"
                                                role="listbox"
                                                aria-label="Mention a user"
                                            >
                                                {isManagersLoading ? (
                                                    <p className="comments-tab-mention-status">Loading users...</p>
                                                ) : filteredManagers.length === 0 ? (
                                                    <p className="comments-tab-mention-status">No users found</p>
                                                ) : (
                                                    filteredManagers.map((manager) => (
                                                        <button
                                                            key={manager.user_id}
                                                            type="button"
                                                            className="comments-tab-mention-option"
                                                            role="option"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => handleSelectManager(manager)}
                                                        >
                                                            <span className="comments-tab-mention-avatar">
                                                                {manager.avatar ? (
                                                                    <img src={manager.avatar} alt="" />
                                                                ) : (
                                                                    <span className="comments-tab-mention-avatar-fallback">
                                                                        {(manager.user_name || "?").charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="comments-tab-mention-name">{manager.user_name}</span>
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
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                <div className="subtasks-tab-field">
                                    <label className="subtasks-tab-label">Document Upload</label>
                                    <div
                                        className={`st-upload-zone${isDragging ? " st-upload-zone--drag" : ""}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                    >
                                        <span className="st-upload-text">
                                            {files.length > 0
                                                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                                                : <>Drag and drop your files here, or <span className="st-upload-browse">click to browse</span></>}
                                        </span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="d-none"
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.files || []);
                                                if (selected.length) setFiles((prev) => [...prev, ...selected]);
                                                e.target.value = "";
                                            }}
                                        />
                                    </div>
                                    {files.length > 0 && (
                                        <div className="st-file-chips">
                                            {files.map((f, i) => (
                                                <span key={i} className="st-file-chip">
                                                    {f.name}
                                                    <button type="button" className="st-upload-clear" onClick={() => removeFile(i)}>
                                                        <FiX size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="st-inline-actions">
                                    <button type="button" className="st-inline-save" onClick={onClose}>Submit</button>
                                </div>

                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TaskCardDetailView;
