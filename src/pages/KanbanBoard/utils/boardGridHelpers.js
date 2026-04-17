/**
 * Board-level column sizing: outer row uses one CSS grid track per workflow column,
 * with track widths proportional to cardsPerRow (see getBoardGridTemplateColumns).
 */

const DEFAULT_CARDS_PER_ROW = 2;

/** When a column is expanded (single expanded column UX), scale its share of the row. */
const EXPANDED_TRACK_MULTIPLIER = 4;

/** When other columns shrink because one is expanded, scale their tracks down. */
const SHRUNK_TRACK_MULTIPLIER = 100 / 270;

/**
 * @param {object | null | undefined} column
 * @returns {number}
 */
export function getCardsPerRow(column) {
  if (column == null) return DEFAULT_CARDS_PER_ROW;
  const n = column.cardsPerRow;
  return typeof n === "number" && n > 0 ? n : DEFAULT_CARDS_PER_ROW;
}

/**
 * Builds `grid-template-columns` for the header row and each swimlane row so column
 * width scales with cardsPerRow (e.g. [3,1,1,1,1] → "3fr 1fr 1fr 1fr 1fr").
 *
 * @param {Record<string, object>} columns
 * @param {string[]} columnOrder
 * @param {string | null} expandedColumnId - column.id when one column is expanded; null if none
 */
export function getBoardGridTemplateColumns(columns, columnOrder, expandedColumnId = null) {
  const parts = columnOrder.map((colKey) => {
    const column = columns[colKey];
    let weight = getCardsPerRow(column);

    if (expandedColumnId != null && column?.id) {
      if (expandedColumnId === column.id) {
        weight *= EXPANDED_TRACK_MULTIPLIER;
      } else {
        weight *= SHRUNK_TRACK_MULTIPLIER;
      }
    }

    return `${weight}fr`;
  });

  return parts.join(" ");
}
