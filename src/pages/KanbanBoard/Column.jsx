import { useRef, useEffect, useLayoutEffect } from "react";
import { Droppable } from "@hello-pangea/dnd";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import CardItem from "./CardItem";
import "../../design/css/Column.css";

function Column({ column, cards, setSelectedCard, isExpanded = false, isShrunk = false, onHeaderClick, onContextMenu, columnHeight, onHeightChange }) {
  const columnRef = useRef(null);
  const columnColor = column.color || "#2A00FF";

  // Truncate title to 8 characters when shrunk
  const displayTitle = isShrunk && column.title.length > 8
    ? column.title.substring(0, 5) + "..."
    : column.title;
  const tooltipId = `column-title-${column.id}`;

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, column);
    }
  };

  // Measure column height and notify parent
  // Use useLayoutEffect for synchronous measurement before paint
  useLayoutEffect(() => {
    if (!columnRef.current || !onHeightChange) return;

    const measureHeight = () => {
      if (columnRef.current) {
        const height = columnRef.current.offsetHeight;
        onHeightChange(column.id, height);
      }
    };

    // Measure synchronously before paint
    measureHeight();

    // Use requestAnimationFrame to ensure DOM is fully laid out
    const rafId = requestAnimationFrame(() => {
      measureHeight();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [cards.length, column.id, onHeightChange, isExpanded, isShrunk]);

  // Use ResizeObserver for dynamic content changes after initial render
  useEffect(() => {
    if (!columnRef.current || !onHeightChange) return;

    const measureHeight = () => {
      if (columnRef.current) {
        const height = columnRef.current.offsetHeight;
        onHeightChange(column.id, height);
      }
    };

    // Use ResizeObserver for dynamic content changes
    const resizeObserver = new ResizeObserver(() => {
      measureHeight();
    });

    if (columnRef.current) {
      resizeObserver.observe(columnRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [cards.length, column.id, onHeightChange, isExpanded, isShrunk]);

  return (
    <div
      ref={columnRef}
      className={`column ${isExpanded ? 'column-expanded' : ''} ${isShrunk ? 'column-shrunk' : ''}`}
      onContextMenu={handleContextMenu}
      style={columnHeight ? { minHeight: `${columnHeight}px` } : {}}
    >
      <div
        className="column-header"
        style={{ "--column-color": columnColor }}
        onClick={onHeaderClick}
      >
        <div className="column-left">
          {isShrunk && column.title.length > 8 ? (
            <>
              <h2
                className="column-title"
                data-tooltip-id={tooltipId}
                data-tooltip-content={column.title}
              >
                {displayTitle}
              </h2>
              <Tooltip id={tooltipId} place="top" />
            </>
          ) : (
            <h2 className="column-title">{displayTitle}</h2>
          )}
        </div>
        <span className="column-count">{cards?.length ?? 0}</span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`card-list ${snapshot.isDraggingOver ? "drag-over" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {cards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                setSelectedCard={setSelectedCard}
                isShrunk={isShrunk}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

Column.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
  }).isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  isShrunk: PropTypes.bool,
  onHeaderClick: PropTypes.func,
  onContextMenu: PropTypes.func,
  columnHeight: PropTypes.number,
  onHeightChange: PropTypes.func,
};

export default Column;
