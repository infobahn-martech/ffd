import { useEffect } from 'react';

export default function useKanbanAddCardFromSidebar({ setSelectedCard, setIsAddMode, setAddTargetWorkflowId }) {
  useEffect(() => {
    const handleAddCard = (e) => {
      const d = e?.detail || {};
      const laneId = d.swimlaneId ?? d.swimlane_id ?? d.laneId ?? null;
      const laneName = d.swimlaneName ?? d.swimlane_name ?? null;
      const callTypeId = d.callTypeId ?? d.call_type_id ?? null;
      const callTypeName = d.callTypeName ?? d.call_type ?? null;
      const portId = d.portId ?? d.port_id ?? null;
      const portName = d.portName ?? d.port_name ?? null;
      const newCard = {
        id: `new-${Date.now()}`,
        title: '',
        color: '#2A00FF',
        ...(laneId != null && laneId !== ''
          ? { laneId, laneName, swimlane_id: laneId }
          : {}),
        ...(callTypeId != null && callTypeId !== ''
          ? { call_type_id: callTypeId, typeOfCall: callTypeId, call_type: callTypeName }
          : {}),
        ...(portId != null && portId !== ''
          ? { port_id: portId, port: portId, port_name: portName }
          : {}),
      };
      setSelectedCard(newCard);
      setIsAddMode(true);
      if (d.workflowId != null && d.workflowId !== '') {
        setAddTargetWorkflowId(d.workflowId);
      } else {
        setAddTargetWorkflowId(null);
      }
    };

    window.addEventListener('kanban:add-card', handleAddCard);
    return () => window.removeEventListener('kanban:add-card', handleAddCard);
  }, [setSelectedCard, setIsAddMode, setAddTargetWorkflowId]);
}
