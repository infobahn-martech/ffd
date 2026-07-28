import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FiEdit2 } from "react-icons/fi";
import SearchableSelect, { deriveSearchPlaceholder } from "../../../../../../components/form/SearchableSelect";
import DateTimePickerField from "../../../shared/components/DateTimePickerField";
import useCommonReducer from "../../../../../../store/CommonReducer";
import { notify } from "../../../../../../components/Toaster";
import kanbanBoardService from "../../../../../../services/kanbanBoardService";
import "../../../../../../design/scss/invoice.scss";
import "../../../../../../design/css/common/CardForm.css";

const mapUserToOption = (user) => ({
    value: String(user.user_id),
    label: user.name ?? "",
    avatar: user.avatar_path || user.avatar || null,
});

const buildDueDateString = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const time = timeStr ? `${timeStr}:00` : "00:00:00";
    return `${dateStr} ${time}`;
};

const parseDueDateParts = (dueDateStr) => {
    if (!dueDateStr) return { date: "", time: "" };
    const [date, timeFull = ""] = dueDateStr.split(" ");
    const time = timeFull.slice(0, 5);
    return { date, time };
};

const normalizeSubtask = (item) => {
    const { date, time } = parseDueDateParts(item.due_date);
    return {
        id: String(item.subtask_id),
        title: item.description ?? "",
        assignee: item.assigned_to
            ? { user_id: String(item.assigned_to), user_name: item.assigned_to_name ?? "" }
            : null,
        dueDate: date || null,
        dueTime: time || null,
        document: item.document
            ? { name: item.document, url: item.document_url ?? null }
            : null,
        completed: String(item.is_completed) === "1",
    };
};

const UserOptionAvatar = ({ avatarUrl, label, className = "" }) => {
    const letterSource = label != null ? String(label).trim() : "";
    const displayLetter = letterSource ? letterSource.charAt(0).toUpperCase() : "U";
    const src = avatarUrl != null && String(avatarUrl).trim();
    const [imgFailed, setImgFailed] = useState(false);

    if (src && !imgFailed) {
        return (
            <div className={`cf-owner-avatar cf-owner-avatar--img ${className}`.trim()}>
                <img src={src} alt="" onError={() => setImgFailed(true)} />
            </div>
        );
    }
    return <div className={`cf-owner-avatar ${className}`.trim()}>{displayLetter}</div>;
};

UserOptionAvatar.propTypes = {
    avatarUrl: PropTypes.string,
    label: PropTypes.string,
    className: PropTypes.string,
};

const formatDueDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const timepart = timeStr || "00:00";
    const parsed = new Date(`${dateStr}T${timepart}:00`);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    const datePart = parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    return timeStr ? `${datePart} ${timepart}` : datePart;
};

const getInitials = (name) => (name || "?").charAt(0).toUpperCase();

function Subtasks({ card }) {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editDescription, setEditDescription] = useState("");
    const [editAssignedTo, setEditAssignedTo] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const [editDueTime, setEditDueTime] = useState("");
    const [editDocumentFile, setEditDocumentFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [title, setTitle] = useState("");
    const [assignUserId, setAssignUserId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [documentFile, setDocumentFile] = useState(null);

    const allUsers = useCommonReducer((state) => state.allUsers);
    const usersLoading = useCommonReducer((state) => state.allUsersLoading);
    const getAllUsers = useCommonReducer((state) => state.getAllUsers);

    const cardId = card?.id || card?.card_id || card?.call_id;

    const userOptions = useMemo(
        () => (Array.isArray(allUsers) ? allUsers.map(mapUserToOption) : []),
        [allUsers]
    );

    const selectedAssigneeAvatar = useMemo(() => {
        const user = allUsers.find((u) => String(u.user_id) === String(assignUserId));
        return user ? (user.avatar_path || user.avatar || null) : null;
    }, [allUsers, assignUserId]);

    const selectedAssigneeName = useMemo(() => {
        const user = allUsers.find((u) => String(u.user_id) === String(assignUserId));
        return user?.name ?? "";
    }, [allUsers, assignUserId]);

    useEffect(() => {
        if (allUsers.length > 0 || usersLoading) return;
        getAllUsers();
    }, [allUsers.length, usersLoading, getAllUsers]);

    const loadSubtasks = useCallback(async () => {
        if (!cardId) return;
        setIsLoading(true);
        try {
            const res = await kanbanBoardService.getSubtasks(cardId);
            const list = res?.data?.data ?? res?.data ?? [];
            setTasks(Array.isArray(list) ? list.map(normalizeSubtask) : []);
        } catch {
            notify("Failed to load subtasks.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [cardId]);

    useEffect(() => {
        loadSubtasks();
    }, [loadSubtasks]);

    const hasTasks = tasks.length > 0;

    const resetForm = useCallback(() => {
        setTitle("");
        setAssignUserId("");
        setDueDate("");
        setDueTime("");
        setDocumentFile(null);
    }, []);

    const handleDocumentChange = useCallback((event) => {
        const file = event.target.files?.[0] || null;
        setDocumentFile(file);
    }, []);

    const handleRemoveDocument = useCallback(() => {
        setDocumentFile(null);
    }, []);

    const handleSave = useCallback(async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle || !cardId) return;

        const formData = new FormData();
        formData.append("card_id", String(cardId));
        formData.append("description", trimmedTitle);
        if (assignUserId) formData.append("assigned_to", String(assignUserId));
        const dueDateStr = buildDueDateString(dueDate, dueTime);
        if (dueDateStr) formData.append("due_date", dueDateStr);
        if (documentFile) formData.append("document", documentFile);

        setIsSaving(true);
        try {
            await kanbanBoardService.createSubtask(formData);
            notify("Task saved successfully.", "success");
            resetForm();
            await loadSubtasks();
        } catch {
            notify("Failed to save task.", "error");
        } finally {
            setIsSaving(false);
        }
    }, [title, assignUserId, dueDate, dueTime, documentFile, cardId, resetForm, loadSubtasks]);

    const handleEditOpen = useCallback((task) => {
        setEditingId(task.id);
        setEditDescription(task.title);
        setEditAssignedTo(task.assignee?.user_id ?? "");
        setEditDueDate(task.dueDate ?? "");
        setEditDueTime(task.dueTime ?? "");
        setEditDocumentFile(null);
    }, []);

    const handleEditCancel = useCallback(() => {
        setEditingId(null);
        setEditDescription("");
        setEditAssignedTo("");
        setEditDueDate("");
        setEditDueTime("");
        setEditDocumentFile(null);
    }, []);

    const handleUpdate = useCallback(async (taskId) => {
        const trimmed = editDescription.trim();
        if (!trimmed) return;
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append("subtask_id", String(taskId));
            formData.append("description", trimmed);
            if (editAssignedTo) formData.append("assigned_to", String(editAssignedTo));
            const dueDateStr = buildDueDateString(editDueDate, editDueTime);
            if (dueDateStr) formData.append("due_date", dueDateStr);
            if (editDocumentFile) formData.append("document", editDocumentFile);
            await kanbanBoardService.updateSubtask(formData);
            notify("Task updated successfully.", "success");
            handleEditCancel();
            await loadSubtasks();
        } catch {
            notify("Failed to update task.", "error");
        } finally {
            setIsUpdating(false);
        }
    }, [editDescription, editAssignedTo, editDueDate, editDueTime, editDocumentFile, handleEditCancel, loadSubtasks]);

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="subtasks-tab">
                <div className="subtasks-tab-layout">
                    <section className="subtasks-tab-editor" aria-label="Add a task">
                        <div className="subtasks-tab-card subtasks-tab-card--editor">
                            <div className="subtasks-tab-editor-body">
                                <h3 className="subtasks-tab-form-title">Add Task</h3>

                                <div className="subtasks-tab-field-row">
                                    <div className="subtasks-tab-field">
                                        <label className="subtasks-tab-label" htmlFor="subtask-assignee">
                                            Assign User
                                        </label>
                                        <div className="subtasks-tab-assignee-row">
                                            <UserOptionAvatar
                                                avatarUrl={selectedAssigneeAvatar}
                                                label={selectedAssigneeName}
                                                className="subtasks-tab-assignee-avatar"
                                            />
                                            <SearchableSelect
                                                className="cf-owner-searchable-select subtasks-tab-assignee-select"
                                                value={assignUserId === "" ? "" : String(assignUserId)}
                                                onChange={(event) => setAssignUserId(event.target.value)}
                                                options={userOptions}
                                                placeholder={usersLoading ? "Loading users..." : "Select user"}
                                                searchPlaceholder={deriveSearchPlaceholder("Select user")}
                                                disabled={usersLoading || isSaving}
                                                renderOption={(option) => (
                                                    <div className="cf-searchable-option-with-avatar">
                                                        <UserOptionAvatar
                                                            avatarUrl={option.avatar}
                                                            label={option.label}
                                                            className="cf-owner-avatar--sm"
                                                        />
                                                        <span>{option.label}</span>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="subtasks-tab-field subtasks-tab-field--due-date">
                                        <label className="subtasks-tab-label" htmlFor="subtask-due-date">
                                            Due Date &amp; Time
                                        </label>
                                        <DateTimePickerField
                                            dateValue={dueDate}
                                            timeValue={dueTime}
                                            onDateTimeChange={({ date, time }) => {
                                                setDueDate(date);
                                                setDueTime(time);
                                            }}
                                            dateFieldName="subtask-due-date"
                                            timeFieldName="subtask-due-time"
                                            placeholder="YYYY-MM-DD HH:mm"
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="subtasks-tab-field subtasks-tab-field--document">
                                        <label className="subtasks-tab-label" htmlFor="subtask-document">
                                            Document
                                        </label>
                                        {documentFile ? (
                                            <div className="subtasks-tab-doc-chip">
                                                <span className="subtasks-tab-doc-name" title={documentFile.name}>
                                                    {documentFile.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="subtasks-tab-doc-remove"
                                                    onClick={handleRemoveDocument}
                                                    aria-label="Remove document"
                                                    disabled={isSaving}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="subtasks-tab-doc-upload" htmlFor="subtask-document">
                                                <span>Upload document</span>
                                                <input
                                                    id="subtask-document"
                                                    type="file"
                                                    className="subtasks-tab-doc-input"
                                                    onChange={handleDocumentChange}
                                                    disabled={isSaving}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="subtasks-tab-field">
                                    <label className="subtasks-tab-label" htmlFor="subtask-title">
                                        Task title / description
                                    </label>
                                    <textarea
                                        id="subtask-title"
                                        className="subtasks-tab-textarea"
                                        rows={4}
                                        placeholder="Enter task title or description..."
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="subtasks-tab-save-row">
                                    <button
                                        type="button"
                                        className="subtasks-tab-save-btn"
                                        onClick={handleSave}
                                        disabled={!title.trim() || isSaving}
                                    >
                                        {isSaving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="subtasks-tab-list" aria-label="Subtasks">
                        <div className="subtasks-tab-card subtasks-tab-card--list">
                            <div className="subtasks-tab-list-scroll">
                                {isLoading ? (
                                    <p className="subtasks-tab-empty">Loading tasks...</p>
                                ) : !hasTasks ? (
                                    <p className="subtasks-tab-empty">No tasks added yet.</p>
                                ) : (
                                    <ul className="subtasks-tab-list-items">
                                        {tasks.map((task) => {
                                            const assigneeName = task.assignee?.user_name || "Unassigned";
                                            const isEditing = editingId === task.id;

                                            return (
                                                <li
                                                    className={`subtasks-tab-task-card${task.completed ? " subtasks-tab-task-card--completed" : ""}`}
                                                    key={task.id}
                                                >
                                                    {isEditing ? (
                                                        <div className="subtasks-tab-edit-form">
                                                            <div className="subtasks-tab-field">
                                                                <label className="subtasks-tab-label">Description</label>
                                                                <textarea
                                                                    className="subtasks-tab-textarea"
                                                                    rows={3}
                                                                    value={editDescription}
                                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                                    disabled={isUpdating}
                                                                />
                                                            </div>
                                                            <div className="subtasks-tab-field-row">
                                                                <div className="subtasks-tab-field">
                                                                    <label className="subtasks-tab-label">Assign User</label>
                                                                    <SearchableSelect
                                                                        className="cf-owner-searchable-select subtasks-tab-assignee-select"
                                                                        value={editAssignedTo === "" ? "" : String(editAssignedTo)}
                                                                        onChange={(e) => setEditAssignedTo(e.target.value)}
                                                                        options={userOptions}
                                                                        placeholder={usersLoading ? "Loading..." : "Select user"}
                                                                        searchPlaceholder={deriveSearchPlaceholder("Select user")}
                                                                        disabled={usersLoading || isUpdating}
                                                                        renderOption={(option) => (
                                                                            <div className="cf-searchable-option-with-avatar">
                                                                                <UserOptionAvatar avatarUrl={option.avatar} label={option.label} className="cf-owner-avatar--sm" />
                                                                                <span>{option.label}</span>
                                                                            </div>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="subtasks-tab-field subtasks-tab-field--due-date">
                                                                    <label className="subtasks-tab-label">Due Date &amp; Time</label>
                                                                    <DateTimePickerField
                                                                        dateValue={editDueDate}
                                                                        timeValue={editDueTime}
                                                                        onDateTimeChange={({ date, time }) => {
                                                                            setEditDueDate(date);
                                                                            setEditDueTime(time);
                                                                        }}
                                                                        disabled={isUpdating}
                                                                    />
                                                                </div>
                                                                <div className="subtasks-tab-field subtasks-tab-field--document">
                                                                    <label className="subtasks-tab-label">Document</label>
                                                                    {editDocumentFile ? (
                                                                        <div className="subtasks-tab-doc-chip">
                                                                            <span className="subtasks-tab-doc-name" title={editDocumentFile.name}>{editDocumentFile.name}</span>
                                                                            <button type="button" className="subtasks-tab-doc-remove" onClick={() => setEditDocumentFile(null)} disabled={isUpdating}>&times;</button>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="subtasks-tab-doc-upload">
                                                                            <span>Upload document</span>
                                                                            <input type="file" className="subtasks-tab-doc-input" disabled={isUpdating} onChange={(e) => setEditDocumentFile(e.target.files?.[0] ?? null)} />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="subtasks-tab-save-row">
                                                                <button type="button" className="subtasks-tab-save-btn" onClick={() => handleUpdate(task.id)} disabled={!editDescription.trim() || isUpdating}>
                                                                    {isUpdating ? "Saving..." : "Update"}
                                                                </button>
                                                                <button type="button" className="subtasks-tab-cancel-btn" onClick={handleEditCancel} disabled={isUpdating}>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="subtasks-tab-task-header">
                                                                <span className="subtasks-tab-task-title">{task.title}</span>
                                                                <div className="subtasks-tab-task-actions">
                                                                    <span className={`subtasks-tab-status-badge subtasks-tab-status-badge--${task.completed ? "completed" : "pending"}`}>
                                                                        {task.completed ? "Completed" : "Pending"}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        className="subtasks-tab-edit-btn"
                                                                        onClick={() => handleEditOpen(task)}
                                                                        aria-label="Edit task"
                                                                    >
                                                                        <FiEdit2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="subtasks-tab-task-meta">
                                                                <span className="subtasks-tab-task-avatar">
                                                                    <span className="subtasks-tab-task-avatar-fallback">{getInitials(assigneeName)}</span>
                                                                </span>
                                                                <span className="subtasks-tab-task-assignee">{assigneeName}</span>
                                                                {task.dueDate && (
                                                                    <span className="subtasks-tab-task-due">
                                                                        Due {formatDueDateTime(task.dueDate, task.dueTime)}
                                                                    </span>
                                                                )}
                                                                {task.document && (
                                                                    task.document.url ? (
                                                                        <a className="subtasks-tab-task-doc" href={task.document.url} target="_blank" rel="noopener noreferrer" title={task.document.name}>
                                                                            {task.document.name}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="subtasks-tab-task-doc" title={task.document.name}>{task.document.name}</span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </li>
                                            );
                                        })}
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

Subtasks.propTypes = {
    card: PropTypes.object,
};

export default Subtasks;
