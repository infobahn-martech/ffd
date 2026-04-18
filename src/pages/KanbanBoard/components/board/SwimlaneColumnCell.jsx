import { useRef, useEffect, useLayoutEffect } from "react";
import { Droppable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import CardItem from "../cards/CardItem";
import { buildSwimlaneDroppableId } from "../../hooks/useKanbanDnD";
import { CARD_GAP, CELL_PADDING_X, getCardsPerRow, getCardWidth } from "../../utils/boardGridHelpers";
import "../../styles/column.scss";

/**
 * One column cell inside a swimlane row: droppable area + CSS grid for cards (cardsPerRow).
 */
export default function SwimlaneColumnCell({
  laneId,
  column,
  cards,
  setSelectedCard,
  isExpanded = false,
  isShrunk = false,
  onContextMenu,
  columnHeight,
  onHeightChange,
  isClassicLayout = false,
  isModernLayout = false,
  isDarkMode = false,
  layoutView = null,
}) {
  const EMPTY_DROP_ZONE_MIN_HEIGHT = 220;
  const cellRef = useRef(null);
  const lastReportedHeightRef = useRef(null);
  const droppableId = buildSwimlaneDroppableId(laneId, column.id);
  /* Inner card grid: repeat(cardsPerRow, …) — layout inside the cell; board row width uses the same ratio via boardGridHelpers */
  const perRow = getCardsPerRow(column);
  const cardWidth = getCardWidth(layoutView);

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
      style={{
        ...(columnHeight ? { minHeight: `${columnHeight}px` } : {}),
        ...(column.backgroundColor ? { backgroundColor: column.backgroundColor } : {}),
      }}
    >
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            className={`card-list card-list--swimlane-grid ${
              snapshot.isDraggingOver ? "drag-over" : ""
            } ${cards.length === 0 ? "card-list--empty" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              /* Inner card grid: fixed column widths; row height = tallest card in that row (implicit auto rows) */
              display: "grid",
              gridTemplateColumns: isShrunk
                ? `${cardWidth}px`
                : `repeat(${perRow}, ${cardWidth}px)`,
              gap: `${CARD_GAP}px`,
              padding: `${CELL_PADDING_X}px`,
              justifyItems: "start",
              alignItems: "start",
              alignContent: "start",
              minHeight: cards.length === 0 ? `${EMPTY_DROP_ZONE_MIN_HEIGHT}px` : undefined,
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
                fixedDimensions={{ width: cardWidth }}
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
    cardsPerRow: PropTypes.number,
  }).isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  isShrunk: PropTypes.bool,
  onContextMenu: PropTypes.func,
  columnHeight: PropTypes.number,
  onHeightChange: PropTypes.func,
  isClassicLayout: PropTypes.bool,
  isModernLayout: PropTypes.bool,
  isDarkMode: PropTypes.bool,
  layoutView: PropTypes.string,
};
