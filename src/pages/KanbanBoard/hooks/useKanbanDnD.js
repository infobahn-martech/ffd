import { useCallback } from "react";
import {
  findColumnByCardId,
  findLaneColumnLocationForCard,
} from "../utils/columnHelpers";
import { findWorkflowByCardId } from "../utils/boardHelpers";

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

export default function useKanbanDnD(workflows, setWorkflows) {
  const findCardColumn = useCallback(
    (cardId) => findColumnByCardId(workflows, cardId),
    [workflows]
  );

  const moveCardToColumn = useCallback(
    (cardId, targetColumnId) => {
      const workflow = findWorkflowByCardId(workflows, cardId);
      if (!workflow) return;

      const laneCol = findLaneColumnLocationForCard(workflow, cardId);
      const targetColKey = Object.keys(workflow.columns).find(
        (k) => workflow.columns[k].id === targetColumnId
      );

      if (!laneCol || !targetColKey) return;
      if (laneCol.columnKey === targetColKey) return;

      const { laneId, columnKey: sourceKey } = laneCol;

      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflow.id) return w;

          const lane = w.swimlanes[laneId];
          if (!lane?.cardMap) return w;

          const sourceIds = [...(lane.cardMap[sourceKey] || [])];
          const idx = sourceIds.indexOf(cardId);
          if (idx === -1) return w;
          sourceIds.splice(idx, 1);

          const targetIds = [...(lane.cardMap[targetColKey] || [])];
          targetIds.unshift(cardId);

          const card = w.cards[cardId];
          if (!card) return w;

          return {
            ...w,
            swimlanes: {
              ...w.swimlanes,
              [laneId]: {
                ...lane,
                cardMap: {
                  ...lane.cardMap,
                  [sourceKey]: sourceIds,
                  [targetColKey]: targetIds,
                },
              },
            },
            cards: {
              ...w.cards,
              [cardId]: { ...card, columnId: targetColKey },
            },
          };
        })
      );
    },
    [workflows, setWorkflows]
  );

  const createDragEndHandler = useCallback(
    (workflowId) => (result) => {
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

      const startList = Array.from(startLane.cardMap[startColumnKey] || []);
      startList.splice(source.index, 1);

      const finishList = Array.from(
        sameLane ? startLane.cardMap[finishColumnKey] || [] : finishLane.cardMap[finishColumnKey] || []
      );
      finishList.splice(destination.index, 0, draggableId);

      const card = workflow.cards[draggableId];
      let nextCard = card;
      if (card) {
        if (finishColumnKey !== card.columnId || dest.laneId !== card.laneId) {
          nextCard = { ...card, columnId: finishColumnKey, laneId: dest.laneId };
        }
      }

      setWorkflows((prev) =>
        prev.map((item) => {
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
        })
      );
    },
    [workflows, setWorkflows]
  );

  return {
    findCardColumn,
    moveCardToColumn,
    createDragEndHandler,
  };
}
