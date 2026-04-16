import { useCallback } from "react";
import {
  findColumnByCardId,
  findColumnLocationById,
} from "../utils/columnHelpers";

export default function useKanbanDnD(workflows, setWorkflows) {
  const findCardColumn = useCallback(
    (cardId) => findColumnByCardId(workflows, cardId),
    [workflows]
  );

  const moveCardToColumn = useCallback(
    (cardId, targetColumnId) => {
      const sourceColumn = findCardColumn(cardId);
      if (!sourceColumn) return;

      const sourceLocation = findColumnLocationById(workflows, sourceColumn.id);
      const targetLocation = findColumnLocationById(workflows, targetColumnId);

      if (!sourceLocation || !targetLocation) return;
      if (sourceColumn.id === targetColumnId) return;

      const startCardIds = Array.from(sourceColumn.cardIds);
      const cardIndex = startCardIds.indexOf(cardId);
      if (cardIndex === -1) return;

      startCardIds.splice(cardIndex, 1);
      const newStart = { ...sourceColumn, cardIds: startCardIds };

      const finishCardIds = Array.from(targetLocation.column.cardIds);
      finishCardIds.unshift(cardId);
      const newFinish = { ...targetLocation.column, cardIds: finishCardIds };

      setWorkflows((prevWorkflows) => {
        const updated = [...prevWorkflows];

        if (sourceLocation.workflowIndex === targetLocation.workflowIndex) {
          updated[sourceLocation.workflowIndex] = {
            ...updated[sourceLocation.workflowIndex],
            columns: {
              ...updated[sourceLocation.workflowIndex].columns,
              [sourceLocation.columnKey]: newStart,
              [targetLocation.columnKey]: newFinish,
            },
          };
        } else {
          updated[sourceLocation.workflowIndex] = {
            ...updated[sourceLocation.workflowIndex],
            columns: {
              ...updated[sourceLocation.workflowIndex].columns,
              [sourceLocation.columnKey]: newStart,
            },
          };
          updated[targetLocation.workflowIndex] = {
            ...updated[targetLocation.workflowIndex],
            columns: {
              ...updated[targetLocation.workflowIndex].columns,
              [targetLocation.columnKey]: newFinish,
            },
          };
        }

        return updated;
      });
    },
    [findCardColumn, workflows, setWorkflows]
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

      const start = Object.values(workflow.columns).find(
        (col) => col.id === source.droppableId
      );
      const finish = Object.values(workflow.columns).find(
        (col) => col.id === destination.droppableId
      );
      if (!start || !finish) return;

      if (start === finish) {
        const newCardIds = Array.from(start.cardIds);
        newCardIds.splice(source.index, 1);
        newCardIds.splice(destination.index, 0, draggableId);

        const newColumn = { ...start, cardIds: newCardIds };
        const columnKey = Object.keys(workflow.columns).find(
          (key) => workflow.columns[key].id === newColumn.id
        );

        setWorkflows((prevWorkflows) =>
          prevWorkflows.map((item) =>
            item.id === workflowId
              ? { ...item, columns: { ...item.columns, [columnKey]: newColumn } }
              : item
          )
        );
        return;
      }

      const startCardIds = Array.from(start.cardIds);
      startCardIds.splice(source.index, 1);
      const newStart = { ...start, cardIds: startCardIds };

      const finishCardIds = Array.from(finish.cardIds);
      finishCardIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finish, cardIds: finishCardIds };

      const startColumnKey = Object.keys(workflow.columns).find(
        (key) => workflow.columns[key].id === newStart.id
      );
      const finishColumnKey = Object.keys(workflow.columns).find(
        (key) => workflow.columns[key].id === newFinish.id
      );

      setWorkflows((prevWorkflows) =>
        prevWorkflows.map((item) =>
          item.id === workflowId
            ? {
                ...item,
                columns: {
                  ...item.columns,
                  [startColumnKey]: newStart,
                  [finishColumnKey]: newFinish,
                },
              }
            : item
        )
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
