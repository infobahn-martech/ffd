import { useCallback, useEffect, useState } from "react";
import { initialData } from "../../../shared/helpers/data";
import { operatorKanbanStaticWorkflows } from "../../../shared/helpers/kanbanOperatorStaticData";
import {
  mapFullBoardApiResponse,
  extractFullBoardBackground,
} from "../../../shared/helpers/kanbanBoardApiMapper";
import kanbanBoardService from "../../../services/kanbanBoardService";
import daService from "../../../services/daService";
import { findWorkflowByCardId } from "../utils/boardHelpers";
import { movePureCardToColumn } from "../utils/columnHelpers";
import { reorderWorkflowsByPinState } from "../utils/workflowHelpers";

const isDev =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV;

const isOperatorBoardId = (id) => String(id ?? "").toLowerCase() === "operator";

/** Pinned workflows (from `is_pinned` on get_full_board) sort to the front, order preserved otherwise. */
const sortByPinState = (mapped) => {
  const pinState = Object.fromEntries(mapped.map((wf) => [wf.id, Boolean(wf.isPinned)]));
  return reorderWorkflowsByPinState(pinState, mapped);
};

// Centralized DA Desk board (board_id "3") only. Backend gap: api/da/advance_stage doesn't
// persist the board's own column — confirmed via direct test, a raw page reload still shows a
// moved DA card back in its pre-move column. DA's own per-call stage (api/da/card/{call_id}) is
// accurate, so on every load/refetch of this board we fetch it for every card and correct the
// freshly-loaded layout to match. This is N+1 network calls by design (explicitly requested,
// board can be slow to settle) — drop this once the backend persists the column itself.
const reconcileDABoardColumns = async (mappedWorkflows, boardIdParam, setWorkflowsFn) => {
  if (String(boardIdParam ?? "") !== "3") return;

  const cardRefs = [];
  for (const wf of mappedWorkflows) {
    for (const cardId of Object.keys(wf.cards || {})) {
      const callIdRaw = wf.cards[cardId]?.callId;
      const callId = callIdRaw != null ? String(callIdRaw).trim() : "";
      if (callId) cardRefs.push({ workflowId: wf.id, cardId, callId });
    }
  }
  if (cardRefs.length === 0) return;

  const wfById = Object.fromEntries(mappedWorkflows.map((wf) => [wf.id, wf]));
  const results = await Promise.allSettled(
    cardRefs.map((ref) => daService.getCardStage(ref.callId))
  );

  const moves = [];
  results.forEach((res, i) => {
    if (res.status !== "fulfilled") return;
    const columnName = res.value?.data?.data?.column_name;
    if (!columnName) return;
    const ref = cardRefs[i];
    const wf = wfById[ref.workflowId];
    if (!wf) return;
    const colKey = Object.keys(wf.columns).find((k) => wf.columns[k]?.title === columnName);
    const targetColumnId = colKey ? wf.columns[colKey]?.id : null;
    if (targetColumnId) moves.push({ cardId: ref.cardId, targetColumnId });
  });
  if (moves.length === 0) return;

  setWorkflowsFn((prev) =>
    moves.reduce((acc, move) => movePureCardToColumn(acc, move.cardId, move.targetColumnId), prev)
  );
};

export default function useKanbanBoardState(selectedBoardId) {
  const [workflows, setWorkflows] = useState(() =>
    isOperatorBoardId(selectedBoardId) ? operatorKanbanStaticWorkflows : []
  );
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardLoadError, setBoardLoadError] = useState(null);
  const [boardBackground, setBoardBackground] = useState(null);
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
      const mapped = sortByPinState(mapFullBoardApiResponse(payload));
      setWorkflows(mapped);
      setBoardBackground(extractFullBoardBackground(payload));
      setSelectedCard((prev) => {
        if (!prev?.id) return prev;
        const wf = findWorkflowByCardId(mapped, prev.id);
        const fresh = wf?.cards?.[prev.id];
        return fresh ?? prev;
      });
      setBoardLoadError(null);
      reconcileDABoardColumns(mapped, selectedBoardId, setWorkflows);
    } catch (e) {
      const msg = e?.message ?? String(e);
      setWorkflows([]);
      setBoardLoadError("Could not load board data.");
    } finally {
      setBoardLoading(false);
    }
  }, [selectedBoardId]);

  useEffect(() => {
    if (!selectedBoardId) {
      setWorkflows(initialData);
      setBoardBackground(null);
      setBoardLoadError(null);
      setBoardLoading(false);
      return undefined;
    }

    if (isOperatorBoardId(selectedBoardId)) {
      setWorkflows(operatorKanbanStaticWorkflows);
      setBoardBackground(null);
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
        const mapped = sortByPinState(mapFullBoardApiResponse(payload));
        if (cancelled) return;
        setWorkflows(mapped);
        setBoardBackground(extractFullBoardBackground(payload));
        setBoardLoadError(null);
        reconcileDABoardColumns(mapped, selectedBoardId, (updater) => {
          if (!cancelled) setWorkflows(updater);
        });
      } catch (e) {
        if (!cancelled) {
          const msg = e?.message ?? String(e);
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
    const handleShowWorkspaces = () => setShowWorkspaces(true);
    const handleHideWorkspaces = () => setShowWorkspaces(false);

    const handleSubtaskCardCreated = () => {
      refetchBoard();
    };

    window.addEventListener("kanban:show-workspaces", handleShowWorkspaces);
    window.addEventListener("kanban:hide-workspaces", handleHideWorkspaces);
    window.addEventListener("subtask:card-created", handleSubtaskCardCreated);

    return () => {
      window.removeEventListener("kanban:show-workspaces", handleShowWorkspaces);
      window.removeEventListener("kanban:hide-workspaces", handleHideWorkspaces);
      window.removeEventListener("subtask:card-created", handleSubtaskCardCreated);
    };
  }, [refetchBoard]);

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

  /** Updates a card's title in workflow state (e.g. after kanban_card/update_card_title). Avoids full board refetch. */
  const patchCardTitle = useCallback((cardId, title) => {
    if (cardId == null || String(cardId).trim() === "") return;
    const id = String(cardId).trim();
    setWorkflows((prev) =>
      prev.map((wf) => {
        const c = wf.cards?.[id];
        if (!c) return wf;
        return {
          ...wf,
          cards: {
            ...wf.cards,
            [id]: { ...c, title },
          },
        };
      })
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, title } : prev));
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
    patchCardTitle,
    patchCardType,
    patchCardBlocker,
    patchCardSticker,
    patchCardTag,
    boardLoading,
    boardLoadError,
    boardBackground,
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
