import { useState, useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import userService from "../../../../../../services/userService";
import { PRE_ARRIVAL_GRO_ROLE_ID } from "../../../../CardFormTabs/tabs/operation/operationConstants";
import { getGroSupervisorStaticDocuments } from "./groSupervisorStaticDocuments";
import {
  getGroSupervisorTasksForCard,
  createEmptyTaskAssignment,
} from "./groSupervisorStaticTasks";
import GROSupervisorTabs from "./GROSupervisorTabs";
import GROSupervisorAssignTask from "./GROSupervisorAssignTask";
import GROSupervisorDocumentLibrary from "./GROSupervisorDocumentLibrary";

const SUPERVISOR_TABS = {
  assign: "assign",
  documents: "documents",
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
  const tasks = useMemo(() => getGroSupervisorTasksForCard(card), [card]);
  const staticDocuments = useMemo(() => getGroSupervisorStaticDocuments(), []);

  const [activeTab, setActiveTab] = useState(SUPERVISOR_TABS.assign);
  const [assignments, setAssignments] = useState(() => {
    const initial = {};
    getGroSupervisorTasksForCard(card).forEach((t) => {
      initial[t.id] = createEmptyTaskAssignment();
    });
    return initial;
  });
  const [userOptions, setUserOptions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    setAssignments((prev) => {
      const next = { ...prev };
      tasks.forEach((t) => {
        if (!next[t.id]) next[t.id] = createEmptyTaskAssignment();
      });
      return next;
    });
  }, [tasks]);

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

  const handleAssignmentChange = useCallback((taskId, patch) => {
    setAssignments((prev) => ({
      ...prev,
      [taskId]: { ...(prev[taskId] ?? createEmptyTaskAssignment()), ...patch },
    }));
  }, []);

  return (
    <div className="gro-card-view gro-supervisor-card-view">
      <div className="gro-supervisor-layout">
        <GROSupervisorTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="gro-supervisor-right">
          {activeTab === SUPERVISOR_TABS.assign ? (
            <GROSupervisorAssignTask
              tasks={tasks}
              assignments={assignments}
              onAssignmentChange={handleAssignmentChange}
              userOptions={userOptions}
              usersLoading={usersLoading}
            />
          ) : (
            <GROSupervisorDocumentLibrary documents={staticDocuments} hideHeading />
          )}
        </div>
      </div>
    </div>
  );
}

GROSupervisorCardView.propTypes = {
  card: PropTypes.object,
};

export default GROSupervisorCardView;
