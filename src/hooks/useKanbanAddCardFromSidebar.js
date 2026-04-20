import { useEffect } from 'react';

export default function useKanbanAddCardFromSidebar({ setSelectedCard, setIsAddMode, setAddTargetWorkflowId }) {
  useEffect(() => {
    const handleAddCard = (e) => {
      const d = e?.detail || {};
      const laneId = d.swimlaneId ?? d.swimlane_id ?? d.laneId ?? null;
      const laneName = d.swimlaneName ?? d.swimlane_name ?? null;
      const newCard = {
        id: `new-${Date.now()}`,
        title: '',
        color: '#2A00FF',
        ...(laneId != null && laneId !== '' ? { laneId, laneName } : {}),
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
