import { useCallback, useEffect, useState } from "react";
import { initialData } from "../../../shared/helpers/data";
import { operatorKanbanStaticWorkflows } from "../../../shared/helpers/kanbanOperatorStaticData";
import { mapFullBoardApiResponse } from "../../../shared/helpers/kanbanBoardApiMapper";
import kanbanBoardService from "../../../services/kanbanBoardService";
import { findWorkflowByCardId } from "../utils/boardHelpers";

const isDev =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV;

const isOperatorBoardId = (id) => String(id ?? "").toLowerCase() === "operator";

export default function useKanbanBoardState(selectedBoardId) {
  const [workflows, setWorkflows] = useState(() =>
    isOperatorBoardId(selectedBoardId) ? operatorKanbanStaticWorkflows : initialData
  );
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

  const refetchBoard = useCallback(async () => {
    if (!selectedBoardId || isOperatorBoardId(selectedBoardId)) return;
    setBoardLoading(true);
    setBoardLoadError(null);
    try {
      const res = await kanbanBoardService.getFullBoard(selectedBoardId);
      const payload = res?.data;
      if (isDev) {
        console.log("raw board response", payload?.data ?? payload);
      }
      const mapped = mapFullBoardApiResponse(payload);
      if (isDev) {
        console.log("normalized workflows", mapped);
      }
      setWorkflows(mapped.length ? mapped : []);
      setSelectedCard((prev) => {
        if (!prev?.id) return prev;
        const wf = findWorkflowByCardId(mapped, prev.id);
        const fresh = wf?.cards?.[prev.id];
        return fresh ?? prev;
      });
      setBoardLoadError(null);
    } catch (e) {
      const msg = e?.message ?? String(e);
      if (typeof console !== "undefined" && console.error) {
        console.error("[KanbanBoard] getFullBoard failed:", msg);
      }
      setWorkflows([]);
      setBoardLoadError("Could not load board data.");
    } finally {
      setBoardLoading(false);
    }
  }, [selectedBoardId]);

  useEffect(() => {
    if (!selectedBoardId) {
      setWorkflows(initialData);
      setBoardLoadError(null);
      setBoardLoading(false);
      return undefined;
    }

    if (isOperatorBoardId(selectedBoardId)) {
      setWorkflows(operatorKanbanStaticWorkflows);
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
        if (isDev) {
          console.log("raw board response", payload?.data ?? payload);
        }
        const mapped = mapFullBoardApiResponse(payload);
        if (isDev) {
          console.log("normalized workflows", mapped);
        }
        if (cancelled) return;
        setWorkflows(mapped.length ? mapped : []);
        setBoardLoadError(null);
      } catch (e) {
        if (!cancelled) {
          const msg = e?.message ?? String(e);
          if (typeof console !== "undefined" && console.error) {
            console.error("[KanbanBoard] getFullBoard failed:", msg);
          }
          setWorkflows([]);
          setBoardLoadError("Could not load board data.");
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

  /** Updates a card's accent color in workflow state (e.g. after kanban_card/update_card_color). Avoids full board refetch. */
  const patchCardColor = useCallback((cardId, color) => {
    if (cardId == null || String(cardId).trim() === "") return;
    const id = String(cardId).trim();
    const nextColor = color;
    setWorkflows((prev) =>
      prev.map((wf) => {
        const c = wf.cards?.[id];
        if (!c) return wf;
        return {
          ...wf,
          cards: {
            ...wf.cards,
            [id]: { ...c, color: nextColor },
          },
        };
      })
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, color: nextColor } : prev));
  }, []);

  const patchCardType = useCallback((cardId, cardTypeId, meta = {}) => {
    if (cardId == null || String(cardId).trim() === "") return;
    const id = String(cardId).trim();
    const nextTypeId =
      cardTypeId != null && String(cardTypeId).trim() !== "" ? String(cardTypeId).trim() : null;
    const patch = {
      card_type_id: nextTypeId,
      cardTypeId: nextTypeId,
      type_name: meta.type_name,
      type_color_code: meta.color_code,
      type_icon_name: meta.icon_name,
    };
    setWorkflows((prev) =>
      prev.map((wf) => {
        const c = wf.cards?.[id];
        if (!c) return wf;
        return {
          ...wf,
          cards: {
            ...wf.cards,
            [id]: { ...c, ...patch },
          },
        };
      })
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }, []);

  const patchCardBlocker = useCallback((cardId, blockerId, meta = {}) => {
    if (cardId == null || String(cardId).trim() === "") return;
    const id = String(cardId).trim();
    const nextId =
      blockerId != null && String(blockerId).trim() !== "" ? String(blockerId).trim() : null;
    const patch = {
      card_blocker_id: nextId,
      cardBlockerId: nextId,
      blocker_name: meta.name,
      blocker_color_code: meta.color_code,
      blocker_icon_name: meta.icon_name,
    };
    setWorkflows((prev) =>
      prev.map((wf) => {
        const c = wf.cards?.[id];
        if (!c) return wf;
        return { ...wf, cards: { ...wf.cards, [id]: { ...c, ...patch } } };
      })
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }, []);

  const patchCardSticker = useCallback((cardId, stickerId, meta = {}) => {
    if (cardId == null || String(cardId).trim() === "") return;
    const id = String(cardId).trim();
    const nextId =
      stickerId != null && String(stickerId).trim() !== "" ? String(stickerId).trim() : null;
    const patch = {
      card_sticker_id: nextId,
      cardStickerId: nextId,
      sticker_name: meta.name,
      sticker_color_code: meta.color_code,
      sticker_icon_name: meta.icon_name,
    };
    setWorkflows((prev) =>
      prev.map((wf) => {
        const c = wf.cards?.[id];
        if (!c) return wf;
        return { ...wf, cards: { ...wf.cards, [id]: { ...c, ...patch } } };
      })
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }, []);

  const patchCardTag = useCallback((cardId, tagId, meta = {}) => {
    if (cardId == null || String(cardId).trim() === "") return;
    const id = String(cardId).trim();
    const nextId = tagId != null && String(tagId).trim() !== "" ? String(tagId).trim() : null;
    const patch = {
      card_tag_id: nextId,
      cardTagId: nextId,
      tag_id: nextId,
      tag_name: meta.name,
      tag_color_code: meta.color_code,
      tag_icon_name: meta.icon_name,
    };
    setWorkflows((prev) =>
      prev.map((wf) => {
        const c = wf.cards?.[id];
        if (!c) return wf;
        return { ...wf, cards: { ...wf.cards, [id]: { ...c, ...patch } } };
      })
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }, []);

  return {
    workflows,
    setWorkflows,
    refetchBoard,
    patchCardColor,
    patchCardType,
    patchCardBlocker,
    patchCardSticker,
    patchCardTag,
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
