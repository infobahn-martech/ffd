import { useCallback } from "react";
import { findColumnByCardId, movePureCardToColumn } from "../utils/columnHelpers";

/** Matches WorkflowColumns / SwimlaneColumnCell droppable ids: `${laneId}::${columnStableId}` */
export const parseSwimlaneDroppableId = (droppableId) => {
  const sep = "::";
  const i = droppableId.indexOf(sep);
  if (i === -1) return null;
  return {
    laneId: droppableId.slice(0, i),
    columnStableId: droppableId.slice(i + sep.length),
  };
};

export const buildSwimlaneDroppableId = (laneId, columnStableId) => `${laneId}::${columnStableId}`;

const applyCrossColumnMove = (
  prevWorkflows,
  workflowId,
  {
    src,
    dest,
    draggableId,
    startColumnKey,
    finishColumnKey,
    sourceIndex,
    destinationIndex,
    startLane,
    finishLane,
  }
) => {
  const sameLane = src.laneId === dest.laneId;
  const startList = Array.from(startLane.cardMap[startColumnKey] || []);
  startList.splice(sourceIndex, 1);

  const finishList = Array.from(
    sameLane ? startLane.cardMap[finishColumnKey] || [] : finishLane.cardMap[finishColumnKey] || []
  );
  finishList.splice(destinationIndex, 0, draggableId);

  const workflow = prevWorkflows.find((item) => item.id === workflowId);
  const card = workflow?.cards?.[draggableId];
  let nextCard = card;
  if (card && (finishColumnKey !== card.columnId || dest.laneId !== card.laneId)) {
    nextCard = { ...card, columnId: finishColumnKey, laneId: dest.laneId };
  }

  return prevWorkflows.map((item) => {
    if (item.id !== workflowId) return item;

    if (sameLane) {
      const lane = item.swimlanes[src.laneId];
      return {
        ...item,
        swimlanes: {
          ...item.swimlanes,
          [src.laneId]: {
            ...lane,
            cardMap: {
              ...lane.cardMap,
              [startColumnKey]: startList,
              [finishColumnKey]: finishList,
            },
          },
        },
        cards: nextCard ? { ...item.cards, [draggableId]: nextCard } : item.cards,
      };
    }

    const sLane = item.swimlanes[src.laneId];
    const fLane = item.swimlanes[dest.laneId];
    return {
      ...item,
      swimlanes: {
        ...item.swimlanes,
        [src.laneId]: {
          ...sLane,
          cardMap: {
            ...sLane.cardMap,
            [startColumnKey]: startList,
          },
        },
        [dest.laneId]: {
          ...fLane,
          cardMap: {
            ...fLane.cardMap,
            [finishColumnKey]: finishList,
          },
        },
      },
      cards: nextCard ? { ...item.cards, [draggableId]: nextCard } : item.cards,
    };
  });
};

/**
 * Generic Kanban drag-and-drop: reorders within a column, or moves a card between
 * columns/swimlanes, purely in local board state. There is currently no generic
 * "move card" API endpoint to persist this to — that's the extension point for
 * whichever backend contract FFD ends up wiring in (a per-board-type `onCardMove`
 * callback would be a natural shape once that contract exists).
 */
export default function useKanbanDnD(workflows, setWorkflows) {
  const findCardColumn = useCallback(
    (cardId) => findColumnByCardId(workflows, cardId),
    [workflows]
  );

  // Resolves the card's current lane/column from `prev` (the live state at update time) rather
  // than a closed-over `workflows` snapshot, so a caller that fires after an intervening state
  // update still finds — and moves from — the card's real current position instead of a stale one.
  const moveCardToColumn = useCallback(
    (cardId, targetColumnId) => {
      setWorkflows((prev) => movePureCardToColumn(prev, cardId, targetColumnId));
    },
    [setWorkflows]
  );

  const createDragEndHandler = useCallback(
    (workflowId) => async (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const workflow = workflows.find((item) => item.id === workflowId);
      if (!workflow) return;

      const src = parseSwimlaneDroppableId(source.droppableId);
      const dest = parseSwimlaneDroppableId(destination.droppableId);
      if (!src || !dest) return;

      const startColumnKey = Object.keys(workflow.columns).find(
        (k) => workflow.columns[k].id === src.columnStableId
      );
      const finishColumnKey = Object.keys(workflow.columns).find(
        (k) => workflow.columns[k].id === dest.columnStableId
      );
      if (!startColumnKey || !finishColumnKey) return;

      const startLane = workflow.swimlanes[src.laneId];
      const finishLane = workflow.swimlanes[dest.laneId];
      if (!startLane?.cardMap || !finishLane?.cardMap) return;

      const sameLane = src.laneId === dest.laneId;
      const sameColumn = startColumnKey === finishColumnKey;

      if (sameLane && sameColumn) {
        const list = Array.from(startLane.cardMap[startColumnKey] || []);
        list.splice(source.index, 1);
        list.splice(destination.index, 0, draggableId);

        setWorkflows((prev) =>
          prev.map((item) => {
            if (item.id !== workflowId) return item;
            const lane = item.swimlanes[src.laneId];
            return {
              ...item,
              swimlanes: {
                ...item.swimlanes,
                [src.laneId]: {
                  ...lane,
                  cardMap: {
                    ...lane.cardMap,
                    [startColumnKey]: list,
                  },
                },
              },
            };
          })
        );
        return;
      }

      const moveParams = {
        src,
        dest,
        draggableId,
        startColumnKey,
        finishColumnKey,
        sourceIndex: source.index,
        destinationIndex: destination.index,
        startLane,
        finishLane,
      };

      setWorkflows((prev) => applyCrossColumnMove(prev, workflowId, moveParams));
    },
    [workflows, setWorkflows]
  );

  return {
    findCardColumn,
    moveCardToColumn,
    createDragEndHandler,
  };
}
