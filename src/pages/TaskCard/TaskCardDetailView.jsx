import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { FiX } from "react-icons/fi";
import "../../design/scss/pages/taskCard.scss";
import "../../design/scss/invoice.scss";
import userService from "../../services/userService";

const MENTION_TRIGGER_REGEX = /@([^\s@]*)$/;

const mapUsersFromResponse = (rows) =>
    (rows || []).map((row) => ({
        user_id: row.user_id,
        user_name: row.name ?? "",
        avatar: row.avatar_path || row.avatar || null,
    }));

function TaskCardDetailView({ card, onClose }) {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const [commentText, setCommentText] = useState("");
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [users, setUsers] = useState([]);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [mentionStartIndex, setMentionStartIndex] = useState(null);
    const [selectedMentionUserIds, setSelectedMentionUserIds] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setIsUsersLoading(true);
        userService.getUsers({ params: { limit: 200 } })
            .then(({ data }) => {
                const list = data?.data || [];
                if (!cancelled) setUsers(mapUsersFromResponse(list));
            })
            .catch(() => { if (!cancelled) setUsers([]); })
            .finally(() => { if (!cancelled) setIsUsersLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filteredUsers = useMemo(() => {
        const term = mentionSearch.trim().toLowerCase();
        if (!term) return users;
        return users.filter((u) => (u.user_name || "").toLowerCase().includes(term));
    }, [users, mentionSearch]);

    const closeMentionDropdown = useCallback(() => {
        setMentionOpen(false);
        setMentionSearch("");
        setMentionStartIndex(null);
    }, []);

    const handleCommentChange = useCallback((e) => {
        const val = e.target.value;
        setCommentText(val);

        const cursor = e.target.selectionStart;
        const textBefore = val.slice(0, cursor);
        const match = textBefore.match(MENTION_TRIGGER_REGEX);
        if (match) {
            setMentionOpen(true);
            setMentionSearch(match[1] || "");
            setMentionStartIndex(cursor - match[0].length);
        } else {
            closeMentionDropdown();
        }
    }, [closeMentionDropdown]);

    const handleSelectUser = useCallback((user) => {
        if (mentionStartIndex === null) return;
        const before = commentText.slice(0, mentionStartIndex);
        const after = commentText.slice(mentionStartIndex + 1 + mentionSearch.length);
        const inserted = `@${user.user_name} `;
        const newText = before + inserted + after;
        setCommentText(newText);
        setSelectedMentionUserIds((prev) =>
            prev.some((id) => String(id) === String(user.user_id)) ? prev : [...prev, user.user_id]
        );
        closeMentionDropdown();

        setTimeout(() => {
            const pos = before.length + inserted.length;
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(pos, pos);
        }, 0);
    }, [commentText, mentionSearch, mentionStartIndex, closeMentionDropdown]);

    const handleSave = useCallback(() => {
        if (!commentText.trim()) return;
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
                                        <textarea
                                            ref={textareaRef}
                                            className="subtasks-tab-textarea"
                                            rows={4}
                                            placeholder="Write a comment... (type @ to mention)"
                                            value={commentText}
                                            onChange={handleCommentChange}
                                            onBlur={() => setTimeout(closeMentionDropdown, 150)}
                                        />

                                        {mentionOpen && (
                                            <div
                                                className="comments-tab-mention-dropdown"
                                                role="listbox"
                                                aria-label="Mention a user"
                                            >
                                                {isUsersLoading ? (
                                                    <p className="comments-tab-mention-status">Loading users...</p>
                                                ) : filteredUsers.length === 0 ? (
                                                    <p className="comments-tab-mention-status">No users found</p>
                                                ) : (
                                                    filteredUsers.map((user) => (
                                                        <button
                                                            key={user.user_id}
                                                            type="button"
                                                            className="comments-tab-mention-option"
                                                            role="option"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => handleSelectUser(user)}
                                                        >
                                                            <span className="comments-tab-mention-avatar">
                                                                {user.avatar ? (
                                                                    <img src={user.avatar} alt="" />
                                                                ) : (
                                                                    <span className="comments-tab-mention-avatar-fallback">
                                                                        {(user.user_name || "?").charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="comments-tab-mention-name">{user.user_name}</span>
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
