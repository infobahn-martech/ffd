/**
 * Board-level column sizing: each track is a fixed pixel width derived from cardsPerRow,
 * card size, gap, and cell padding so headers and swimlane cells stay aligned.
 */

const DEFAULT_CARDS_PER_ROW = 2;

export const CARD_WIDTH = 180;
export const MODERN_CARD_WIDTH = 210;
export const CARD_GAP = 12;

/** One side of horizontal padding inside the card-list cell (L+R total = 2× this). */
export const CELL_PADDING_X = 10;

/** Total horizontal padding inside a column cell (matches L+R padding of .card-list--swimlane-grid). */
export const CELL_HORIZONTAL_PADDING_TOTAL = CELL_PADDING_X * 2;

/** Gap between workflow columns on the outer board grid (not the same as CARD_GAP). */
export const BOARD_COLUMN_GAP_PX = 6;

/** When a column is expanded, scale its track width. */
const EXPANDED_TRACK_MULTIPLIER = 4;

/** When other columns shrink because one is expanded, scale their tracks (floored to one-card width). */
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
 * Returns fixed card width for the active layout mode.
 *
 * @param {string | null | undefined} viewMode
 * @returns {number}
 */
export function getCardWidth(viewMode) {
  return viewMode === "modern" ? MODERN_CARD_WIDTH : CARD_WIDTH;
}

/**
 * columnWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * CARD_GAP + horizontal padding
 *
 * @param {object} column
 * @param {string | null} [expandedColumnId] - column.id when expand/shrink mode is active
 * @param {string | null | undefined} [viewMode]
 * @returns {number} Rounded pixel width for one board column track
 */
export function getColumnWidth(column, expandedColumnId = null, viewMode = null) {
  const n = getCardsPerRow(column);
  const cardWidth = getCardWidth(viewMode);
  let base =
    n * cardWidth +
    Math.max(0, n - 1) * CARD_GAP +
    CELL_HORIZONTAL_PADDING_TOTAL;

  if (expandedColumnId != null && column?.id) {
    if (expandedColumnId === column.id) {
      base *= EXPANDED_TRACK_MULTIPLIER;
    } else {
      base = Math.max(
        cardWidth + CELL_HORIZONTAL_PADDING_TOTAL,
        base * SHRUNK_TRACK_MULTIPLIER
      );
    }
  }

  return Math.round(base);
}

/**
 * Builds `grid-template-columns` for the header row and each swimlane row (px tracks).
 *
 * @param {Record<string, object>} columns
 * @param {string[]} columnOrder
 * @param {string | null} expandedColumnId
 * @param {string | null | undefined} viewMode
 * @returns {string} e.g. "392px 204px 204px"
 */
export function getBoardGridTemplateColumns(
  columns,
  columnOrder,
  expandedColumnId = null,
  viewMode = null
) {
  const parts = columnOrder.map((colKey) => {
    const column = columns[colKey];
    const w = getColumnWidth(column, expandedColumnId, viewMode);
    return `${w}px`;
  });
  return parts.join(" ");
}
