import { useEffect } from 'react';
import { useKanbanSidebarBridge } from '../store/kanbanSidebarBridge';

/** Mirrors normalized workflow fields so SideNav can apply the same add-card rules as on /operator. */
export default function useSyncKanbanSidebarWorkflows(workflows) {
  const setBoardWorkflows = useKanbanSidebarBridge((s) => s.setBoardWorkflows);

  useEffect(() => {
    const list = (workflows || []).map((w) => ({
      id: w.id,
      name: w.title ?? w.name ?? 'Workflow',
      title: w.title ?? w.name ?? 'Workflow',
      description: w.description,
      swimlaneOrder: w.swimlaneOrder,
      swimlanes: w.swimlanes,
      columnOrder: w.columnOrder,
      columns: w.columns,
    }));
    setBoardWorkflows(list);
    return () => setBoardWorkflows([]);
  }, [workflows, setBoardWorkflows]);
}
