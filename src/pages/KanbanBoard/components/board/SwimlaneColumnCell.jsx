import { useRef, useEffect, useLayoutEffect } from "react";
import { Droppable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import CardItem from "../cards/CardItem";
import { buildSwimlaneDroppableId } from "../../hooks/useKanbanDnD";
import "../../styles/column.scss";

const DEFAULT_CARDS_PER_ROW = 2;

/**
 * One column cell inside a swimlane row: droppable area + CSS grid for cards (cardsPerRow).
 */
export default function SwimlaneColumnCell({
  laneId,
  column,
  cards,
  cardsPerRow,
  setSelectedCard,
  isExpanded = false,
  isShrunk = false,
  onContextMenu,
  columnHeight,
  onHeightChange,
  isClassicLayout = false,
  isModernLayout = false,
  isDarkMode = false,
}) {
  const cellRef = useRef(null);
  const lastReportedHeightRef = useRef(null);
  const droppableId = buildSwimlaneDroppableId(laneId, column.id);
  const perRow = cardsPerRow ?? DEFAULT_CARDS_PER_ROW;

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu?.(e, column);
  };

  useLayoutEffect(() => {
    if (!cellRef.current || !onHeightChange) return;

    const measureHeight = () => {
      if (cellRef.current) {
        const height = cellRef.current.offsetHeight;
        if (lastReportedHeightRef.current !== height) {
          lastReportedHeightRef.current = height;
          onHeightChange(column.id, height, laneId);
        }
      }
    };

    measureHeight();
    const rafId = requestAnimationFrame(() => {
      measureHeight();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [cards.length, column.id, laneId, onHeightChange, isExpanded, isShrunk]);

  useEffect(() => {
    if (!cellRef.current || !onHeightChange) return;

    const measureHeight = () => {
      if (cellRef.current) {
        const height = cellRef.current.offsetHeight;
        if (lastReportedHeightRef.current !== height) {
          lastReportedHeightRef.current = height;
          onHeightChange(column.id, height, laneId);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      measureHeight();
    });

    resizeObserver.observe(cellRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [cards.length, column.id, laneId, onHeightChange, isExpanded, isShrunk]);

  return (
    <div
      ref={cellRef}
      className={`column column--swimlane-cell ${isExpanded ? "column-expanded" : ""} ${
        isShrunk ? "column-shrunk" : ""
      } ${isClassicLayout ? "column-classic" : ""} ${isModernLayout ? "column-modern" : ""} ${
        isDarkMode ? "column-dark" : ""
      }`}
      onContextMenu={handleContextMenu}
      style={columnHeight ? { minHeight: `${columnHeight}px` } : {}}
    >
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          /* Cards-per-row grid: column.cardsPerRow (fallback 2) → CSS grid columns */
          <div
            className={`card-list card-list--swimlane-grid ${
              snapshot.isDraggingOver ? "drag-over" : ""
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              gridTemplateColumns: isShrunk
                ? "1fr"
                : `repeat(${perRow}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                setSelectedCard={setSelectedCard}
                isShrunk={isShrunk}
                isClassicLayout={isClassicLayout}
                isModernLayout={isModernLayout}
                columnTitle={column.title}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

SwimlaneColumnCell.propTypes = {
  laneId: PropTypes.string.isRequired,
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
    wipLimit: PropTypes.number,
  }).isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  cardsPerRow: PropTypes.number,
  setSelectedCard: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  isShrunk: PropTypes.bool,
  onContextMenu: PropTypes.func,
  columnHeight: PropTypes.number,
  onHeightChange: PropTypes.func,
  isClassicLayout: PropTypes.bool,
  isModernLayout: PropTypes.bool,
  isDarkMode: PropTypes.bool,
};
