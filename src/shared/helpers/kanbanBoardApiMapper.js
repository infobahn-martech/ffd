/**
 * Maps GET kanban_board/get_full_board/{board_id} payloads into the normalized
 * workflow shape used by the board (`mapBoardWorkflowFromApi` / `normalizeWorkflowFromApi` in data.js).
 */

import { mapBoardWorkflowFromApi } from "./data";

/**
 * Converts a single BE workflow record into the normalized FE workflow object.
 * @param {object} beWorkflow - one element of response.data
 * @returns {object|null}
 */
export function mapFullBoardApiToWorkflow(beWorkflow) {
  return mapBoardWorkflowFromApi(beWorkflow);
}

/**
 * Maps the full API body (workflows) to normalized FE workflows.
 * Accepts either a bare array or a common wrapper `{ data: Workflow[] }`.
 * @param {unknown} responseData - axios `response.data`
 * @returns {object[]}
 */
export function mapFullBoardApiResponse(responseData) {
  const list = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : [];
  return list.map(mapFullBoardApiToWorkflow).filter(Boolean);
}

/**
 * Extracts the board-level `background: { color, background_url }` from a
 * `get_full_board` response, if present.
 * @param {unknown} responseData - axios `response.data`
 * @returns {{ color?: string; background_url?: string } | null}
 */
export function extractFullBoardBackground(responseData) {
  const background = responseData?.background;
  return background && typeof background === "object" ? background : null;
}
