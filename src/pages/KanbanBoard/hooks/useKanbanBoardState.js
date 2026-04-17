import { useCallback, useEffect, useState } from "react";
import { initialData } from "../../../helpers/data";
import { mapFullBoardApiResponse } from "../../../helpers/kanbanBoardApiMapper";
import kanbanBoardService from "../../../services/kanbanBoardService";

export default function useKanbanBoardState(selectedBoardId) {
  const [workflows, setWorkflows] = useState(initialData);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardLoadError, setBoardLoadError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const [addTargetWorkflowId, setAddTargetWorkflowId] = useState(null);

  useEffect(() => {
    setSelectedCard(null);
    setIsAddMode(false);
    setAddTargetWorkflowId(null);
  }, [selectedBoardId]);

  useEffect(() => {
    if (!selectedBoardId) {
      setWorkflows(initialData);
      setBoardLoadError(null);
      setBoardLoading(false);
      return undefined;
    }

    let cancelled = false;
    setBoardLoading(true);
    setBoardLoadError(null);

    (async () => {
      try {
        const res = await kanbanBoardService.getFullBoard(selectedBoardId);
        const payload = res?.data;
        const mapped = mapFullBoardApiResponse(payload);
        if (cancelled) return;
        if (!mapped.length) {
          setWorkflows(initialData);
        } else {
          setWorkflows(mapped);
        }
        setBoardLoadError(null);
      } catch (e) {
        if (!cancelled) {
          const msg = e?.message ?? String(e);
          if (typeof console !== "undefined" && console.error) {
            console.error("[KanbanBoard] getFullBoard failed:", msg);
          }
          setWorkflows(initialData);
          setBoardLoadError("Could not load board data. Showing sample data.");
        }
      } finally {
        if (!cancelled) setBoardLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBoardId]);

  useEffect(() => {
    const handleShowWorkspaces = () => {
      setShowWorkspaces(true);
    };

    const handleHideWorkspaces = () => {
      setShowWorkspaces(false);
    };

    window.addEventListener("kanban:show-workspaces", handleShowWorkspaces);
    window.addEventListener("kanban:hide-workspaces", handleHideWorkspaces);

    return () => {
      window.removeEventListener("kanban:show-workspaces", handleShowWorkspaces);
      window.removeEventListener("kanban:hide-workspaces", handleHideWorkspaces);
    };
  }, []);

  const handleSelectCard = useCallback((card) => {
    setSelectedCard(card);
    setIsAddMode(false);
    setAddTargetWorkflowId(null);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedCard(null);
    setIsAddMode(false);
    setAddTargetWorkflowId(null);
  }, []);

  return {
    workflows,
    setWorkflows,
    boardLoading,
    boardLoadError,
    selectedCard,
    setSelectedCard,
    isAddMode,
    setIsAddMode,
    showWorkspaces,
    addTargetWorkflowId,
    setAddTargetWorkflowId,
    handleSelectCard,
    handleCloseCard,
  };
}
