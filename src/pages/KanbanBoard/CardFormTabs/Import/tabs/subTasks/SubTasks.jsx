import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import "../../../../../../design/scss/invoice.scss";

const DUMMY_USERS = [
    { user_id: 1, user_name: "Sarah Mitchell", avatar: null },
    { user_id: 2, user_name: "James Chen", avatar: null },
    { user_id: 3, user_name: "Elena Rodriguez", avatar: null },
    { user_id: 4, user_name: "Omar Hassan", avatar: null },
];

const getUserById = (userId) =>
    DUMMY_USERS.find((user) => String(user.user_id) === String(userId)) ?? null;

const formatDueDate = (dateStr) => {
    if (!dateStr) return "";
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getInitials = (name) => (name || "?").charAt(0).toUpperCase();

function Subtasks({ card }) {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [assignUserId, setAssignUserId] = useState("");
    const [dueDate, setDueDate] = useState("");

    const hasTasks = tasks.length > 0;

    const resetForm = useCallback(() => {
        setTitle("");
        setAssignUserId("");
        setDueDate("");
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
                completed: false,
            },
        ]);

        resetForm();

        console.log("[Subtasks] task saved (local)", {
            card_id: card?.id || card?.card_id || card?.call_id,
            title: trimmedTitle,
            assign_user_id: assignUserId || null,
            due_date: dueDate || null,
        });
    }, [title, assignUserId, dueDate, card, resetForm]);

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
                                        <select
                                            id="subtask-assignee"
                                            className="subtasks-tab-select"
                                            value={assignUserId}
                                            onChange={(event) => setAssignUserId(event.target.value)}
                                        >
                                            <option value="">Select user</option>
                                            {DUMMY_USERS.map((user) => (
                                                <option key={user.user_id} value={user.user_id}>
                                                    {user.user_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="subtasks-tab-field">
                                        <label className="subtasks-tab-label" htmlFor="subtask-due-date">
                                            Due Date
                                        </label>
                                        <input
                                            id="subtask-due-date"
                                            type="date"
                                            className="subtasks-tab-date-input"
                                            value={dueDate}
                                            onChange={(event) => setDueDate(event.target.value)}
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
                                                                Due {formatDueDate(task.dueDate)}
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
