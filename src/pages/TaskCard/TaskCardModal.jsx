import { useState, useCallback, useEffect } from "react";
import DateTimePickerField from "../KanbanBoard/CardFormTabs/components/DateTimePickerField";
import userService from "../../services/userService";
import "../../design/css/common/CardForm.css";
import "../../design/scss/pages/taskCard.scss";

function TaskCardModal({ show, onClose }) {
    const [cardTitle, setCardTitle] = useState("");
    const [taskName, setTaskName] = useState("");
    const [assignUserId, setAssignUserId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [taskNameError, setTaskNameError] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!show) return;
        userService.getUsers({ params: { limit: 200 } })
            .then(({ data }) => setUsers(data?.data || []))
            .catch(() => setUsers([]));
    }, [show]);

    const handleReset = useCallback(() => {
        setCardTitle("");
        setTaskName("");
        setAssignUserId("");
        setDueDate("");
        setDueTime("");
        setTaskNameError("");
    }, []);

    const handleClose = useCallback(() => {
        handleReset();
        onClose();
    }, [handleReset, onClose]);

    const handleSave = useCallback(() => {
        if (!taskName.trim()) {
            setTaskNameError("Task description is required");
            return;
        }
        setTaskNameError("");

        const assignedUser = users.find((u) => String(u.user_id) === String(assignUserId));
        const dueDateDisplay = dueDate ? (dueTime ? `${dueDate} ${dueTime}` : dueDate) : "";
        const newTask = {
            id: Date.now(),
            cardTitle: cardTitle || "Task Card",
            taskName: taskName.trim(),
            assignUserId,
            assignedUserName: assignedUser?.name || "",
            dueDate: dueDateDisplay,
            isSubTask: true,
        };

        window.dispatchEvent(new CustomEvent("subtask:card-created", { detail: newTask }));
        handleReset();
    }, [cardTitle, taskName, assignUserId, dueDate, dueTime, users, handleReset]);

    if (!show) return null;

    return (
        <div className="cardform-overlay">
            <div className="cardform-panel add-mode">

                <div className="cardform-topbar tc-topbar">
                    <input
                        type="text"
                        className="cardform-title-input"
                        placeholder="Enter card title"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        autoFocus
                    />
                    <div className="cardform-topbar-right">
                        <button type="button" className="cardform-close-btn" onClick={handleClose}>✕</button>
                    </div>
                </div>

                <div className="tc-body">
                    <h3 className="tc-form-title">Create Task Card</h3>

                    <div className="tc-field">
                        <label className="tc-label" htmlFor="tc-task-name">
                            Task Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                            id="tc-task-name"
                            className={`tc-textarea${taskNameError ? " is-invalid" : ""}`}
                            rows={3}
                            placeholder="Enter task description..."
                            value={taskName}
                            onChange={(e) => { setTaskName(e.target.value); setTaskNameError(""); }}
                        />
                        {taskNameError && <span className="tc-field-error">{taskNameError}</span>}
                    </div>

                    <div className="tc-field-row">
                        <div className="tc-field">
                            <label className="tc-label" htmlFor="tc-assign-user">Assign User</label>
                            <select
                                id="tc-assign-user"
                                className="tc-select"
                                value={assignUserId}
                                onChange={(e) => setAssignUserId(e.target.value)}
                            >
                                <option value="">Select user</option>
                                {users.map((u) => (
                                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="tc-field">
                            <label className="tc-label">Due Date &amp; Time</label>
                            <DateTimePickerField
                                dateValue={dueDate}
                                timeValue={dueTime}
                                onDateChange={(e) => setDueDate(e.target.value)}
                                onTimeChange={(e) => setDueTime(e.target.value)}
                                dateFieldName="dueDate"
                                timeFieldName="dueTime"
                                placeholder="Select date and time"
                            />
                        </div>
                    </div>

                    <div className="tc-save-row">
                        <button type="button" className="tc-cancel-btn" onClick={handleClose}>Cancel</button>
                        <button type="button" className="tc-save-btn" onClick={handleSave}>Create Task</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TaskCardModal;
