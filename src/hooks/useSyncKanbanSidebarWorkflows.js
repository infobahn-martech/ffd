import { useEffect } from 'react';
import { useKanbanSidebarBridge } from '../store/kanbanSidebarBridge';

export default function useSyncKanbanSidebarWorkflows(workflows) {
  const setBoardWorkflows = useKanbanSidebarBridge((s) => s.setBoardWorkflows);

  useEffect(() => {
    const list = (workflows || []).map((w) => ({
      id: w.id,
      name: w.title ?? w.name ?? 'Workflow',
    }));
    setBoardWorkflows(list);
    return () => setBoardWorkflows([]);
  }, [workflows, setBoardWorkflows]);
}
