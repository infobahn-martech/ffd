import { useState, useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import SearchableSelect, { deriveSearchPlaceholder } from "../../../../../../components/form/SearchableSelect";
import DateTimePickerField from "../../../../CardFormTabs/components/DateTimePickerField";
import userService from "../../../../../../services/userService";
import { PRE_ARRIVAL_GRO_ROLE_ID } from "../../../../CardFormTabs/tabs/operation/operationConstants";
import { getGroSupervisorStaticDocuments } from "./groSupervisorStaticDocuments";
import GROSupervisorDocumentLibrary from "./GROSupervisorDocumentLibrary";

const resolveTaskTitle = (card) => {
  const candidates = [
    card?.task_name,
    card?.taskName,
    card?.raw?.task_name,
    card?.raw?.taskName,
    card?.title,
    card?.cardName,
    card?.card_name,
  ];
  for (const c of candidates) {
    if (c != null && String(c).trim() !== "") return String(c).trim();
  }
  return "Task";
};

const parseUsersByRoleResponse = (res) => {
  const body = res?.data ?? res;
  const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  return list
    .map((row) => {
      const id = row?.user_id ?? row?.id ?? row?.userid;
      if (id == null || String(id).trim() === "") return null;
      const label =
        row?.name ??
        row?.user_name ??
        row?.username ??
        row?.full_name ??
        `User ${id}`;
      return { value: String(id), label: String(label).trim() || `User ${id}` };
    })
    .filter(Boolean);
};

function GROSupervisorCardView({ card }) {
  const taskTitle = useMemo(() => resolveTaskTitle(card), [card]);
  const staticDocuments = useMemo(() => getGroSupervisorStaticDocuments(), []);

  const [assignedUserId, setAssignedUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUsersLoading(true);
    userService
      .getUsersByRole({ role_id: PRE_ARRIVAL_GRO_ROLE_ID })
      .then((res) => {
        if (cancelled) return;
        setUserOptions(parseUsersByRoleResponse(res));
      })
      .catch(() => {
        if (!cancelled) setUserOptions([]);
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAssignedUserChange = useCallback((e) => {
    setAssignedUserId(e?.target?.value ?? "");
  }, []);

  const handleDueDateTimeChange = useCallback(({ date, time }) => {
    setDueDate(date || "");
    setDueTime(time != null && time !== "" ? String(time).slice(0, 5) : "");
  }, []);

  return (
    <div className="gro-card-view gro-supervisor-card-view">
      <section className="gro-supervisor-section gro-supervisor-task-section" aria-labelledby="gro-supervisor-task-heading">
        <div className="gro-supervisor-section-head">
          <h3 id="gro-supervisor-task-heading" className="gro-supervisor-section-title">
            Task Assign User
          </h3>
        </div>
        <div className="gro-supervisor-task-card">
          <div className="gro-supervisor-task-name-block">
            <span className="gro-supervisor-field-label">Task</span>
            <p className="gro-supervisor-task-name">{taskTitle}</p>
          </div>
          <div className="gro-supervisor-task-form-grid">
            <div className="gro-supervisor-field">
              <label className="gro-supervisor-field-label">Assigned User</label>
              <div className="cf-select gro-supervisor-select-wrap">
                <SearchableSelect
                  value={assignedUserId}
                  onChange={handleAssignedUserChange}
                  options={userOptions}
                  placeholder={usersLoading ? "Loading users…" : "Select assigned user"}
                  searchPlaceholder={deriveSearchPlaceholder("Select assigned user")}
                  disabled={usersLoading}
                  className="gro-supervisor-searchable-select"
                />
              </div>
            </div>
            <div className="gro-supervisor-field gro-supervisor-field--datetime">
              <label className="gro-supervisor-field-label" htmlFor="gro-supervisor-due-datetime">
                Due Date
              </label>
              <DateTimePickerField
                dateValue={dueDate}
                timeValue={dueTime}
                onDateTimeChange={handleDueDateTimeChange}
                placeholder="YYYY-MM-DD hh:mm"
                popperClassName="gro-supervisor-datetime-popper"
              />
            </div>
            <div className="gro-supervisor-field gro-supervisor-field--remarks">
              <label className="gro-supervisor-field-label" htmlFor="gro-supervisor-remarks">
                Remarks
              </label>
              <textarea
                id="gro-supervisor-remarks"
                className="gro-supervisor-remarks-input"
                rows={3}
                placeholder="Add remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <GROSupervisorDocumentLibrary documents={staticDocuments} />
    </div>
  );
}

GROSupervisorCardView.propTypes = {
  card: PropTypes.object,
};

export default GROSupervisorCardView;
