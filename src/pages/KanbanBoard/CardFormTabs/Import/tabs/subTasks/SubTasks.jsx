import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import SearchableSelect, { deriveSearchPlaceholder } from "../../../../../../components/form/SearchableSelect";
import DateTimePickerField from "../../../shared/components/DateTimePickerField";
import useCommonReducer from "../../../../../../store/CommonReducer";
import "../../../../../../design/scss/invoice.scss";
import "../../../../../../design/css/common/CardForm.css";

const isActiveUser = (user) =>
    String(user?.user_status ?? "").toLowerCase() === "active" || String(user?.status) === "1";

const mapUserToAssignee = (user) => ({
    user_id: user.user_id,
    user_name: user.name ?? "",
    avatar: user.avatar_path || user.avatar || null,
});

const mapUserToOption = (user) => ({
    value: String(user.user_id),
    label: user.name ?? "",
    avatar: user.avatar_path || user.avatar || null,
});

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
    const [title, setTitle] = useState("");
    const [assignUserId, setAssignUserId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");

    const users = useCommonReducer((state) => state.users);
    const usersLoading = useCommonReducer((state) => state.usersLoading);
    const getUsers = useCommonReducer((state) => state.getUsers);

    const activeUsers = useMemo(
        () => (Array.isArray(users) ? users.filter(isActiveUser) : []),
        [users]
    );

    const userOptions = useMemo(
        () => activeUsers.map(mapUserToOption),
        [activeUsers]
    );

    const getUserById = useCallback(
        (userId) => {
            const user = activeUsers.find((item) => String(item.user_id) === String(userId));
            return user ? mapUserToAssignee(user) : null;
        },
        [activeUsers]
    );

    useEffect(() => {
        if (users.length > 0 || usersLoading) return;
        getUsers({ params: { limit: 200 } });
    }, [users.length, usersLoading, getUsers]);

    const hasTasks = tasks.length > 0;
    const selectedAssignee = useMemo(() => getUserById(assignUserId), [assignUserId, getUserById]);

    const resetForm = useCallback(() => {
        setTitle("");
        setAssignUserId("");
        setDueDate("");
        setDueTime("");
    }, []);

    const handleSave = useCallback(() => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        const assignee = assignUserId ? getUserById(assignUserId) : null;

        setTasks((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${prev.length}`,
                title: trimmedTitle,
                assignee,
                dueDate: dueDate || null,
                dueTime: dueTime || null,
                completed: false,
            },
        ]);

        resetForm();

        console.log("[Subtasks] task saved (local)", {
            card_id: card?.id || card?.card_id || card?.call_id,
            title: trimmedTitle,
            assign_user_id: assignUserId || null,
            due_date: dueDate || null,
            due_time: dueTime || null,
        });
    }, [title, assignUserId, dueDate, dueTime, card, resetForm, getUserById]);

    const handleToggleStatus = useCallback((taskId) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    return (
        <div className="cardform-body cardform-body--feed-tab">
            <div className="subtasks-tab">
                <div className="subtasks-tab-layout">
                    <section className="subtasks-tab-editor" aria-label="Add a task">
                        <div className="subtasks-tab-card subtasks-tab-card--editor">
                            <div className="subtasks-tab-editor-body">
                                <h3 className="subtasks-tab-form-title">Add Task</h3>

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
                                    />
                                </div>

                                <div className="subtasks-tab-field-row">
                                    <div className="subtasks-tab-field">
                                        <label className="subtasks-tab-label" htmlFor="subtask-assignee">
                                            Assign User
                                        </label>
                                        <div className="subtasks-tab-assignee-row">
                                            <UserOptionAvatar
                                                avatarUrl={selectedAssignee?.avatar}
                                                label={selectedAssignee?.user_name}
                                                className="subtasks-tab-assignee-avatar"
                                            />
                                            <SearchableSelect
                                                className="cf-owner-searchable-select subtasks-tab-assignee-select"
                                                value={assignUserId === "" ? "" : String(assignUserId)}
                                                onChange={(event) => setAssignUserId(event.target.value)}
                                                options={userOptions}
                                                placeholder={usersLoading ? "Loading users..." : "Select user"}
                                                searchPlaceholder={deriveSearchPlaceholder("Select user")}
                                                disabled={usersLoading}
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
                                        />
                                    </div>
                                </div>

                                <div className="subtasks-tab-save-row">
                                    <button
                                        type="button"
                                        className="subtasks-tab-save-btn"
                                        onClick={handleSave}
                                        disabled={!title.trim()}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="subtasks-tab-list" aria-label="Subtasks">
                        <div className="subtasks-tab-card subtasks-tab-card--list">
                            <div className="subtasks-tab-list-scroll">
                                {!hasTasks ? (
                                    <p className="subtasks-tab-empty">No tasks added yet.</p>
                                ) : (
                                    <ul className="subtasks-tab-list-items">
                                        {tasks.map((task) => {
                                            const assigneeName =
                                                task.assignee?.user_name || "Unassigned";
                                            const statusLabel = task.completed
                                                ? "Completed"
                                                : "Pending";

                                            return (
                                                <li
                                                    className={`subtasks-tab-task-card${task.completed ? " subtasks-tab-task-card--completed" : ""}`}
                                                    key={task.id}
                                                >
                                                    <div className="subtasks-tab-task-header">
                                                        <label className="subtasks-tab-task-check">
                                                            <input
                                                                type="checkbox"
                                                                checked={task.completed}
                                                                onChange={() =>
                                                                    handleToggleStatus(task.id)
                                                                }
                                                                aria-label={`Mark "${task.title}" as ${task.completed ? "pending" : "completed"}`}
                                                            />
                                                            <span className="subtasks-tab-task-title">
                                                                {task.title}
                                                            </span>
                                                        </label>
                                                        <span
                                                            className={`subtasks-tab-status-badge subtasks-tab-status-badge--${task.completed ? "completed" : "pending"}`}
                                                        >
                                                            {statusLabel}
                                                        </span>
                                                    </div>

                                                    <div className="subtasks-tab-task-meta">
                                                        <span className="subtasks-tab-task-avatar">
                                                            {task.assignee?.avatar ? (
                                                                <img
                                                                    src={task.assignee.avatar}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <span className="subtasks-tab-task-avatar-fallback">
                                                                    {getInitials(assigneeName)}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="subtasks-tab-task-assignee">
                                                            {assigneeName}
                                                        </span>
                                                        {task.dueDate && (
                                                            <span className="subtasks-tab-task-due">
                                                                Due {formatDueDateTime(task.dueDate, task.dueTime)}
                                                            </span>
                                                        )}
                                                    </div>
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
